import React, { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CalendarDays, ChevronLeft, ChevronRight, Sunrise, Sunset, Moon, Sparkles, ShieldAlert, Star, Info } from 'lucide-react';
import { L, usePanchang, useNow, fmtTime, fmtRange, fmtAt, tithiName, pakshaName, dateTitle, inRange } from '../components/panchangShared';
import { todayIST, shiftDay, toInputValue, fromInputValue } from '../utils/panchangDate';
import { PLACE_NAME } from '../utils/panchangPlace';

const Row = ({ label, value, sub }) => (
  <div className="flex items-start justify-between gap-3 py-2 border-b border-saffron/10 last:border-0">
    <span className="text-xs font-bold uppercase text-temple-500">{label}</span>
    <span className="text-right text-sm font-bold text-temple-900">{value}{sub && <span className="block text-[11px] font-semibold text-temple-500">{sub}</span>}</span>
  </div>
);

export default function Panchang() {
  const { language } = useLanguage();
  const l = L[language] || L.en;
  const [ymd, setYmd] = useState(() => todayIST());
  const { data, lib, loading, error } = usePanchang(ymd);
  const now = useNow(30000);
  const isToday = useMemo(() => { const t = todayIST(); return t.y === ymd.y && t.m === ymd.m && t.d === ymd.d; }, [ymd, now]);

  const render = () => {
    if (loading && !data) return <p className="text-center font-semibold text-temple-600 py-16">{l.loading}</p>;
    if (error || !data || !lib) return <p className="text-center font-semibold text-rose-700 py-16">{l.error}</p>;

    const N = lib.NAMES[language] || lib.NAMES.en;
    const g = lib.guidance(data);
    const live = (r) => isToday && inRange(r, now);
    const segList = (segs, nameOf) => (
      <div className="space-y-1">
        {segs.map((s, i) => (
          <p key={i} className={i === 0 ? 'text-lg font-extrabold text-temple-900' : 'text-sm font-semibold text-temple-700'}>
            {i > 0 && <span className="text-temple-500">{l.then} </span>}{nameOf(s)}
            <span className="block text-xs font-semibold text-temple-500">{l.till} {fmtAt(s.end, ymd)}</span>
          </p>
        ))}
      </div>
    );
    const ratingCls = g.rating === 'good' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : g.rating === 'avoid' ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-gold/10 border-gold/40 text-temple-900';
    const ratingText = g.rating === 'good' ? l.good : g.rating === 'avoid' ? l.badday : l.mixed;
    const Window = ({ label, range, tone }) => (
      <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${live(range) ? (tone === 'good' ? 'bg-emerald-200 border-emerald-400' : 'bg-rose-200 border-rose-400') : (tone === 'good' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200')}`}>
        <div>
          <p className={`text-xs font-bold uppercase ${tone === 'good' ? 'text-emerald-800' : 'text-rose-800'}`}>{label}</p>
          {live(range) && <p className="text-[11px] font-extrabold">{l.active}</p>}
        </div>
        <p className={`text-sm font-extrabold ${tone === 'good' ? 'text-emerald-900' : 'text-rose-900'}`}>{fmtRange(range)}</p>
      </div>
    );

    return (
      <div className="space-y-6">
        {/* Day summary */}
        <div className="glass-card p-6 md:p-8 border-t-4 border-maroon text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-saffron">{N.vara[data.weekday]} · {dateTitle(ymd, language)}</p>
          <h3 className="text-2xl md:text-3xl font-extrabold font-outfit text-maroon">
            {pakshaName(N, data.tithi[0].idx)} · {tithiName(N, data.tithi[0].idx)}
          </h3>
          <p className="text-sm font-bold text-temple-700">{N.nakshatra[data.nakshatra[0].idx]} · {N.yoga[data.yoga[0].idx]}</p>
          {g.special.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {g.special.map((k) => (
                <span key={k} className="px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-xs font-extrabold text-temple-900 flex items-center gap-1">
                  <Star size={12} className="text-gold-dark" />
                  {k === 'sankranti' ? l.sankranti(N.rashi[data.sankranti.rashi], fmtTime(data.sankranti.time)) : l[k]}
                </span>
              ))}
            </div>
          )}
          <div className={`inline-block mt-3 px-4 py-2 rounded-xl border text-sm font-bold ${ratingCls}`}>{ratingText}</div>
        </div>

        {/* Five limbs */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div className="glass-card p-5"><p className="text-xs font-bold uppercase text-saffron mb-2">{l.tithi}</p>
            {segList(data.tithi, (s) => `${tithiName(N, s.idx)} (${pakshaName(N, s.idx)})`)}</div>
          <div className="glass-card p-5"><p className="text-xs font-bold uppercase text-saffron mb-2">{l.nakshatra}</p>
            {segList(data.nakshatra, (s) => N.nakshatra[s.idx])}</div>
          <div className="glass-card p-5"><p className="text-xs font-bold uppercase text-saffron mb-2">{l.yoga}</p>
            {segList(data.yoga, (s) => N.yoga[s.idx])}</div>
          <div className="glass-card p-5"><p className="text-xs font-bold uppercase text-saffron mb-2">{l.karana}</p>
            {segList(data.karana, (s) => N.karana[s.idx])}</div>
          <div className="glass-card p-5 md:col-span-1 xl:col-span-2">
            <p className="text-xs font-bold uppercase text-saffron mb-1 flex items-center gap-1.5"><Sunrise size={14} /> {l.sunmoon}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <div>
                <Row label={l.sunrise} value={fmtTime(data.sunrise)} />
                <Row label={l.sunset} value={fmtTime(data.sunset)} />
                <Row label={l.sunRashi} value={N.rashi[data.sunRashi]} />
              </div>
              <div>
                <Row label={l.moonrise} value={fmtAt(data.moonrise, ymd)} />
                <Row label={l.moonset} value={fmtAt(data.moonset, ymd)} />
                <Row label={l.moonRashi} value={N.rashi[data.moonRashi]} />
              </div>
            </div>
          </div>
        </div>

        {/* Muhurat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="glass-card p-5 space-y-3 border-t-4 border-emerald-500">
            <p className="text-sm font-extrabold text-emerald-800 flex items-center gap-2"><Sparkles size={16} /> {l.auspicious}</p>
            <Window label={l.brahma} range={data.brahma} tone="good" />
            {data.abhijit
              ? <Window label={l.abhijit} range={data.abhijit} tone="good" />
              : <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800">{l.abhijit}: {l.abhijitNA}</div>}
          </div>
          <div className="glass-card p-5 space-y-3 border-t-4 border-rose-500">
            <p className="text-sm font-extrabold text-rose-800 flex items-center gap-2"><ShieldAlert size={16} /> {l.inauspicious}</p>
            <Window label={l.rahu} range={data.rahu} tone="bad" />
            <Window label={l.yama} range={data.yama} tone="bad" />
            <Window label={l.gulika} range={data.gulika} tone="bad" />
          </div>
        </div>

        {/* Shubh karya */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="glass-card p-5">
            <p className="text-sm font-extrabold text-maroon mb-3">{l.shubhKarya}</p>
            <div className="flex flex-wrap gap-2">
              {g.good.length === 0 && <span className="text-xs font-semibold text-temple-500">—</span>}
              {g.good.map((k) => <span key={k} className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">{l[k]}</span>)}
            </div>
          </div>
          <div className="glass-card p-5">
            <p className="text-sm font-extrabold text-maroon mb-3">{l.avoid}</p>
            <div className="flex flex-wrap gap-2">
              {g.avoid.length === 0 && <span className="text-xs font-semibold text-temple-500">—</span>}
              {g.avoid.map((k) => <span key={k} className="px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-900">{k === 'auspicious' ? l.auspiciousWork : l[k]}</span>)}
            </div>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed font-semibold text-temple-500 flex gap-2"><Info size={14} className="shrink-0 mt-0.5" /> <span>{l.note} ({l.place}: {PLACE_NAME})</span></p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900 pb-20">
      <div className="relative bg-temple-dark text-cream-light py-16 border-b border-gold/20 text-center">
        <div className="absolute inset-0 bg-[url('/assets/temple_spire_flags.jpg')] bg-cover bg-center opacity-25"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-glow text-white">{l.title}</h2>
          <p className="mt-3 text-sm text-cream-light/80 font-semibold">{l.sub}</p>
          <div className="mt-4 flex justify-center items-center gap-2">
            <span className="w-10 h-0.5 bg-gold"></span><CalendarDays size={20} className="text-gold" /><span className="w-10 h-0.5 bg-gold"></span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 space-y-6">
        <div className="glass-card p-4 flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => setYmd(shiftDay(ymd, -1))} className="px-3 py-2 rounded-xl border border-saffron/30 bg-white text-xs font-bold flex items-center gap-1" aria-label={l.prev}><ChevronLeft size={14} /> {l.prev}</button>
          <input
            type="date" value={toInputValue(ymd)}
            onChange={(e) => { const v = fromInputValue(e.target.value); if (v) setYmd(v); }}
            className="px-3 py-2 rounded-xl border border-saffron/30 bg-white text-xs font-bold"
          />
          <button onClick={() => setYmd(todayIST())} disabled={isToday} className="px-4 py-2 rounded-xl bg-saffron text-white text-xs font-bold disabled:opacity-50">{l.today}</button>
          <button onClick={() => setYmd(shiftDay(ymd, 1))} className="px-3 py-2 rounded-xl border border-saffron/30 bg-white text-xs font-bold flex items-center gap-1" aria-label={l.next}>{l.next} <ChevronRight size={14} /></button>
        </div>
        {render()}
      </div>
    </div>
  );
}
