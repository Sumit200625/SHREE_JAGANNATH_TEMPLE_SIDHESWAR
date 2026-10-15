import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { L, usePanchang, useNow, fmtTime, fmtRange, fmtAt, tithiName, pakshaName, dateTitle, inRange } from './panchangShared';
import { todayIST } from '../utils/panchangDate';

// compact "today" card for the home page
export default function PanchangCard() {
  const { language } = useLanguage();
  const l = L[language] || L.en;
  const ymd = React.useMemo(() => todayIST(), []);
  const { data, lib, loading, error } = usePanchang(ymd);
  const now = useNow(60000);

  return (
    <section className="glass-card rounded-2xl p-6 md:p-8 shadow-md border-t-4 border-saffron">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold font-outfit flex items-center gap-2 text-maroon">
          <CalendarDays size={22} className="text-saffron" /> {l.title}
        </h2>
        <span className="text-xs font-semibold text-temple-500">{dateTitle(ymd, language)}</span>
      </div>

      {loading && <p className="text-sm font-semibold text-temple-500">{l.loading}</p>}
      {error && <p className="text-sm font-semibold text-rose-700">{l.error}</p>}

      {data && lib && (() => {
        const N = lib.NAMES[language] || lib.NAMES.en;
        const t = data.tithi[0], n = data.nakshatra[0], y = data.yoga[0];
        const rahuNow = inRange(data.rahu, now);
        return (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-saffron/10">
                <p className="text-[11px] font-bold uppercase text-temple-500">{l.tithi}</p>
                <p className="font-bold text-temple-900">{tithiName(N, t.idx)}</p>
                <p className="text-[11px] text-temple-600">{pakshaName(N, t.idx)} · {l.till} {fmtAt(t.end, ymd)}</p>
              </div>
              <div className="p-3 rounded-xl bg-saffron/10">
                <p className="text-[11px] font-bold uppercase text-temple-500">{l.nakshatra}</p>
                <p className="font-bold text-temple-900">{N.nakshatra[n.idx]}</p>
                <p className="text-[11px] text-temple-600">{l.till} {fmtAt(n.end, ymd)}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50">
                <p className="text-[11px] font-bold uppercase text-emerald-800">{data.abhijit ? l.abhijit : l.brahma}</p>
                <p className="font-bold text-emerald-900">{fmtRange(data.abhijit || data.brahma)}</p>
              </div>
              <div className={`p-3 rounded-xl ${rahuNow ? 'bg-rose-200' : 'bg-rose-50'}`}>
                <p className="text-[11px] font-bold uppercase text-rose-800">{l.rahu}</p>
                <p className="font-bold text-rose-900">{fmtRange(data.rahu)}</p>
                {rahuNow && <p className="text-[11px] font-bold text-rose-800">{l.active}</p>}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-temple-600">
              <span>{N.vara[data.weekday]} · {l.sunrise} {fmtTime(data.sunrise)} · {l.sunset} {fmtTime(data.sunset)}</span>
              <Link to="/panchang" className="text-saffron font-bold flex items-center gap-1 hover:underline">{l.full} <ArrowRight size={14} /></Link>
            </div>
          </>
        );
      })()}
    </section>
  );
}
