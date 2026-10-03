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

// ---- staff roles come from environment variables (verified Google accounts only) ----
//   ADMIN_EMAILS = "head@gmail.com,other@gmail.com"                      -> super_admin
//   STAFF_ROLES  = "a@gmail.com:seva_manager,b@gmail.com:donation_manager,c@gmail.com:content_editor,d@gmail.com:notice_manager"
const list = (v) => (v || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
function staffRole(email, googleVerified) {
  if (!email || !googleVerified) return 'devotee';
  const e = email.toLowerCase();
  if (list(process.env.ADMIN_EMAILS).includes(e)) return 'super_admin';
  for (const pair of list(process.env.STAFF_ROLES)) {
    const [mail, role] = pair.split(':');
    if (mail === e && ['seva_manager', 'donation_manager', 'content_editor', 'notice_manager'].includes(role)) return role;
  }
  return 'devotee';
}

export function publicUser(u) {
  return {
    id: u.id, name: u.name, email: u.email, phone: u.phone || '', picture: u.picture || '',
    gotra: u.gotra || '', address: u.address || '',
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

export const newId = (prefix) => `${prefix}_${crypto.randomBytes(9).toString('base64url')}`;
