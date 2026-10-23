import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Share2, Youtube, Bell, BellOff, Clock, Gift, Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { SITE } from '../config/site';

const ytLink = (l) => (l.videoId ? `https://www.youtube.com/watch?v=${l.videoId}` : SITE.youtube);

export default function LiveDarshan() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const isAdmin = !!user && user.role !== 'devotee';
  const [live, setLive] = useState(null);
  const [msg, setMsg] = useState('');

  // admin form
  const [form, setForm] = useState({ kind: 'arati', title: '', url: '' });
  const [busy, setBusy] = useState(false);
  const [adminMsg, setAdminMsg] = useState('');
  const [cfg, setCfg] = useState(null);
  const [channels, setChannels] = useState({ email: true, whatsapp: false, sms: false });
  const [custom, setCustom] = useState('');
  const [result, setResult] = useState(null);
  const [phones, setPhones] = useState(null);
  const [testMsg, setTestMsg] = useState('');
  const [help, setHelp] = useState(false);

  const load = () => api.getLive().then(setLive).catch(() => setLive({ isLive: false }));
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);
  useEffect(() => { if (isAdmin) api.notifyConfig().then(setCfg).catch(() => {}); }, [isAdmin]);
  useEffect(() => { if (live?.isLive) setForm((f) => ({ ...f, kind: live.kind, title: live.title })); }, [live?.isLive]);

  const toggleAlerts = async (on) => {
    setMsg('');
    const r = await updateProfile({ notifyLive: on });
    setMsg(r.success ? (on ? 'Live alerts are ON.' : 'Live alerts are OFF.') : r.message);
  };

  const share = () => {
    const text = `${live?.title || 'Live Arati'} - Shree Jagannath Temple Sidheswar\nWatch live: ${window.location.origin}/live`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const saveLive = async (isLive) => {
    setBusy(true); setAdminMsg('');
    try {
      await api.setLive({ isLive, kind: form.kind, title: form.title, url: form.url });
      setAdminMsg(isLive ? 'Live is ON. Now press "Send alerts" to inform devotees.' : 'Live is OFF.');
      setForm((f) => ({ ...f, url: '' }));
      await load();
    } catch (e) { setAdminMsg(e.message); } finally { setBusy(false); }
  };

  const sendAlerts = async (offset = 0) => {
    setBusy(true); setAdminMsg(''); setResult(null);
    try { setResult(await api.notifyLive({ ...channels, message: custom, offset })); }
    catch (e) { setAdminMsg(e.message); } finally { setBusy(false); }
  };

  const testEmail = async () => {
    setBusy(true); setTestMsg('');
    try { const r = await api.testLiveEmail(); setTestMsg(`Test email sent to ${r.to}. Check that inbox (and spam).`); }
    catch (e) { setTestMsg(e.message); } finally { setBusy(false); }
  };
  const loadPhones = async () => {
    try {
      const [dev, subs] = await Promise.all([api.getDevotees(), api.getSubscribers()]);
      const m = new Map();
      dev.forEach((d) => { if (d.phone && d.notify !== false) m.set(d.phone, d.name); });
      subs.forEach((x) => { if (x.type === 'phone' && x.active && !m.has(x.value)) m.set(x.value, 'Subscriber'); });
      setPhones([...m.entries()].map(([phone, name]) => ({ phone, name })));
    } catch (e) { setAdminMsg(e.message); setPhones([]); }
  };
  const alertText = () => (custom || `${form.title || live?.title || 'Live Arati'} ${live?.isLive ? 'is LIVE now.' : 'is starting soon.'}`) + ' Watch: ' + window.location.origin + '/live';

  const src = live?.videoId
    ? `https://www.youtube.com/embed/${live.videoId}?autoplay=1&rel=0&modestbranding=1`
    : live?.channelId ? `https://www.youtube.com/embed/live_stream?channel=${live.channelId}&autoplay=1&rel=0` : '';
  const inputCls = 'w-full px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl text-xs font-semibold focus:outline-none';
  const fmt = (r) => r ? `${r.sent} sent${r.failed ? `, ${r.failed} failed` : ''}` : null;

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900 pb-20">
      <div className="relative bg-temple-dark text-cream-light py-14 border-b border-gold/20 text-center">
        <div className="absolute inset-0 bg-[url('/assets/jagannath_tulasi_closeup.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-glow text-white">Live Darshan</h2>
          <p className="mt-3 text-sm text-cream-light/80 font-semibold">Watch the Arati and Pujan of Lord Jagannath live</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10 space-y-6">
        {/* Player */}
        <div className="glass-card overflow-hidden border-t-4 border-red-600">
          {live?.isLive && src ? (
            <>
              <div className="px-5 py-3 flex items-center gap-2 bg-red-50 text-red-800 font-extrabold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span> LIVE NOW &middot; {live.title}
              </div>
              <div className="aspect-video bg-black">
                <iframe
                  title={live.title || 'Live'} src={src} className="w-full h-full" loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen
                />
              </div>
            </>
          ) : (
            <div className="p-10 text-center space-y-3">
              <Radio size={44} className="mx-auto text-saffron" />
              <h3 className="text-xl font-extrabold font-outfit text-maroon">{live ? 'Live darshan is not on right now' : 'Loading...'}</h3>
              <p className="text-sm font-semibold text-temple-600">When the Arati or Pujan starts, the video will appear here automatically. Turn on alerts below to get a message.</p>
            </div>
          )}
          <div className="p-4 flex flex-wrap gap-2 justify-center border-t border-saffron/10">
            <button onClick={share} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5"><Share2 size={14} /> Share on WhatsApp</button>
            <a href={live ? ytLink(live) : SITE.youtube} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1.5"><Youtube size={14} /> Open on YouTube</a>
            <Link to="/darshan" className="px-4 py-2 rounded-xl border border-saffron/30 bg-white text-xs font-bold flex items-center gap-1.5"><Clock size={14} /> Arati timings</Link>
            <Link to="/seva" className="px-4 py-2 rounded-xl bg-saffron text-white text-xs font-bold flex items-center gap-1.5"><Gift size={14} /> Book Arati Seva</Link>
          </div>
        </div>

        {/* Alerts */}
        <div className="glass-card p-5 space-y-3">
          <p className="text-sm font-extrabold text-maroon flex items-center gap-2"><Bell size={16} /> Live Arati alerts</p>
          {isAuthenticated ? (
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input type="checkbox" checked={user.notifyLive !== false} onChange={(e) => toggleAlerts(e.target.checked)} className="w-4 h-4" />
              <span>Send me a WhatsApp / SMS / email when Live Arati or Pujan starts</span>
            </label>
          ) : (
            <p className="text-sm font-semibold text-temple-700">
              <Link to="/login" className="text-saffron font-bold underline">Log in</Link> or <Link to="/register" className="text-saffron font-bold underline">register</Link> to get an alert on your mobile and email when the Live Arati starts.
            </p>
          )}
          {msg && <p className="text-xs font-bold text-emerald-700">{msg}</p>}
        </div>

        {/* Admin */}
        {isAdmin && (
          <div className="glass-card p-5 space-y-4 border-l-4 border-maroon">
            <p className="text-sm font-extrabold text-maroon">Admin: control the live stream</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
              <label className="space-y-1"><span className="uppercase text-temple-700">Type</span>
                <select className={inputCls} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                  <option value="arati">Arati</option><option value="pujan">Pujan</option>
                </select></label>
              <label className="space-y-1"><span className="uppercase text-temple-700">Title (shown to devotees)</span>
                <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sandhya Arati" maxLength={120} /></label>
            </div>
            <label className="block space-y-1 text-xs font-semibold"><span className="uppercase text-temple-700">YouTube live link (or channel ID)</span>
              <input className={inputCls} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." /></label>
            <div className="flex flex-wrap gap-2">
              <button disabled={busy} onClick={() => saveLive(true)} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold disabled:opacity-60">Go LIVE</button>
              <button disabled={busy || !live?.isLive} onClick={() => saveLive(false)} className="px-4 py-2 rounded-xl border border-temple-300 bg-white text-xs font-bold disabled:opacity-50">Stop live</button>
            </div>

            <div className="border-t border-saffron/10 pt-4 space-y-3 text-xs font-semibold">
              <p className="uppercase text-temple-700 flex items-center gap-1"><Send size={12} /> Send alerts to devotees</p>
              <input className={inputCls} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Optional message, e.g. Sandhya Arati starts at 6:30 PM" maxLength={200} />
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={channels.email} disabled={cfg && !cfg.email} onChange={(e) => setChannels({ ...channels, email: e.target.checked })} /> Email {cfg && !cfg.email ? '(not set up)' : ''}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={channels.whatsapp} disabled={cfg && !cfg.whatsapp} onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })} /> WhatsApp {cfg && !cfg.whatsapp ? '(not set up)' : ''}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={channels.sms} disabled={cfg && !cfg.sms} onChange={(e) => setChannels({ ...channels, sms: e.target.checked })} /> SMS {cfg && !cfg.sms ? '(not set up)' : ''}</label>
              </div>
              <button disabled={busy || !(channels.email || channels.whatsapp || channels.sms)} onClick={() => sendAlerts(0)} className="px-4 py-2 rounded-xl bg-maroon text-cream-light text-xs font-bold disabled:opacity-50">Send alerts now</button>
              {result && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-1">
                  <p>{[result.email && `Email: ${fmt(result.email)}`, result.whatsapp && `WhatsApp: ${fmt(result.whatsapp)}`, result.sms && `SMS: ${fmt(result.sms)}`].filter(Boolean).join(' | ') || 'Nothing sent.'}</p>
                  {['email', 'whatsapp', 'sms'].map((k) => result[k]?.error ? <p key={k} className="text-rose-700 break-words">{k}: {result[k].error}</p> : null)}
                  <p className="text-[11px]">Reached up to {result.offset + result.cap} of {result.totals.email} emails / {result.totals.phone} mobile numbers.</p>
                  {(result.offset + result.cap < Math.max(result.totals.email, result.totals.phone)) && (
                    <button disabled={busy} onClick={() => sendAlerts(result.offset + result.cap)} className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold">Send to next {result.cap}</button>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2 items-center">
                <button disabled={busy || !cfg?.email} onClick={testEmail} className="px-3 py-1.5 rounded-lg border border-maroon/40 bg-white text-maroon font-bold disabled:opacity-50">Send test email to me</button>
                <button onClick={() => setHelp(!help)} className="px-3 py-1.5 rounded-lg border border-temple-300 bg-white font-bold">{help ? 'Hide' : 'Show'} setup help</button>
              </div>
              {testMsg && <p className="font-bold text-maroon break-words">{testMsg}</p>}
              {help && (
                <div className="p-3 bg-gold/10 border border-gold/30 rounded-xl space-y-2 leading-relaxed">
                  <p><b>Email (easiest, free):</b> official Gmail, then Google Account, Security, turn on 2-Step Verification, then "App passwords" (myaccount.google.com/apppasswords). Create one named "Temple website" and copy the 16 letters. In Vercel, Settings, Environment Variables, add <code>GMAIL_APP_PASSWORD</code> with that value (no spaces), then Redeploy. Press "Send test email to me" to check.</p>
                  <p><b>WhatsApp (official API):</b> needs a Meta Business account, a phone number that is not already on WhatsApp, and an approved message template with 2 variables. Then add <code>WHATSAPP_TOKEN</code>, <code>WHATSAPP_PHONE_ID</code>, <code>WHATSAPP_TEMPLATE</code> in Vercel. Until then use the manual list below.</p>
                  <p><b>SMS (India):</b> needs a provider such as MSG91 plus DLT registration and an approved template with two variables. Then add <code>MSG91_AUTHKEY</code> and <code>MSG91_TEMPLATE_ID</code> in Vercel.</p>
                </div>
              )}

              <div className="border-t border-saffron/10 pt-3 space-y-2">
                <p className="uppercase text-temple-700 flex items-center gap-1"><MessageCircle size={12} /> WhatsApp without any setup (manual)</p>
                {phones === null ? (
                  <button onClick={loadPhones} className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold">Show WhatsApp list</button>
                ) : phones.length === 0 ? <p className="text-temple-500">No mobile numbers yet.</p> : (
                  <>
                    <p className="text-temple-600">Tap a number: WhatsApp opens with the message ready, you only press send.</p>
                    <div className="max-h-56 overflow-y-auto space-y-1">
                      {phones.map((p) => (
                        <a key={p.phone} target="_blank" rel="noopener noreferrer" href={`https://wa.me/91${p.phone}?text=${encodeURIComponent(alertText())}`}
                          className="flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-lg text-emerald-900 hover:bg-emerald-100">
                          <span>{p.name} &middot; +91 {p.phone}</span><span className="font-bold">Open chat &rarr;</span>
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            {adminMsg && <p className="text-xs font-bold text-maroon">{adminMsg}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
