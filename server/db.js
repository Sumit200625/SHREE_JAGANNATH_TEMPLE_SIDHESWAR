import { neon } from '@neondatabase/serverless';
import { HttpError } from './http.js';
import { SEED_NOTICES, SEED_FESTIVALS, SEED_GALLERY, SEED_FAQS } from './seed.js';

let _sql;
export function db() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) throw new HttpError(500, 'Server is not configured: DATABASE_URL is missing.');
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

let readyPromise;
export function ensureReady() {
  readyPromise ??= init().catch((e) => { readyPromise = null; throw e; });
  return readyPromise;
}

async function init() {
  const sql = db();
  await sql`CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY,
    name text NOT NULL,
    email text UNIQUE,
    phone text,
    password_hash text,
    google_sub text UNIQUE,
    picture text,
    gotra text,
    address text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
  // Generic document table: notices, festivals, faqs, gallery, sevas, donations, tickets, audit logs
  await sql`CREATE TABLE IF NOT EXISTS docs (
    seq bigserial,
    kind text NOT NULL,
    id text NOT NULL,
    data jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (kind, id)
  )`;
  await sql`CREATE INDEX IF NOT EXISTS docs_kind_seq ON docs (kind, seq)`;
  await sql`CREATE TABLE IF NOT EXISTS orders (
    id text PRIMARY KEY,
    type text NOT NULL,
    amount_paise integer NOT NULL,
    status text NOT NULL DEFAULT 'created',
    payload jsonb NOT NULL,
    user_id text,
    payment_id text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE SEQUENCE IF NOT EXISTS receipt_seq START 1001`;

  const [{ c }] = await sql`SELECT count(*)::int AS c FROM docs WHERE kind IN ('notice','festival','gallery','faq')`;
  if (c === 0) {
    // "newest first" kinds are read ORDER BY seq DESC, so insert them reversed to keep the original order on screen
    const rows = [
      ...[...SEED_NOTICES].reverse().map((d) => ({ kind: 'notice', id: d.id, data: d })),
      ...[...SEED_FESTIVALS].reverse().map((d) => ({ kind: 'festival', id: d.id, data: d })),
      ...SEED_GALLERY.map((d) => ({ kind: 'gallery', id: d.id, data: d })),
      ...SEED_FAQS.map((d) => ({ kind: 'faq', id: d.id, data: d })),
    ];    await sql`INSERT INTO docs (kind, id, data)
      SELECT kind, id, data FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb) AS t(kind text, id text, data jsonb)
      ON CONFLICT DO NOTHING`;
  }
}

// ---- document helpers ----
const ASC_KINDS = new Set(['gallery', 'faq']);

export async function listDocs(kind, limit = 1000) {
  const sql = db();
  const rows = ASC_KINDS.has(kind)
    ? await sql`SELECT data FROM docs WHERE kind = ${kind} ORDER BY seq ASC LIMIT ${limit}`
    : await sql`SELECT data FROM docs WHERE kind = ${kind} ORDER BY seq DESC LIMIT ${limit}`;
  return rows.map((r) => r.data);
}

export async function getDoc(kind, id) {
  const rows = await db()`SELECT data FROM docs WHERE kind = ${kind} AND id = ${id}`;
  return rows[0]?.data || null;
}

export async function insertDoc(kind, id, data) {
  await db()`INSERT INTO docs (kind, id, data) VALUES (${kind}, ${id}, ${JSON.stringify({ ...data, id })}::jsonb)`;
  return { ...data, id };
}

export async function patchDoc(kind, id, patch) {
  const rows = await db()`UPDATE docs SET data = data || ${JSON.stringify(patch)}::jsonb WHERE kind = ${kind} AND id = ${id} RETURNING data`;
  return rows[0]?.data || null;
}

export async function deleteDoc(kind, id) {
  const rows = await db()`DELETE FROM docs WHERE kind = ${kind} AND id = ${id} RETURNING id`;
  return rows.length > 0;
}

