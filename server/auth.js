import crypto from 'node:crypto';
import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';
import { db } from './db.js';
import { HttpError } from './http.js';

const COOKIE = 'temple_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const secretKey = () => {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new HttpError(500, 'Server is not configured: JWT_SECRET must be at least 32 characters.');
  return new TextEncoder().encode(s);
};

export async function startSession(res, userId) {
  const token = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(userId)
    .setIssuedAt().setExpirationTime(`${MAX_AGE}s`).sign(secretKey());
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`);
}

export function endSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
}

function readCookie(req, name) {
  const m = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(name + '='));
  return m ? m.slice(name.length + 1) : null;
}

// ---- Only ONE admin: the temple's official Gmail (and only when signed in with Google). Everyone else is a devotee. ----
export const OFFICIAL_ADMIN = 'shreejagannathtemplesiddheswar@gmail.com';
function staffRole(email, googleVerified) {
  if (!email || !googleVerified) return 'devotee';
  return email.toLowerCase() === OFFICIAL_ADMIN ? 'super_admin' : 'devotee';
}

export function publicUser(u) {
  return {
    id: u.id, name: u.name, email: u.email, phone: u.phone || '', picture: u.picture || '',
    gotra: u.gotra || '', address: u.address || '', notifyLive: u.notify_live !== false,
    role: staffRole(u.email, !!u.google_sub),
  };
}

export async function currentUser(req) {
  const token = readCookie(req, COOKIE);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
    const rows = await db()`SELECT * FROM users WHERE id = ${payload.sub}`;
    return rows[0] ? publicUser(rows[0]) : null;
  } catch { return null; }
}

export async function requireUser(req) {
  const u = await currentUser(req);
  if (!u) throw new HttpError(401, 'Please log in to continue.');
  return u;
}

export async function requireRole(req, roles) {
  const u = await requireUser(req);
  if (!roles.includes(u.role)) throw new HttpError(403, 'You do not have permission to do this.');
  return u;
}

// ---- Google Sign-In (verifies the ID token signature, audience, issuer, expiry) ----
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
export async function verifyGoogleCredential(credential) {
  const aud = process.env.GOOGLE_CLIENT_ID;
  if (!aud) throw new HttpError(500, 'Google login is not configured on the server (GOOGLE_CLIENT_ID).');
  try {
    const { payload } = await jwtVerify(credential, JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: aud,
    });
    if (!payload.email || payload.email_verified !== true) throw new Error('unverified email');
    return payload;
  } catch {
    throw new HttpError(401, 'Google sign-in could not be verified. Please try again.');
  }
}

// signed token for the one-click "stop live alerts" link in emails (no login needed)
export const liveUnsubToken = (userId) =>
  crypto.createHmac('sha256', process.env.JWT_SECRET || '').update('live:' + userId).digest('base64url').slice(0, 32);

export const newId = (prefix) => `${prefix}_${crypto.randomBytes(9).toString('base64url')}`;
