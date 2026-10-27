// Run once from the project root:  node patch-index.mjs
// Adds title, description, favicon, social-share image, structured data (SEO) to index.html and creates robots.txt / sitemap.xml
// ONLY if they are missing. Your Google Search Console verification tag is kept untouched. Safe to run again.
import fs from 'node:fs';

// Change this line when you move to your own domain (for example https://shreejagannathtemplesidheswar.org)
const SITE_URL = 'https://shreejagannathtemplesidheswar.vercel.app';

const TITLE = 'Shree Jagannath Temple Sidheswar | Lord Jagannath (Patitapavan), Sidhaswar, Odisha';
const DESC = 'Official website of Shree Jagannath Temple Sidheswar, Sidhaswar, Ganjam, Odisha. Darshan and aarti timings, live darshan, festival dates, seva booking and online donation for Lord Jagannath (Patitapavan).';

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');
const crlf = html.includes('\r\n');
if (crlf) html = html.replace(/\r\n/g, '\n');

// 0) clean-up: anything in <head> that is not a tag (for example a left-over  " />  from an older patch) shows up on the page. Remove it.
const ATTR = `(?:"[^"]*"|'[^']*'|[^>"'])*`;                      // attribute text; a ">" inside quotes does not end the tag
const TOKEN = new RegExp(`<!--[\\s\\S]*?-->|<(script|style)\\b[\\s\\S]*?<\\/\\1\\s*>|<title>[\\s\\S]*?<\\/title>|<\\/?[a-zA-Z][^\\s>/]*${ATTR}>`, 'g');
function cleanHead(src) {
  const headMatch = src.match(/(<head\b[^>]*>)([\s\S]*?)(<\/head>)/i);
  if (!headMatch) return src;
  const inner = headMatch[2];
  let out = '', last = 0, removed = [];
  for (const m of inner.matchAll(TOKEN)) {
    const gap = inner.slice(last, m.index);
    if (gap.trim()) removed.push(gap.trim());
    out += gap.replace(/\S/g, '') + m[0];
    last = m.index + m[0].length;
  }
  const tail = inner.slice(last);
  if (tail.trim()) removed.push(tail.trim());
  out += tail.replace(/\S/g, '');
  if (removed.length) console.log('removed stray text from <head>:', removed.map((x) => JSON.stringify(x.slice(0, 60))).join(', '));
  return src.replace(headMatch[0], () => headMatch[1] + out + headMatch[3]);
}
html = cleanHead(html);

// 1) drop the old copies of the tags we manage (never the google-site-verification tag)
const tag = (name, attr) => new RegExp(`^[ \\t]*<${name}\\s+${attr}${ATTR}>[ \\t]*\\n?`, 'gim');
const strip = [
  /^[ \t]*<title>[\s\S]*?<\/title>[ \t]*\n?/gim,
  tag('meta', 'name="description"'),
  tag('link', 'rel="canonical"'),
  tag('link', 'rel="(?:shortcut )?icon"'),
  tag('link', 'rel="apple-touch-icon"'),
  tag('meta', 'property="og:[^"]*"'),
  tag('meta', 'name="twitter:[^"]*"'),
  tag('meta', 'name="theme-color"'),
  /^[ \t]*<!-- seo:start -->[\s\S]*?<!-- seo:end -->[ \t]*\n?/gim,
];
for (const re of strip) html = html.replace(re, '');

const ld = {
  '@context': 'https://schema.org', '@type': 'HinduTemple', name: 'Shree Jagannath Temple Sidheswar', url: SITE_URL + '/',
  image: SITE_URL + '/og-image.jpg', telephone: '+919337822942', email: 'shreejagannathtemplesiddheswar@gmail.com',
  address: { '@type': 'PostalAddress', streetAddress: '9JMV+VVC, Sidhaswar', addressRegion: 'Odisha', postalCode: '761054', addressCountry: 'IN' },
  geo: { '@type': 'GeoCoordinates', latitude: 19.385, longitude: 84.645 },
  sameAs: [
    'https://www.youtube.com/@SHREEJAGANNATHTEMPLESIDDHESWAR',
    'https://www.instagram.com/shree.jagannath.temple.sid',
    'https://www.facebook.com/share/1KmGfHqbJz/',
  ],
};
const block = `    <!-- seo:start -->
    <title>${TITLE}</title>
    <meta name="description" content="${DESC}" />
    <link rel="canonical" href="${SITE_URL}/" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="theme-color" content="#7a0f0f" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Shree Jagannath Temple Sidheswar" />
    <meta property="og:title" content="${TITLE}" />
    <meta property="og:description" content="${DESC}" />
    <meta property="og:url" content="${SITE_URL}/" />
    <meta property="og:image" content="${SITE_URL}/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${TITLE}" />
    <meta name="twitter:description" content="${DESC}" />
    <meta name="twitter:image" content="${SITE_URL}/og-image.jpg" />
    <script type="application/ld+json">${JSON.stringify(ld)}</script>
    <!-- seo:end -->
`;
if (!html.includes('</head>')) { console.log('!! </head> not found in index.html - send me the file'); process.exit(1); }
html = html.replace('</head>', block + '  </head>');
html = cleanHead(html);   // final safety pass
fs.writeFileSync(file, crlf ? html.replace(/\n/g, '\r\n') : html, 'utf8');
console.log('updated index.html' + (/google-site-verification/.test(html) ? ' (Google verification tag kept)' : ' (note: no google-site-verification tag found in this file)'));

fs.mkdirSync('public', { recursive: true });
if (!fs.existsSync('public/robots.txt')) {
  fs.writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  console.log('created public/robots.txt');
} else console.log('kept your existing public/robots.txt');
if (!fs.existsSync('public/sitemap.xml')) {
  const pages = ['', 'about', 'darshan', 'live', 'festivals', 'panchang', 'seva', 'donation', 'prasad', 'gallery', 'notices', 'visit', 'contact', 'privacy-policy', 'terms', 'refund-policy'];
  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    pages.map((p) => `  <url><loc>${SITE_URL}/${p}</loc><lastmod>${today}</lastmod></url>`).join('\n') + `\n</urlset>\n`);
  console.log('created public/sitemap.xml');
} else console.log('kept your existing public/sitemap.xml (remember to use your new domain in it if you move)');
