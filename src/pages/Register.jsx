import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Mail, Phone, Lock, EyeOff, Eye } from 'lucide-react';
import GoogleButton from '../components/GoogleButton';

export default function Register() {
  const { t } = useLanguage();
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogle = async (credential) => {
    setLoading(true);
    setErrorMsg('');
    const res = await loginWithGoogle(credential);
    setLoading(false);
    if (res.success) navigate('/profile');
    else setErrorMsg(res.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await register(name, email, phone, password);
      setLoading(false);
      if (res.success) {
        navigate('/profile');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("An unexpected registration error occurred. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-darker flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full glass-card p-8 space-y-6 box-glow border-t-4 border-maroon">
        
        {/* Branding header */}
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold font-outfit text-maroon dark:text-gold">
            Create Devotee Account
          </h2>
          <span className="text-xs text-temple-500 font-semibold uppercase mt-1 block">Sidheswar Shree Jagannath Temple</span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold">
            {errorMsg}
          </div>
        )}

        <GoogleButton onCredential={handleGoogle} onError={setErrorMsg} />
        <div className="flex items-center gap-3 text-[10px] font-bold text-temple-400 uppercase">
          <span className="flex-1 h-px bg-saffron/15" /> or register with email <span className="flex-1 h-px bg-saffron/15" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          
          {/* Name */}
          <div className="flex flex-col space-y-1">
            <label className="text-temple-700 uppercase">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-temple-400" size={14} />
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Debasis Devotee"
                className="w-full pl-9 pr-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-1">
            <label className="text-temple-700 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-temple-400" size={14} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="devotee@example.com"
                className="w-full pl-9 pr-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col space-y-1">
            <label className="text-temple-700 uppercase">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-temple-400" size={14} />
              <input 
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                className="w-full pl-9 pr-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col space-y-1">
            <label className="text-temple-700 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-temple-400" size={14} />
              <input 
                type={showPassword ? 'text' : 'password'}
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            className="w-full py-3 bg-saffron hover:bg-saffron-dark text-white font-bold rounded-xl text-xs shadow-md transition-colors"
          >
            {loading ? 'Creating account...' : 'Sign Up Account'}
          </button>
        </form>

        <div className="border-t border-saffron/10 pt-4 text-center text-xs font-semibold text-temple-600">
          Already registered?{' '}
          <Link to="/login" className="text-maroon hover:underline">
            Login Here
          </Link>
        </div>

      </div>
    </div>
  );
}
