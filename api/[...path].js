import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { put } from '@vercel/blob';
import { db, ensureReady, listDocs, getDoc, insertDoc, patchDoc, deleteDoc } from '../server/db.js';
import {
  startSession, endSession, currentUser, requireUser, requireRole, publicUser,
  verifyGoogleCredential, newId,
} from '../server/auth.js';
import { HttpError, send, readJson, readRaw, str, isEmail, isPhone, rateLimit } from '../server/http.js';
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

async function upsertGoogleUser(p) {
  const sql = db();
  const email = p.email.toLowerCase();
  const found = await sql`SELECT * FROM users WHERE google_sub = ${p.sub} OR email = ${email} LIMIT 1`;
  if (found[0]) {
    const rows = await sql`UPDATE users SET google_sub = ${p.sub}, picture = ${p.picture || null},
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
  if (key === 'POST /account/google') {
    rateLimit(req, 'login', 20, 60_000);
    const { credential } = await readJson(req);
    const payload = await verifyGoogleCredential(str(credential, 4000));
    const u = await upsertGoogleUser(payload);
    await startSession(res, u.id);
    return send(res, 200, { user: publicUser(u) });
  }
  if (key === 'POST /account/register') {
    rateLimit(req, 'register', 10, 60_000);
    const d = await readJson(req);
    const name = str(d.name, 80), email = str(d.email, 254).toLowerCase(), phone = str(d.phone, 10), pw = String(d.password || '');
    if (!name) throw new HttpError(400, 'Name is required.');
    if (!isEmail(email)) throw new HttpError(400, 'Enter a valid email address.');
    if (!isPhone(phone)) throw new HttpError(400, 'Enter a valid 10-digit mobile number.');
    if (pw.length < 8 || pw.length > 72) throw new HttpError(400, 'Password must be 8 to 72 characters.');
    const hash = await bcrypt.hash(pw, 11);
    try {
      const rows = await db()`INSERT INTO users (id, name, email, phone, password_hash)
        VALUES (${newId('usr')}, ${name}, ${email}, ${phone}, ${hash}) RETURNING *`;
      await startSession(res, rows[0].id);
      return send(res, 200, { user: publicUser(rows[0]) });
    } catch (e) {
      if (String(e.message).includes('unique')) throw new HttpError(409, 'This email is already registered. Please log in.');
      throw e;
    }
  }
  if (key === 'POST /account/login') {
    rateLimit(req, 'login', 10, 60_000);
    const d = await readJson(req);
    const email = str(d.email, 254).toLowerCase();
    const rows = await db()`SELECT * FROM users WHERE email = ${email}`;
    const u = rows[0];
    const ok = u?.password_hash && (await bcrypt.compare(String(d.password || ''), u.password_hash));
    if (!ok) throw new HttpError(401, 'Invalid email or password. (If you signed up with Google, use "Continue with Google".)');
    await startSession(res, u.id);
    return send(res, 200, { user: publicUser(u) });
  }
  if (key === 'POST /account/logout') { endSession(res); return send(res, 200, { ok: true }); }
  if (key === 'GET /account/me') return send(res, 200, { user: await currentUser(req) });
  if (key === 'PATCH /account/profile') {
    const me = await requireUser(req);
    const d = await readJson(req);
    const rows = await db()`UPDATE users SET name = COALESCE(NULLIF(${str(d.name, 80)}, ''), name),
      gotra = ${str(d.gotra, 60)}, address = ${str(d.address, 300)},
      phone = COALESCE(NULLIF(${str(d.phone, 10)}, ''), phone) WHERE id = ${me.id} RETURNING *`;
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
      titleOr: str(d.titleOr, 200), contentOr: str(d.contentOr, 4000),
      titleHi: str(d.titleHi, 200), contentHi: str(d.contentHi, 4000),
      category: str(d.category, 30) || 'general', isPinned: !!d.isPinned,
      publishDate: new Date().toISOString().slice(0, 10), expiryDate: str(d.expiryDate, 10) || '', pdfUrl: str(d.pdfUrl, 500) || '#',
    });
    await audit(me, 'CREATE_NOTICE', `Created announcement: ${doc.titleEn}`);
    return send(res, 201, doc);
  }
  if (a === 'notices' && b && method === 'PATCH') {
    const me = await requireRole(req, NOTICE);
    const d = await readJson(req);
    const patch = {};
    for (const k of ['titleEn', 'contentEn', 'titleOr', 'contentOr', 'titleHi', 'contentHi', 'category', 'expiryDate', 'pdfUrl']) if (k in d) patch[k] = str(d[k], 4000);
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
      return send(res, 200, s ? { bookingReference: s.bookingReference, devoteeName: s.devoteeName, sevaType: s.sevaType, selectedDate: s.selectedDate,
        amount: s.amount, paymentStatus: s.paymentStatus, approvalStatus: s.approvalStatus, rejectionReason: s.rejectionReason || '', phone: s.phone, gotra: s.gotra } : null);
    }
    await requireRole(req, ['super_admin', 'seva_manager']);
    return send(res, 200, await listDocs('seva'));
  }
  if (a === 'sevas' && b && method === 'PATCH') {
    const me = await requireRole(req, ['super_admin', 'seva_manager']);
    const d = await readJson(req);
    if (!['approved', 'rejected'].includes(d.approvalStatus)) throw new HttpError(400, 'Invalid status.');
    const doc = await patchDoc('seva', b, { approvalStatus: d.approvalStatus, rejectionReason: str(d.rejectionReason, 500) });
    if (!doc) throw new HttpError(404, 'Booking not found.');
    await audit(me, 'UPDATE_SEVA', `Updated Seva status (${d.approvalStatus}) for ref: ${doc.bookingReference}`);
    return send(res, 200, doc);
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
    await audit(me, 'BACKUP', 'Downloaded database backup');
    return send(res, 200, out);
  }

  throw new HttpError(404, 'Not found');
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, 'http://x');
    const path = url.pathname.replace(/^\/api\/?/, '');
    await ensureReady();
    await route(req, res, req.method, path, url);
  } catch (e) {
    if (!(e instanceof HttpError)) console.error(e);
    send(res, e.status || 500, { error: e instanceof HttpError ? e.message : 'Something went wrong. Please try again.' });
  }
}

