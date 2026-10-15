import { useEffect, useState } from 'react';

export const L = {
  en: {
    title: "Today's Panchang", sub: 'Tithi, Nakshatra, auspicious & inauspicious timings', today: 'Today', prev: 'Previous day', next: 'Next day',
    tithi: 'Tithi', vara: 'Vara (Day)', nakshatra: 'Nakshatra', yoga: 'Yoga', karana: 'Karana', till: 'till', then: 'then',
    sunrise: 'Sunrise', sunset: 'Sunset', moonrise: 'Moonrise', moonset: 'Moonset', sunmoon: 'Sun & Moon',
    auspicious: 'Shubh Muhurat (Auspicious)', inauspicious: 'Ashubh Kaal (Avoid)', brahma: 'Brahma Muhurat', abhijit: 'Abhijit Muhurat',
    abhijitNA: 'Not applicable on Wednesday', rahu: 'Rahu Kaal', yama: 'Yamaganda', gulika: 'Gulika Kaal', active: 'Active now',
    shubhKarya: 'Shubh Karya today (general guide)', avoid: 'Better to avoid today', sunRashi: 'Sun in', moonRashi: 'Moon in',
    good: 'Generally favourable day', mixed: 'Mixed day - ordinary work is fine', badday: 'Avoid starting new auspicious work',
    ekadashi: 'Ekadashi Vrat', purnima: 'Purnima', amavasya: 'Amavasya', sankranti: (r, t) => `Sun enters ${r} at ${t}`,
    foundation: 'Foundation / construction start', settle: 'Griha pravesh / lasting work', travel: 'Travel', vehicle: 'Vehicle purchase',
    trade: 'Business / shopping', learning: 'Education start', arts: 'Arts / music', clothes: 'Clothes / jewellery',
    marriage: 'Marriage-favourable nakshatra', puja: 'Puja / charity', newstart: 'Starting new work', auspiciousWork: 'Auspicious ceremonies (Bhadra)',
    note: 'Calculated by astronomical formulas for the temple location; it can differ by a few minutes from printed panchangs and from the temple\'s traditional Odia panchang. For marriage, griha pravesh and other big decisions, please consult the temple priest.',
    loading: 'Calculating the panchang...', error: 'Could not calculate the panchang. Please refresh the page.', full: 'Full Panchang', place: 'Place',
  },
  hi: {
    title: 'आज का पंचांग', sub: 'तिथि, नक्षत्र, शुभ और अशुभ समय', today: 'आज', prev: 'पिछला दिन', next: 'अगला दिन',
    tithi: 'तिथि', vara: 'वार', nakshatra: 'नक्षत्र', yoga: 'योग', karana: 'करण', till: 'तक', then: 'फिर',
    sunrise: 'सूर्योदय', sunset: 'सूर्यास्त', moonrise: 'चंद्रोदय', moonset: 'चंद्रास्त', sunmoon: 'सूर्य और चंद्र',
    auspicious: 'शुभ मुहूर्त', inauspicious: 'अशुभ काल (वर्जित)', brahma: 'ब्रह्म मुहूर्त', abhijit: 'अभिजित मुहूर्त',
    abhijitNA: 'बुधवार को लागू नहीं', rahu: 'राहुकाल', yama: 'यमगण्ड', gulika: 'गुलिक काल', active: 'अभी चल रहा है',
    shubhKarya: 'आज के शुभ कार्य (सामान्य मार्गदर्शन)', avoid: 'आज इनसे बचें', sunRashi: 'सूर्य राशि', moonRashi: 'चंद्र राशि',
    good: 'आज का दिन सामान्यतः शुभ है', mixed: 'आज का दिन मिश्रित है - सामान्य कार्य ठीक हैं', badday: 'नए शुभ कार्य आरंभ करने से बचें',
    ekadashi: 'एकादशी व्रत', purnima: 'पूर्णिमा', amavasya: 'अमावस्या', sankranti: (r, t) => `सूर्य ${t} पर ${r} राशि में प्रवेश करेंगे`,
    foundation: 'नींव / निर्माण आरंभ', settle: 'गृह प्रवेश / स्थायी कार्य', travel: 'यात्रा', vehicle: 'वाहन खरीद',
    trade: 'व्यापार / खरीदारी', learning: 'विद्यारंभ / शिक्षा', arts: 'कला / संगीत', clothes: 'वस्त्र / आभूषण',
    marriage: 'विवाह योग्य नक्षत्र', puja: 'पूजा-पाठ / दान', newstart: 'नया कार्य आरंभ', auspiciousWork: 'मंगल कार्य (भद्रा)',
    note: 'यह गणना मंदिर के स्थान के अनुसार खगोलीय सूत्रों से की गई है; छपे पंचांग या मंदिर के पारंपरिक ओड़िया पंचांग से कुछ मिनट का अंतर हो सकता है। विवाह, गृह प्रवेश जैसे बड़े निर्णयों के लिए मंदिर के पुजारी से परामर्श करें।',
    loading: 'पंचांग की गणना हो रही है...', error: 'पंचांग की गणना नहीं हो सकी। कृपया पेज रिफ्रेश करें।', full: 'पूरा पंचांग', place: 'स्थान',
  },
  or: {
    title: 'ଆଜିର ପଞ୍ଚାଙ୍ଗ', sub: 'ତିଥି, ନକ୍ଷତ୍ର, ଶୁଭ ଓ ଅଶୁଭ ସମୟ', today: 'ଆଜି', prev: 'ଆଗ ଦିନ', next: 'ପରଦିନ',
    tithi: 'ତିଥି', vara: 'ବାର', nakshatra: 'ନକ୍ଷତ୍ର', yoga: 'ଯୋଗ', karana: 'କରଣ', till: 'ପର୍ଯ୍ୟନ୍ତ', then: 'ତା’ପରେ',
    sunrise: 'ସୂର୍ଯ୍ୟୋଦୟ', sunset: 'ସୂର୍ଯ୍ୟାସ୍ତ', moonrise: 'ଚନ୍ଦ୍ରୋଦୟ', moonset: 'ଚନ୍ଦ୍ରାସ୍ତ', sunmoon: 'ସୂର୍ଯ୍ୟ ଓ ଚନ୍ଦ୍ର',
    auspicious: 'ଶୁଭ ମୁହୂର୍ତ୍ତ', inauspicious: 'ଅଶୁଭ କାଳ (ବର୍ଜ୍ୟ)', brahma: 'ବ୍ରହ୍ମ ମୁହୂର୍ତ୍ତ', abhijit: 'ଅଭିଜିତ ମୁହୂର୍ତ୍ତ',
    abhijitNA: 'ବୁଧବାର ଦିନ ଲାଗୁ ହୁଏ ନାହିଁ', rahu: 'ରାହୁ କାଳ', yama: 'ଯମଗଣ୍ଡ', gulika: 'ଗୁଳିକ କାଳ', active: 'ବର୍ତ୍ତମାନ ଚାଲିଛି',
    shubhKarya: 'ଆଜିର ଶୁଭ କାର୍ଯ୍ୟ (ସାଧାରଣ ମାର୍ଗଦର୍ଶନ)', avoid: 'ଆଜି ଏଡ଼ାନ୍ତୁ', sunRashi: 'ସୂର୍ଯ୍ୟ ରାଶି', moonRashi: 'ଚନ୍ଦ୍ର ରାଶି',
    good: 'ଆଜିର ଦିନ ସାଧାରଣତଃ ଶୁଭ', mixed: 'ଆଜିର ଦିନ ମିଶ୍ରିତ - ସାଧାରଣ କାମ ଠିକ୍', badday: 'ନୂଆ ଶୁଭ କାମ ଆରମ୍ଭ ନ କରିବା ଭଲ',
    ekadashi: 'ଏକାଦଶୀ ବ୍ରତ', purnima: 'ପୂର୍ଣ୍ଣିମା', amavasya: 'ଅମାବାସ୍ୟା', sankranti: (r, t) => `ସୂର୍ଯ୍ୟ ${t} ବେଳେ ${r} ରାଶିରେ ପ୍ରବେଶ`,
    foundation: 'ଭିତ୍ତି / ନିର୍ମାଣ ଆରମ୍ଭ', settle: 'ଗୃହ ପ୍ରବେଶ / ସ୍ଥାୟୀ କାର୍ଯ୍ୟ', travel: 'ଯାତ୍ରା', vehicle: 'ଯାନବାହନ କ୍ରୟ',
    trade: 'ବ୍ୟବସାୟ / କ୍ରୟବିକ୍ରୟ', learning: 'ବିଦ୍ୟାରମ୍ଭ / ଶିକ୍ଷା', arts: 'କଳା / ସଙ୍ଗୀତ', clothes: 'ବସ୍ତ୍ର / ଅଳଙ୍କାର',
    marriage: 'ବିବାହଯୋଗ୍ୟ ନକ୍ଷତ୍ର', puja: 'ପୂଜା / ଦାନ', newstart: 'ନୂଆ କାମ ଆରମ୍ଭ', auspiciousWork: 'ମଙ୍ଗଳ କାର୍ଯ୍ୟ (ଭଦ୍ରା)',
    note: 'ଏହି ଗଣନା ମନ୍ଦିର ସ୍ଥାନ ଅନୁସାରେ ଜ୍ୟୋତିର୍ବିଜ୍ଞାନ ସୂତ୍ରରେ କରାଯାଇଛି; ଛପା ପଞ୍ଚାଙ୍ଗ କିମ୍ବା ମନ୍ଦିରର ପାରମ୍ପରିକ ଓଡ଼ିଆ ପଞ୍ଚାଙ୍ଗ ସହ କିଛି ମିନିଟ୍ ତଫାତ୍ ହୋଇପାରେ। ବିବାହ, ଗୃହ ପ୍ରବେଶ ଭଳି ବଡ଼ ନିଷ୍ପତ୍ତି ପାଇଁ ମନ୍ଦିରର ପୂଜକଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।',
    loading: 'ପଞ୍ଚାଙ୍ଗ ଗଣନା ହେଉଛି...', error: 'ପଞ୍ଚାଙ୍ଗ ଗଣନା ହୋଇପାରିଲା ନାହିଁ। ଦୟାକରି ପୃଷ୍ଠା ରିଫ୍ରେସ୍ କରନ୍ତୁ।', full: 'ପୂର୍ଣ୍ଣ ପଞ୍ଚାଙ୍ଗ', place: 'ସ୍ଥାନ',
  },
};

const tf = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
const df = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' });
export const fmtTime = (d) => (d ? tf.format(d).toUpperCase() : '—');
// adds the date when the time falls on another calendar day than the one being shown
export function fmtAt(d, ymd) {
  if (!d) return '—';
  const ist = new Date(d.getTime() + 5.5 * 3600000);
  const same = ist.getUTCDate() === ymd.d && ist.getUTCMonth() + 1 === ymd.m && ist.getUTCFullYear() === ymd.y;
  return same ? fmtTime(d) : `${df.format(d)}, ${fmtTime(d)}`;
}
export const fmtRange = (r) => (r ? `${fmtTime(r.start)} - ${fmtTime(r.end)}` : '—');
export const tithiName = (names, idx) => (idx === 29 ? names.tithi[15] : names.tithi[idx % 15]);
export const pakshaName = (names, idx) => names.paksha[idx < 15 ? 0 : 1];

export function dateTitle(ymd, language) {
  const d = new Date(Date.UTC(ymd.y, ymd.m - 1, ymd.d, 12));
  try {
    return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  } catch { return `${ymd.d}/${ymd.m}/${ymd.y}`; }
}

// loads the calculation library only when needed and computes the panchang for a date
export function usePanchang(ymd) {
  const [state, setState] = useState({ loading: true, data: null, lib: null, error: false });
  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: false }));
    import('../utils/panchang')
      .then((lib) => {
        if (cancelled) return;
        try { setState({ loading: false, data: lib.computePanchang(ymd.y, ymd.m, ymd.d), lib, error: false }); }
        catch { setState({ loading: false, data: null, lib: null, error: true }); }
      })
      .catch(() => { if (!cancelled) setState({ loading: false, data: null, lib: null, error: true }); });
    return () => { cancelled = true; };
  }, [ymd.y, ymd.m, ymd.d]);
  return state;
}

export function useNow(ms = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), ms); return () => clearInterval(t); }, [ms]);
  return now;
}
export const inRange = (r, now) => !!r && now >= r.start && now < r.end;
