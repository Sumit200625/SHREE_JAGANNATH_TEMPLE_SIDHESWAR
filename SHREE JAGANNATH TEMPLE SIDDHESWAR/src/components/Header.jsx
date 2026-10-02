import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Globe, User, ShieldAlert, LogOut } from 'lucide-react';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

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

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'or', label: 'ଓଡ଼ିଆ' },
    { code: 'hi', label: 'हिन्दी' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-header shadow-md transition-all duration-300">
      {/* Devotional Alert Banner / Fraud Warning */}
      <div className="bg-maroon text-cream-light py-1 px-4 text-center text-xs border-b border-gold/20 flex items-center justify-center gap-2">
        <ShieldAlert size={14} className="text-gold animate-pulse" />
        <span>{t('fraudWarning')}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo and Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 text-saffron group-hover:rotate-45 transition-transform duration-700">
            {/* Sudarshan Chakra Icon */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_4px_rgba(227,95,36,0.3)]">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="3" fill="none" className="stroke-saffron" />
              <circle cx="50" cy="50" r="12" fill="currentColor" className="fill-gold" />
              {/* Chakra Spokes */}
              <path d="M 50 5 L 50 95 M 5 50 L 95 50 M 18 18 L 82 82 M 18 82 L 82 18" stroke="currentColor" strokeWidth="2.5" className="stroke-saffron" />
              <path d="M 50 20 L 50 35 M 50 65 L 50 80 M 20 50 L 35 50 M 65 50 L 80 50" stroke="currentColor" strokeWidth="3.5" className="stroke-gold" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-bold font-outfit text-maroon dark:text-gold leading-tight tracking-wide">
              {t('templeName')}
            </h1>
            <span className="text-xs text-saffron-dark dark:text-saffron font-medium">
              {t('location')}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center space-x-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-semibold rounded-lg font-outfit transition-colors duration-200 ${
                  isActive
                    ? 'text-saffron bg-saffron/10 border-b-2 border-saffron'
                    : 'text-temple-800 dark:text-temple-200 hover:text-saffron hover:bg-saffron/5'
                }`
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="hidden lg:flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-saffron/30 hover:border-saffron bg-white dark:bg-temple-dark rounded-full text-sm font-semibold text-temple-800 dark:text-temple-100 transition-colors"
            >
              <Globe size={16} className="text-saffron" />
              <span>{languages.find(l => l.code === language)?.label || 'English'}</span>
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 glass-card overflow-hidden z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-saffron/10 transition-colors ${
                      language === lang.code ? 'text-saffron font-bold bg-saffron/5' : 'text-temple-800'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to={user.role === 'devotee' ? '/profile' : '/admin'}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-saffron text-white rounded-full text-sm font-semibold hover:bg-saffron-dark shadow-sm transition-all"
              >
                <User size={16} />
                <span>{user.role === 'devotee' ? t('userAccount') : 'Admin Panel'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-maroon hover:bg-maroon/5 rounded-full transition-colors"
                title={t('logout')}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 bg-maroon text-cream-light rounded-full text-sm font-semibold hover:bg-maroon-light shadow-sm transition-all"
            >
              {t('adminLogin')}
            </Link>
          )}
        </div>

        {/* Mobile controls (hamburger + menu) */}
        <div className="xl:hidden flex items-center gap-3">
          {/* Quick Language Toggle on Mobile (Cycles languages) */}
          <button
            onClick={() => {
              const codes = languages.map(l => l.code);
              const nextIdx = (codes.indexOf(language) + 1) % codes.length;
              setLanguage(codes[nextIdx]);
            }}
            className="flex items-center gap-1 p-2 border border-saffron/20 bg-white dark:bg-temple-dark rounded-full text-xs font-bold text-temple-800 dark:text-temple-100"
          >
            <Globe size={14} className="text-saffron" />
            <span>{language.toUpperCase()}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-temple-800 dark:text-temple-100 focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 top-[110px] bg-white dark:bg-temple-darker z-40 overflow-y-auto border-t border-saffron/10 px-4 py-6 shadow-2xl transition-all duration-300">
          <nav className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 text-base font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'text-saffron bg-saffron/10 border-l-4 border-saffron'
                      : 'text-temple-800 dark:text-temple-200 hover:text-saffron hover:bg-saffron/5'
                  }`
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}

            <div className="border-t border-saffron/10 my-4 pt-4 flex flex-col space-y-4">
              {/* Profile or Login */}
              {isAuthenticated ? (
                <>
                  <Link
                    to={user.role === 'devotee' ? '/profile' : '/admin'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-saffron bg-saffron/10 rounded-xl"
                  >
                    <User size={18} />
                    <span>{user.role === 'devotee' ? t('userAccount') : 'Admin Panel'} ({user.name})</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-maroon bg-maroon/5 rounded-xl text-left"
                  >
                    <LogOut size={18} />
                    <span>{t('logout')}</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-maroon text-cream-light font-bold rounded-xl hover:bg-maroon-light shadow-md"
                >
                  <User size={18} />
                  <span>{t('adminLogin')}</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
