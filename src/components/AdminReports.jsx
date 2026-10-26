import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { CATEGORY_LABELS } from '../../shared/catalog';

const cell = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
function csv(name, header, rows) {
  const text = '\uFEFF' + [header, ...rows].map((r) => r.map(cell).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}
const istMonth = () => new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 7);
const dayOf = (iso) => new Date(new Date(iso).getTime() + 5.5 * 3600000).toISOString().slice(0, 10);

export default function AdminReports({ donations = [], sevas = [] }) {
  const [month, setMonth] = useState(istMonth());
  const inMonth = (iso) => !month || (iso && dayOf(iso).startsWith(month));
  const dons = useMemo(() => donations.filter((d) => inMonth(d.date)), [donations, month]);
  const bks = useMemo(() => sevas.filter((s) => inMonth(s.createdAt)), [sevas, month]);

  const donTotal = dons.reduce((s, d) => s + Number(d.amount || 0), 0);
  const byPurpose = {};
  dons.forEach((d) => { const k = CATEGORY_LABELS[d.category] || d.category; byPurpose[k] = (byPurpose[k] || 0) + Number(d.amount || 0); });
  const paidBk = bks.filter((s) => s.paymentStatus === 'paid');
  const sevaTotal = paidBk.reduce((s, x) => s + Number(x.amount || 0), 0);
  const byStatus = {};
  bks.forEach((s) => { byStatus[s.approvalStatus] = (byStatus[s.approvalStatus] || 0) + 1; });
  const bySeva = {};
  bks.forEach((s) => { bySeva[s.sevaType] = (bySeva[s.sevaType] || 0) + 1; });
  const tag = month || 'all';
  const Box = ({ title, value, sub }) => <div className="glass-card p-4"><p className="text-[10px] font-bold uppercase text-temple-500">{title}</p><p className="text-2xl font-extrabold font-outfit text-maroon">{value}</p>{sub && <p className="text-[11px] font-semibold text-temple-500">{sub}</p>}</div>;

  return (
    <div className="space-y-5">
      <div className="glass-card p-4 flex flex-wrap items-center gap-3 text-xs font-bold">
        <label className="flex items-center gap-2">Month <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-2 bg-white border border-saffron/30 rounded-lg" /></label>
        <button onClick={() => setMonth('')} className="px-3 py-2 rounded-lg border border-temple-300">All time</button>
        <button onClick={() => setMonth(istMonth())} className="px-3 py-2 rounded-lg border border-temple-300">This month</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Box title="Donations" value={`\u20B9${donTotal}`} sub={`${dons.length} receipts`} />
        <Box title="Seva payments" value={`\u20B9${sevaTotal}`} sub={`${paidBk.length} paid bookings`} />
        <Box title="Total received" value={`\u20B9${donTotal + sevaTotal}`} />
        <Box title="Bookings" value={bks.length} sub={Object.entries(byStatus).map(([k, v]) => `${k}: ${v}`).join(' | ')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs font-semibold">
        <div className="glass-card p-4">
          <p className="font-extrabold text-maroon mb-2">Donations by purpose</p>
          {Object.keys(byPurpose).length === 0 ? <p className="text-temple-500">No donations in this period.</p> : Object.entries(byPurpose).map(([k, v]) => <p key={k} className="flex justify-between py-1 border-b border-saffron/10"><span>{k}</span><b>{'\u20B9'}{v}</b></p>)}
        </div>
        <div className="glass-card p-4">
          <p className="font-extrabold text-maroon mb-2">Bookings by seva</p>
          {Object.keys(bySeva).length === 0 ? <p className="text-temple-500">No bookings in this period.</p> : Object.entries(bySeva).map(([k, v]) => <p key={k} className="flex justify-between py-1 border-b border-saffron/10"><span>{k}</span><b>{v}</b></p>)}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => csv(`donations-${tag}.csv`, ['Receipt No', 'Date', 'Donor', 'Mobile', 'Email', 'Purpose', 'Amount (INR)', 'Payment ID', 'Anonymous'],
            dons.map((d) => [d.receiptNumber, dayOf(d.date), d.donorName, d.phone, d.email, CATEGORY_LABELS[d.category] || d.category, d.amount, d.transactionId, d.isAnonymous ? 'yes' : 'no']))}
          className="px-4 py-2.5 rounded-xl bg-maroon text-cream-light font-bold text-xs flex items-center gap-2"><Download size={14} /> Donations CSV</button>
        <button
          onClick={() => csv(`seva-bookings-${tag}.csv`, ['Booking ID', 'Booked on', 'Seva date', 'Time slot', 'Seva', 'Devotee', 'Mobile', 'Email', 'Gotra', 'Nakshatra', 'Sankalpa', 'Amount (INR)', 'Payment', 'Status', 'Payment ID'],
            bks.map((s) => [s.bookingReference, dayOf(s.createdAt), s.selectedDate, s.slot, s.sevaType, s.devoteeName, s.phone, s.email, s.gotra, s.nakshatra, s.sankalpa, s.amount, s.paymentStatus, s.approvalStatus, s.transactionId]))}
          className="px-4 py-2.5 rounded-xl bg-saffron text-white font-bold text-xs flex items-center gap-2"><Download size={14} /> Seva bookings CSV</button>
      </div>
      <p className="text-[11px] font-semibold text-temple-500">CSV files open in Excel / Google Sheets. Donor and devotee details are private: share these reports only with committee members.</p>
    </div>
  );
}
