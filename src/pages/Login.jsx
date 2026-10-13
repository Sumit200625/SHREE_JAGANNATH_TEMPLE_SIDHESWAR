import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Lock, EyeOff, Eye } from 'lucide-react';
import GoogleButton from '../components/GoogleButton';

export default function Login() {
  const { t } = useLanguage();
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const goAfterLogin = (u) => navigate(u.role === 'devotee' ? '/profile' : '/admin');

  const handleGoogle = async (credential) => {
    setLoading(true);
    setErrorMsg('');
    const res = await loginWithGoogle(credential);
    setLoading(false);
    if (res.success) goAfterLogin(res.user);
    else setErrorMsg(res.message);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      setLoading(false);
      if (res.success) goAfterLogin(res.user);
      else setErrorMsg(res.message);
    } catch (err) {
      setLoading(false);
      setErrorMsg('Could not log in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-darker flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full glass-card p-8 space-y-6 box-glow border-t-4 border-maroon">

        <div className="text-center">
          <div className="w-12 h-12 text-saffron mx-auto mb-3">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" fill="none" />
              <circle cx="50" cy="50" r="12" fill="currentColor" />
              <path d="M 50 5 L 50 95 M 5 50 L 95 50" stroke="currentColor" strokeWidth="3" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-outfit text-maroon dark:text-gold">
            {t('templeName')}
          </h2>
          <span className="text-xs text-temple-500 font-semibold uppercase mt-1 block">Devotee & Staff Portal</span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold">
            {errorMsg}
          </div>
        )}

        <GoogleButton onCredential={handleGoogle} onError={() => {}} />

        <div className="flex items-center gap-3 text-[10px] font-bold text-temple-400 uppercase">
          <span className="flex-1 h-px bg-saffron/15" /> or use email <span className="flex-1 h-px bg-saffron/15" />
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs font-semibold">
          <div className="flex flex-col space-y-1">
            <label className="text-temple-700 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-temple-400" size={14} />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none font-semibold"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-temple-700 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-temple-400" size={14} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full pl-9 pr-10 py-3 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-temple-400 focus:outline-none"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-maroon hover:bg-maroon-light text-cream-light font-bold rounded-xl text-xs shadow-md transition-colors disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs font-semibold text-temple-600">
          New devotee? <Link to="/register" className="text-saffron font-bold hover:underline">Create an account</Link>
        </p>

        <div className="border-t border-saffron/10 pt-4 text-center">
          <Link to="/" className="text-xs text-saffron font-bold hover:underline">
            &larr; Return to Home
          </Link>
        </div>

      </div>
    </div>
  );
}