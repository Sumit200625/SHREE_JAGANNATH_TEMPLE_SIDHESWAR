import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/client';
import { DEFAULT_TIMINGS } from '../../shared/catalog';
import { currentRitual, isTempleOpen, isArati, nowIST } from '../utils/templeStatus';

const L = {
  en: { title: 'Daily Darshan & Aarti Timings', open: 'Temple is OPEN now', closed: 'Temple is CLOSED now', pahuda: '(Pahuda - rest period)', now: 'NOW', full: 'Full darshan schedule', arati: 'Aarti' },
  hi: { title: 'दैनिक दर्शन व आरती समय', open: 'मंदिर अभी खुला है', closed: 'मंदिर अभी बंद है', pahuda: '(पहुड़ - विश्राम)', now: 'अभी', full: 'पूरा दर्शन समय', arati: 'आरती' },
  or: { title: 'ଦୈନିକ ଦର୍ଶନ ଓ ଆରତି ସମୟ', open: 'ମନ୍ଦିର ବର୍ତ୍ତମାନ ଖୋଲା', closed: 'ମନ୍ଦିର ବର୍ତ୍ତମାନ ବନ୍ଦ', pahuda: '(ପହୁଡ଼ - ବିଶ୍ରାମ)', now: 'ବର୍ତ୍ତମାନ', full: 'ପୂର୍ଣ୍ଣ ଦର୍ଶନ ସମୟ', arati: 'ଆରତି' },
};

export default function DailyTimings() {
  const { language } = useLanguage();
  const l = L[language] || L.en;
  const [rows, setRows] = useState(DEFAULT_TIMINGS);
  const [now, setNow] = useState(nowIST());
  useEffect(() => { api.getTimings().then((r) => r.rows?.length && setRows(r.rows)).catch(() => {}); }, []);
  useEffect(() => { const t = setInterval(() => setNow(nowIST()), 30000); return () => clearInterval(t); }, []);

  const open = isTempleOpen(rows, now);
  const cur = currentRitual(rows, now);
  const name = (r) => (language === 'or' ? r.eventOr : language === 'hi' ? r.eventHi : r.eventEn) || r.eventEn;

  return (
    <section className="glass-card rounded-2xl p-6 md:p-8 shadow-md border-t-4 border-gold">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-xl md:text-2xl font-bold font-outfit flex items-center gap-2"><Clock size={22} className="text-gold" /> {l.title}</h2>
        <span className={`px-3 py-1.5 rounded-full text-sm font-extrabold flex items-center gap-1.5 ${open ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-maroon'}`}>
          {open ? <CheckCircle size={16} /> : <XCircle size={16} />} {open ? l.open : l.closed}
        </span>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        {rows.map((r, i) => {
          const arati = isArati(r), active = i === cur;
          return (
            <li key={i} className={`flex items-start justify-between gap-3 py-2.5 px-2 border-b border-gold/20 rounded-lg ${arati ? 'bg-saffron/10' : ''} ${active ? 'ring-2 ring-saffron bg-saffron/15' : ''}`}>
              <span className="flex items-start gap-2 font-semibold min-w-0">
                {arati && <Flame size={16} className="text-saffron shrink-0 mt-0.5" />}
                <span>{name(r)}{/pahuda/i.test(r.eventEn) ? <span className="block text-[11px] font-semibold text-temple-500">{l.pahuda}</span> : null}</span>
              </span>
              <span className="text-right shrink-0 text-sm font-bold text-temple-700">
                {r.time}
                {active && <span className="block text-[10px] font-extrabold text-saffron">{l.now}</span>}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-right"><Link to="/darshan" className="text-saffron font-bold hover:underline text-sm">{l.full} &rarr;</Link></p>
    </section>
  );
}
