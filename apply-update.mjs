// Run from the project root:  node apply-update.mjs
// Applies the content/branding/donation/sevayat changes. Safe to run twice.
import fs from 'node:fs';
import path from 'node:path';

let failures = 0;
const log = (m) => console.log(m);

function load(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const crlf = raw.includes('\r\n');
  return { text: crlf ? raw.replace(/\r\n/g, '\n') : raw, crlf };
}
function save(file, f, text) {
  fs.writeFileSync(file, f.crlf ? text.replace(/\n/g, '\r\n') : text, 'utf8');
}
function edit(file, fn) {
  if (!fs.existsSync(file)) { log(`  !! MISSING FILE ${file}`); failures++; return; }
  const f = load(file);
  const ctx = {
    t: f.text,
    rep(old, neu, all = false) {
      if (this.t.includes(old)) this.t = all ? this.t.split(old).join(neu) : this.t.replace(old, () => neu);
      else if (this.t.includes(neu)) log(`  (already done) ${file}: ${old.slice(0, 50)}`);
      else { log(`  !! NOT FOUND in ${file}: ${old.slice(0, 70)}`); failures++; }
    },
    sub(re, neu) {
      if (re.test(this.t)) this.t = this.t.replace(re, () => neu);
      else log(`  (no match / already done) ${file}: ${String(re).slice(0, 60)}`);
    },
    addImport(line) {
      if (this.t.includes(line)) return;
      const lines = this.t.split('\n');
      let last = -1;
      lines.forEach((l, i) => { if (/^import .* from ['"].*['"];?\s*$/.test(l)) last = i; });
      lines.splice(last + 1, 0, line);
      this.t = lines.join('\n');
    },
  };
  fn(ctx);
  save(file, f, ctx.t);
  log(`updated ${file}`);
}

// ================= Footer =================
edit('src/components/Footer.jsx', (c) => {
  c.addImport("import { SITE } from '../config/site';");
  c.rep('href="https://youtube.com"', 'href={SITE.youtube}');
  c.rep('href="https://facebook.com"', 'href={SITE.facebook}');
  c.sub(/href="https:\/\/www\.instagram\.com\/[^"]*"/, 'href={SITE.instagram}');
  c.rep('href="mailto:info@siddheswarjagannath.org"', 'href={SITE.emailLink}');
  c.rep('<span>Helpline: +91 94371 XXXXX (Manager)</span>', '<a href={SITE.phoneTel} className="hover:text-gold">Helpline / WhatsApp: {SITE.phoneDisplay}</a>');
  c.sub(/\n\s*<li className="flex items-center gap-2">\s*<Phone size=\{14\} className="text-saffron shrink-0" \/>\s*<span>Emergency Contact: \+91 93378 22942<\/span>\s*<\/li>/, '');
  c.rep('<span>Email: trust@siddheswarjagannath.org</span>', '<a href={SITE.emailLink} className="hover:text-gold break-all">Email: {SITE.email}</a>');
});

// ================= Contact page =================
edit('src/pages/ContactGrievance.jsx', (c) => {
  c.addImport("import { SITE } from '../config/site';");
  c.rep('href="https://api.whatsapp.com/send?phone=919437199999&text=Hello%20Siddheswar%20Temple%20Office"', 'href={SITE.whatsapp}');
  c.rep(`              Helpline: +91 94371 XXXXX (Manager)<br />
              Emergency: +91 93378 22942`, `              <a href={SITE.phoneTel} className="text-saffron hover:underline font-bold">{SITE.phoneDisplay}</a><br />
              Helpline / WhatsApp`);
  c.rep(`              info@siddheswarjagannath.org<br />
              trust@siddheswarjagannath.org
            </p>`, `              <a href={SITE.emailLink} className="text-saffron hover:underline font-bold break-all">{SITE.email}</a>
            </p>
            <div className="flex items-center justify-center gap-3 pt-1 text-[11px] font-bold">
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="text-saffron hover:underline">Instagram</a>
              <a href={SITE.youtube} target="_blank" rel="noopener noreferrer" className="text-saffron hover:underline">YouTube</a>
              <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="text-saffron hover:underline">Facebook</a>
            </div>`);
  c.rep('/assets/temple_exterior.png', '/assets/temple_chariot_sunset.jpg');
});

// ================= Sevayat list (About + Contact) =================
for (const f of ['src/pages/About.jsx', 'src/pages/ContactGrievance.jsx']) {
  edit(f, (c) => {
    if (c.t.includes('Kanhu Charan Khadanga')) { log(`  (already done) sevayat in ${f}`); return; }
    const m = c.t.match(/(\s*)<li>Sarat Chandra Padhy<\/li>/);
    if (!m) { log(`  !! Sarat Chandra Padhy not found in ${f}`); failures++; return; }
    const ind = m[1];
    c.t = c.t.replace('<li>Sarat Chandra Padhy</li>', '<li>Lulu Padhy</li>');
    c.t = c.t.replace('<li>Pramod Chandra Padhy</li>', '<li>Pramod Chandra Padhy</li>' + ind + '<li>Kanhu Charan Khadanga</li>' + ind + '<li>Pramod Padhy</li>');
  });
}

// ================= other contact numbers =================
edit('src/pages/DarshanRituals.jsx', (c) => {
  c.rep('href="tel:+9194371XXXXX"', 'href="tel:+919337822942"');
  c.rep('Call Desk: +91 94371 XXXXX', 'Call Desk: +91 93378 22942');
  c.rep("/assets/deity_darshan.png", '/assets/jagannath_sanctum_seva.jpg');
});
edit('src/pages/PlanYourVisit.jsx', (c) => {
  c.rep('Digapahandi Police Station: 112 / +91 6814 24XXXX', 'Police / Emergency: 112');
  c.rep('/assets/temple_exterior.png', '/assets/temple_chariot_sunset.jpg');
});
edit('src/pages/FestivalCalendar.jsx', (c) => {
  c.rep("'+91 94371 99999'", "'+91 93378 22942'");
  c.rep('@siddheswarjagannath.org', '@shreejagannathtemplesidheswar.vercel.app');
  c.rep("bg-[url('/assets/rath_yatra.png')]", "bg-[url('/assets/temple_chariot_sunset.jpg')]");
  c.rep('/assets/temple_exterior.png', '/assets/temple_spire_flags.jpg', true);
});
edit('src/pages/NewsNotices.jsx', (c) => c.rep('/assets/temple_exterior.png', '/assets/temple_chariot_sunset.jpg'));
edit('src/pages/PrasadBhoga.jsx', (c) => c.rep('/assets/annadan_seva.png', '/assets/jagannath_sanctum_seva.jpg'));
edit('src/pages/SevaPuja.jsx', (c) => c.rep('/assets/annadan_seva.png', '/assets/jagannath_sanctum_seva.jpg'));
edit('src/pages/Gallery.jsx', (c) => {
  c.rep('src={error ? "/assets/temple_exterior.png" : src}', 'src={error ? "/assets/temple_spire_flags.jpg" : src}');
  c.rep("bg-[url('/assets/temple_exterior.png')]", "bg-[url('/assets/temple_chariot_sunset.jpg')]");
});

// ================= Home =================
edit('src/pages/Home.jsx', (c) => {
  c.rep("/assets/hero_jagannath.png", '/assets/jagannath_tulasi_closeup.jpg');
  c.rep("    { src: '/assets/rath_yatra.png', alt: 'Rath Yatra' },\n", '');
  c.rep("    { src: '/assets/hanuman_shrine.jpg', alt: 'Hanuman Shrine' },\n", '');
  c.rep('grid grid-cols-2 md:grid-cols-4 gap-4">\n            {galleryPreview', 'grid grid-cols-2 md:grid-cols-3 gap-4">\n            {galleryPreview');
});

// ================= About: only Lord Jagannath (Patitapavan) =================
edit('src/pages/About.jsx', (c) => {
  c.rep("bg-[url('/assets/temple_exterior.png')]", "bg-[url('/assets/temple_chariot_sunset.jpg')]");
  c.rep('src="/assets/temple_exterior.png"', 'src="/assets/temple_spire_flags.jpg"');
  c.rep('src="/assets/annadan_seva.png"', 'src="/assets/jagannath_sanctum_seva.jpg"');
  c.rep('alt="Mahaprasad Anandabazar food hall"', 'alt="Devotee performing seva in front of Lord Jagannath"');
  c.rep('descEn: "The three divine idols of Lord Jagannath, Balabhadra, and Devi Subhadra were carved out of sacred Neem wood (Daru) and consecrated."', 'descEn: "The sacred idol of Lord Jagannath (Patitapavan) was carved out of sacred Neem wood (Daru) and consecrated."');
  c.rep('descHi: "भगवान जगन्नाथ, बलभद्र और देवी सुभद्रा की पवित्र विग्रहों को नीम की लकड़ी (दारू) से तराश कर प्रतिष्ठित किया गया।"', 'descHi: "भगवान जगन्नाथ (पतितपावन) के पवित्र विग्रह को नीम की लकड़ी (दारू) से तराश कर प्रतिष्ठित किया गया।"');
  c.rep('descOr: "ଶ୍ରୀବିଗ୍ରହ ଦାରୁରେ ନିର୍ମିତ ହୋଇ ରତ୍ନସିଂହାସନରେ ଅଧିଷ୍ଠିତ ହେଲେ ଏବଂ ପ୍ରାଣ ପ୍ରତିଷ୍ଠା ଉତ୍ସବ ସମ୍ପନ୍ନ ହେଲା।"', 'descOr: "ପତିତପାବନ ଶ୍ରୀ ଜଗନ୍ନାଥ ଦାରୁରେ ନିର୍ମିତ ହୋଇ ରତ୍ନସିଂହାସନରେ ଅଧିଷ୍ଠିତ ହେଲେ ଏବଂ ପ୍ରାଣ ପ୍ରତିଷ୍ଠା ଉତ୍ସବ ସମ୍ପନ୍ନ ହେଲା।"');
  c.rep('the universal energy of Lord Jagannath, Lord Balabhadra, and Devi Subhadra.', 'the universal energy of Lord Jagannath (Patitapavan).');
  if (c.t.includes('{/* Deities Section */}')) {
    const a = c.t.indexOf('{/* Deities Section */}');
    const b = c.t.indexOf('{/* Lord Jagannath */}');
    const mid = `{/* Deity Section */}
        <section className="bg-white dark:bg-temple-darker p-8 md:p-12 rounded-2xl border border-saffron/10 box-glow space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-saffron uppercase tracking-widest">Our Presiding Deity</span>
            <h3 className="text-2xl md:text-3xl font-extrabold font-outfit text-maroon mt-1">
              {language === 'or' ? "ପତିତପାବନ ଶ୍ରୀ ଜଗନ୍ନାଥ" : language === 'hi' ? "पतितपावन श्री जगन्नाथ" : "Lord Jagannath — Patitapavan"}
            </h3>
            <p className="text-xs text-temple-500 mt-2 font-semibold">
              Worshipped here as Patitapavan, the redeemer of the fallen.
            </p>
          </div>

          <div className="grid grid-cols-1 max-w-md mx-auto gap-8">
            `;
    if (a < 0 || b < a) { log('  !! About.jsx deity section markers not found'); failures++; }
    else c.t = c.t.slice(0, a) + mid + c.t.slice(b);
  } else log('  (already done) About deity section');
});

// ================= Language strings =================
edit('src/context/LanguageContext.jsx', (c) => {
  c.rep('heroSubtitle: "Welcome to the Sacred Abode of Lord Jagannath, Balabhadra & Devi Subhadra in Ganjam"', 'heroSubtitle: "Welcome to the Sacred Abode of Lord Jagannath (Patitapavan) in Ganjam"');
  c.rep('heroSubtitle: "ଗଞ୍ଜାମର ପବିତ୍ର ପ୍ରଭୁ ଶ୍ରୀ ଜଗନ୍ନାଥ, ବଳଭଦ୍ର ଓ ଦେବୀ ସୁଭଦ୍ରାଙ୍କ ମନ୍ଦିରକୁ ଆପଣଙ୍କୁ ସ୍ୱାଗତ"', 'heroSubtitle: "ଗଞ୍ଜାମରେ ପତିତପାବନ ପ୍ରଭୁ ଶ୍ରୀ ଜଗନ୍ନାଥଙ୍କ ପବିତ୍ର ମନ୍ଦିରକୁ ଆପଣଙ୍କୁ ସ୍ୱାଗତ"');
  c.rep('heroSubtitle: "गंजम में भगवान जगन्नाथ, बलभद्र और देवी सुभद्रा के पवित्र निवास में आपका स्वागत है"', 'heroSubtitle: "गंजम में पतितपावन भगवान जगन्नाथ के पवित्र निवास में आपका स्वागत है"');
  c.sub(/quoteText: "\|\| Nilachala[^\n]*\n/, 'quoteText: "|| Jai Jagannath ||",\n');
  c.sub(/quoteTranslation: "\\"Salutations to Lord Jagannath[^\n]*\n/, 'quoteTranslation: "Victory to Lord Jagannath, Patitapavan — the redeemer of the fallen.",\n');
  c.sub(/quoteText: "\|\| ନୀଳାଚଳ[^\n]*\n/, 'quoteText: "|| ଜୟ ଜଗନ୍ନାଥ ||",\n');
  c.sub(/quoteTranslation: "\\"ନୀଳାଚଳରେ[^\n]*\n/, 'quoteTranslation: "ପତିତପାବନ ପ୍ରଭୁ ଶ୍ରୀ ଜଗନ୍ନାଥଙ୍କ ଜୟ ହେଉ।",\n');
  c.sub(/quoteText: "\|\| नीलाचल[^\n]*\n/, 'quoteText: "|| जय जगन्नाथ ||",\n');
  c.sub(/quoteTranslation: "\\"नीलाचल[^\n]*\n/, 'quoteTranslation: "पतितपावन भगवान जगन्नाथ की जय हो।",\n');
});

// ================= seed.js (festival + gallery content) =================
edit('server/seed.js', (c) => {
  c.rep('"The grand chariot procession of Lord Jagannath, Balabhadra, and Subhadra to Gundicha Temple."', '"The grand chariot procession of Lord Jagannath to Gundicha Temple."');
  c.rep('Lord Jagannath, Lord Balabhadra, and Devi Subhadra ride their respective wooden chariots (Nandighosa, Taladhwaja, and Debadalana) to the Gundicha temple, pulled by thousands', 'Lord Jagannath rides the sacred chariot to the Gundicha temple, pulled by thousands');
  c.rep('Snana Purnima is the bathing festival of Lord Jagannath, Balabhadra, and Subhadra. The deities are escorted to the Snana Mandapa and bathed with 108 pots of perfumed water. Afterwards, they dress in the Ganesha-like Hati Besha.', 'Snana Purnima is the bathing festival of Lord Jagannath. The Lord is escorted to the Snana Mandapa and bathed with 108 pots of perfumed water. Afterwards, He is dressed in the Ganesha-like Hati Besha.');
  c.rep('The deities are dressed in Makar Vesha.', 'Lord Jagannath is dressed in Makar Vesha.');
  c.rep('To soothe the deities during hot summer', 'To soothe the Lord during hot summer');
  c.rep('the deities are believed to fall ill with fever. They rest in the private Anasara chamber', 'Lord Jagannath is believed to fall ill with fever. He rests in the private Anasara chamber');
  c.rep('when the deities recover from illness and their eyes are painted anew (Naba Jaubana Darshan) before they step out for Rath Yatra.', 'when Lord Jagannath recovers from illness and His eyes are painted anew (Naba Jaubana Darshan) before Rath Yatra.');
  c.rep('Lord Jagannath, Lord Balabhadra, and Devi Subhadra from Gundicha Temple back to their main temple after 9 days.', 'Lord Jagannath from Gundicha Temple back to the main temple after 9 days.');
  c.rep('the deities are adorned in massive gold crowns, hands, and ornaments directly on their chariots parked in front of the temple.', 'Lord Jagannath is adorned in massive gold crowns, hands, and ornaments directly on the chariot parked in front of the temple.');
  c.rep('The return of deities into the inner sanctum', 'The return of Lord Jagannath into the inner sanctum');
  c.rep('The deities are dressed in the grand Suna Besha', 'Lord Jagannath is dressed in the grand Suna Besha');
  c.rep('+91 94371 99999 / Temple Office Control', '+91 93378 22942 / Temple Office Control');
  c.rep('"+91 94371 99999"', '"+91 93378 22942"', true);

  // gallery: keep only the real photos (ids gal_u1 ... gal_u7)
  const a = c.t.indexOf('const SEED_GALLERY = [');
  const firstReal = c.t.indexOf('id: "gal_u1"', a);
  if (a >= 0 && firstReal > a) {
    const start = c.t.lastIndexOf('  {', firstReal);
    c.t = c.t.slice(0, c.t.indexOf('[', a) + 1) + '\n' + c.t.slice(start);
  }

  // festival images: only real photos
  const map = { 1: 'temple_chariot_sunset.jpg', 13: 'temple_chariot_sunset.jpg', 2: 'jagannath_tulasi_closeup.jpg', 11: 'jagannath_tulasi_closeup.jpg', 26: 'jagannath_tulasi_closeup.jpg',
    9: 'jagannath_sanctum_seva.jpg', 10: 'jagannath_sanctum_seva.jpg', 14: 'jagannath_sanctum_seva.jpg', 16: 'jagannath_sanctum_seva.jpg', 20: 'jagannath_sanctum_seva.jpg', 21: 'jagannath_sanctum_seva.jpg',
    15: 'deity_procession_close.jpg', 6: 'deity_procession_close.jpg', 12: 'procession_night_street.jpg', 25: 'procession_night_street.jpg' };
  c.t = c.t.split(/(?=\n  \{\n    id: "fest_\d+")/).map((p) => {
    const m = p.match(/id: "fest_(\d+)"/);
    if (!m) return p;
    const img = map[Number(m[1])] || 'temple_spire_flags.jpg';
    return p.replace(/imageUrl: "\/assets\/[^"]+"/, `imageUrl: "/assets/${img}"`);
  }).join('');
});

// ================= Donation: any amount, minimum 50 =================
edit('src/pages/Donation.jsx', (c) => {
  c.rep('const [amount, setAmount] = useState(1100);', 'const [amount, setAmount] = useState(500);');
  c.rep('const preSets = [501, 1100, 2500, 5001];', 'const preSets = [50, 100, 200, 500, 1000, 2000];');
  c.rep("/assets/hero_jagannath.png", '/assets/jagannath_tulasi_closeup.jpg');
  c.rep(`    const val = e.target.value;
    setCustomVal(val);
    setAmount(Number(val) || 0);`, String.raw`    // digits only, no negatives / decimals / text
    const val = e.target.value.replace(/\D/g, '').slice(0, 7);
    setCustomVal(val);
    setAmount(val ? parseInt(val, 10) : 0);`);
  c.rep('grid grid-cols-4 gap-3">\n                    {preSets', 'grid grid-cols-3 sm:grid-cols-6 gap-3">\n                    {preSets');
  const m = c.t.match(/      setErrorMsg\(`Enter a whole amount between[^\n]*\n/);
  if (m) c.t = c.t.replace(m[0], `      setErrorMsg(amount > MAX_DONATION
        ? 'For a single online payment the maximum is ₹' + MAX_DONATION.toLocaleString('en-IN') + '. For larger gifts please contact the temple office.'
        : 'Please enter an amount of at least ₹' + MIN_DONATION + '.');
`);
  else log('  (already done) donation error message');
  c.rep('type="number"\n                      value={customVal}', 'type="text"\n                      inputMode="numeric"\n                      pattern="[0-9]*"\n                      aria-label="Custom donation amount in rupees"\n                      value={customVal}');
  if (!c.t.includes('Choose an amount or enter your own')) {
    const k = c.t.indexOf("placeholder={t('customAmount')}");
    const j = c.t.indexOf('</div>', k);
    c.t = c.t.slice(0, j + 6) + `
                  <p className={'text-[11px] font-semibold ' + (customVal && amount < MIN_DONATION ? 'text-rose-700' : 'text-temple-500')}>
                    {customVal && amount < MIN_DONATION
                      ? 'Minimum donation is ₹' + MIN_DONATION + '.'
                      : 'Choose an amount or enter your own (minimum ₹' + MIN_DONATION + ').'}
                  </p>` + c.t.slice(j + 6);
  }
  c.rep('disabled={loading || amount <= 0}', 'disabled={loading || amount < MIN_DONATION}');
});

// ================= Register: clear validation messages =================
edit('src/pages/Register.jsx', (c) => {
  c.rep("    if (!name || !email || !phone || !password) return;\n", String.raw`    setErrorMsg('');
    if (!name.trim()) { setErrorMsg('Please enter your full name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setErrorMsg('Please enter a valid email address.'); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { setErrorMsg('Please enter a valid 10-digit Indian mobile number.'); return; }
    if (password.length < 8) { setErrorMsg('Password must be at least 8 characters.'); return; }
`);
  c.rep('const res = await register(name, email, phone, password);', 'const res = await register(name.trim(), email.trim(), phone, password);');
  c.rep('setErrorMsg("An unexpected registration error occurred. Try again.");', 'setErrorMsg("Could not complete registration. Please try again.");');
});

// ================= index.html: title/description/canonical (keeps Google verification tag) =================
edit('index.html', (c) => {
  c.sub(/<title>[\s\S]*?<\/title>/, '<title>Shree Jagannath Temple Sidheswar | Lord Jagannath (Patitapavan), Sidhaswar, Odisha</title>');
  const desc = '<meta name="description" content="Official website of Shree Jagannath Temple Sidheswar, Sidhaswar, Ganjam, Odisha. Darshan of Lord Jagannath (Patitapavan), festivals, seva booking and donations." />';
  if (/<meta\s+name="description"[^>]*>/.test(c.t)) c.t = c.t.replace(/<meta\s+name="description"[^>]*>/, () => desc);
  else c.t = c.t.replace('</head>', desc + '\n  </head>');
  if (!c.t.includes('rel="canonical"')) {
    const extra = `<link rel="canonical" href="https://shreejagannathtemplesidheswar.vercel.app/" />
    <meta property="og:title" content="Shree Jagannath Temple Sidheswar" />
    <meta property="og:description" content="Lord Jagannath (Patitapavan) – darshan, festivals, seva and donations. Sidhaswar, Odisha." />
    <meta property="og:url" content="https://shreejagannathtemplesidheswar.vercel.app/" />
    <meta property="og:image" content="https://shreejagannathtemplesidheswar.vercel.app/assets/jagannath_tulasi_closeup.jpg" />
    `;
    c.t = c.t.replace('</head>', '    ' + extra + '</head>');
  }
});

// ================= donation minimum (server + site) =================
edit('shared/catalog.js', (c) => c.rep('export const MIN_DONATION = 10;', 'export const MIN_DONATION = 50;'));

// ================= delete old files =================
for (const f of ['api/[...path].js', 'public/assets/annadan_seva.png', 'public/assets/deity_darshan.png', 'public/assets/hero_jagannath.png', 'public/assets/rath_yatra.png', 'public/assets/temple_exterior.png']) {
  if (fs.existsSync(f)) { fs.rmSync(f); log(`deleted ${f}`); }
}

log(failures ? `\nFINISHED WITH ${failures} PROBLEM(S) - see the "!!" lines above and send them to me.` : '\nALL DONE. Now: npm run build, then git add -A, git commit, git push.');
process.exit(failures ? 1 : 0);