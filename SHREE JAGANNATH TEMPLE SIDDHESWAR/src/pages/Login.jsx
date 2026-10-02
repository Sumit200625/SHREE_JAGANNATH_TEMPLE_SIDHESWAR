import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Mail, Phone, Lock, EyeOff, Eye, Send, Key } from 'lucide-react';

export default function Login() {
  const { t } = useLanguage();
  const { login, loginOTP } = useAuth();
  const navigate = useNavigate();

  // Mode state: 'email' or 'otp'
  const [loginMode, setLoginMode] = useState('otp');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  // OTP Flow
  const [otpSent, setOtpSent] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        if (res.user.role === 'devotee') {
          navigate('/profile');
        } else {
          navigate('/admin');
        }
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("An unexpected login error occurred. Try again.");
    }
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setErrorMsg("Enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 600);
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginOTP(phone, otp);
      setLoading(false);
      if (res.success) {
        if (res.user.role === 'devotee') {
          navigate('/profile');
        } else {
          navigate('/admin');
        }
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("An unexpected verification error occurred. Try again.");
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

        {/* Tab triggers */}
        <div className="flex bg-temple-50 border border-saffron/10 rounded-lg overflow-hidden text-xs font-bold text-temple-800">
          <button 
            onClick={() => { setLoginMode('otp'); setErrorMsg(''); setOtpSent(false); }}
            className={`w-1/2 py-2.5 text-center transition-colors ${
              loginMode === 'otp' ? 'bg-saffron text-white' : 'hover:bg-saffron/5'
            }`}
          >
            OTP Login (Devotees)
          </button>
          <button 
            onClick={() => { setLoginMode('email'); setErrorMsg(''); }}
            className={`w-1/2 py-2.5 text-center transition-colors ${
              loginMode === 'email' ? 'bg-saffron text-white' : 'hover:bg-saffron/5'
            }`}
          >
            Staff Login (Admin)
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold">
            {errorMsg}
          </div>
        )}

        {/* OTP Flow Forms */}
        {loginMode === 'otp' ? (
          <div>
            {!otpSent ? (
              /* Step 1: Send OTP */
              <form onSubmit={handleSendOTP} className="space-y-4 text-xs font-semibold">
                <div className="flex flex-col space-y-1">
                  <label className="text-temple-700 uppercase">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-temple-400" size={14} />
                    <input 
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full pl-9 pr-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-maroon text-cream-light hover:bg-maroon-light font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>

                <div className="text-center text-[10px] text-temple-500 font-semibold mt-4">
                  New devotee? Entering your mobile number will automatically register a new profile.
                </div>
              </form>
            ) : (
              /* Step 2: Verify OTP */
              <form onSubmit={handleOTPSubmit} className="space-y-4 text-xs font-semibold">
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-temple-500 uppercase font-semibold">Verification Code</span>
                    <button onClick={() => setOtpSent(false)} className="text-saffron font-bold underline">Edit Number</button>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 text-temple-400" size={14} />
                    <input 
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP code"
                      className="w-full pl-9 pr-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none tracking-widest text-center text-sm font-extrabold"
                    />
                  </div>
                  <span className="text-[10px] text-gold-dark font-bold text-center block pt-1">
                    * For testing preview, use OTP: <strong>123456</strong>
                  </span>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-saffron hover:bg-saffron-dark text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify & Log In'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Email / Password Forms */
          <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs font-semibold">
            
            {/* Email */}
            <div className="flex flex-col space-y-1">
              <label className="text-temple-700 uppercase">Staff Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-temple-400" size={14} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@siddheswar.org"
                  className="w-full pl-9 pr-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none font-semibold"
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
              className="w-full py-3 bg-maroon hover:bg-maroon-light text-cream-light font-bold rounded-xl text-xs shadow-md transition-colors"
            >
              {loading ? 'Logging in...' : 'Sign In as Staff'}
            </button>

            <div className="p-3 bg-gold/10 border border-gold/20 rounded-xl text-[10px] text-temple-800 leading-relaxed font-semibold">
              <strong>Admin Credentials (for testing preview):</strong><br />
              Email: <strong>admin@siddheswar.org</strong><br />
              Password: <strong>password123</strong>
            </div>

          </form>
        )}

        <div className="border-t border-saffron/10 pt-4 text-center">
          <Link to="/" className="text-xs text-saffron font-bold hover:underline">
            &larr; Return to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
