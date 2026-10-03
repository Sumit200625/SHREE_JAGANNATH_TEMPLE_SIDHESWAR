import crypto from 'node:crypto';
import { db, insertDoc } from './db.js';
import { HttpError, str, isEmail, isPhone } from './http.js';
import { newId } from './auth.js';
import { SEVAS, DONATION_CATEGORIES, MIN_DONATION, MAX_DONATION } from '../shared/catalog.js';

export const paymentsEnabled = () => !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

async function rzp(path, method = 'GET', body) {
  if (!paymentsEnabled()) throw new HttpError(503, 'Online payment is not enabled yet. Please contact the temple office.');
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  const r = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error('Razorpay error', r.status, JSON.stringify(json));
    throw new HttpError(502, json?.error?.description || 'Payment gateway error. Please try again.');
  }
  return json;
}

const istToday = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
const istYear = () => new Date(Date.now() + 5.5 * 3600 * 1000).getUTCFullYear();

// ---------- 1. create a Razorpay order (amount is decided/validated HERE, never trusted from the browser) ----------
export async function createOrder(input, user) {
  let amount, payload;

  if (input.type === 'donation') {
    amount = Number(input.amount);
    if (!Number.isInteger(amount) || amount < MIN_DONATION || amount > MAX_DONATION)
      throw new HttpError(400, `Donation must be a whole number between ₹${MIN_DONATION} and ₹${MAX_DONATION}.`);
    const d = input.donor || {};
    const category = str(d.category, 40);
    if (!DONATION_CATEGORIES.includes(category)) throw new HttpError(400, 'Invalid donation category.');
    const phone = str(d.phone, 10), email = str(d.email, 254).toLowerCase(), pan = str(d.panNumber, 10).toUpperCase();
    if (phone && !isPhone(phone)) throw new HttpError(400, 'Enter a valid 10-digit mobile number.');
    if (email && !isEmail(email)) throw new HttpError(400, 'Enter a valid email address.');
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) throw new HttpError(400, 'Enter a valid PAN (e.g. ABCDE1234F) or leave it blank.');
    const isAnonymous = !!d.isAnonymous;
    payload = {
      donorName: isAnonymous ? 'Anonymous Devotee' : (str(d.donorName, 80) || 'Devotee'),
      realName: str(d.donorName, 80) || user?.name || 'Devotee',
      email, phone, panNumber: pan, category, isAnonymous,
    };
  } else if (input.type === 'seva') {
    const b = input.booking || {};
    const seva = SEVAS.find((s) => s.name === b.sevaType);
    if (!seva) throw new HttpError(400, 'Invalid seva selected.');
    amount = seva.price;
    const phone = str(b.phone, 10), email = str(b.email, 254).toLowerCase(), date = str(b.selectedDate, 10);
    if (!str(b.devoteeName, 80)) throw new HttpError(400, 'Devotee name is required.');
    if (!isPhone(phone)) throw new HttpError(400, 'Enter a valid 10-digit mobile number.');
    if (email && !isEmail(email)) throw new HttpError(400, 'Enter a valid email address.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < istToday()) throw new HttpError(400, 'Choose a seva date from today onwards.');
    const family = Array.isArray(b.familyMembers) ? b.familyMembers.map((m) => str(m, 60)).filter(Boolean).slice(0, 15) : [];
    payload = {
      devoteeName: str(b.devoteeName, 80), email, phone, gotra: str(b.gotra, 60), address: str(b.address, 300),
      familyMembers: family, selectedDate: date, sevaType: seva.name, specialRequest: str(b.specialRequest, 500),
    };
  } else {
    throw new HttpError(400, 'Unknown payment type.');
  }

  const order = await rzp('/orders', 'POST', {
    amount: amount * 100, currency: 'INR', receipt: newId('r'), notes: { type: input.type },
  });
  await db()`INSERT INTO orders (id, type, amount_paise, payload, user_id)
             VALUES (${order.id}, ${input.type}, ${amount * 100}, ${JSON.stringify(payload)}::jsonb, ${user?.id || null})`;
  return { orderId: order.id, amount: amount * 100, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID };
}

// ---------- 2. verify signature ----------
const safeEq = (a, b) => {
  const x = Buffer.from(a || ''), y = Buffer.from(b || '');
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export function verifyCheckoutSignature(orderId, paymentId, signature) {
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${orderId}|${paymentId}`).digest('hex');
  return safeEq(expected, signature);
}

export function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  return safeEq(crypto.createHmac('sha256', secret).update(rawBody).digest('hex'), signature);
}

// ---------- 3. fulfil exactly once (called by browser verify AND by webhook) ----------
export async function fulfill(orderId, paymentId) {
  const sql = db();
  const won = await sql`UPDATE orders SET status = 'paid', payment_id = ${paymentId}
                        WHERE id = ${orderId} AND status = 'created' RETURNING *`;
  if (won.length) {
    try { return await createRecord(won[0], paymentId); }
    catch (e) {
      await sql`UPDATE orders SET status = 'created', payment_id = NULL WHERE id = ${orderId}`; // allow retry
      throw e;
    }
  }
  const rows = await sql`SELECT kind, data FROM docs WHERE kind IN ('donation','seva') AND data->>'orderId' = ${orderId}`;
  return rows[0] ? { type: rows[0].kind, record: rows[0].data } : null; // null = being created by the other call
}

async function createRecord(order, paymentId) {
  const p = order.payload;
  const now = new Date().toISOString();
  if (order.type === 'donation') {
    const [{ n }] = await db()`SELECT nextval('receipt_seq')::int AS n`;
    const id = newId('don');
    const record = await insertDoc('donation', id, {
      donorName: p.donorName, email: p.email, phone: p.phone, panNumber: p.panNumber,
      amount: order.amount_paise / 100, category: p.category, isAnonymous: p.isAnonymous,
      paymentGateway: 'Razorpay', transactionId: paymentId, receiptNumber: `RCPT-${istYear()}-${n}`,
      date: now, userId: order.user_id, orderId: order.id,
    });
    return { type: 'donation', record };
  }
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const ref = 'SEVA-' + Array.from(crypto.randomBytes(8), (b) => alphabet[b % alphabet.length]).join('');
  const record = await insertDoc('seva', newId('sev'), {
    ...p, amount: order.amount_paise / 100, bookingReference: ref, paymentStatus: 'paid', approvalStatus: 'pending',
    transactionId: paymentId, createdAt: now, userId: order.user_id, orderId: order.id,
  });
  return { type: 'seva', record };
}

export async function getOrder(orderId) {
  const rows = await db()`SELECT * FROM orders WHERE id = ${orderId}`;
  return rows[0] || null;
}

export async function refund(paymentId, amountRupees) {
  return rzp(`/payments/${paymentId}/refund`, 'POST', { amount: Math.round(amountRupees * 100), speed: 'normal' });
}

// Safe projection for the public "transparency log"
export const publicDonation = (d) => ({
  id: d.id, donorName: d.isAnonymous ? 'Anonymous Devotee' : (d.donorName || 'Devotee'),
  amount: d.amount, category: d.category, date: d.date,
});
