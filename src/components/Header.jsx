import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Globe, User, ShieldAlert, LogOut, LogIn } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'hi', label: 'हिन्दी' },
];

const navItems = [
  { path: '/', labelKey: 'home' },
  { path: '/about', labelKey: 'about' },
  { path: '/darshan', labelKey: 'darshan' },
  { path: '/festivals', labelKey: 'festivals' },
  { path: '/seva', labelKey: 'seva' },
  { path: '/donation', labelKey: 'donation' },
  { path: '/prasad', labelKey: 'prasad' },
  { path: '/gallery', labelKey: 'gallery' },
  { path: '/notices', labelKey: 'notices' },
  { path: '/visit', labelKey: 'visit' },
  { path: '/contact', labelKey: 'contact' },
];

const Chakra = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="45" strokeWidth="3" fill="none" className="stroke-saffron" />
    <circle cx="50" cy="50" r="12" className="fill-gold" />
    <path d="M 50 5 L 50 95 M 5 50 L 95 50 M 18 18 L 82 82 M 18 82 L 82 18" strokeWidth="2.5" className="stroke-saffron" />
    <path d="M 50 20 L 50 35 M 50 65 L 50 80 M 20 50 L 35 50 M 65 50 L 80 50" strokeWidth="3.5" className="stroke-gold" />
  </svg>
);

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const close = () => setMenuOpen(false);
  const isStaff = user && user.role !== 'devotee';
  const accountPath = isStaff ? '/admin' : '/profile';

  // close menu on navigation, lock page scroll while open
  useEffect(() => { setMenuOpen(false); setLangOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [menuOpen]);

  const handleLogout = async () => {
    close();
    await logout();
    navigate('/');
  };

  // The drawer is rendered in a portal on <body>. (Inside the sticky/blurred header, "position: fixed"
  // gets trapped by backdrop-filter, which is why only one menu item used to show on phones.)
  const drawer = menuOpen && createPortal(
    <div className="fixed inset-0 z-[100] xl:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <aside className="absolute right-0 top-0 h-full w-[84%] max-w-sm bg-cream-light dark:bg-temple-darker shadow-2xl flex flex-col animate-[slideIn_.22s_ease-out]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-saffron/15 bg-maroon text-cream-light">
          <span className="font-outfit font-bold tracking-wide">Menu</span>
          <button onClick={close} aria-label="Close menu" className="p-2 -mr-2"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Account block first so login is always visible */}
          {isAuthenticated ? (
            <div className="p-3 rounded-2xl bg-saffron/10 border border-saffron/20 space-y-2">
              <div className="flex items-center gap-3">
                {user.picture
                  ? <img src={user.picture} alt="" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full" />
                  : <div className="w-10 h-10 rounded-full bg-saffron text-white flex items-center justify-center"><User size={20} /></div>}
                <div className="min-w-0">
                  <p className="font-bold text-temple-900 truncate">{user.name}</p>
                  <p className="text-xs text-temple-600 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={accountPath} onClick={close} className="flex-1 text-center py-2.5 rounded-xl bg-saffron text-white text-sm font-bold">
                  {isStaff ? 'Admin Panel' : t('userAccount')}
                </Link>
                <button onClick={handleLogout} className="px-4 py-2.5 rounded-xl bg-maroon/10 text-maroon text-sm font-bold flex items-center gap-1.5">
                  <LogOut size={16} /> {t('logout')}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login" onClick={close} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-maroon text-cream-light font-bold text-sm shadow">
                <LogIn size={16} /> Login
              </Link>
              <Link to="/register" onClick={close} className="flex items-center justify-center py-3 rounded-xl border-2 border-saffron text-saffron font-bold text-sm">
                Register
              </Link>
            </div>
          )}

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={close}
                className={({ isActive }) =>
                  `px-4 py-3 text-base font-semibold rounded-xl transition-colors ${
                    isActive ? 'text-saffron bg-saffron/10 border-l-4 border-saffron' : 'text-temple-800 hover:text-saffron hover:bg-saffron/5'
                  }`}
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          <div>
            <p className="text-[11px] font-bold uppercase text-temple-500 mb-2 flex items-center gap-1"><Globe size={12} /> Language</p>
            <div className="grid grid-cols-3 gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`py-2.5 rounded-xl text-sm font-bold border ${
                    language === l.code ? 'bg-saffron text-white border-saffron' : 'border-saffron/30 text-temple-800'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );

  return (
    <header className="sticky top-0 z-50 w-full glass-header shadow-md">
      <div className="bg-maroon text-cream-light py-1 px-3 text-center text-[11px] sm:text-xs border-b border-gold/20 flex items-center justify-center gap-2">
        <ShieldAlert size={13} className="text-gold shrink-0" />
        <span className="leading-tight">{t('fraudWarning')}</span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
          <Chakra className="w-9 h-9 sm:w-12 sm:h-12 shrink-0 group-hover:rotate-45 transition-transform duration-700" />
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm sm:text-lg md:text-xl font-bold font-outfit text-maroon leading-tight truncate">{t('templeName')}</h1>
            <span className="text-[10px] sm:text-xs text-saffron-dark font-medium truncate">{t('location')}</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden xl:flex items-center space-x-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-semibold rounded-lg font-outfit transition-colors ${
                  isActive ? 'text-saffron bg-saffron/10 border-b-2 border-saffron' : 'text-temple-800 hover:text-saffron hover:bg-saffron/5'
                }`}
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Desktop right controls */}
        <div className="hidden xl:flex items-center space-x-3">
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1.5 px-3 py-1.5 border border-saffron/30 bg-white rounded-full text-sm font-semibold text-temple-800">
              <Globe size={16} className="text-saffron" />
              <span>{languages.find((l) => l.code === language)?.label}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 glass-card overflow-hidden z-50">
                {languages.map((l) => (
                  <button key={l.code} onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-saffron/10 ${language === l.code ? 'text-saffron font-bold bg-saffron/5' : 'text-temple-800'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to={accountPath} className="flex items-center gap-1.5 px-4 py-1.5 bg-saffron text-white rounded-full text-sm font-semibold hover:bg-saffron-dark shadow-sm">
                <User size={16} /><span>{isStaff ? 'Admin Panel' : t('userAccount')}</span>
              </Link>
              <button onClick={handleLogout} className="p-2 text-maroon hover:bg-maroon/5 rounded-full" title={t('logout')}><LogOut size={18} /></button>
            </div>
          ) : (
            <Link to="/login" className="px-4 py-1.5 bg-maroon text-cream-light rounded-full text-sm font-semibold hover:bg-maroon-light shadow-sm">Login</Link>
          )}
        </div>

        {/* Mobile / tablet: menu button pinned to top-right */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="xl:hidden shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-saffron text-white shadow-md active:scale-95"
        >
          <Menu size={24} />
        </button>
      </div>
      {drawer}
    </header>
  );
}
