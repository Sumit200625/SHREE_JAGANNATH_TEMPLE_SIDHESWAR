import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Plus, Trash2, Save } from 'lucide-react';

const inputCls = 'w-full px-3 py-2 bg-temple-50 border border-saffron/20 rounded-lg text-xs font-semibold focus:outline-none';
const blank = { name: '', desc: '', price: '', slotsText: '', active: false };
const toForm = (x) => ({ id: x.id, name: x.name, desc: x.desc || '', price: String(x.price ?? ''), slotsText: (x.slots || []).join('\n'), active: !!x.active });

export default function AdminSevaItems() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState('');
  const [fresh, setFresh] = useState(blank);

  const load = () => api.getSevaItems({ all: true }).then((l) => setItems(l.map(toForm))).catch((e) => setMsg(e.message));
  useEffect(() => { load(); }, []);

  const body = (f) => ({ name: f.name, desc: f.desc, price: Number(f.price), active: f.active, slots: f.slotsText.split('\n').map((x) => x.trim()).filter(Boolean) });
  const set = (id, k, v) => setItems((l) => l.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  const save = async (f) => {
    setBusy(f.id); setMsg('');
    try { await api.updateSevaItem(f.id, body(f)); setMsg(`Saved: ${f.name}`); await load(); }
    catch (e) { setMsg(e.message); } finally { setBusy(''); }
  };
  const del = async (f) => {
    if (!window.confirm(`Delete "${f.name}"? Existing bookings are not affected.`)) return;
    try { await api.deleteSevaItem(f.id); await load(); } catch (e) { setMsg(e.message); }
  };
  const add = async (e) => {
    e.preventDefault(); setBusy('new'); setMsg('');
    try { await api.createSevaItem(body(fresh)); setFresh(blank); setMsg('Seva added.'); await load(); }
    catch (err) { setMsg(err.message); } finally { setBusy(''); }
  };

  return (
    <div className="space-y-5">
      <div className="glass-card p-4 text-xs font-semibold text-temple-700">
        Devotees see only sevas that are <b>switched on</b> with a price above Rs. 0. Time slots are one per line. Prices are decided here by the temple committee.
      </div>
      {msg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl font-semibold">{msg}</div>}

      {items.map((f) => (
        <div key={f.id} className={`glass-card p-4 space-y-3 border-l-4 ${f.active ? 'border-emerald-500' : 'border-temple-300'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <label className="md:col-span-2 space-y-1"><span className="font-bold uppercase text-temple-600">Seva name</span><input className={inputCls} value={f.name} onChange={(e) => set(f.id, 'name', e.target.value)} /></label>
            <label className="space-y-1"><span className="font-bold uppercase text-temple-600">Price (Rs.)</span><input type="number" min="0" className={inputCls} value={f.price} onChange={(e) => set(f.id, 'price', e.target.value)} /></label>
            <label className="flex items-center gap-2 font-bold mt-5"><input type="checkbox" checked={f.active} onChange={(e) => set(f.id, 'active', e.target.checked)} /> Show to devotees</label>
            <label className="md:col-span-2 space-y-1"><span className="font-bold uppercase text-temple-600">Description</span><textarea rows={3} className={inputCls} value={f.desc} onChange={(e) => set(f.id, 'desc', e.target.value)} /></label>
            <label className="md:col-span-2 space-y-1"><span className="font-bold uppercase text-temple-600">Time slots (one per line)</span><textarea rows={3} className={inputCls} value={f.slotsText} onChange={(e) => set(f.id, 'slotsText', e.target.value)} /></label>
          </div>
          <div className="flex gap-2 justify-end">
            <button disabled={busy === f.id} onClick={() => save(f)} className="px-4 py-2 rounded-lg bg-maroon text-cream-light text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"><Save size={14} /> Save</button>
            <button onClick={() => del(f)} className="px-3 py-2 rounded-lg border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5"><Trash2 size={14} /> Delete</button>
          </div>
        </div>
      ))}

      <form onSubmit={add} className="glass-card p-4 space-y-3 border-t-4 border-saffron">
        <p className="text-sm font-extrabold text-maroon flex items-center gap-2"><Plus size={16} /> Add a new seva</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <input required className={inputCls + ' md:col-span-2'} placeholder="Seva name" value={fresh.name} onChange={(e) => setFresh({ ...fresh, name: e.target.value })} />
          <input required type="number" min="1" className={inputCls} placeholder="Price (Rs.)" value={fresh.price} onChange={(e) => setFresh({ ...fresh, price: e.target.value })} />
          <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={fresh.active} onChange={(e) => setFresh({ ...fresh, active: e.target.checked })} /> Show to devotees</label>
          <textarea rows={2} className={inputCls + ' md:col-span-2'} placeholder="Description" value={fresh.desc} onChange={(e) => setFresh({ ...fresh, desc: e.target.value })} />
          <textarea rows={2} className={inputCls + ' md:col-span-2'} placeholder="Time slots, one per line (leave empty for Morning / Evening)" value={fresh.slotsText} onChange={(e) => setFresh({ ...fresh, slotsText: e.target.value })} />
        </div>
        <button disabled={busy === 'new'} className="px-4 py-2 rounded-lg bg-saffron text-white text-xs font-bold disabled:opacity-60">Add seva</button>
      </form>
    </div>
  );
}
