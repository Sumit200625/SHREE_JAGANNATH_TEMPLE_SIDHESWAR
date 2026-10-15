import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { SITE } from '../config/site';
import { generateNoticePdf } from '../utils/noticePdf';
import SubscribeBox from '../components/SubscribeBox';
import { Bell, Info, Search, FileText, Share2, Plus, Pencil, Trash2, Send, X, Paperclip, MessageCircle } from 'lucide-react';

const emptyForm = () => ({
  titleEn: '', contentEn: '', titleOr: '', contentOr: '', titleHi: '', contentHi: '',
  category: 'general', isPinned: false,
  expiryDate: new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10),
  sendEmail: false, sendWhatsapp: false,
});

export default function NewsNotices() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const isAdmin = !!user && user.role !== 'devotee';

  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [banner, setBanner] = useState('');
  const [pdfBusy, setPdfBusy] = useState('');

  // admin state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [pdfFile, setPdfFile] = useState(null);
  const [showOther, setShowOther] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [sendFor, setSendFor] = useState(null);
  const [cfg, setCfg] = useState(null);
  const [sendResult, setSendResult] = useState('');
  const [phones, setPhones] = useState([]);

  const reload = () => api.getNotices().then((res) => setNotices(res)).catch(() => {});
  useEffect(() => { reload(); }, []);
  useEffect(() => { if (isAdmin) api.notifyConfig().then(setCfg).catch(() => {}); }, [isAdmin]);

  useEffect(() => {
    let result = notices;
    if (activeCategory !== 'all') result = result.filter((n) => n.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((n) =>
        [n.titleEn, n.contentEn, n.titleOr, n.contentOr, n.titleHi, n.contentHi].some((x) => (x || '').toLowerCase().includes(q)));
    }
    setFilteredNotices(result);
  }, [activeCategory, searchQuery, notices]);

  const getNoticeTitle = (n) => (language === 'or' ? n.titleOr : language === 'hi' ? n.titleHi : n.titleEn) || n.titleEn;
  const getNoticeContent = (n) => (language === 'or' ? n.contentOr : language === 'hi' ? n.contentHi : n.contentEn) || n.contentEn;

  const shareOnWhatsApp = (n) => {
    const textMsg = `*Temple Announcement: ${getNoticeTitle(n)}*\n\n${getNoticeContent(n)}\n\nShree Jagannath Temple Sidheswar\n${window.location.origin}/notices`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`, '_blank', 'noopener');
  };

  // Real PDF: the file the admin attached, or a PDF generated from the notice text
  const downloadNoticePDF = async (n) => {
    if (n.pdfUrl && n.pdfUrl.startsWith('https://')) {
      window.open(n.pdfUrl, '_blank', 'noopener');
      return;
    }
    setPdfBusy(n.id);
    setBanner('');
    try {
      await generateNoticePdf(
        { id: n.id, title: getNoticeTitle(n), content: getNoticeContent(n), category: n.category, publishDate: n.publishDate, expiryDate: n.expiryDate },
        { phone: SITE.phoneDisplay, email: SITE.email }
      );
    } catch {
      setBanner('Could not create the PDF on this device. Please try again or use another browser.');
    } finally {
      setPdfBusy('');
    }
  };

  // ---------- admin: create / edit / delete ----------
  const openNew = () => { setEditing(null); setForm(emptyForm()); setPdfFile(null); setShowOther(false); setFormError(''); setFormOpen(true); };
  const openEdit = (n) => {
    setEditing(n);
    setForm({
      titleEn: n.titleEn || '', contentEn: n.contentEn || '', titleOr: n.titleOr || '', contentOr: n.contentOr || '',
      titleHi: n.titleHi || '', contentHi: n.contentHi || '', category: n.category || 'general', isPinned: !!n.isPinned,
      expiryDate: n.expiryDate || '', sendEmail: false, sendWhatsapp: false,
    });
    setPdfFile(null); setShowOther(true); setFormError(''); setFormOpen(true);
  };
  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submitForm = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.titleEn.trim() || !form.contentEn.trim()) { setFormError('Title and details (English) are required.'); return; }
    setBusy(true);
    try {
      const payload = {
        titleEn: form.titleEn.trim(), contentEn: form.contentEn.trim(),
        titleOr: form.titleOr.trim() || form.titleEn.trim(), contentOr: form.contentOr.trim() || form.contentEn.trim(),
        titleHi: form.titleHi.trim() || form.titleEn.trim(), contentHi: form.contentHi.trim() || form.contentEn.trim(),
        category: form.category, isPinned: form.isPinned, expiryDate: form.expiryDate,
      };
      if (pdfFile) {
        if (pdfFile.type !== 'application/pdf') throw new Error('Please choose a PDF file.');
        if (pdfFile.size > 4 * 1024 * 1024) throw new Error('PDF must be smaller than 4 MB.');
        payload.pdfUrl = (await api.uploadPdf(pdfFile)).url;
      }
      const saved = editing ? await api.updateNotice(editing.id, payload) : await api.createNotice(payload);
      await reload();
      setFormOpen(false);
      if (!editing && (form.sendEmail || form.sendWhatsapp)) {
        try {
          const r = await api.sendNotice(saved.id, { email: form.sendEmail, whatsapp: form.sendWhatsapp });
          setBanner('Notice published. ' + describeSend(r));
        } catch (err) {
          setBanner('Notice published, but sending failed: ' + err.message);
        }
      } else {
        setBanner(editing ? 'Notice updated.' : 'Notice published.');
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const removeNotice = async (n) => {
    if (!window.confirm(`Delete this notice?\n\n${n.titleEn}`)) return;
    try { await api.deleteNotice(n.id); await reload(); setBanner('Notice deleted.'); }
    catch (err) { setBanner(err.message); }
  };

  // ---------- admin: send to subscribers ----------
  const describeSend = (r) => {
    const parts = [];
    if (r.email) parts.push(`Email: ${r.email.sent} sent${r.email.failed ? `, ${r.email.failed} failed` : ''}`);
    if (r.whatsapp) parts.push(`WhatsApp: ${r.whatsapp.sent} sent${r.whatsapp.failed ? `, ${r.whatsapp.failed} failed` : ''}`);
    return parts.join(' | ') || 'Nothing was sent.';
  };
  const openSend = (n) => {
    setSendFor(n); setSendResult('');
    api.notifyConfig().then(setCfg).catch(() => {});
    api.getSubscribers().then((l) => setPhones(l.filter((s) => s.type === 'phone' && s.active))).catch(() => {});
  };
  const doSend = async (channels) => {
    setBusy(true); setSendResult('');
    try { setSendResult(describeSend(await api.sendNotice(sendFor.id, channels))); }
    catch (err) { setSendResult(err.message); }
    finally { setBusy(false); }
  };
  const manualWhatsAppText = (n) => `*Temple Announcement: ${n.titleEn}*\n\n${n.contentEn}\n\nShree Jagannath Temple Sidheswar`;

  const categories = [
    { code: 'all', label: 'All Notices' }, { code: 'urgent', label: 'Urgent' }, { code: 'general', label: 'General' },
    { code: 'festival', label: 'Festivals' }, { code: 'closure', label: 'Closures' }, { code: 'committee', label: 'Committee' },
  ];
  const inputCls = 'w-full px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:outline-none font-semibold';

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900 pb-20">

      <div className="relative bg-temple-dark text-cream-light py-20 border-b border-gold/20 text-center">
        <div className="absolute inset-0 bg-[url('/assets/temple_chariot_sunset.jpg')] bg-cover bg-center opacity-25"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-glow text-white">{t('notices')}</h2>
          <div className="mt-4 flex justify-center items-center gap-2">
            <span className="w-10 h-0.5 bg-gold"></span>
            <Bell size={20} className="text-gold" />
            <span className="w-10 h-0.5 bg-gold"></span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 space-y-8">

        {isAdmin && (
          <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-maroon">
            <p className="text-xs font-bold text-maroon">Admin: you can publish, edit, delete and send notices from this page.</p>
            <button onClick={openNew} className="px-4 py-2 bg-maroon hover:bg-maroon-light text-cream-light rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Plus size={14} /> New Notice
            </button>
          </div>
        )}

        {banner && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl font-semibold flex justify-between gap-3">
            <span>{banner}</span>
            <button onClick={() => setBanner('')} aria-label="Dismiss"><X size={14} /></button>
          </div>
        )}

        <div className="glass-card p-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.code}
                onClick={() => setActiveCategory(cat.code)}
                className={`px-4 py-2 rounded-full text-xs font-bold font-outfit whitespace-nowrap transition-colors border ${
                  activeCategory === cat.code ? 'bg-saffron border-saffron text-white shadow-sm' : 'bg-white border-saffron/10 hover:bg-saffron/5 text-temple-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3 top-3 text-temple-400" size={14} />
            <input
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-saffron/20 rounded-xl text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredNotices.length === 0 && (
            <div className="glass-card p-12 text-center text-temple-600 font-semibold border-t-4 border-maroon">
              <Bell size={48} className="text-maroon mx-auto mb-4 animate-bounce" />
              <p>No notices found matching your criteria.</p>
            </div>
          )}

          {filteredNotices.map((n) => {
            const isUrgent = n.category === 'urgent';
            return (
              <div
                key={n.id}
                className={`glass-card p-6 md:p-8 box-glow border-l-4 transition-all duration-300 relative ${
                  n.isPinned ? 'border-gold bg-gradient-to-r from-white to-gold/5 dark:from-temple-darker dark:to-gold/5'
                    : isUrgent ? 'border-rose-600 bg-gradient-to-r from-white to-rose-50/10' : 'border-saffron'
                }`}
              >
                {n.isPinned && (
                  <div className="absolute top-4 right-4 bg-gold/20 text-gold-dark font-extrabold text-[9px] px-2.5 py-0.5 rounded-full border border-gold/40">
                    PINNED IMPORTANT
                  </div>
                )}

                <div className="flex gap-4 items-start">
                  <div className={`p-3 rounded-full shrink-0 ${isUrgent ? 'bg-rose-100 text-rose-800' : 'bg-saffron/10 text-saffron'}`}>
                    <Info size={20} />
                  </div>

                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-temple-500 font-semibold">
                      <span className={`px-2 py-0.5 rounded-full ${isUrgent ? 'bg-rose-100 text-rose-800' : 'bg-temple-100 text-temple-800'}`}>
                        {(n.category || 'general').toUpperCase()}
                      </span>
                      <span>Published: {n.publishDate}</span>
                      {n.expiryDate && (<><span>•</span><span>Expiry: {n.expiryDate}</span></>)}
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-temple-900">{getNoticeTitle(n)}</h3>
                    <p className="text-xs md:text-sm text-temple-600 leading-relaxed font-semibold whitespace-pre-wrap break-words">{getNoticeContent(n)}</p>

                    <div className="pt-4 border-t border-saffron/5 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => downloadNoticePDF(n)}
                          disabled={pdfBusy === n.id}
                          className="px-3.5 py-1.5 border border-saffron/20 hover:border-saffron text-saffron bg-white dark:bg-temple-dark font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-60"
                        >
                          <FileText size={12} />
                          <span>{pdfBusy === n.id ? 'Preparing PDF...' : 'Download PDF'}</span>
                        </button>
                        {isAdmin && (
                          <>
                            <button onClick={() => openEdit(n)} className="px-3 py-1.5 border border-temple-200 bg-white text-temple-800 font-bold rounded-lg text-xs flex items-center gap-1.5"><Pencil size={12} /> Edit</button>
                            <button onClick={() => openSend(n)} className="px-3 py-1.5 border border-maroon/30 bg-white text-maroon font-bold rounded-lg text-xs flex items-center gap-1.5"><Send size={12} /> Send</button>
                            <button onClick={() => removeNotice(n)} className="px-3 py-1.5 border border-rose-200 bg-white text-rose-700 font-bold rounded-lg text-xs flex items-center gap-1.5"><Trash2 size={12} /> Delete</button>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => shareOnWhatsApp(n)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Share2 size={12} />
                        <span>Share on WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <SubscribeBox />
      </div>

      {/* ---------- Create / Edit modal ---------- */}
      {formOpen && (
        <div className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center p-3 bg-black/60 overflow-y-auto">
          <form onSubmit={submitForm} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-5 sm:p-7 space-y-4 text-xs font-semibold my-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-outfit text-maroon">{editing ? 'Edit Notice' : 'Publish New Notice'}</h3>
              <button type="button" onClick={() => setFormOpen(false)} aria-label="Close"><X size={20} /></button>
            </div>

            {formError && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">{formError}</div>}

            <label className="block space-y-1"><span className="uppercase text-temple-700">Title (English) *</span>
              <input className={inputCls} value={form.titleEn} onChange={setF('titleEn')} maxLength={200} required /></label>
            <label className="block space-y-1"><span className="uppercase text-temple-700">Details (English) *</span>
              <textarea className={inputCls + ' min-h-[110px]'} value={form.contentEn} onChange={setF('contentEn')} maxLength={4000} required /></label>

            <button type="button" onClick={() => setShowOther(!showOther)} className="text-saffron font-bold underline">
              {showOther ? 'Hide' : 'Add'} Odia / Hindi text (optional, English is used if empty)
            </button>
            {showOther && (
              <div className="space-y-3 p-3 bg-temple-50 rounded-xl">
                <input className={inputCls} placeholder="Title (Odia)" value={form.titleOr} onChange={setF('titleOr')} />
                <textarea className={inputCls + ' min-h-[70px]'} placeholder="Details (Odia)" value={form.contentOr} onChange={setF('contentOr')} />
                <input className={inputCls} placeholder="Title (Hindi)" value={form.titleHi} onChange={setF('titleHi')} />
                <textarea className={inputCls + ' min-h-[70px]'} placeholder="Details (Hindi)" value={form.contentHi} onChange={setF('contentHi')} />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-1"><span className="uppercase text-temple-700">Category</span>
                <select className={inputCls} value={form.category} onChange={setF('category')}>
                  <option value="general">General</option><option value="urgent">Urgent</option><option value="festival">Festival</option>
                  <option value="closure">Closure</option><option value="committee">Committee</option>
                </select></label>
              <label className="block space-y-1"><span className="uppercase text-temple-700">Valid till</span>
                <input type="date" className={inputCls} value={form.expiryDate} onChange={setF('expiryDate')} /></label>
            </div>

            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPinned} onChange={setF('isPinned')} /> Pin as important</label>

            <label className="block space-y-1"><span className="uppercase text-temple-700 flex items-center gap-1"><Paperclip size={12} /> Attach PDF (optional, max 4 MB)</span>
              <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} className="text-xs" />
              {editing?.pdfUrl && editing.pdfUrl !== '#' && !pdfFile && <span className="text-temple-500">A PDF is already attached. Choose a new file to replace it.</span>}
            </label>

            {!editing && (
              <div className="p-3 bg-gold/10 border border-gold/30 rounded-xl space-y-1.5">
                <p className="uppercase text-temple-700">Also send to subscribers now</p>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.sendEmail} onChange={setF('sendEmail')} disabled={cfg && !cfg.email} /> Email {cfg ? `(${cfg.subscribers.email} subscribers)` : ''}{cfg && !cfg.email ? ' - not set up yet' : ''}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.sendWhatsapp} onChange={setF('sendWhatsapp')} disabled={cfg && !cfg.whatsapp} /> WhatsApp {cfg ? `(${cfg.subscribers.phone} numbers)` : ''}{cfg && !cfg.whatsapp ? ' - not set up yet (you can still send manually after publishing)' : ''}</label>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2.5 rounded-xl border border-temple-200">Cancel</button>
              <button type="submit" disabled={busy} className="px-5 py-2.5 rounded-xl bg-maroon text-cream-light font-bold disabled:opacity-60">
                {busy ? 'Saving...' : editing ? 'Save changes' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------- Send modal ---------- */}
      {sendFor && (
        <div className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center p-3 bg-black/60 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-7 space-y-4 text-xs font-semibold my-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-outfit text-maroon">Send to subscribers</h3>
              <button onClick={() => setSendFor(null)} aria-label="Close"><X size={20} /></button>
            </div>
            <p className="text-temple-700 font-bold">{sendFor.titleEn}</p>
            {sendResult && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl">{sendResult}</div>}

            <div className="space-y-2">
              <button
                disabled={busy || !cfg?.email || !cfg?.subscribers.email}
                onClick={() => doSend({ email: true })}
                className="w-full py-2.5 rounded-xl bg-maroon text-cream-light font-bold disabled:opacity-50"
              >
                Send Email to {cfg?.subscribers.email ?? 0} subscribers
              </button>
              {cfg && !cfg.email && <p className="text-rose-700">Email is not set up yet. Add GMAIL_APP_PASSWORD in Vercel settings.</p>}

              <button
                disabled={busy || !cfg?.whatsapp || !cfg?.subscribers.phone}
                onClick={() => doSend({ whatsapp: true })}
                className="w-full py-2.5 rounded-xl bg-emerald-700 text-white font-bold disabled:opacity-50"
              >
                Send WhatsApp (official API) to {cfg?.subscribers.phone ?? 0} numbers
              </button>
              {cfg && !cfg.whatsapp && <p className="text-temple-500">WhatsApp API is not set up. Use the manual list below instead.</p>}
            </div>

            <div className="border-t border-saffron/10 pt-3 space-y-2">
              <p className="uppercase text-temple-700 flex items-center gap-1"><MessageCircle size={12} /> Manual WhatsApp (works without any setup)</p>
              {phones.length === 0 && <p className="text-temple-500">No subscribed mobile numbers yet.</p>}
              <div className="max-h-48 overflow-y-auto space-y-1">
                {phones.map((p) => (
                  <a key={p.id} target="_blank" rel="noopener noreferrer"
                    href={`https://wa.me/91${p.value}?text=${encodeURIComponent(manualWhatsAppText(sendFor))}`}
                    className="flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-lg text-emerald-900 hover:bg-emerald-100">
                    <span>+91 {p.value}</span><span className="font-bold">Open chat &rarr;</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
