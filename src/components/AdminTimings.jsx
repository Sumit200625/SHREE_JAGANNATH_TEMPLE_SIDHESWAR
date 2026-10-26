import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, RotateCcw } from 'lucide-react';

const inputCls = 'w-full px-2 py-1.5 bg-temple-50 border border-saffron/20 rounded-lg text-xs font-semibold focus:outline-none';
const blank = { time: '', eventEn: '', eventOr: '', eventHi: '', descEn: '', descOr: '', descHi: '' };

export default function AdminTimings() {
  const [rows, setRows] = useState([]);
  const [custom, setCustom] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.getTimings().then((r) => { setRows(r.rows); setCustom(r.custom); }).catch((e) => setMsg(e.message));
  useEffect(() => { load(); }, []);
  const set = (i, k, v) => setRows((l) => l.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const move = (i, d) => setRows((l) => { const a = [...l]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });

  const save = async () => {
    setBusy(true); setMsg('');
    try { const r = await api.saveTimings(rows); setRows(r.rows); setCustom(true); setMsg('Timings saved. They are now live on the Home and Darshan pages.'); }
    catch (e) { setMsg(e.message); } finally { setBusy(false); }
  };
  const reset = async () => {
    if (!window.confirm('Go back to the original timings?')) return;
    try { const r = await api.resetTimings(); setRows(r.rows); setCustom(false); setMsg('Timings reset.'); } catch (e) { setMsg(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 text-xs font-semibold text-temple-700 space-y-1">
        <p>Write the time like <b>05:00 AM - 05:30 AM</b>. Keep the row named <b>Pahuda</b> for the rest period so the site shows the temple as closed during it. A name with the word <b>Arati</b> is highlighted on the Home page.</p>
        <p>Odia / Hindi names are optional (the English name is used if left empty). {custom ? 'These are your own saved timings.' : 'These are the standard timings.'}</p>
      </div>
      {msg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl font-semibold">{msg}</div>}
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-left min-w-[860px]">
          <thead className="text-[10px] text-temple-500 uppercase border-b border-saffron/10"><tr><th className="p-2">Time</th><th className="p-2">Name (English)</th><th className="p-2">Name (Odia)</th><th className="p-2">Name (Hindi)</th><th className="p-2">Short note (English)</th><th className="p-2"></th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-saffron/5 align-top">
                <td className="p-2 w-44"><input className={inputCls} value={r.time} onChange={(e) => set(i, 'time', e.target.value)} /></td>
                <td className="p-2"><input className={inputCls} value={r.eventEn} onChange={(e) => set(i, 'eventEn', e.target.value)} /></td>
                <td className="p-2"><input className={inputCls} value={r.eventOr} onChange={(e) => set(i, 'eventOr', e.target.value)} /></td>
                <td className="p-2"><input className={inputCls} value={r.eventHi} onChange={(e) => set(i, 'eventHi', e.target.value)} /></td>
                <td className="p-2"><input className={inputCls} value={r.descEn} onChange={(e) => set(i, 'descEn', e.target.value)} /></td>
                <td className="p-2 whitespace-nowrap">
                  <button onClick={() => move(i, -1)} className="p-1" aria-label="Move up"><ArrowUp size={14} /></button>
                  <button onClick={() => move(i, 1)} className="p-1" aria-label="Move down"><ArrowDown size={14} /></button>
                  <button onClick={() => setRows((l) => l.filter((_, j) => j !== i))} className="p-1 text-rose-700" aria-label="Delete row"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setRows((l) => [...l, { ...blank }])} className="px-4 py-2 rounded-lg border border-saffron text-saffron font-bold text-xs flex items-center gap-1.5"><Plus size={14} /> Add row</button>
        <button disabled={busy} onClick={save} className="px-4 py-2 rounded-lg bg-maroon text-cream-light font-bold text-xs flex items-center gap-1.5 disabled:opacity-60"><Save size={14} /> Save timings</button>
        {custom && <button onClick={reset} className="px-4 py-2 rounded-lg border border-temple-300 font-bold text-xs flex items-center gap-1.5"><RotateCcw size={14} /> Reset to standard</button>}
      </div>
    </div>
  );
}
