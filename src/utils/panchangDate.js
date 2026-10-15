// tiny date helpers (kept separate so the home page does not load the astronomy library just to know the date)
const IST_OFFSET_MS = 5.5 * 3600 * 1000;
export function todayIST() {
  const t = new Date(Date.now() + IST_OFFSET_MS);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}
export function shiftDay({ y, m, d }, delta) {
  const t = new Date(Date.UTC(y, m - 1, d + delta));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}
export const toInputValue = ({ y, m, d }) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
export function fromInputValue(v) {
  const [y, m, d] = String(v).split('-').map(Number);
  return y && m && d ? { y, m, d } : null;
}
