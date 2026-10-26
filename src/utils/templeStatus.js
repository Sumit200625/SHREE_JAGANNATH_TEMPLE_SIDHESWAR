// Helpers for the daily timings (rows like { time: '05:00 AM - 05:30 AM', eventEn, ... })
const toHours = (txt) => {
  const m = String(txt).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return h + parseInt(m[2], 10) / 60;
};
export function parseRange(time) {
  const [a, b] = String(time).split(/\s*[-\u2013]\s*/);
  const start = toHours(a), end = toHours(b);
  return start == null || end == null ? null : { start, end: end <= start ? end + 24 : end };
}
// current time in India as decimal hours
export function nowIST(date = new Date()) {
  const t = new Date(date.getTime() + 5.5 * 3600000);
  return t.getUTCHours() + t.getUTCMinutes() / 60;
}
export const isArati = (r) => /ar[a]?ti/i.test(r.eventEn || '');
const isPahuda = (r) => /pahuda/i.test(r.eventEn || '');

// index of the ritual running right now (or -1)
export function currentRitual(rows, now = nowIST()) {
  return rows.findIndex((r) => { const p = parseRange(r.time); return p && now >= p.start && now < p.end; });
}
// open between the first ritual and Pahuda, and again from the end of Pahuda to the last ritual
export function isTempleOpen(rows, now = nowIST()) {
  const ranges = rows.map((r) => ({ r, p: parseRange(r.time) })).filter((x) => x.p);
  if (!ranges.length) return false;
  const first = Math.min(...ranges.map((x) => x.p.start)), last = Math.max(...ranges.map((x) => x.p.end));
  if (now < first || now >= last) return false;
  const pahuda = ranges.find((x) => isPahuda(x.r));
  return !(pahuda && now >= pahuda.p.start && now < pahuda.p.end);
}
