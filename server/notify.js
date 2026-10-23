import nodemailer from 'nodemailer';
import { HttpError } from './http.js';
import { OFFICIAL_ADMIN } from './auth.js';

export const emailConfigured = () => !!process.env.GMAIL_APP_PASSWORD;
export const smsConfigured = () => !!(process.env.MSG91_AUTHKEY && process.env.MSG91_TEMPLATE_ID);
export const whatsappConfigured = () =>
  !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_TEMPLATE);

const mailUser = () => process.env.GMAIL_USER || OFFICIAL_ADMIN;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let transport;
function mailer() {
  transport ??= nodemailer.createTransport({
    service: 'gmail',
    auth: { user: mailUser(), pass: process.env.GMAIL_APP_PASSWORD },
    pool: true,
    maxConnections: 3,
  });
  return transport;
}

async function runPool(items, worker, size = 3) {
  const queue = [...items];
  await Promise.all(Array.from({ length: size }, async () => {
    while (queue.length) await worker(queue.shift());
  }));
}

// messages = [{ title, body }, ...]  (English first, then Odia / Hindi if available)
export async function sendEmails(recipients, messages, baseUrl, opts = {}) {
  if (!emailConfigured()) throw new HttpError(503, 'Email sending is not set up yet (GMAIL_APP_PASSWORD missing on the server).');
  let sent = 0, failed = 0;
  const subject = opts.subject || 'Temple Notice: ' + messages[0].title;
  await runPool(recipients, async (r) => {
    const unsub = r.unsubUrl || `${baseUrl}/api/index?__p=unsubscribe&t=${r.token}`;
    const text = messages.map((m) => `${m.title}\n\n${m.body}`).join('\n\n-----\n\n')
      + `\n\n--\nShree Jagannath Temple Sidheswar, Sidhaswar, Ganjam, Odisha\nUnsubscribe: ${unsub}`;
    const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#3b2417">
      <h2 style="color:#7a0f0f;margin:0 0 4px">Shree Jagannath Temple Sidheswar</h2>
      <p style="margin:0 0 16px;color:#a15c32;font-size:13px">Official temple notice</p>
      ${messages.map((m) => `<h3 style="margin:16px 0 6px">${esc(m.title)}</h3><p style="white-space:pre-wrap;line-height:1.55;margin:0">${esc(m.body)}</p>`).join('<hr style="border:none;border-top:1px solid #eadcc9;margin:16px 0">')}
      <p style="margin-top:24px;font-size:12px;color:#8a6a50">You are receiving this because you subscribed on the temple website.
      <a href="${esc(unsub)}">Unsubscribe</a></p></div>`;
    try {
      await mailer().sendMail({
        from: `"Shree Jagannath Temple Sidheswar" <${mailUser()}>`,
        to: r.value, subject, text, html,
        headers: { 'List-Unsubscribe': `<${unsub}>` },
      });
      sent++;
    } catch (e) {
      failed++;
      console.error('email failed:', e.message);
    }
  });
  return { sent, failed };
}

// Uses the official WhatsApp Business Cloud API with an approved TEMPLATE that has 2 body variables: {{1}} title, {{2}} text
export async function sendWhatsApp(phones, title, body, template) {
  if (!whatsappConfigured()) throw new HttpError(503, 'WhatsApp sending is not set up yet.');
  const clean = (s, n) => String(s).replace(/\s+/g, ' ').trim().slice(0, n);
  let sent = 0, failed = 0;
  await runPool(phones, async (p) => {
    try {
      const r = await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: '91' + p.value,
          type: 'template',
          template: {
            name: template || process.env.WHATSAPP_TEMPLATE,
            language: { code: process.env.WHATSAPP_LANG || 'en' },
            components: [{ type: 'body', parameters: [{ type: 'text', text: clean(title, 120) }, { type: 'text', text: clean(body, 800) }] }],
          },
        }),
      });
      if (r.ok) sent++;
      else { failed++; console.error('whatsapp failed:', r.status, await r.text()); }
    } catch (e) {
      failed++;
      console.error('whatsapp error:', e.message);
    }
  });
  return { sent, failed };
}

// SMS through MSG91 "Flow" (India: needs a DLT-approved template with two variables VAR1 and VAR2)
export async function sendSms(phones, var1, var2) {
  if (!smsConfigured()) throw new HttpError(503, 'SMS sending is not set up yet.');
  let sent = 0, failed = 0;
  const clean = (x, n) => String(x).replace(/\s+/g, ' ').trim().slice(0, n);
  for (let i = 0; i < phones.length; i += 100) {
    const batch = phones.slice(i, i + 100);
    try {
      const r = await fetch('https://control.msg91.com/api/v5/flow', {
        method: 'POST',
        headers: { authkey: process.env.MSG91_AUTHKEY, 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID, short_url: '0',
          recipients: batch.map((p) => ({ mobiles: '91' + p.value, VAR1: clean(var1, 60), VAR2: clean(var2, 60) })),
        }),
      });
      if (r.ok) sent += batch.length; else { failed += batch.length; console.error('sms failed:', r.status, await r.text()); }
    } catch (e) { failed += batch.length; console.error('sms error:', e.message); }
  }
  return { sent, failed };
}
