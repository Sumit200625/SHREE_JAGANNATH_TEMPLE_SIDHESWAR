import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { mockApi } from '../api/mockApi';
import { Bell, Info, Search, ShieldAlert, Award, FileText, Send, Share2 } from 'lucide-react';

export default function NewsNotices() {
  const { t, language } = useLanguage();
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    mockApi.getNotices().then(res => {
      setNotices(res);
      setFilteredNotices(res);
    });
  }, []);

  // Filter & Search Notice Board
  useEffect(() => {
    let result = notices;

    if (activeCategory !== 'all') {
      result = result.filter(n => n.category === activeCategory);
    }

    if (searchQuery) {
      result = result.filter(n => 
        n.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.titleOr.includes(searchQuery) ||
        n.titleHi.includes(searchQuery) ||
        n.contentEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.contentOr.includes(searchQuery) ||
        n.contentHi.includes(searchQuery)
      );
    }

    setFilteredNotices(result);
  }, [activeCategory, searchQuery, notices]);

  const getNoticeTitle = (n) => {
    if (language === 'or') return n.titleOr;
    if (language === 'hi') return n.titleHi;
    return n.titleEn;
  };

  const getNoticeContent = (n) => {
    if (language === 'or') return n.contentOr;
    if (language === 'hi') return n.contentHi;
    return n.contentEn;
  };

  // Share Notice on WhatsApp link generator
  const shareOnWhatsApp = (n) => {
    const title = getNoticeTitle(n);
    const content = getNoticeContent(n);
    const textMsg = `*Temple Announcement: ${title}*\n\n${content}\n\nRead more at Sidheswar Temple digital portal.`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Mock PDF Downloader
  const downloadNoticePDF = (n) => {
    const docText = `========================================================
OFFICIAL TEMPLE ANNOUNCEMENT - SIDHESWAR TRUST
========================================================
Notice ID:      ${n.id}
Publish Date:   ${n.publishDate}
Expiry Date:    ${n.expiryDate}
Category:       ${n.category.toUpperCase()}
========================================================
Title:          ${getNoticeTitle(n)}
========================================================
Announcement Details:
${getNoticeContent(n)}
========================================================
Trust Secretary, Shree Jagannath Temple, Digapahandi
========================================================`;

    const blob = new Blob([docText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `notice_${n.id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = [
    { code: 'all', label: 'All Notices' },
    { code: 'urgent', label: 'Urgent' },
    { code: 'general', label: 'General' },
    { code: 'festival', label: 'Festivals' },
    { code: 'closure', label: 'Closures' },
    { code: 'committee', label: 'Committee' }
  ];

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900 pb-20">
      
      {/* Page Header */}
      <div className="relative bg-temple-dark text-cream-light py-20 border-b border-gold/20 text-center">
        <div className="absolute inset-0 bg-[url('/assets/temple_exterior.png')] bg-cover bg-center opacity-25"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-glow text-white">
            {t('notices')}
          </h2>
          <div className="mt-4 flex justify-center items-center gap-2">
            <span className="w-10 h-0.5 bg-gold"></span>
            <Bell size={20} className="text-gold" />
            <span className="w-10 h-0.5 bg-gold"></span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 space-y-8">
        
        {/* Notices Toolbar */}
        <div className="glass-card p-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          {/* Categories select */}
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.code}
                onClick={() => setActiveCategory(cat.code)}
                className={`px-4 py-2 rounded-full text-xs font-bold font-outfit whitespace-nowrap transition-colors border ${
                  activeCategory === cat.code
                    ? 'bg-saffron border-saffron text-white shadow-sm'
                    : 'bg-white border-saffron/10 hover:bg-saffron/5 text-temple-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3 top-3 text-temple-400" size={14} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-saffron/20 rounded-xl text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* List of Pinned/Important Notices first */}
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
                  n.isPinned 
                    ? 'border-gold bg-gradient-to-r from-white to-gold/5 dark:from-temple-darker dark:to-gold/5' 
                    : isUrgent 
                    ? 'border-rose-600 bg-gradient-to-r from-white to-rose-50/10' 
                    : 'border-saffron'
                }`}
              >
                {/* Floating status flag */}
                {n.isPinned && (
                  <div className="absolute top-4 right-4 bg-gold/20 text-gold-dark font-extrabold text-[9px] px-2.5 py-0.5 rounded-full border border-gold/40">
                    PINNED IMPORTANT
                  </div>
                )}

                <div className="flex gap-4 items-start">
                  <div className={`p-3 rounded-full shrink-0 ${isUrgent ? 'bg-rose-100 text-rose-800' : 'bg-saffron/10 text-saffron'}`}>
                    <Info size={20} />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-temple-500 font-semibold">
                      <span className={`px-2 py-0.5 rounded-full ${isUrgent ? 'bg-rose-100 text-rose-800' : 'bg-temple-100 text-temple-800'}`}>
                        {n.category.toUpperCase()}
                      </span>
                      <span>Published: {n.publishDate}</span>
                      <span>•</span>
                      <span>Expiry: {n.expiryDate}</span>
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-temple-900">{getNoticeTitle(n)}</h3>
                    
                    <p className="text-xs md:text-sm text-temple-600 leading-relaxed font-semibold">
                      {getNoticeContent(n)}
                    </p>

                    <div className="pt-4 border-t border-saffron/5 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        {/* PDF link */}
                        <button 
                          onClick={() => downloadNoticePDF(n)}
                          className="px-3.5 py-1.5 border border-saffron/20 hover:border-saffron text-saffron bg-white dark:bg-temple-dark font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <FileText size={12} />
                          <span>Download PDF</span>
                        </button>
                      </div>

                      {/* Share */}
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

      </div>
    </div>
  );
}
