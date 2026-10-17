// Panchang calculation (Drik / astronomical method, Lahiri ayanamsa) done in the browser.
// Sun and Moon positions come from the open-source "astronomy-engine" library.
import * as Astronomy from 'astronomy-engine';

// Sidhaswar, Ganjam (derived from the Plus Code 9JMV+VVC shown on the website). Change here if needed.
export const PLACE = { name: 'Sidhaswar, Ganjam, Odisha', lat: 19.385, lon: 84.645, elev: 0 };
const IST_OFFSET_MS = 5.5 * 3600 * 1000;
const observer = new Astronomy.Observer(PLACE.lat, PLACE.lon, PLACE.elev);

const norm = (x) => ((x % 360) + 360) % 360;
const NAK = 360 / 27;

// Lahiri (Chitrapaksha) ayanamsa
function ayanamsa(date) {
  const T = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (36525 * 86400000);
  return 23.85306 + 1.39694 * T;
}
const sunLon = (d) => Astronomy.SunPosition(d).elon;
const moonLon = (d) => Astronomy.EclipticGeoMoon(d).lon;

export function snapshot(date) {
  const s = sunLon(date), m = moonLon(date), ay = ayanamsa(date);
  const sidSun = norm(s - ay), sidMoon = norm(m - ay), elong = norm(m - s);
  return {
    sidSun, sidMoon,
    tithi: Math.floor(elong / 12),                 // 0..29
    nakshatra: Math.floor(sidMoon / NAK),          // 0..26
    yoga: Math.floor(norm(sidSun + sidMoon) / NAK), // 0..26
    karana: Math.floor(elong / 6),                 // 0..59
    sunRashi: Math.floor(sidSun / 30),
    moonRashi: Math.floor(sidMoon / 30),
  };
}

// time when f(date) first differs from its value at t0 (10-minute scan, then bisection to ~1 second)
function nextChange(f, t0, maxHours = 40) {
  const v0 = f(t0);
  const step = 10 * 60000;
  let a = t0.getTime();
  for (let t = a + step; t <= a + maxHours * 3600000; t += step) {
    if (f(new Date(t)) !== v0) {
      let lo = t - step, hi = t;
      while (hi - lo > 1000) {
        const mid = Math.floor((lo + hi) / 2);
        if (f(new Date(mid)) === v0) lo = mid; else hi = mid;
      }
      return new Date(hi);
    }
  }
  return null;
}

// consecutive segments of an element between sunrise and next sunrise: [{ idx, end }]
function segments(f, from, until, limit = 6) {
  const out = [];
  let t = from;
  for (let i = 0; i < limit; i++) {
    const idx = f(t);
    const end = nextChange(f, t);
    out.push({ idx, end });
    if (!end || end >= until) break;
    t = new Date(end.getTime() + 1000);
  }
  return out;
}

export const nextChangePublic = nextChange;

// karana name index: 0 Kimstughna, 1..56 movable (Bava..Vishti x8), 57 Shakuni, 58 Chatushpada, 59 Naga
// returns 0..10 into KARANA names [Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti, Shakuni, Chatushpada, Naga, Kimstughna]
export function karanaName(i) {
  if (i === 0) return 10;
  if (i >= 57) return 7 + (i - 57);
  return (i - 1) % 7;
}

const riseSet = (body, dir, from, days = 1) => Astronomy.SearchRiseSet(body, observer, dir, from, days)?.date || null;

// weekday tables (0 = Sunday). Part number (1..8) of the daytime
const RAHU = [8, 2, 7, 5, 6, 4, 3];
const YAMA = [5, 4, 3, 2, 1, 7, 6];
const GULIKA = [7, 6, 5, 4, 3, 2, 1];

// y, m (1-12), d = calendar date in India (IST)
export function computePanchang(y, m, d) {
  const startUtc = new Date(Date.UTC(y, m - 1, d) - IST_OFFSET_MS); // IST midnight
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();

  const sunrise = riseSet(Astronomy.Body.Sun, +1, startUtc);
  const sunset = riseSet(Astronomy.Body.Sun, -1, sunrise);
  const nextSunrise = riseSet(Astronomy.Body.Sun, +1, new Date(sunrise.getTime() + 3600000));
  // the Moon rises/sets about 50 minutes later each day, so on some dates one of them falls on the next calendar day (shown with its date)
  const moonrise = riseSet(Astronomy.Body.Moon, +1, startUtc, 2);
  const moonset = riseSet(Astronomy.Body.Moon, -1, startUtc, 2);

  const tithi = segments((t) => snapshot(t).tithi, sunrise, nextSunrise);
  const nakshatra = segments((t) => snapshot(t).nakshatra, sunrise, nextSunrise);
  const yoga = segments((t) => snapshot(t).yoga, sunrise, nextSunrise);
  const karana = segments((t) => snapshot(t).karana, sunrise, nextSunrise, 8).map((s) => ({ ...s, idx: karanaName(s.idx), raw: s.idx }));

  const day = sunset - sunrise;
  const part = (n) => ({ start: new Date(sunrise.getTime() + ((n - 1) * day) / 8), end: new Date(sunrise.getTime() + (n * day) / 8) });
  const muhurta = day / 15;
  const sr = snapshot(sunrise);

  // Sankranti: Sun changes rashi between this sunrise and the next
  let sankranti = null;
  const srNext = snapshot(nextSunrise);
  if (srNext.sunRashi !== sr.sunRashi) {
    const when = nextChange((t) => snapshot(t).sunRashi, sunrise);
    if (when) sankranti = { rashi: srNext.sunRashi, time: when };
  }

  return {
    date: { y, m, d }, weekday, sunrise, sunset, nextSunrise, moonrise, moonset,
    tithi, nakshatra, yoga, karana,
    sunRashi: sr.sunRashi, moonRashi: sr.moonRashi, sankranti,
    rahu: part(RAHU[weekday]), yama: part(YAMA[weekday]), gulika: part(GULIKA[weekday]),
    abhijit: weekday === 3 ? null : { start: new Date(sunrise.getTime() + 7 * muhurta), end: new Date(sunrise.getTime() + 8 * muhurta) },
    brahma: { start: new Date(sunrise.getTime() - 96 * 60000), end: new Date(sunrise.getTime() - 48 * 60000) },
  };
}

// today's date in India
export function todayIST() {
  const t = new Date(Date.now() + IST_OFFSET_MS);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}
export function shiftDay({ y, m, d }, delta) {
  const t = new Date(Date.UTC(y, m - 1, d + delta));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

// ---------- traditional classifications (general guidance only) ----------
// nakshatra indices: 0 Ashwini ... 26 Revati
const CLASS = {
  sthira: [3, 11, 20, 25],             // Rohini, U.Phalguni, U.Ashadha, U.Bhadrapada
  chara: [6, 14, 21, 22, 23],          // Punarvasu, Swati, Shravana, Dhanishta, Shatabhisha
  kshipra: [0, 7, 12],                 // Ashwini, Pushya, Hasta
  mridu: [4, 26, 13, 16],              // Mrigashira, Revati, Chitra, Anuradha
  ugra: [1, 9, 10, 19, 24],            // Bharani, Magha, P.Phalguni, P.Ashadha, P.Bhadrapada
  tikshna: [5, 8, 17, 18],             // Ardra, Ashlesha, Jyeshtha, Mula
};
const VIVAHA = [3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26];
const BAD_YOGA = [0, 5, 8, 9, 12, 14, 16, 18, 26]; // Vishkambha, Atiganda, Shula, Ganda, Vyaghata, Vajra, Vyatipata, Parigha, Vaidhriti

// returns { rating: 'good'|'mixed'|'avoid', good: [keys], avoid: [keys], special: [keys] }
export function guidance(p) {
  const tNum = p.tithi[0].idx + 1;               // 1..30
  const tInPaksha = ((tNum - 1) % 15) + 1;       // 1..15
  const nak = p.nakshatra[0].idx;
  const yoga = p.yoga[0].idx;
  const kar = p.karana[0].idx;

  const good = new Set(), avoid = new Set(), special = [];
  let score = 0;

  if (CLASS.sthira.includes(nak)) { good.add('foundation'); good.add('settle'); score += 1; }
  if (CLASS.chara.includes(nak)) { good.add('travel'); good.add('vehicle'); score += 1; }
  if (CLASS.kshipra.includes(nak)) { good.add('trade'); good.add('learning'); score += 1; }
  if (CLASS.mridu.includes(nak)) { good.add('arts'); good.add('clothes'); score += 1; }
  if (VIVAHA.includes(nak)) good.add('marriage');
  if (CLASS.ugra.includes(nak) || CLASS.tikshna.includes(nak)) { avoid.add('newstart'); score -= 1; }

  if ([4, 9, 14].includes(tInPaksha)) { avoid.add('newstart'); score -= 1; }       // Rikta tithis
  if (tNum === 30) { avoid.add('newstart'); score -= 1; }                          // Amavasya
  if ([2, 3, 5, 7, 10, 11, 13, 15].includes(tInPaksha) && tNum !== 30) { good.add('puja'); score += 1; }
  if (BAD_YOGA.includes(yoga)) { avoid.add('newstart'); score -= 1; }
  if (kar === 6) { avoid.add('auspicious'); score -= 1; }                          // Vishti (Bhadra)

  if (tInPaksha === 11) special.push('ekadashi');
  if (tNum === 15) special.push('purnima');
  if (tNum === 30) special.push('amavasya');
  if (p.sankranti) special.push('sankranti');

  const rating = score >= 2 ? 'good' : score <= -1 ? 'avoid' : 'mixed';
  if (rating === 'avoid') good.delete('marriage');
  return { rating, good: [...good], avoid: [...avoid], special };
}

// ---------- names ----------
export const NAMES = {
  en: {
    vara: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    tithi: ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima', 'Amavasya'],
    paksha: ['Shukla Paksha', 'Krishna Paksha'],
    nakshatra: ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'],
    yoga: ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'],
    karana: ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti (Bhadra)', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'],
    rashi: ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'],
  },
  hi: {
    vara: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
    tithi: ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा', 'अमावस्या'],
    paksha: ['शुक्ल पक्ष', 'कृष्ण पक्ष'],
    nakshatra: ['अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्व फाल्गुनी', 'उत्तर फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्व भाद्रपद', 'उत्तर भाद्रपद', 'रेवती'],
    yoga: ['विष्कम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्मा', 'धृति', 'शूल', 'गण्ड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान', 'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'ऐन्द्र', 'वैधृति'],
    karana: ['बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टि (भद्रा)', 'शकुनि', 'चतुष्पाद', 'नाग', 'किंस्तुघ्न'],
    rashi: ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'],
  },
  or: {
    vara: ['ରବିବାର', 'ସୋମବାର', 'ମଙ୍ଗଳବାର', 'ବୁଧବାର', 'ଗୁରୁବାର', 'ଶୁକ୍ରବାର', 'ଶନିବାର'],
    tithi: ['ପ୍ରତିପଦା', 'ଦ୍ୱିତୀୟା', 'ତୃତୀୟା', 'ଚତୁର୍ଥୀ', 'ପଞ୍ଚମୀ', 'ଷଷ୍ଠୀ', 'ସପ୍ତମୀ', 'ଅଷ୍ଟମୀ', 'ନବମୀ', 'ଦଶମୀ', 'ଏକାଦଶୀ', 'ଦ୍ୱାଦଶୀ', 'ତ୍ରୟୋଦଶୀ', 'ଚତୁର୍ଦ୍ଦଶୀ', 'ପୂର୍ଣ୍ଣିମା', 'ଅମାବାସ୍ୟା'],
    paksha: ['ଶୁକ୍ଳ ପକ୍ଷ', 'କୃଷ୍ଣ ପକ୍ଷ'],
    nakshatra: ['ଅଶ୍ୱିନୀ', 'ଭରଣୀ', 'କୃତ୍ତିକା', 'ରୋହିଣୀ', 'ମୃଗଶିରା', 'ଆର୍ଦ୍ରା', 'ପୁନର୍ବସୁ', 'ପୁଷ୍ୟା', 'ଅଶ୍ଳେଷା', 'ମଘା', 'ପୂର୍ବ ଫାଲ୍ଗୁନୀ', 'ଉତ୍ତର ଫାଲ୍ଗୁନୀ', 'ହସ୍ତା', 'ଚିତ୍ରା', 'ସ୍ୱାତୀ', 'ବିଶାଖା', 'ଅନୁରାଧା', 'ଜ୍ୟେଷ୍ଠା', 'ମୂଳା', 'ପୂର୍ବାଷାଢ଼ା', 'ଉତ୍ତରାଷାଢ଼ା', 'ଶ୍ରବଣା', 'ଧନିଷ୍ଠା', 'ଶତଭିଷା', 'ପୂର୍ବ ଭାଦ୍ରପଦ', 'ଉତ୍ତର ଭାଦ୍ରପଦ', 'ରେବତୀ'],
    yoga: ['ବିଷ୍କମ୍ଭ', 'ପ୍ରୀତି', 'ଆୟୁଷ୍ମାନ', 'ସୌଭାଗ୍ୟ', 'ଶୋଭନ', 'ଅତିଗଣ୍ଡ', 'ସୁକର୍ମା', 'ଧୃତି', 'ଶୂଳ', 'ଗଣ୍ଡ', 'ବୃଦ୍ଧି', 'ଧ୍ରୁବ', 'ବ୍ୟାଘାତ', 'ହର୍ଷଣ', 'ବଜ୍ର', 'ସିଦ୍ଧି', 'ବ୍ୟତୀପାତ', 'ବରୀୟାନ', 'ପରିଘ', 'ଶିବ', 'ସିଦ୍ଧ', 'ସାଧ୍ୟ', 'ଶୁଭ', 'ଶୁକ୍ଳ', 'ବ୍ରହ୍ମ', 'ଐନ୍ଦ୍ର', 'ବୈଧୃତି'],
    karana: ['ବବ', 'ବାଳବ', 'କୌଳବ', 'ତୈତିଳ', 'ଗର', 'ବଣିଜ', 'ବିଷ୍ଟି (ଭଦ୍ରା)', 'ଶକୁନି', 'ଚତୁଷ୍ପାଦ', 'ନାଗ', 'କିଂସ୍ତୁଘ୍ନ'],
    rashi: ['ମେଷ', 'ବୃଷ', 'ମିଥୁନ', 'କର୍କଟ', 'ସିଂହ', 'କନ୍ୟା', 'ତୁଳା', 'ବୃଶ୍ଚିକ', 'ଧନୁ', 'ମକର', 'କୁମ୍ଭ', 'ମୀନ'],
  },
};
