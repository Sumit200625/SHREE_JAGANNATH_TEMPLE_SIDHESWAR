import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { put } from '@vercel/blob';
import { db, ensureReady, listDocs, getDoc, insertDoc, patchDoc, deleteDoc } from '../server/db.js';
import {
  startSession, endSession, currentUser, requireUser, requireRole, publicUser,
  verifyGoogleCredential, newId, OFFICIAL_ADMIN, liveUnsubToken,
} from '../server/auth.js';
import { HttpError, send, sendHtml, readJson, readRaw, str, isEmail, isPhone, rateLimit } from '../server/http.js';
import { resolveChannel, detectLive, channelIdFromHandle } from '../server/youtube.js';
import { sendMail } from '../server/notify.js';
import { DEFAULT_TIMINGS, DEFAULT_SLOTS } from '../shared/catalog.js';
import { emailConfigured, whatsappConfigured, smsConfigured, sendEmails, sendWhatsApp, sendSms } from '../server/notify.js';
import {
  paymentsEnabled, createOrder, verifyCheckoutSignature, verifyWebhookSignature,
  fulfill, getOrder, publicDonation, refund,
} from '../server/payments.js';

export const config = { api: { bodyParser: false } };

const ADMINS = ['super_admin', 'donation_manager', 'seva_manager', 'content_editor', 'notice_manager'];
const CONTENT = ['super_admin', 'content_editor'];
const NOTICE = ['super_admin', 'content_editor', 'notice_manager'];

async function audit(user, action, description) {
  await insertDoc('audit', newId('aud'), {
    adminId: user.id, adminName: user.name, role: user.role, action, description, timestamp: new Date().toISOString(),
  });
}

// Only accept PDF links that were uploaded through our own upload endpoint (blocks javascript: and other URLs)
function cleanPdfUrl(v) {
  const s = str(v, 600);
  if (!s || s === '#') return '#';
  try {
    const u = new URL(s);
    if (u.protocol === 'https:' && u.hostname.endsWith('.public.blob.vercel-storage.com')) return s;
  } catch { /* fall through */ }
  throw new HttpError(400, 'Invalid PDF link. Please upload the PDF using the attach button.');
}

// accepts a YouTube link, a video id or a channel id; only the id is stored (we build the embed URL ourselves)
function parseYoutube(input) {
  const s = str(input, 300);
  if (/^UC[\w-]{22}$/.test(s)) return { channelId: s };
  if (/^@[\w.-]{3,60}$/.test(s)) return { handle: s.slice(1) };
  if (/^[\w-]{11}$/.test(s)) return { videoId: s };
  try {
    const u = new URL(s);
    const h = u.hostname.replace(/^(www|m)\./, '');
    if (h === 'youtu.be') { const id = u.pathname.slice(1, 12); if (/^[\w-]{11}$/.test(id)) return { videoId: id }; }
    if (h === 'youtube.com' || h === 'youtube-nocookie.com') {
      const v = u.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return { videoId: v };
      const m = u.pathname.match(/^\/(?:live|embed|shorts)\/([\w-]{11})/);
      if (m) return { videoId: m[1] };
      const c = u.pathname.match(/^\/channel\/(UC[\w-]{22})/);
      if (c) return { channelId: c[1] };
      const hd = u.pathname.match(/^\/@([\w.-]{3,60})/);
      if (hd) return { handle: hd[1] };
    }
  } catch { /* fall through */ }
  throw new HttpError(400, 'Please paste a valid YouTube live link (or video ID / channel ID).');
}

async function upsertGoogleUser(p) {
  const sql = db();
  const email = p.email.toLowerCase();
  const found = await sql`SELECT * FROM users WHERE google_sub = ${p.sub} OR email = ${email} LIMIT 1`;
  if (found[0]) {
    // If this email was registered earlier with a password (never verified), the password is dropped once Google proves ownership.
    const rows = await sql`UPDATE users SET google_sub = ${p.sub}, picture = ${p.picture || null},
      password_hash = CASE WHEN google_sub IS NULL THEN NULL ELSE password_hash END,
      name = COALESCE(NULLIF(name, ''), ${p.name || email}) WHERE id = ${found[0].id} RETURNING *`;
    return rows[0];
  }
  const rows = await sql`INSERT INTO users (id, name, email, google_sub, picture)
    VALUES (${newId('usr')}, ${p.name || email.split('@')[0]}, ${email}, ${p.sub}, ${p.picture || null}) RETURNING *`;
  return rows[0];
}

async function route(req, res, method, path, url) {
  const seg = path.split('/').filter(Boolean); // e.g. ['auth','google']
  const [a, b, c] = seg;
  const key = `${method} /${a || ''}${b ? '/' + b : ''}`;

  // ---------------- public config ----------------
  if (key === 'GET /config')
    return send(res, 200, { googleClientId: process.env.GOOGLE_CLIENT_ID || '', paymentsEnabled: paymentsEnabled() });

  // ---------------- auth ----------------
  if (key === 'POST /google-login') {
    rateLimit(req, 'login', 20, 60_000);
    const { credential } = await readJson(req);
    const payload = await verifyGoogleCredential(str(credential, 4000));
    const u = await upsertGoogleUser(payload);
    await startSession(res, u.id);
    return send(res, 200, { user: publicUser(u) });
  }
  if (key === 'POST /register') {
    rateLimit(req, 'register', 10, 60_000);
    const d = await readJson(req);
    const name = str(d.name, 80), email = str(d.email, 254).toLowerCase(), phone = str(d.phone, 10), pw = String(d.password || '');
    if (!name) throw new HttpError(400, 'Name is required.');
    if (!isEmail(email)) throw new HttpError(400, 'Enter a valid email address.');
    if (email === OFFICIAL_ADMIN) throw new HttpError(403, 'This email can only sign in with "Continue with Google".');
    if (!isPhone(phone)) throw new HttpError(400, 'Enter a valid 10-digit Indian mobile number.');
    if (pw.length < 8 || pw.length > 72) throw new HttpError(400, pw.length < 8 ? 'Password must be at least 8 characters.' : 'Password is too long (maximum 72 characters).');
    const hash = await bcrypt.hash(pw, 11);
    try {
      const rows = await db()`INSERT INTO users (id, name, email, phone, password_hash, notify_live)
        VALUES (${newId('usr')}, ${name}, ${email}, ${phone}, ${hash}, ${d.notifyLive !== false}) RETURNING *`;
      await startSession(res, rows[0].id);
      return send(res, 200, { user: publicUser(rows[0]) });
    } catch (e) {
      if (String(e.message).includes('unique')) throw new HttpError(409, 'This email is already registered. Please log in.');
      throw e;
    }
  }
  if (key === 'POST /login') {
    rateLimit(req, 'login', 10, 60_000);
    const d = await readJson(req);
    const email = str(d.email, 254).toLowerCase();
    if (email === OFFICIAL_ADMIN) throw new HttpError(403, 'The temple administrator must sign in with "Continue with Google".');
    const rows = await db()`SELECT * FROM users WHERE email = ${email}`;
    const u = rows[0];
    const ok = u?.password_hash && (await bcrypt.compare(String(d.password || ''), u.password_hash));
    if (!ok) throw new HttpError(401, 'Invalid login credentials. (If you signed up with Google, use "Continue with Google".)');
    await startSession(res, u.id);
    return send(res, 200, { user: publicUser(u) });
  }
  if (key === 'POST /logout') { endSession(res); return send(res, 200, { ok: true }); }
  if (key === 'GET /me') return send(res, 200, { user: await currentUser(req) });
  if (key === 'PATCH /profile') {
    const me = await requireUser(req);
    const d = await readJson(req);
    const has = (k) => Object.prototype.hasOwnProperty.call(d, k);
    const rows = await db()`UPDATE users SET
      name = COALESCE(NULLIF(${has('name') ? str(d.name, 80) : ''}, ''), name),
      gotra = COALESCE(${has('gotra') ? str(d.gotra, 60) : null}, gotra),
      address = COALESCE(${has('address') ? str(d.address, 300) : null}, address),
      phone = COALESCE(NULLIF(${has('phone') ? str(d.phone, 10) : ''}, ''), phone),
      notify_live = COALESCE(${has('notifyLive') ? !!d.notifyLive : null}, notify_live)
      WHERE id = ${me.id} RETURNING *`;
    return send(res, 200, { user: publicUser(rows[0]) });
  }

  // ---------------- notices ----------------
  if (key === 'GET /notices') return send(res, 200, await listDocs('notice'));
  if (key === 'POST /notices') {
    const me = await requireRole(req, NOTICE);
    const d = await readJson(req);
    if (!str(d.titleEn)) throw new HttpError(400, 'Title is required.');
    const doc = await insertDoc('notice', newId('not'), {
      titleEn: str(d.titleEn, 200), contentEn: str(d.contentEn, 4000),
      titleOr: str(d.titleOr, 200) || str(d.titleEn, 200), contentOr: str(d.contentOr, 4000) || str(d.contentEn, 4000),
      titleHi: str(d.titleHi, 200) || str(d.titleEn, 200), contentHi: str(d.contentHi, 4000) || str(d.contentEn, 4000),
      category: str(d.category, 30) || 'general', isPinned: !!d.isPinned,
      publishDate: new Date().toISOString().slice(0, 10), expiryDate: str(d.expiryDate, 10) || '', pdfUrl: cleanPdfUrl(d.pdfUrl),
    });
    await audit(me, 'CREATE_NOTICE', `Created announcement: ${doc.titleEn}`);
    return send(res, 201, doc);
  }
  if (a === 'notices' && b && method === 'PATCH') {
    const me = await requireRole(req, NOTICE);
    const d = await readJson(req);
    const patch = {};
    for (const k of ['titleEn', 'contentEn', 'titleOr', 'contentOr', 'titleHi', 'contentHi', 'category', 'expiryDate']) if (k in d) patch[k] = str(d[k], 4000);
    if ('pdfUrl' in d) patch.pdfUrl = cleanPdfUrl(d.pdfUrl);
    if ('isPinned' in d) patch.isPinned = !!d.isPinned;
    const doc = await patchDoc('notice', b, patch);
    if (!doc) throw new HttpError(404, 'Notice not found.');
    await audit(me, 'UPDATE_NOTICE', `Updated announcement: ${doc.titleEn}`);
    return send(res, 200, doc);
  }
  if (a === 'notices' && b && method === 'DELETE') {
    const me = await requireRole(req, NOTICE);
    const old = await getDoc('notice', b);
    if (!(await deleteDoc('notice', b))) throw new HttpError(404, 'Notice not found.');
    await audit(me, 'DELETE_NOTICE', `Deleted announcement: ${old?.titleEn}`);
    return send(res, 200, { success: true });
  }

  // ---------------- PDF attachment for notices (admin) ----------------
  if (key === 'POST /upload-pdf') {
    const me = await requireRole(req, NOTICE);
    rateLimit(req, 'upload', 15, 60_000);
    const type = String(req.headers['content-type'] || '').split(';')[0].toLowerCase();
    if (type !== 'application/pdf') throw new HttpError(415, 'Only PDF files are allowed.');
    const buf = await readRaw(req, 4_200_000);
    if (buf.length < 100 || buf.subarray(0, 5).toString() !== '%PDF-') throw new HttpError(400, 'File content does not look like a PDF.');
    const blob = await put(`notices/${me.id}-${crypto.randomBytes(6).toString('hex')}.pdf`, buf, {
      access: 'public', contentType: 'application/pdf', addRandomSuffix: true,
    });
    return send(res, 201, { url: blob.url });
  }

  // ---------------- send a notice to subscribers (admin) ----------------
  if (a === 'notices' && b && c === 'send' && method === 'POST') {
    const me = await requireRole(req, NOTICE);
    rateLimit(req, 'broadcast', 6, 60_000);
    const d = await readJson(req);
    const n = await getDoc('notice', b);
    if (!n) throw new HttpError(404, 'Notice not found.');
    const subs = (await listDocs('subscriber', 20000)).filter((s) => s.active);
    const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;
    const messages = [{ title: n.titleEn, body: n.contentEn }];
    if (n.titleOr && n.titleOr !== n.titleEn) messages.push({ title: n.titleOr, body: n.contentOr });
    if (n.titleHi && n.titleHi !== n.titleEn) messages.push({ title: n.titleHi, body: n.contentHi });
    const result = {};
    if (d.email) {
      const list = subs.filter((s) => s.type === 'email');
      result.email = { total: list.length, ...(await sendEmails(list.slice(0, 300), messages, baseUrl)) };
    }
    if (d.whatsapp) {
      const list = subs.filter((s) => s.type === 'phone');
      result.whatsapp = { total: list.length, ...(await sendWhatsApp(list.slice(0, 300), n.titleEn, n.contentEn)) };
    }
    await audit(me, 'SEND_NOTICE', `Sent notice "${n.titleEn}" ${JSON.stringify(result)}`);
    return send(res, 200, result);
  }

  // ---------------- subscribers ----------------
  if (key === 'POST /subscribe') {
    rateLimit(req, 'subscribe', 8, 60_000);
    const d = await readJson(req);
    const raw = str(d.contact, 254);
    let type, value;
    if (raw.includes('@')) {
      value = raw.toLowerCase();
      if (!isEmail(value)) throw new HttpError(400, 'Enter a valid email address.');
      type = 'email';
    } else {
      value = raw.replace(/\D/g, '');
      if (value.length === 12 && value.startsWith('91')) value = value.slice(2);
      if (!isPhone(value)) throw new HttpError(400, 'Enter a valid 10-digit mobile number or an email address.');
      type = 'phone';
    }
    const id = crypto.createHash('sha256').update(type + ':' + value).digest('hex').slice(0, 20);
    const existing = await getDoc('subscriber', id);
    if (existing) {
      if (!existing.active) await patchDoc('subscriber', id, { active: true });
    } else {
      try {
        await insertDoc('subscriber', id, { type, value, token: crypto.randomBytes(16).toString('hex'), active: true, createdAt: new Date().toISOString() });
      } catch (e) { if (!String(e.message).includes('duplicate')) throw e; }
    }
    return send(res, 200, { ok: true });
  }
  if (key === 'GET /unsubscribe') {
    const t = str(url.searchParams.get('t'), 64);
    const rows = t ? await db()`SELECT id FROM docs WHERE kind = 'subscriber' AND data->>'token' = ${t}` : [];
    if (rows[0]) await patchDoc('subscriber', rows[0].id, { active: false });
    return sendHtml(res, 200, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed</title>
      <body style="font-family:Arial,sans-serif;background:#fffdf0;color:#3b2417;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
      <div style="max-width:420px;text-align:center;padding:24px"><h2 style="color:#7a0f0f">Shree Jagannath Temple Sidheswar</h2>
      <p>${rows[0] ? 'You have been unsubscribed. You will no longer receive temple notices.' : 'This unsubscribe link is not valid or was already used.'}</p>
      <p><a href="/" style="color:#e35f24;font-weight:bold">Go to website</a></p></div></body>`);
  }
  if (key === 'GET /subscribers') {
    await requireRole(req, ['super_admin']);
    return send(res, 200, (await listDocs('subscriber', 20000)).map(({ token, ...s }) => s));
  }
  if (a === 'subscribers' && b && method === 'DELETE') {
    const me = await requireRole(req, ['super_admin']);
    if (!(await deleteDoc('subscriber', b))) throw new HttpError(404, 'Subscriber not found.');
    await audit(me, 'DELETE_SUBSCRIBER', 'Removed a subscriber');
    return send(res, 200, { success: true });
  }
  if (key === 'GET /notify-config') {
    await requireRole(req, NOTICE);
    const subs = (await listDocs('subscriber', 20000)).filter((s) => s.active);
    return send(res, 200, {
      email: emailConfigured(), whatsapp: whatsappConfigured(), sms: smsConfigured(),
      subscribers: { email: subs.filter((s) => s.type === 'email').length, phone: subs.filter((s) => s.type === 'phone').length },
    });
  }

  // ---------------- registered devotees (admin only) ----------------
  if (key === 'GET /devotees') {
    await requireRole(req, ['super_admin']);
    const sql = db();
    const users = await sql`SELECT id, name, email, phone, gotra, address, created_at, notify_live AS notify, (google_sub IS NOT NULL) AS google FROM users ORDER BY created_at DESC LIMIT 5000`;
    const don = await sql`SELECT data->>'userId' AS uid, count(*)::int AS cnt, COALESCE(sum((data->>'amount')::numeric), 0)::float AS total
                          FROM docs WHERE kind = 'donation' AND data->>'userId' IS NOT NULL GROUP BY 1`;
    const sev = await sql`SELECT data->>'userId' AS uid, count(*)::int AS cnt FROM docs WHERE kind = 'seva' AND data->>'userId' IS NOT NULL GROUP BY 1`;
    const dm = Object.fromEntries(don.map((r) => [r.uid, r]));
    const sm = Object.fromEntries(sev.map((r) => [r.uid, r]));
    return send(res, 200, users.map((u) => ({
      ...u, donationCount: dm[u.id]?.cnt || 0, donationTotal: dm[u.id]?.total || 0, sevaCount: sm[u.id]?.cnt || 0,
    })));
  }

  // ---------------- live darshan (arati / pujan) ----------------
  if (key === 'GET /live') {
    let l = (await getDoc('live', 'current')) || {};
    const ch = await resolveChannel(l);
    if (ch.fromHandle && ch.id) {            // remember the channel id so YouTube is not asked again
      try { if (l.id) await patchDoc('live', 'current', { resolvedChannelId: ch.id }); else l = await insertDoc('live', 'current', { isLive: false, kind: 'arati', title: '', resolvedChannelId: ch.id }); } catch { /* ignore */ }
    }
    const channelId = l.channelId || ch.id || '';
    let out = { isLive: !!l.isLive, kind: l.kind || 'arati', title: l.title || '', videoId: l.videoId || '', channelId, startedAt: l.startedAt || '', updatedAt: l.updatedAt || '', auto: false };
    if (!out.isLive && channelId) {          // not switched on by the admin: ask YouTube whether the channel is live right now
      const d = await detectLive(channelId);
      if (d) out = { ...out, isLive: true, auto: true, videoId: d.videoId, title: d.title || 'Live Darshan', kind: /pujan|puja|pooja/i.test(d.title) ? 'pujan' : 'arati' };
    }
    out.playlistId = channelId ? 'UU' + channelId.slice(2) : '';
    return send(res, 200, out);
  }
  if (key === 'POST /live') {
    const me = await requireRole(req, ['super_admin']);
    const d = await readJson(req);
    const old = (await getDoc('live', 'current')) || {};
    let src = d.url ? parseYoutube(d.url) : { videoId: '', channelId: old.channelId || '' };
    const NEED_ID = 'Could not read the channel from that link automatically. Paste the Channel ID (starts with UC...) from YouTube Studio > Settings > Channel > Advanced settings.';
    if (src.handle) {
      const id = await channelIdFromHandle(src.handle);
      if (!id) throw new HttpError(400, NEED_ID);
      src = { channelId: id };
    }
    const isLive = !!d.isLive;
    if (isLive && !src.videoId && !src.channelId) {      // no link pasted: use the temple's channel (its running live stream)
      const ch = await resolveChannel(old);
      if (!ch.id) throw new HttpError(400, NEED_ID);
      src = { channelId: ch.id };
    }
    const now = new Date().toISOString();
    const next = {
      isLive, kind: d.kind === 'pujan' ? 'pujan' : 'arati', title: str(d.title, 120) || (d.kind === 'pujan' ? 'Live Pujan' : 'Live Arati'),
      videoId: src.videoId || '', channelId: src.channelId || old.channelId || '', updatedAt: now,
      startedAt: isLive ? (old.isLive ? old.startedAt || now : now) : '', notifiedAt: old.notifiedAt || '',
    };
    if (old.id) await patchDoc('live', 'current', next); else await insertDoc('live', 'current', next);
    await audit(me, isLive ? 'LIVE_ON' : 'LIVE_OFF', `${next.kind}: ${next.title}`);
    return send(res, 200, { ok: true, isLive: next.isLive });
  }
  if (key === 'POST /live/notify') {
    const me = await requireRole(req, ['super_admin']);
    const d = await readJson(req);
    const live = (await getDoc('live', 'current')) || {};
    if (live.notifiedAt && Date.now() - Date.parse(live.notifiedAt) < 5 * 60000 && !d.offset)
      throw new HttpError(429, 'Alerts were sent a few minutes ago. Please wait 5 minutes before sending again.');
    const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;
    const link = `${baseUrl}/live`;
    const title = live.title || 'Live Arati';
    const custom = str(d.message, 200);
    const text = (custom || (live.isLive ? `${title} is LIVE now.` : `${title} is starting soon.`)) + ' Watch: ' + link;
    const offset = Math.max(0, parseInt(d.offset, 10) || 0), CAP = 300;

    const users = await db()`SELECT id, email, phone FROM users WHERE notify_live = true ORDER BY created_at LIMIT 20000`;
    const subs = (await listDocs('subscriber', 20000)).filter((s) => s.active);
    const emails = new Map(), phones = new Map();
    for (const u of users) {
      if (u.email) emails.set(u.email.toLowerCase(), { value: u.email, unsubUrl: `${baseUrl}/api/index?__p=unsubscribe-live&u=${u.id}&t=${liveUnsubToken(u.id)}` });
      if (u.phone) phones.set(u.phone, { value: u.phone });
    }
    for (const s of subs) {
      if (s.type === 'email' && !emails.has(s.value)) emails.set(s.value, { value: s.value, token: s.token });
      if (s.type === 'phone' && !phones.has(s.value)) phones.set(s.value, { value: s.value });
    }
    const E = [...emails.values()], P = [...phones.values()];
    const result = { totals: { email: E.length, phone: P.length }, offset, cap: CAP };
    if (d.email) result.email = await sendEmails(E.slice(offset, offset + CAP), [{ title, body: text }], baseUrl, { subject: (live.isLive ? '🔴 LIVE now: ' : 'Live soon: ') + title });
    if (d.whatsapp) result.whatsapp = await sendWhatsApp(P.slice(offset, offset + CAP), title, text, process.env.WHATSAPP_LIVE_TEMPLATE);
    if (d.sms) result.sms = await sendSms(P.slice(offset, offset + CAP), title, link.replace(/^https?:\/\//, ''));
    if (live.id) await patchDoc('live', 'current', { notifiedAt: new Date().toISOString() });
    await audit(me, 'LIVE_NOTIFY', `Sent live alerts ${JSON.stringify({ email: result.email, whatsapp: result.whatsapp, sms: result.sms, offset })}`);
    return send(res, 200, result);
  }
  if (key === 'POST /live/test') {
    const me = await requireRole(req, ['super_admin']);
    rateLimit(req, 'livetest', 6, 60_000);
    if (!emailConfigured()) throw new HttpError(503, 'Email is not set up yet: add GMAIL_APP_PASSWORD in Vercel and redeploy.');
    const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;
    const r = await sendEmails([{ value: me.email, unsubUrl: `${baseUrl}/live` }], [{ title: 'Test alert', body: 'This is a test of the live arati alert. If you can read this, email alerts are working.' }], baseUrl, { subject: 'Test: live arati alert' });
    if (r.failed) throw new HttpError(502, 'Gmail rejected the message: ' + (r.error || 'unknown error'));
    return send(res, 200, { ok: true, to: me.email });
  }
  if (key === 'GET /unsubscribe-live') {
    const u = str(url.searchParams.get('u'), 80), t = str(url.searchParams.get('t'), 64);
    let ok = false;
    if (u && t && t === liveUnsubToken(u)) { await db()`UPDATE users SET notify_live = false WHERE id = ${u}`; ok = true; }
    return sendHtml(res, 200, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Live alerts</title>
      <body style="font-family:Arial,sans-serif;background:#fffdf0;color:#3b2417;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
      <div style="max-width:420px;text-align:center;padding:24px"><h2 style="color:#7a0f0f">Shree Jagannath Temple Sidheswar</h2>
      <p>${ok ? 'You will no longer receive live arati alerts. You can turn them on again any time from the Live page after logging in.' : 'This link is not valid.'}</p>
      <p><a href="/live" style="color:#e35f24;font-weight:bold">Go to Live page</a></p></div></body>`);
  }

  // ---------------- festivals ----------------
  if (key === 'GET /festivals') return send(res, 200, await listDocs('festival'));

  // ---------------- FAQs ----------------
  if (key === 'GET /faqs') return send(res, 200, await listDocs('faq'));
  if (key === 'POST /faqs') {
    const me = await requireRole(req, CONTENT);
    const d = await readJson(req);
    if (!str(d.questionEn) || !str(d.answerEn)) throw new HttpError(400, 'Question and answer are required.');
    const doc = await insertDoc('faq', newId('faq'), {
      questionEn: str(d.questionEn, 300), answerEn: str(d.answerEn, 3000),
      questionOr: str(d.questionOr, 300), answerOr: str(d.answerOr, 3000), questionHi: str(d.questionHi, 300), answerHi: str(d.answerHi, 3000),
    });
    await audit(me, 'ADD_FAQ', `Added FAQ question: ${doc.questionEn}`);
    return send(res, 201, doc);
  }
  if (a === 'faqs' && b && method === 'DELETE') {
    const me = await requireRole(req, CONTENT);
    const old = await getDoc('faq', b);
    if (!(await deleteDoc('faq', b))) throw new HttpError(404, 'FAQ not found.');
    await audit(me, 'DELETE_FAQ', `Deleted FAQ: ${old?.questionEn}`);
    return send(res, 200, { success: true });
  }

  // ---------------- image upload + gallery ----------------
  if (key === 'POST /upload') {
    const me = await requireUser(req);
    rateLimit(req, 'upload', 15, 60_000);
    const type = String(req.headers['content-type'] || '').split(';')[0].toLowerCase();
    const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[type];
    if (!ext) throw new HttpError(415, 'Only JPG, PNG or WEBP images are allowed.');
    const buf = await readRaw(req, 4_200_000);
    if (buf.length < 100) throw new HttpError(400, 'Empty file.');
    const magicOk = (type === 'image/jpeg' && buf[0] === 0xff && buf[1] === 0xd8) ||
      (type === 'image/png' && buf.subarray(0, 4).toString('hex') === '89504e47') ||
      (type === 'image/webp' && buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP');
    if (!magicOk) throw new HttpError(400, 'File content does not match an image.');
    const blob = await put(`gallery/${me.id}-${crypto.randomBytes(6).toString('hex')}.${ext}`, buf, {
      access: 'public', contentType: type, addRandomSuffix: true,
    });
    return send(res, 201, { url: blob.url });
  }
  if (key === 'GET /gallery') {
    const all = await listDocs('gallery');
    if (url.searchParams.get('all') === '1') { await requireRole(req, CONTENT); return send(res, 200, all); }
    return send(res, 200, all.filter((g) => g.isApproved));
  }
  if (key === 'POST /gallery') {
    const me = await requireUser(req);
    rateLimit(req, 'gallery', 15, 60_000);
    const d = await readJson(req);
    const imageUrl = str(d.imageUrl, 600);
    let host = ''; try { host = new URL(imageUrl).hostname; } catch {}
    if (!host.endsWith('.public.blob.vercel-storage.com')) throw new HttpError(400, 'Please upload the photo using the upload button.');
    const staff = ADMINS.includes(me.role);
    const doc = await insertDoc('gallery', newId('gal'), {
      title: str(d.title, 120) || 'Devotee photo', altText: str(d.title, 120), category: str(d.category, 40) || 'Devotee Events',
      imageUrl, thumbnailUrl: imageUrl, caption: str(d.caption, 500) || 'Submitted by devotee',
      date: new Date().toISOString().slice(0, 10), isFeatured: false, isApproved: staff && CONTENT.includes(me.role),
      uploadedBy: me.name, uploadedById: me.id,
    });
    return send(res, 201, doc);
  }
  if (a === 'gallery' && b && c === 'approve' && method === 'POST') {
    const me = await requireRole(req, CONTENT);
    const doc = await patchDoc('gallery', b, { isApproved: true });
    if (!doc) throw new HttpError(404, 'Photo not found.');
    await audit(me, 'APPROVE_PHOTO', `Approved gallery upload: ${doc.title}`);
    return send(res, 200, doc);
  }
  if (a === 'gallery' && b && method === 'DELETE') {
    const me = await requireRole(req, CONTENT);
    const old = await getDoc('gallery', b);
    if (!(await deleteDoc('gallery', b))) throw new HttpError(404, 'Photo not found.');
    await audit(me, 'DELETE_PHOTO', `Deleted gallery item: ${old?.title}`);
    return send(res, 200, { success: true });
  }

  // ---------------- payments ----------------
  if (key === 'POST /payments/order') {
    rateLimit(req, 'order', 20, 60_000);
    const me = await currentUser(req);
    const d = await readJson(req);
    if (d.type === 'seva' && !me) throw new HttpError(401, 'Please log in to book a seva.');
    return send(res, 200, await createOrder(d, me));
  }
  if (key === 'POST /payments/verify') {
    const d = await readJson(req);
    const orderId = str(d.razorpay_order_id, 60), paymentId = str(d.razorpay_payment_id, 60);
    if (!verifyCheckoutSignature(orderId, paymentId, str(d.razorpay_signature, 200)))
      throw new HttpError(400, 'Payment verification failed. If money was deducted, it will be reconciled automatically.');
    let out = await fulfill(orderId, paymentId);
    if (!out) { await new Promise((r) => setTimeout(r, 1200)); out = await fulfill(orderId, paymentId); }
    if (!out) throw new HttpError(202, 'Payment received, confirmation is being generated. Check "My Account" in a moment.');
    return send(res, 200, out);
  }
  if (key === 'POST /payments/webhook') {
    const raw = await readRaw(req, 256 * 1024);
    if (!verifyWebhookSignature(raw, String(req.headers['x-razorpay-signature'] || ''))) throw new HttpError(400, 'bad signature');
    const evt = JSON.parse(raw.toString('utf8'));
    if (evt.event === 'payment.captured' || evt.event === 'order.paid') {
      const pay = evt.payload?.payment?.entity;
      if (pay?.order_id && pay?.id) await fulfill(pay.order_id, pay.id);
    }
    return send(res, 200, { ok: true });
  }
  if (a === 'payments' && b === 'refund' && method === 'POST') {
    const me = await requireRole(req, ['super_admin']);
    const d = await readJson(req);
    const rows = await db()`SELECT data FROM docs WHERE kind = 'seva' AND id = ${str(d.sevaId, 60)}`;
    const s = rows[0]?.data;
    if (!s?.transactionId) throw new HttpError(404, 'Booking not found.');
    await refund(s.transactionId, s.amount);
    await patchDoc('seva', s.id, { paymentStatus: 'refunded' });
    await audit(me, 'REFUND', `Refunded seva ${s.bookingReference}`);
    return send(res, 200, { ok: true });
  }

  // ---------------- donations ----------------
  if (key === 'GET /donations') {
    const scope = url.searchParams.get('scope');
    if (scope === 'public') return send(res, 200, (await listDocs('donation', 20)).map(publicDonation));
    if (scope === 'mine') { const me = await requireUser(req); return send(res, 200, (await listDocs('donation', 500)).filter((d) => d.userId === me.id)); }
    await requireRole(req, ['super_admin', 'donation_manager']);
    return send(res, 200, await listDocs('donation'));
  }

  // ---------------- sevas ----------------
  if (key === 'GET /sevas') {
    const scope = url.searchParams.get('scope');
    if (scope === 'mine') { const me = await requireUser(req); return send(res, 200, (await listDocs('seva', 500)).filter((s) => s.userId === me.id)); }
    if (scope === 'track') {
      rateLimit(req, 'track', 20, 60_000);
      const ref = str(url.searchParams.get('ref'), 40).toUpperCase();
      const rows = await db()`SELECT data FROM docs WHERE kind = 'seva' AND upper(data->>'bookingReference') = ${ref}`;
      const s = rows[0]?.data;
      return send(res, 200, s ? { bookingReference: s.bookingReference, devoteeName: s.devoteeName, sevaType: s.sevaType, selectedDate: s.selectedDate, slot: s.slot || '',
        amount: s.amount, paymentStatus: s.paymentStatus, approvalStatus: s.approvalStatus, rejectionReason: s.rejectionReason || '', phone: s.phone, gotra: s.gotra } : null);
    }
    await requireRole(req, ['super_admin', 'seva_manager']);
    return send(res, 200, await listDocs('seva'));
  }
  if (a === 'sevas' && b && method === 'PATCH') {
    const me = await requireRole(req, ['super_admin', 'seva_manager']);
    const d = await readJson(req);
    if (!['approved', 'rejected', 'completed', 'cancelled'].includes(d.approvalStatus)) throw new HttpError(400, 'Invalid status.');
    const doc = await patchDoc('seva', b, { approvalStatus: d.approvalStatus, rejectionReason: str(d.rejectionReason, 500), statusUpdatedAt: new Date().toISOString() });
    if (!doc) throw new HttpError(404, 'Booking not found.');
    await audit(me, 'UPDATE_SEVA', `Updated Seva status (${d.approvalStatus}) for ref: ${doc.bookingReference}`);
    if (doc.email) {
      const word = { approved: 'CONFIRMED', completed: 'COMPLETED', cancelled: 'CANCELLED', rejected: 'NOT ACCEPTED' }[d.approvalStatus];
      const extra = { approved: 'Your seva is confirmed. Please reach the temple on the booked date and slot.', completed: 'Your seva has been performed. Jai Jagannath! Thank you for your devotion.',
        cancelled: 'Your booking was cancelled by the temple office. If you paid online, the temple office will contact you about the refund.', rejected: 'We are sorry, the temple could not accept this booking.' }[d.approvalStatus];
      const text = `Dear ${doc.devoteeName},\n\nBooking ${doc.bookingReference} (${doc.sevaType}, ${doc.selectedDate}, ${doc.slot || ''}) is ${word}.\n${extra}${doc.rejectionReason ? '\nNote: ' + doc.rejectionReason : ''}\n\nShree Jagannath Temple Sidheswar\nWhatsApp / Phone: +91 93378 22942`;
      await sendMail(doc.email, `Seva booking ${doc.bookingReference} ${word.toLowerCase()}`, text, `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;white-space:pre-wrap;line-height:1.6;color:#3b2417">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</div>`);
    }
    return send(res, 200, doc);
  }

  // ---------------- seva list (admin manages names, prices, slots) ----------------
  if (key === 'GET /sevaitems') {
    let items = await listDocs('sevaitem', 300);
    items = items.sort((x, y) => (x.sort || 0) - (y.sort || 0));
    if (url.searchParams.get('all') === '1') { await requireRole(req, ['super_admin', 'seva_manager']); return send(res, 200, items); }
    return send(res, 200, items.filter((x) => x.active && x.price > 0).map((x) => ({ id: x.id, name: x.name, desc: x.desc, price: x.price, slots: x.slots?.length ? x.slots : DEFAULT_SLOTS })));
  }
  const cleanSeva = (d) => {
    const name = str(d.name, 120);
    if (!name) throw new HttpError(400, 'Seva name is required.');
    const price = Math.round(Number(d.price));
    if (!Number.isFinite(price) || price < 0 || price > 500000) throw new HttpError(400, 'Enter a valid price in rupees.');
    const active = !!d.active;
    if (active && price < 1) throw new HttpError(400, 'Set a price above Rs. 0 before switching this seva on.');
    const slots = (Array.isArray(d.slots) ? d.slots : []).map((x) => str(x, 80)).filter(Boolean).slice(0, 10);
    return { name, desc: str(d.desc, 500), price, active, slots: slots.length ? slots : DEFAULT_SLOTS };
  };
  if (key === 'POST /sevaitems') {
    const me = await requireRole(req, ['super_admin', 'seva_manager']);
    const clean = cleanSeva(await readJson(req));
    const all = await listDocs('sevaitem', 300);
    const doc = await insertDoc('sevaitem', newId('sv'), { ...clean, sort: all.reduce((m, x) => Math.max(m, x.sort || 0), 0) + 1 });
    await audit(me, 'ADD_SEVA_ITEM', `Added seva: ${doc.name} Rs.${doc.price}`);
    return send(res, 201, doc);
  }
  if (a === 'sevaitems' && b && method === 'PATCH') {
    const me = await requireRole(req, ['super_admin', 'seva_manager']);
    const clean = cleanSeva(await readJson(req));
    const doc = await patchDoc('sevaitem', b, clean);
    if (!doc) throw new HttpError(404, 'Seva not found.');
    await audit(me, 'UPDATE_SEVA_ITEM', `Updated seva: ${doc.name} Rs.${doc.price} ${doc.active ? 'ON' : 'OFF'}`);
    return send(res, 200, doc);
  }
  if (a === 'sevaitems' && b && method === 'DELETE') {
    const me = await requireRole(req, ['super_admin', 'seva_manager']);
    const old = await getDoc('sevaitem', b);
    if (!(await deleteDoc('sevaitem', b))) throw new HttpError(404, 'Seva not found.');
    await audit(me, 'DELETE_SEVA_ITEM', `Deleted seva: ${old?.name}`);
    return send(res, 200, { success: true });
  }

  // ---------------- events (committee adds local temple events) ----------------
  if (key === 'GET /events') {
    const all = (await listDocs('event', 500)).sort((x, y) => (x.date < y.date ? -1 : 1));
    if (url.searchParams.get('all') === '1') { await requireRole(req, CONTENT); return send(res, 200, all); }
    return send(res, 200, all.filter((e) => e.published));
  }
  const cleanEvent = (d) => {
    const titleEn = str(d.titleEn, 150);
    const date = str(d.date, 10), endDate = str(d.endDate, 10);
    if (!titleEn) throw new HttpError(400, 'Event title is required.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new HttpError(400, 'Choose the event date.');
    if (endDate && (!/^\d{4}-\d{2}-\d{2}$/.test(endDate) || endDate < date)) throw new HttpError(400, 'End date cannot be before the start date.');
    return {
      titleEn, titleOr: str(d.titleOr, 150) || titleEn, titleHi: str(d.titleHi, 150) || titleEn, date, endDate,
      time: str(d.time, 60), place: str(d.place, 150), descEn: str(d.descEn, 800), descOr: str(d.descOr, 800) || str(d.descEn, 800), descHi: str(d.descHi, 800) || str(d.descEn, 800),
      published: d.published !== false,
    };
  };
  if (key === 'POST /events') {
    const me = await requireRole(req, CONTENT);
    const doc = await insertDoc('event', newId('evt'), cleanEvent(await readJson(req)));
    await audit(me, 'ADD_EVENT', `Added event: ${doc.titleEn} (${doc.date})`);
    return send(res, 201, doc);
  }
  if (a === 'events' && b && method === 'PATCH') {
    const me = await requireRole(req, CONTENT);
    const doc = await patchDoc('event', b, cleanEvent(await readJson(req)));
    if (!doc) throw new HttpError(404, 'Event not found.');
    await audit(me, 'UPDATE_EVENT', `Updated event: ${doc.titleEn}`);
    return send(res, 200, doc);
  }
  if (a === 'events' && b && method === 'DELETE') {
    const me = await requireRole(req, CONTENT);
    const old = await getDoc('event', b);
    if (!(await deleteDoc('event', b))) throw new HttpError(404, 'Event not found.');
    await audit(me, 'DELETE_EVENT', `Deleted event: ${old?.titleEn}`);
    return send(res, 200, { success: true });
  }

  // ---------------- daily darshan / ritual timings ----------------
  if (key === 'GET /timings') {
    const t = await getDoc('config', 'timings');
    return send(res, 200, { rows: t?.rows?.length ? t.rows : DEFAULT_TIMINGS, custom: !!t?.rows?.length });
  }
  if (key === 'POST /timings') {
    const me = await requireRole(req, CONTENT);
    const d = await readJson(req);
    if (d.reset) { await deleteDoc('config', 'timings'); await audit(me, 'RESET_TIMINGS', 'Timings reset to default'); return send(res, 200, { rows: DEFAULT_TIMINGS, custom: false }); }
    const rows = (Array.isArray(d.rows) ? d.rows : []).slice(0, 40).map((r) => ({
      time: str(r.time, 40), eventEn: str(r.eventEn, 120), eventOr: str(r.eventOr, 120) || str(r.eventEn, 120), eventHi: str(r.eventHi, 120) || str(r.eventEn, 120),
      descEn: str(r.descEn, 300), descOr: str(r.descOr, 300) || str(r.descEn, 300), descHi: str(r.descHi, 300) || str(r.descEn, 300),
    })).filter((r) => r.time && r.eventEn);
    if (!rows.length) throw new HttpError(400, 'Add at least one timing row (time and name).');
    if (await getDoc('config', 'timings')) await patchDoc('config', 'timings', { rows }); else await insertDoc('config', 'timings', { rows });
    await audit(me, 'UPDATE_TIMINGS', `Updated daily timings (${rows.length} rows)`);
    return send(res, 200, { rows, custom: true });
  }

  // ---------------- grievance tickets ----------------
  if (key === 'POST /tickets') {
    rateLimit(req, 'ticket', 5, 60_000);
    const d = await readJson(req);
    if (!str(d.name) || !str(d.message, 3000)) throw new HttpError(400, 'Name and message are required.');
    if (str(d.email) && !isEmail(str(d.email, 254))) throw new HttpError(400, 'Enter a valid email address.');
    const doc = await insertDoc('ticket', newId('tkt'), {
      ticketNumber: `TKT-${crypto.randomInt(100000, 999999)}`, status: 'open', createdAt: new Date().toISOString(), adminNotes: '',
      name: str(d.name, 80), email: str(d.email, 254), phone: str(d.phone, 15), type: str(d.type, 40) || 'general_inquiry',
      subject: str(d.subject, 200), message: str(d.message, 3000),
    });
    return send(res, 201, { ticketNumber: doc.ticketNumber, id: doc.id, status: doc.status, subject: doc.subject });
  }
  if (key === 'GET /tickets') { await requireRole(req, CONTENT); return send(res, 200, await listDocs('ticket')); }
  if (a === 'tickets' && b && method === 'PATCH') {
    const me = await requireRole(req, CONTENT);
    const d = await readJson(req);
    const doc = await patchDoc('ticket', b, { status: str(d.status, 20) || 'resolved', adminNotes: str(d.notes, 2000) });
    if (!doc) throw new HttpError(404, 'Ticket not found.');
    await audit(me, 'UPDATE_TICKET', `Updated ticket: ${doc.ticketNumber} to status: ${doc.status}`);
    return send(res, 200, doc);
  }

  // ---------------- admin extras ----------------
  if (key === 'GET /audit') { await requireRole(req, ['super_admin']); return send(res, 200, await listDocs('audit', 300)); }
  if (key === 'GET /analytics') {
    await requireRole(req, ADMINS);
    const [donations, sevas, tickets, notices] = await Promise.all(['donation', 'seva', 'ticket', 'notice'].map((k) => listDocs(k)));
    const categoryBreakdown = {};
    donations.forEach((d) => { categoryBreakdown[d.category] = (categoryBreakdown[d.category] || 0) + Number(d.amount); });
    return send(res, 200, {
      totalDonations: donations.reduce((s, d) => s + Number(d.amount), 0), totalDonationsCount: donations.length,
      pendingSevasCount: sevas.filter((s) => s.approvalStatus === 'pending').length,
      approvedSevasCount: sevas.filter((s) => s.approvalStatus === 'approved').length,
      openTicketsCount: tickets.filter((t) => t.status === 'open').length, totalNoticesCount: notices.length, categoryBreakdown,
    });
  }
  if (key === 'GET /backup') {
    const me = await requireRole(req, ['super_admin']);
    const kinds = ['notice', 'festival', 'seva', 'donation', 'gallery', 'faq', 'ticket', 'audit'];
    const out = {};
    for (const k of kinds) out[k] = await listDocs(k, 100000);
    out.subscriber = (await listDocs('subscriber', 100000)).map(({ token, ...x }) => x);
    out.users = await db()`SELECT id, name, email, phone, gotra, address, created_at FROM users ORDER BY created_at DESC`;
    await audit(me, 'BACKUP', 'Downloaded database backup');
    return send(res, 200, out);
  }

  throw new HttpError(404, 'Not found');
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, 'http://x');
    // vercel.json rewrites every /api/* call to this file and passes the original path in ?__p=
    let path = url.searchParams.get('__p');
    if (path === null) path = url.pathname.replace(/^\/api\/?/, '');
    path = path.replace(/^\/+|\/+$/g, '');
    url.searchParams.delete('__p');
    await ensureReady();
    await route(req, res, req.method, path, url);
  } catch (e) {
    if (!(e instanceof HttpError)) console.error(e);
    send(res, e.status || 500, { error: e instanceof HttpError ? e.message : 'Something went wrong. Please try again.' });
  }
}
