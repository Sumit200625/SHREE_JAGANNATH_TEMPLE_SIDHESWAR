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
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        goAfterLogin(res.user);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("An unexpected login error occurred. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-darker flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full glass-card p-8 space-y-6 box-glow border-t-4 border-maroon">
        
        {/* Branding header */}
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

        <GoogleButton onCredential={handleGoogle} onError={setErrorMsg} />
        <p className="text-[10px] text-temple-500 font-semibold text-center">
          Devotees and temple staff both sign in with Google. Staff access is assigned by the temple administrator.
        </p>

        <div className="flex items-center gap-3 text-[10px] font-bold text-temple-400 uppercase">
          <span className="flex-1 h-px bg-saffron/15" /> or use email <span className="flex-1 h-px bg-saffron/15" />
        </div>



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
