import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { DONATION_CATEGORIES, MIN_DONATION, MAX_DONATION } from '../../shared/catalog';
import { Heart, Landmark, ShieldAlert, Award, FileText, CheckCircle2, QrCode } from 'lucide-react';

export default function Donation() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const preSets = [50, 100, 200, 500, 1000, 2000];

  // Donation state
  const [amount, setAmount] = useState(500);
  const [customVal, setCustomVal] = useState('');
  const [formData, setFormData] = useState({
    donorName: user ? user.name : '',
    email: user ? user.email : '',
    phone: user ? user.phone : '',
    panNumber: '',
    category: 'general_fund',
    isAnonymous: false
  });
  const [loading, setLoading] = useState(false);
  const [successDonation, setSuccessDonation] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch recent donations for transparency log
  useEffect(() => {
    api.getPublicDonations().then(setRecentDonations).catch(() => {});
  }, []);

  const handlePresetClick = (val) => {
    setAmount(val);
    setCustomVal('');
  };

  const handleCustomChange = (e) => {
    // digits only, no negatives / decimals / text
    const val = e.target.value.replace(/\D/g, '').slice(0, 7);
    setCustomVal(val);
    setAmount(val ? parseInt(val, 10) : 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!Number.isInteger(amount) || amount < MIN_DONATION || amount > MAX_DONATION) {
      setErrorMsg(amount > MAX_DONATION
        ? 'For a single online payment the maximum is ₹' + MAX_DONATION.toLocaleString('en-IN') + '. For larger gifts please contact the temple office.'
        : 'Please enter an amount of at least ₹' + MIN_DONATION + '.');
      return;
    }
    setLoading(true);
    try {
      // Opens Razorpay (UPI / cards / netbanking). Resolves only after the server verified the payment.
      const out = await api.payDonation({
        donorName: formData.donorName,
        email: formData.email,
        phone: formData.phone,
        panNumber: formData.panNumber,
        category: formData.category,
        isAnonymous: formData.isAnonymous,
      }, amount);
      setSuccessDonation(out.record);
      api.getPublicDonations().then(setRecentDonations).catch(() => {});
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = (don) => {
    const receiptText = `========================================================
SIDHESWAR SHREE JAGANNATH TEMPLE TRUST, DIGAPAHANDI
OFFICIAL DIGITAL HUNDI DONATION RECEIPT
========================================================
Receipt Number:   ${don.receiptNumber}
Transaction ID:   ${don.transactionId}
Date & Time:      ${new Date(don.date).toLocaleString()}
Donor Name:       ${don.donorName}
PAN Number:       ${don.panNumber || "N/A"}
Category/Purpose: ${don.category.toUpperCase().replace(/_/g, ' ')}
Donation Amount:  INR ${don.amount}/-
Payment Mode:     ${don.paymentGateway || 'Online'} (UPI / Card / Netbanking)
========================================================
* Thank you for your contribution. May Lord Jagannath bless you!
* Donations are eligible for tax exemption under section 80G.
========================================================`;

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${don.receiptNumber}_slip.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900 pb-20">
      
      {/* Page Header */}
      <div className="relative bg-temple-dark text-cream-light py-20 border-b border-gold/20 text-center">
        <div className="absolute inset-0 bg-[url('/assets/jagannath_tulasi_closeup.jpg')] bg-cover bg-center opacity-25"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-glow text-white">
            {t('donation')}
          </h2>
          <div className="mt-4 flex justify-center items-center gap-2">
            <span className="w-10 h-0.5 bg-gold"></span>
            <Heart size={20} className="text-gold" />
            <span className="w-10 h-0.5 bg-gold"></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Donation Portal */}
          <div className="lg:col-span-2 space-y-8">
            {!successDonation ? (
              <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6 box-glow border-t-4 border-saffron">
                
                <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <ShieldAlert className="text-rose-700 shrink-0 mt-0.5" size={20} />
                  <div className="text-xs text-rose-800 font-semibold leading-relaxed">
                    <p className="font-bold">Fraud Alert & Caution:</p>
                    <p className="mt-1">{t('donationDisclaimer')}</p>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold">{errorMsg}</div>
                )}

                {/* Amount Selectors */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-temple-700 uppercase">Select Contribution Amount (INR)</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {preSets.map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => handlePresetClick(val)}
                        className={`py-3 text-center rounded-xl font-bold font-outfit text-sm transition-all border ${
                          amount === val && !customVal
                            ? 'bg-saffron text-white border-saffron shadow-md scale-102'
                            : 'bg-temple-50 border-saffron/15 hover:bg-saffron/10 text-temple-800'
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Input */}
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-sm font-bold text-temple-400">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      aria-label="Custom donation amount in rupees"
                      value={customVal}
                      onChange={handleCustomChange}
                      placeholder={t('customAmount')}
                      className="w-full pl-8 pr-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-saffron focus:outline-none"
                    />
                  </div>
                  <p className={'text-[11px] font-semibold ' + (customVal && amount < MIN_DONATION ? 'text-rose-700' : 'text-temple-500')}>
                    {customVal && amount < MIN_DONATION
                      ? 'Minimum donation is ₹' + MIN_DONATION + '.'
                      : 'Choose an amount or enter your own (minimum ₹' + MIN_DONATION + ').'}
                  </p>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div className="flex flex-col space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-temple-700 uppercase">{t('donationCategory')}</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="px-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value="general_fund">General Temple Fund (ସାଧାରଣ ପାଣ୍ଠି)</option>
                      <option value="anna_daan">Anna Daan Seva (ଅନ୍ନଦାନ ପାଣ୍ଠି)</option>
                      <option value="festival_fund">Festival Celebration Fund (ଉତ୍ସବ ପାଣ୍ଠି)</option>
                      <option value="construction_fund">Temple Boundary Construction (ମେଘନାଦ ପାଚେରୀ)</option>
                      <option value="cleanliness_fund">Temple Cleanliness & Hygiene (ସ୍ୱଚ୍ଛତା ପାଣ୍ଠି)</option>
                      <option value="charity">Social Welfare & Charity (ସେବା ସମୂହ)</option>
                    </select>
                  </div>

                  {/* Donor Name */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-temple-700 uppercase">Donor Full Name</label>
                    <input
                      type="text"
                      required={!formData.isAnonymous}
                      disabled={formData.isAnonymous}
                      value={formData.isAnonymous ? '' : formData.donorName}
                      onChange={(e) => setFormData(prev => ({ ...prev, donorName: e.target.value }))}
                      placeholder={formData.isAnonymous ? 'Anonymous Contribution' : 'e.g. Anil Kumar Jena'}
                      className="px-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:ring-1 focus:ring-saffron focus:outline-none disabled:opacity-55"
                    />
                  </div>

                  {/* PAN Card */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-temple-700 uppercase">{t('panNumber')}</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.panNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }))}
                      placeholder="e.g. ABCDE1234F"
                      className="px-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-saffron focus:outline-none uppercase"
                    />
                  </div>

                  {/* Contact Info (optional/not shown if anonymous but needed for logs) */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-temple-700 uppercase">Mobile Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="10-digit mobile number"
                      className="px-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:ring-1 focus:ring-saffron focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-temple-700 uppercase">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="donor@example.com"
                      className="px-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:ring-1 focus:ring-saffron focus:outline-none"
                    />
                  </div>

                  {/* Anonymous Check */}
                  <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="anonymousCheck"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      className="w-4 h-4 text-saffron accent-saffron focus:ring-0 focus:outline-none cursor-pointer"
                    />
                    <label htmlFor="anonymousCheck" className="text-xs font-bold text-temple-700 cursor-pointer select-none">
                      {t('anonymousDonation')}
                    </label>
                  </div>
                </div>

                {/* Submits */}
                <div className="pt-4 flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-full">
                    <button
                      type="submit"
                      disabled={loading || amount < MIN_DONATION}
                      className="w-full py-4 bg-saffron hover:bg-saffron-dark text-white font-bold rounded-xl shadow-md transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <QrCode size={16} />
                      <span>{loading ? 'Processing...' : 'Pay Securely'}</span>
                    </button>
                  </div>

                  {amount > 0 && (
                    <div className="shrink-0 p-4 border border-saffron/10 bg-white rounded-2xl text-center shadow-sm max-w-[180px]">
                      <p className="text-2xl font-extrabold font-outfit text-maroon">₹{amount}</p>
                      <p className="text-[10px] font-bold text-temple-500 mt-1 leading-snug">Pay by UPI, card or net banking on the next screen</p>
                    </div>
                  )}
                </div>
              </form>
            ) : (
              /* Success Panel */
              <div className="glass-card p-8 border-t-4 border-emerald-600 space-y-6 box-glow text-center">
                <CheckCircle2 size={56} className="text-emerald-600 mx-auto" />
                
                <div>
                  <h3 className="text-2xl font-bold font-outfit text-emerald-800">Donation Complete!</h3>
                  <p className="text-xs text-temple-600 mt-2 font-semibold">
                    Thank you for your generous contribution. The digital receipt slip is ready for download.
                  </p>
                </div>

                <div className="p-5 bg-temple-50 rounded-xl border border-saffron/10 text-left max-w-md mx-auto space-y-2 text-xs md:text-sm">
                  <p className="flex justify-between">
                    <span className="font-bold text-temple-600">Receipt No:</span> 
                    <strong className="text-temple-800">{successDonation.receiptNumber}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-bold text-temple-600">Donor Name:</span> 
                    <span className="font-semibold text-temple-800">{successDonation.donorName}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-bold text-temple-600">Amount Paid:</span> 
                    <span className="font-extrabold text-maroon font-outfit">₹{successDonation.amount}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-bold text-temple-600">txnId:</span> 
                    <span className="font-semibold text-temple-800 text-[11px] select-all">{successDonation.transactionId}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-bold text-temple-600">Purpose:</span> 
                    <span className="font-semibold text-temple-800 capitalize">{successDonation.category.replace(/_/g, ' ')}</span>
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => downloadReceipt(successDonation)}
                    className="px-4 py-2.5 bg-maroon text-cream-light hover:bg-maroon-light font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <FileText size={14} />
                    <span>Download Receipt Slip</span>
                  </button>
                  <button
                    onClick={() => setSuccessDonation(null)}
                    className="px-4 py-2.5 border border-saffron text-saffron hover:bg-saffron/5 font-bold rounded-xl text-xs"
                  >
                    Contribute Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info: Banks & Transparency Log */}
          <div className="space-y-6">
            {/* Bank verification details */}
            {import.meta.env.VITE_BANK_ACCOUNT_NO && (
            <div className="glass-card p-6 border-t-4 border-gold space-y-4">
              <div className="flex items-center gap-2 text-gold-dark font-bold">
                <Landmark size={20} />
                <h3 className="text-md font-outfit uppercase tracking-wider">Official Bank Account</h3>
              </div>
              <p className="text-xs text-temple-600 leading-relaxed font-semibold">
                Use bank transfer (IMPS/NEFT/RTGS) directly for larger contributions to the managing trust.
              </p>
              
              <div className="p-3 bg-temple-50 border border-saffron/5 rounded-xl space-y-2 text-xs font-semibold">
                <p className="text-temple-800"><strong>Bank Name:</strong> {import.meta.env.VITE_BANK_NAME}</p>
                <p className="text-temple-800"><strong>Account Name:</strong> {import.meta.env.VITE_BANK_ACCOUNT_NAME}</p>
                <p className="text-temple-800"><strong>Account No:</strong> {import.meta.env.VITE_BANK_ACCOUNT_NO}</p>
                <p className="text-temple-800"><strong>IFSC Code:</strong> {import.meta.env.VITE_BANK_IFSC}</p>
                <p className="text-temple-800"><strong>Branch:</strong> {import.meta.env.VITE_BANK_BRANCH}</p>
              </div>
            </div>
            )}

            {/* Transparency Log Ledger preview */}
            <div className="glass-card p-6 border-t-4 border-maroon space-y-4">
              <h3 className="text-md font-bold font-outfit text-maroon uppercase tracking-wider">Transparency Log</h3>
              <p className="text-xs text-temple-500 font-semibold leading-relaxed">
                Recent contributions to the digital Hundi. (Updated live).
              </p>
              
              <div className="space-y-3">
                {recentDonations.slice(0, 4).map((don) => (
                  <div key={don.id} className="p-3 bg-temple-50 rounded-xl border border-saffron/5 flex items-center justify-between text-xs font-semibold">
                    <div>
                      <h4 className="text-temple-900 font-bold">{don.donorName}</h4>
                      <span className="text-[10px] text-temple-500">{don.category.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="text-maroon font-outfit font-bold">₹{don.amount}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-temple-500 font-semibold text-center italic mt-2">
                * Transparency reports are published on the 1st of every month.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
