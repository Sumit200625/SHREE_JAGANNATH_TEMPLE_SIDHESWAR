import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Gift } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Always-visible Donate / Book Seva buttons at the bottom of phone screens
const TXT = { en: ['Donate Now', 'Book Seva'], hi: ['दान करें', 'सेवा बुक करें'], or: ['ଦାନ କରନ୍ତୁ', 'ସେବା ବୁକ୍ କରନ୍ତୁ'] };
export default function MobileCtaBar() {
  const { language } = useLanguage();
  const { pathname } = useLocation();
  if (['/donation', '/seva', '/admin', '/login', '/register'].includes(pathname)) return null;
  const [d, s] = TXT[language] || TXT.en;
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-saffron/20 px-3 py-2 flex gap-2" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}>
      <Link to="/donation" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gold text-temple-dark font-extrabold text-sm shadow"><Heart size={16} /> {d}</Link>
      <Link to="/seva" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-saffron text-white font-extrabold text-sm shadow"><Gift size={16} /> {s}</Link>
    </div>
  );
}
