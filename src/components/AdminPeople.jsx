import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Users, Mail, Phone, Trash2, Download, MessageCircle } from 'lucide-react';

const csvCell = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
function downloadCsv(filename, header, rows) {
  const text = '\uFEFF' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
const day = (d) => (d ? String(d).slice(0, 10) : '');

export default function AdminPeople() {
  const [tab, setTab] = useState('devotees');
  const [devotees, setDevotees] = useState([]);
  const [subs, setSubs] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([api.getDevotees(), api.getSubscribers()])
      .then(([d, s]) => { setDevotees(d); setSubs(s); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const needle = q.trim().toLowerCase();
  const dev = devotees.filter((d) => !needle || [d.name, d.email, d.phone].some((x) => (x || '').toLowerCase().includes(needle)));
  const sub = subs.filter((s) => !needle || s.value.toLowerCase().includes(needle));

  const removeSub = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return;
    try { await api.deleteSubscriber(id); setSubs((l) => l.filter((x) => x.id !== id)); }
    catch (e) { setError(e.message); }
  };

  const tabBtn = (code, label, count) => (
    <button
      onClick={() => setTab(code)}
      className={`px-4 py-2 rounded-full text-xs font-bold border ${tab === code ? 'bg-saffron border-saffron text-white' : 'bg-white border-saffron/20 text-temple-800'}`}
    >
      {label} ({count})
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex gap-2">
          {tabBtn('devotees', 'Registered Devotees', devotees.length)}
          {tabBtn('subs', 'Notice Subscribers', subs.length)}
        </div>
        <div className="flex gap-2 items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name / email / phone"
            className="px-3 py-2 bg-white border border-saffron/20 rounded-xl text-xs focus:outline-none w-56"
          />
          <button
            onClick={() => tab === 'devotees'
              ? downloadCsv('devotees.csv', ['Name', 'Email', 'Mobile', 'Gotra', 'Address', 'Login', 'Joined', 'Donations (count)', 'Donations (INR)', 'Sevas'],
                  dev.map((d) => [d.name, d.email, d.phone, d.gotra, d.address, d.google ? 'Google' : 'Email', day(d.created_at), d.donationCount, d.donationTotal, d.sevaCount]))
              : downloadCsv('subscribers.csv', ['Type', 'Contact', 'Status', 'Subscribed on'],
                  sub.map((s) => [s.type, s.value, s.active ? 'active' : 'unsubscribed', day(s.createdAt)]))}
            className="px-3 py-2 bg-maroon text-cream-light rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold">{error}</div>}
      {loading && <p className="text-xs font-semibold text-temple-500">Loading...</p>}

      {tab === 'devotees' && (
        <div className="overflow-x-auto glass-card">
          <table className="w-full text-xs font-semibold text-left min-w-[720px]">
            <thead className="text-temple-500 uppercase border-b border-saffron/10">
              <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Mobile</th><th className="p-3">Login</th><th className="p-3">Joined</th><th className="p-3">Donations</th><th className="p-3">Sevas</th></tr>
            </thead>
            <tbody>
              {dev.map((d) => (
                <tr key={d.id} className="border-b border-saffron/5">
                  <td className="p-3 text-temple-900 font-bold">{d.name}</td>
                  <td className="p-3 break-all">{d.email}</td>
                  <td className="p-3">{d.phone || '-'}</td>
                  <td className="p-3">{d.google ? 'Google' : 'Email'}</td>
                  <td className="p-3">{day(d.created_at)}</td>
                  <td className="p-3">{d.donationCount ? `${d.donationCount} (₹${d.donationTotal})` : '-'}</td>
                  <td className="p-3">{d.sevaCount || '-'}</td>
                </tr>
              ))}
              {!loading && dev.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-temple-500">No devotees found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'subs' && (
        <div className="overflow-x-auto glass-card">
          <table className="w-full text-xs font-semibold text-left min-w-[560px]">
            <thead className="text-temple-500 uppercase border-b border-saffron/10">
              <tr><th className="p-3">Type</th><th className="p-3">Contact</th><th className="p-3">Status</th><th className="p-3">Subscribed</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {sub.map((s) => (
                <tr key={s.id} className="border-b border-saffron/5">
                  <td className="p-3">{s.type === 'email' ? <Mail size={14} /> : <Phone size={14} />}</td>
                  <td className="p-3 text-temple-900 font-bold break-all">{s.value}</td>
                  <td className="p-3">{s.active ? 'Active' : 'Unsubscribed'}</td>
                  <td className="p-3">{day(s.createdAt)}</td>
                  <td className="p-3 flex gap-3 items-center">
                    {s.type === 'phone' && (
                      <a href={`https://wa.me/91${s.value}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700" title="Open WhatsApp chat"><MessageCircle size={16} /></a>
                    )}
                    <button onClick={() => removeSub(s.id)} className="text-rose-700" title="Remove"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {!loading && sub.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-temple-500">No subscribers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-temple-500 font-semibold flex items-center gap-1"><Users size={12} /> This data is visible only to the temple administrator.</p>
    </div>
  );
}
