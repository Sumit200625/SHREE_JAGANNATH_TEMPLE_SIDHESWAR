import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/client';
import FestivalArt from './FestivalArt';

const L = {
  en: { title: 'Upcoming Festivals & Events', all: 'Full festival calendar', none: 'No upcoming events right now.', loading: 'Loading dates...', approx: 'Dates follow the panchang and are confirmed by the temple committee.' },
  hi: { title: 'आगामी त्योहार व कार्यक्रम', all: 'पूरा त्योहार कैलेंडर', none: 'अभी कोई आगामी कार्यक्रम नहीं है।', loading: 'तिथियाँ लोड हो रही हैं...', approx: 'तिथियाँ पंचांग के अनुसार हैं और मंदिर समिति द्वारा पुष्ट की जाती हैं।' },
  or: { title: 'ଆଗାମୀ ପର୍ବପର୍ବାଣି ଓ କାର୍ଯ୍ୟକ୍ରମ', all: 'ପୂର୍ଣ୍ଣ ପର୍ବ କ୍ୟାଲେଣ୍ଡର', none: 'ବର୍ତ୍ତମାନ କୌଣସି ଆଗାମୀ କାର୍ଯ୍ୟକ୍ରମ ନାହିଁ।', loading: 'ତାରିଖ ଲୋଡ୍ ହେଉଛି...', approx: 'ତାରିଖ ପଞ୍ଚାଙ୍ଗ ଅନୁସାରେ ଏବଂ ମନ୍ଦିର କମିଟି ଦ୍ୱାରା ନିଶ୍ଚିତ ହୁଏ।' },
};
const istToday = () => new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 10);
const daysTo = (d) => Math.round((Date.parse(d + 'T00:00:00Z') - Date.parse(istToday() + 'T00:00:00Z')) / 86400000);
const fmt = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-IN', { timeZone: 'UTC', day: 'numeric', month: 'short' });

export default function UpcomingEvents({ limit = 4 }) {
  const { language } = useLanguage();
  const l = L[language] || L.en;
  const [items, setItems] = useState(null);

  useEffect(() => {
    let stop = false;
    (async () => {
      const today = istToday();
      let list = [];
      try {
        const [raw, events] = await Promise.all([api.getFestivals(), api.getEvents().catch(() => [])]);
        // computed after the page has painted; observances (Ekadashi etc.) are skipped here to keep it quick
        await new Promise((r) => setTimeout(r, 200));
        const lib = await import('../utils/festivalDates');
        const y = new Date().getFullYear();
        const fests = lib.buildFestivalList(raw, [y], { observances: false }).filter((f) => f.date >= today);
        if (fests.length < limit) fests.push(...lib.buildFestivalList(raw, [y + 1], { observances: false }));
        list = [
          ...fests.map((f) => ({ id: f.id, date: f.date, end: f.dateEnd, en: f.festivalNameEnglish, or: f.festivalNameOdia, hi: f.festivalNameHindi, note: f.shortDescription, art: f })),
          ...events.filter((e) => (e.endDate || e.date) >= today).map((e) => ({ id: e.id, date: e.date, end: e.endDate, en: e.titleEn, or: e.titleOr, hi: e.titleHi, note: [e.time, e.place].filter(Boolean).join(' - ') || e.descEn, art: { id: 'event', baseId: 'fest_17', festivalNameEnglish: e.titleEn } })),
        ].sort((a, b) => (a.date < b.date ? -1 : 1)).filter((x) => x.date >= today || (x.end && x.end >= today)).slice(0, limit);
      } catch { list = []; }
      if (!stop) setItems(list);
    })();
    return () => { stop = true; };
  }, [limit]);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold font-outfit flex items-center gap-2"><CalendarDays size={24} className="text-gold" /> {l.title}</h2>
        <Link to="/festivals" className="text-saffron font-semibold hover:underline">{l.all} &rarr;</Link>
      </div>
      {items === null && <p className="text-sm font-semibold text-temple-500">{l.loading}</p>}
      {items && items.length === 0 && <p className="text-sm font-semibold text-temple-500">{l.none}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {(items || []).map((x) => (
          <Link key={x.id} to="/festivals" className="glass-card overflow-hidden group hover:shadow-lg transition-shadow">
            <FestivalArt festival={x.art} className="h-28 w-full" />
            <div className="p-4 space-y-1.5">
              <p className="text-xs font-extrabold text-saffron uppercase">{fmt(x.date)}{x.end && x.end !== x.date ? ` - ${fmt(x.end)}` : ''}<span className="ml-2 px-2 py-0.5 rounded-full bg-gold/25 text-temple-800 normal-case">{daysTo(x.date) <= 0 ? (language === 'hi' ? 'आज' : language === 'or' ? 'ଆଜି' : 'Today') : daysTo(x.date) === 1 ? (language === 'hi' ? 'कल' : language === 'or' ? 'ଆସନ୍ତାକାଲି' : 'Tomorrow') : (language === 'hi' ? `${daysTo(x.date)} दिन बाद` : language === 'or' ? `${daysTo(x.date)} ଦିନ ପରେ` : `in ${daysTo(x.date)} days`)}</span></p>
              <h3 className="font-bold text-temple-900 leading-snug">{(language === 'or' ? x.or : language === 'hi' ? x.hi : x.en) || x.en}</h3>
              {x.note && <p className="text-xs text-temple-600 font-semibold line-clamp-2">{x.note}</p>}
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-3 text-[11px] font-semibold text-temple-500">{l.approx}</p>
    </section>
  );
}
