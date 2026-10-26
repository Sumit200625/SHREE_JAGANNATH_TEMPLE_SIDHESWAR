import { neon } from '@neondatabase/serverless';
import { HttpError } from './http.js';
import { SEED_NOTICES, SEED_FESTIVALS, SEED_GALLERY, SEED_FAQS } from './seed.js';
import { SEVAS, DRAFT_SEVAS, DEFAULT_SLOTS } from '../shared/catalog.js';

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
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_live boolean NOT NULL DEFAULT true`;
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
    ];
    await sql`
      INSERT INTO docs (kind, id, data)
      SELECT kind, id, data
      FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb) AS t(kind text, id text, data jsonb)
      ON CONFLICT DO NOTHING
    `;
  }

  // The seva list lives in the database so the committee can change names, prices, slots and switch sevas on/off
  const [{ n: sevaCount }] = await sql`SELECT count(*)::int AS n FROM docs WHERE kind = 'sevaitem'`;
  if (sevaCount === 0) {
    const items = [
      ...SEVAS.map((x) => ({ ...x, active: true })),
      ...DRAFT_SEVAS.map((x) => ({ ...x, active: false })),   // hidden until the committee sets a real price
    ].map((x, i) => ({ kind: 'sevaitem', id: `sv_${i + 1}`, data: { id: `sv_${i + 1}`, name: x.name, desc: x.desc, price: x.price, slots: DEFAULT_SLOTS, active: x.active, sort: i + 1 } }));
    await sql`
      INSERT INTO docs (kind, id, data)
      SELECT kind, id, data FROM jsonb_to_recordset(${JSON.stringify(items)}::jsonb) AS t(kind text, id text, data jsonb)
      ON CONFLICT DO NOTHING
    `;
  }

  // One-time content update for sites that were seeded earlier: real temple photos, Lord Jagannath only,
  // new contact number. Overwrites the built-in festival/gallery entries (same ids) and removes the old
  // demo gallery pictures. Devotee uploads and admin-created notices are NOT touched.
  const migrated = await sql`SELECT 1 FROM docs WHERE kind = 'meta' AND id = 'content_v2'`;
  if (!migrated.length) {
    const fresh = [
      ...SEED_FESTIVALS.map((d) => ({ kind: 'festival', id: d.id, data: d })),
      ...SEED_GALLERY.map((d) => ({ kind: 'gallery', id: d.id, data: d })),
    ];
    await sql`
      INSERT INTO docs (kind, id, data)
      SELECT kind, id, data
      FROM jsonb_to_recordset(${JSON.stringify(fresh)}::jsonb) AS t(kind text, id text, data jsonb)
      ON CONFLICT (kind, id) DO UPDATE SET data = EXCLUDED.data
    `;
    await sql`DELETE FROM docs WHERE kind = 'gallery' AND data->>'imageUrl' LIKE '/assets/%.png'`;
    await sql`INSERT INTO docs (kind, id, data) VALUES ('meta', 'content_v2', '{}'::jsonb) ON CONFLICT DO NOTHING`;
  }

  // Second one-time refresh: new timings FAQ (Mangala Arati removed) and festival ritual schedules
  const migrated3 = await sql`SELECT 1 FROM docs WHERE kind = 'meta' AND id = 'content_v3'`;
  if (!migrated3.length) {
    const fresh3 = [
      ...SEED_FESTIVALS.map((d) => ({ kind: 'festival', id: d.id, data: d })),
      ...SEED_FAQS.filter((d) => d.id === 'faq_1').map((d) => ({ kind: 'faq', id: d.id, data: d })),
    ];
    await sql`
      INSERT INTO docs (kind, id, data)
      SELECT kind, id, data
      FROM jsonb_to_recordset(${JSON.stringify(fresh3)}::jsonb) AS t(kind text, id text, data jsonb)
      ON CONFLICT (kind, id) DO UPDATE SET data = EXCLUDED.data
    `;
    await sql`INSERT INTO docs (kind, id, data) VALUES ('meta', 'content_v3', '{}'::jsonb) ON CONFLICT DO NOTHING`;
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
