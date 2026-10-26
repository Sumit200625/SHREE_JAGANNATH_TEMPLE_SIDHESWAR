import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Pencil, Trash2, Plus } from 'lucide-react';

const inputCls = 'w-full px-3 py-2 bg-temple-50 border border-saffron/20 rounded-lg text-xs font-semibold focus:outline-none';
const blank = { titleEn: '', titleOr: '', titleHi: '', date: '', endDate: '', time: '', place: '', descEn: '', descOr: '', descHi: '', published: true };

export default function AdminEvents() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.getEvents({ all: true }).then(setList).catch((e) => setMsg(e.message));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setMsg('');
    try {
      if (editId) await api.updateEvent(editId, form); else await api.createEvent(form);
      setMsg(editId ? 'Event updated.' : 'Event added. It now shows on the home page and festival calendar.');
      setForm(blank); setEditId(null); await load();
    } catch (err) { setMsg(err.message); } finally { setBusy(false); }
  };
  const edit = (ev) => { setEditId(ev.id); setForm({ ...blank, ...ev }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const del = async (ev) => { if (window.confirm(`Delete "${ev.titleEn}"?`)) { await api.deleteEvent(ev.id).catch((e) => setMsg(e.message)); load(); } };

  return (
    <div className="space-y-5">
      {msg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl font-semibold">{msg}</div>}
      <form onSubmit={submit} className="glass-card p-4 space-y-3 border-t-4 border-saffron text-xs">
        <p className="text-sm font-extrabold text-maroon flex items-center gap-2"><Plus size={16} /> {editId ? 'Edit event' : 'Add an event'}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input required className={inputCls + ' md:col-span-3'} placeholder="Event title (English) *" value={form.titleEn} onChange={set('titleEn')} />
          <input className={inputCls} placeholder="Title (Odia, optional)" value={form.titleOr} onChange={set('titleOr')} />
          <input className={inputCls} placeholder="Title (Hindi, optional)" value={form.titleHi} onChange={set('titleHi')} />
          <span />
          <label className="space-y-1"><span className="font-bold uppercase text-temple-600">Date *</span><input required type="date" className={inputCls} value={form.date} onChange={set('date')} /></label>
          <label className="space-y-1"><span className="font-bold uppercase text-temple-600">End date (optional)</span><input type="date" className={inputCls} value={form.endDate} onChange={set('endDate')} /></label>
          <input className={inputCls + ' mt-5'} placeholder="Time, e.g. 6:00 PM onwards" value={form.time} onChange={set('time')} />
          <input className={inputCls + ' md:col-span-3'} placeholder="Place (optional)" value={form.place} onChange={set('place')} />
          <textarea rows={3} className={inputCls + ' md:col-span-3'} placeholder="About the event (English)" value={form.descEn} onChange={set('descEn')} />
          <textarea rows={2} className={inputCls + ' md:col-span-3'} placeholder="About the event (Odia, optional)" value={form.descOr} onChange={set('descOr')} />
          <textarea rows={2} className={inputCls + ' md:col-span-3'} placeholder="About the event (Hindi, optional)" value={form.descHi} onChange={set('descHi')} />
        </div>
        <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={form.published} onChange={set('published')} /> Show on the website</label>
        <div className="flex gap-2">
          <button disabled={busy} className="px-4 py-2 rounded-lg bg-maroon text-cream-light font-bold disabled:opacity-60">{editId ? 'Save changes' : 'Add event'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm(blank); }} className="px-4 py-2 rounded-lg border border-temple-300 font-bold">Cancel</button>}
        </div>
      </form>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-xs font-semibold text-left min-w-[560px]">
          <thead className="text-temple-500 uppercase border-b border-saffron/10"><tr><th className="p-3">Date</th><th className="p-3">Event</th><th className="p-3">Shown</th><th className="p-3"></th></tr></thead>
          <tbody>
            {list.map((ev) => (
              <tr key={ev.id} className="border-b border-saffron/5">
                <td className="p-3 whitespace-nowrap">{ev.date}{ev.endDate ? ` to ${ev.endDate}` : ''}</td>
                <td className="p-3 text-temple-900 font-bold">{ev.titleEn}<span className="block text-[10px] text-temple-500">{[ev.time, ev.place].filter(Boolean).join(' | ')}</span></td>
                <td className="p-3">{ev.published ? 'Yes' : 'Hidden'}</td>
                <td className="p-3 flex gap-3"><button onClick={() => edit(ev)} className="text-temple-700"><Pencil size={15} /></button><button onClick={() => del(ev)} className="text-rose-700"><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-temple-500">No events added yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
