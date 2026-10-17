// Festival dates computed from the Sun/Moon (same engine as the Panchang page) - no fixed table that can go out of date.
// Odisha uses the Amanta lunar months (month starts at the new moon). Dates follow the tithi at the time that the
// tradition uses (sunrise, forenoon, midday, evening or midnight). The temple committee's announcement is always final.
import * as Astronomy from 'astronomy-engine';
import { PLACE, snapshot, nextChangePublic, NAMES } from './panchang';

const IST = 5.5 * 3600 * 1000;
const observer = new Astronomy.Observer(PLACE.lat, PLACE.lon, PLACE.elev);
const MONTH = { chaitra: 0, vaishakha: 1, jyeshtha: 2, ashadha: 3, shravana: 4, bhadrapada: 5, ashvina: 6, kartika: 7, margashira: 8, pausha: 9, magha: 10, phalguna: 11 };
const ymdOf = (t) => { const d = new Date(t.getTime() + IST); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; };
const keyOf = ({ y, m, d }) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const addDays = (key, n) => { const [y, m, d] = key.split('-').map(Number); return keyOf(ymdOf(new Date(Date.UTC(y, m - 1, d + n) - IST + 12 * 3600 * 1000))); };

// ---- lunar months (new moon to new moon) ----
function lunarMonths(from, to) {
  const out = [];
  let t = Astronomy.SearchMoonPhase(0, new Date(from.getTime() - 40 * 86400000), 40).date;
  while (t < to) {
    out.push({ start: t, rashi: snapshot(t).sunRashi });
    t = Astronomy.SearchMoonPhase(0, new Date(t.getTime() + 20 * 86400000), 40).date;
  }
  out.push({ start: t, rashi: snapshot(t).sunRashi });
  return out.map((m, i) => ({ ...m, end: out[i + 1]?.start, month: (m.rashi + 1) % 12, adhika: !!out[i + 1] && out[i + 1].rashi === m.rashi }));
}

function buildYear(year) {
  const from = new Date(Date.UTC(year, 0, 1) - IST), to = new Date(Date.UTC(year + 1, 0, 2) - IST);
  const months = lunarMonths(from, to);
  const monthAt = (t) => months.find((m) => m.end && t >= m.start && t < m.end);
  const days = [];
  let rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, from, 1)?.date;
  for (let i = 0; i < 366 + 1; i++) {
    const nextRise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, new Date(rise.getTime() + 3 * 3600000), 1)?.date;
    const set = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, rise, 1)?.date;
    const len = set - rise, night = nextRise - set;
    days.push({
      key: keyOf(ymdOf(rise)), rise, set, nextRise,
      at: { sunrise: rise, purvahna: new Date(rise.getTime() + 0.25 * len), madhyahna: new Date(rise.getTime() + 0.5 * len), aparahna: new Date(rise.getTime() + 0.7 * len), pradosha: new Date(set.getTime() + 3600000), nishita: new Date(set.getTime() + night / 2) },
    });
    rise = nextRise;
  }
  return { year, months, monthAt, days: days.filter((d) => d.key.startsWith(String(year))) };
}
const cache = new Map();
const yearData = (y) => { if (!cache.has(y)) cache.set(y, buildYear(y)); return cache.get(y); };

// first day on which the tithi (0..29) holds at the given moment of the day, inside the given (nija) lunar month
function tithiDay(Y, month, tithi, at) {
  const month0 = (d, t) => { const m = Y.monthAt(t); return m && !m.adhika && m.month === month; };
  for (const d of Y.days) { const t = d.at[at]; if (snapshot(t).tithi === tithi && month0(d, t)) return d.key; }
  // tithi skipped at that moment: take the first day on which it is present at any time between sunrise and next sunrise
  for (const d of Y.days) {
    for (let t = d.rise.getTime(); t < d.nextRise.getTime(); t += 30 * 60000) {
      if (snapshot(new Date(t)).tithi === tithi && month0(d, new Date(t))) return d.key;
    }
  }
  return null;
}

// Sun entering a rashi: returns { key, moment }  (festival is on the day if the moment is before sunset, else the next day)
function sankranti(Y, rashi) {
  for (const d of Y.days) {
    if (snapshot(d.rise).sunRashi !== rashi && snapshot(d.nextRise).sunRashi === rashi) {
      const moment = nextChangePublic((t) => snapshot(t).sunRashi, d.rise);
      return { key: moment < d.set ? d.key : addDays(d.key, 1), moment };
    }
  }
  return null;
}

// shukla tithi n = index n-1 ; krishna tithi n = index 15+n-1
const S = (n) => n - 1, K = (n) => 15 + n - 1;

export function computeFestivalDates(year) {
  const Y = yearData(year);
  const r = {};
  r.fest_3 = sankranti(Y, 9);                                               // Makar Sankranti
  r.fest_4 = tithiDay(Y, MONTH.magha, S(5), 'purvahna');                    // Vasant Panchami
  r.fest_5 = tithiDay(Y, MONTH.magha, K(14), 'nishita');                    // Maha Shivaratri
  r.fest_6 = tithiDay(Y, MONTH.phalguna, S(15), 'sunrise');                 // Dola Purnima
  r.fest_7 = sankranti(Y, 0);                                               // Pana Sankranti / Odia New Year
  r.fest_8 = tithiDay(Y, MONTH.vaishakha, S(3), 'purvahna');                // Akshaya Tritiya
  r.fest_9 = r.fest_8;                                                      // Chandan Yatra starts on Akshaya Tritiya
  r.fest_2 = tithiDay(Y, MONTH.jyeshtha, S(15), 'sunrise');                 // Deba Snana Purnima
  r.fest_10 = r.fest_2 && addDays(r.fest_2, 1);                             // Anasara begins after Snana Purnima
  r.fest_1 = tithiDay(Y, MONTH.ashadha, S(2), 'sunrise');                   // Rath Yatra
  r.fest_11 = r.fest_1 && addDays(r.fest_1, -1);                            // Netrotsava (day before Rath Yatra)
  r.fest_12 = r.fest_1 && addDays(r.fest_1, 4);                             // Hera Panchami
  r.fest_13 = tithiDay(Y, MONTH.ashadha, S(10), 'sunrise');                 // Bahuda Yatra
  r.fest_14 = tithiDay(Y, MONTH.ashadha, S(11), 'sunrise');                 // Suna Besha
  r.fest_15 = tithiDay(Y, MONTH.ashadha, S(13), 'sunrise');                 // Niladri Bije
  r.fest_16 = tithiDay(Y, MONTH.shravana, K(8), 'sunrise');                 // Janmashtami
  r.fest_17 = tithiDay(Y, MONTH.bhadrapada, S(4), 'madhyahna');             // Ganesh Chaturthi
  r.fest_18 = tithiDay(Y, MONTH.bhadrapada, S(5), 'sunrise');               // Nuakhai
  r.fest_19 = tithiDay(Y, MONTH.ashvina, S(6), 'sunrise');                  // Durga Puja (Shashthi)
  r.dashami = tithiDay(Y, MONTH.ashvina, S(10), 'aparahna');                // Vijayadashami (end of Durga Puja)
  r.fest_20 = tithiDay(Y, MONTH.ashvina, S(15), 'pradosha');                // Kumar Purnima
  r.fest_21 = tithiDay(Y, MONTH.kartika, S(15), 'sunrise');                 // Kartika Purnima
  r.fest_22 = tithiDay(Y, MONTH.margashira, K(8), 'purvahna');              // Prathamastami
  r.fest_23 = tithiDay(Y, MONTH.margashira, S(11), 'sunrise');              // Gita Jayanti
  r.fest_24 = sankranti(Y, 8);                                              // Dhanu Sankranti
  return r;
}

// Ekadashi / Purnima / Amavasya of the year: [{ key, kind, month, paksha }]
export function computeObservances(year) {
  const Y = yearData(year), out = [];
  for (const d of Y.days) {
    const t = snapshot(d.rise).tithi;
    const kind = t === 10 || t === 25 ? 'ekadashi' : t === 14 ? 'purnima' : t === 29 ? 'amavasya' : null;
    if (kind) out.push({ key: d.key, kind, shukla: t < 15, tithi: t });
  }
  // a tithi that is present at two consecutive sunrises is listed once (first day)
  return out.filter((o, i) => !(i > 0 && out[i - 1].tithi === o.tithi && addDays(out[i - 1].key, 1) === o.key));
}
export { keyOf, addDays };


const HIDDEN = new Set(['fest_25', 'fest_26']); // placeholder entries that had no real date
const SANKRANTI = new Set(['fest_3', 'fest_7', 'fest_24']);
const tf = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });

// festivals: the list from the database (descriptions, rituals, images...). Dates are replaced by the computed ones.
export function buildFestivalList(festivals, years) {
  const out = [];
  const template = festivals.find((f) => f.id === 'fest_27');
  for (const year of years) {
    const dates = computeFestivalDates(year);
    for (const f of festivals) {
      if (HIDDEN.has(f.id) || f.id === 'fest_27') continue;
      const v = dates[f.id];
      if (!v) continue;
      const key = typeof v === 'string' ? v : v.key;
      let status = 'Tentative - calculated from the panchang, subject to temple committee confirmation';
      if (SANKRANTI.has(f.id) && v.moment) status = `Tentative - Sankranti moment ${tf.format(v.moment).toUpperCase()}, subject to temple committee confirmation`;
      out.push({ ...f, id: `${f.id}_${year}`, baseId: f.id, date: key, status, lastUpdated: key, dateEnd: f.id === 'fest_19' ? dates.dashami : undefined });
    }
    if (template) {
      for (const o of computeObservances(year)) {
        const idx = o.kind === 'ekadashi' ? 10 : o.kind === 'purnima' ? 14 : 15;
        const pk = o.kind === 'ekadashi' ? (o.shukla ? 'Shukla ' : 'Krishna ') : '';
        const pOr = o.kind !== 'ekadashi' ? '' : ` (${NAMES.or.paksha[o.shukla ? 0 : 1]})`;
        const pHi = o.kind !== 'ekadashi' ? '' : ` (${NAMES.hi.paksha[o.shukla ? 0 : 1]})`;
        out.push({
          ...template, id: `obs_${o.key}_${o.kind}`, baseId: 'fest_27', date: o.key,
          festivalNameEnglish: `${pk}${NAMES.en.tithi[idx]}`, festivalNameOdia: NAMES.or.tithi[idx] + pOr, festivalNameHindi: NAMES.hi.tithi[idx] + pHi,
          status: 'Tentative - calculated from the panchang, subject to temple committee confirmation', lastUpdated: o.key, art: o.kind,
        });
      }
    }
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
