// Finds the temple's YouTube channel and checks whether it is live right now (no API key needed).
export const DEFAULT_HANDLE = 'SHREEJAGANNATHTEMPLESIDDHESWAR';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function fetchText(url, ms = 4500) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(url, { signal: ac.signal, redirect: 'follow', headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', Cookie: 'CONSENT=YES+1; SOCS=CAI' } });
    return r.ok ? await r.text() : '';
  } catch { return ''; } finally { clearTimeout(t); }
}
const decode = (s) => String(s).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

export function extractChannelId(html) {
  const m = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})"/)
    || html.match(/<meta itemprop="(?:channelId|identifier)" content="(UC[\w-]{22})"/)
    || html.match(/"(?:channelId|externalId|browseId)":"(UC[\w-]{22})"/);
  return m ? m[1] : '';
}

// the channel's /live page redirects to the running stream; then the page says it is live
export function extractLive(html) {
  const canon = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/);
  if (!canon || !/"isLive(?:Now)?":true/.test(html)) return null;
  const title = (html.match(/<meta name="title" content="([^"]*)"/) || [])[1] || '';
  return { videoId: canon[1], title: decode(title).slice(0, 120) };
}

export async function channelIdFromHandle(handle) {
  const h = String(handle || '').replace(/^@/, '');
  if (!/^[\w.-]{3,60}$/.test(h)) return '';
  return extractChannelId(await fetchText(`https://www.youtube.com/@${h}`));
}

let resolved = { id: '', at: 0 };
// env YOUTUBE_CHANNEL_ID > id saved by the admin > id read once from the default channel handle
export async function resolveChannel(doc = {}) {
  if (process.env.YOUTUBE_CHANNEL_ID && /^UC[\w-]{22}$/.test(process.env.YOUTUBE_CHANNEL_ID)) return { id: process.env.YOUTUBE_CHANNEL_ID, fromHandle: false };
  if (doc.channelId) return { id: doc.channelId, fromHandle: false };
  if (doc.resolvedChannelId) return { id: doc.resolvedChannelId, fromHandle: false };
  if (resolved.id && Date.now() - resolved.at < 6 * 3600000) return { id: resolved.id, fromHandle: false };
  const id = await channelIdFromHandle(DEFAULT_HANDLE);
  if (id) resolved = { id, at: Date.now() };
  return { id, fromHandle: !!id };
}

let liveCache = { at: 0, key: '', val: null };
export async function detectLive(channelId) {
  if (!channelId) return null;
  if (liveCache.key === channelId && Date.now() - liveCache.at < 45000) return liveCache.val;
  const val = extractLive(await fetchText(`https://www.youtube.com/channel/${channelId}/live`));
  liveCache = { at: Date.now(), key: channelId, val };
  return val;
}
