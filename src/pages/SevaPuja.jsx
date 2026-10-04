import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { SEVAS } from '../../shared/catalog';
import { Link } from 'react-router-dom';
import { Gift, Calendar, User, Search, ShieldAlert, Award, FileText, CheckCircle2, XCircle } from 'lucide-react';

export default function SevaPuja() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Tabs: 'book' or 'track'
  const [activeTab, setActiveTab] = useState('book');

  // Booking Form State
  const [formData, setFormData] = useState({
    devoteeName: user ? user.name : '',
    email: user ? user.email : '',
    phone: user ? user.phone : '',
    gotra: user ? user.gotra || '' : '',
    address: user ? user.address || '' : '',
    familyMembers: '',
    selectedDate: '',
    sevaType: 'Annadan Seva (Mahaprasad)',
    specialRequest: ''
  });
  const [loading, setLoading] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Tracking State
  const [searchRef, setSearchRef] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);

  const sevasList = SEVAS;

  const today = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!user) { setErrorMsg('Please log in to book a seva.'); return; }
    setLoading(true);
    try {
      // Price is decided by the server from the seva name; payment is verified server-side before the booking is saved.
      const out = await api.paySeva({
        ...formData,
        familyMembers: formData.familyMembers.split(',').map(m => m.trim()).filter(Boolean),
      });
      setSuccessBooking(out.record);
      setFormData(prev => ({ ...prev, familyMembers: '', selectedDate: '', specialRequest: '' }));
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!searchRef) return;
    setTrackingLoading(true);
    setTrackError('');
    setTrackResult(null);
    try {
      const match = await api.trackSeva(searchRef.trim());
      if (match) setTrackResult(match);
      else setTrackError("Booking reference code not found. Verify number (Format: SEVA-XXXXXXXX).");
    } catch (err) {
      setTrackError(err.message);
    } finally {
      setTrackingLoading(false);
    }
  };

  // Receipt Download
  const generateReceiptPDF = (booking) => {
    const receiptContent = `========================================================
SIDHESWAR SHREE JAGANNATH TEMPLE TRUST, DIGAPAHANDI
OFFICIAL SEVA BOOKING RECEIPT
========================================================
Booking Reference: ${booking.bookingReference}
Devotee Name:      ${booking.devoteeName}
Mobile Number:     ${booking.phone}
Gotra:             ${booking.gotra || "N/A"}
Selected Date:     ${booking.selectedDate}
Seva Category:     ${booking.sevaType}
Contribution Amt:  INR ${booking.amount}/-
Payment Status:    ${booking.paymentStatus.toUpperCase()} (Razorpay)
Approval Status:   ${booking.approvalStatus.toUpperCase()}
========================================================
* Seva booking is confirmed only after temple committee approval.
* Present a copy of this slip at the temple office on arrival.
========================================================`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${booking.bookingReference}_receipt.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900 pb-20">
      
      {/* Page Header */}
      <div className="relative bg-temple-dark text-cream-light py-20 border-b border-gold/20 text-center">
        <div className="absolute inset-0 bg-[url('/assets/jagannath_sanctum_seva.jpg')] bg-cover bg-center opacity-25"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-glow text-white">
            {t('seva')}
          </h2>
          <div className="mt-4 flex justify-center items-center gap-2">
            <span className="w-10 h-0.5 bg-gold"></span>
            <Gift size={20} className="text-gold" />
            <span className="w-10 h-0.5 bg-gold"></span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-12 space-y-8">
        
        {/* Tab Toggle buttons */}
        <div className="flex bg-white border border-saffron/10 rounded-xl overflow-hidden shadow-sm">
          <button 
            onClick={() => { setActiveTab('book'); setSuccessBooking(null); }}
            className={`w-1/2 py-3.5 text-center text-sm font-bold font-outfit transition-all flex items-center justify-center gap-2 ${
              activeTab === 'book' ? 'bg-saffron text-white shadow-inner' : 'hover:bg-saffron/5 text-temple-800'
            }`}
          >
            <Gift size={16} />
            <span>Request New Seva</span>
          </button>
          <button 
            onClick={() => { setActiveTab('track'); setSuccessBooking(null); }}
            className={`w-1/2 py-3.5 text-center text-sm font-bold font-outfit transition-all flex items-center justify-center gap-2 ${
              activeTab === 'track' ? 'bg-saffron text-white shadow-inner' : 'hover:bg-saffron/5 text-temple-800'
            }`}
          >
            <Search size={16} />
            <span>Track Booking Status</span>
          </button>
        </div>

        {/* Dynamic content */}
        {activeTab === 'book' ? (
          <div>
            {/* Booking Form Layout */}
            {!successBooking ? (
              <form onSubmit={handleBookSubmit} className="glass-card p-8 space-y-6 box-glow border-t-4 border-saffron">
                {!user && (
                  <div className="p-3 bg-gold/10 border border-gold/30 rounded-xl text-xs font-semibold text-temple-800">
                    Please <Link to="/login" className="text-saffron font-bold underline">log in</Link> to book and pay for a seva.
                  </div>
                )}
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold">{errorMsg}</div>
                )}
                
                <div className="flex items-start gap-3 p-4 bg-gold/15 border border-gold/30 rounded-xl">
                  <ShieldAlert className="text-saffron shrink-0 mt-0.5" size={20} />
                  <p className="text-xs text-temple-800 font-semibold leading-relaxed">
                    {t('sevaBookingDisclaimer')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div className="flex flex-col space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-temple-700 uppercase">{t('selectSevaType')}</label>
                    <select
                      value={formData.sevaType}
                      onChange={(e) => setFormData(prev => ({ ...prev, sevaType: e.target.value }))}
                      className="w-full px-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      {sevasList.map((s, idx) => (
                        <option key={idx} value={s.name}>{s.name} - ₹{s.price}</option>
                      ))}
                    </select>
                    <span className="text-[10px] text-temple-500 font-semibold italic mt-1 pl-1">
                      {sevasList.find(s => s.name === formData.sevaType)?.desc}
                    </span>
                  </div>

                  {/* Devotee Name */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-temple-700 uppercase">{t('devoteeName')}</label>
                    <input 
                      type="text"
                      required
                      value={formData.devoteeName}
                      onChange={(e) => setFormData(prev => ({ ...prev, devoteeName: e.target.value }))}
                      placeholder="e.g. Rama Chandra Mishra"
                      className="px-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:ring-1 focus:ring-saffron focus:outline-none"
                    />
                  </div>

                  {/* Date */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-temple-700 uppercase">{t('selectDate')}</label>
                    <input 
                      type="date"
                      min={today}
                      required
                      value={formData.selectedDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, selectedDate: e.target.value }))}
                      className="px-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:ring-1 focus:ring-saffron focus:outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-temple-700 uppercase">{t('mobileNumber')}</label>
                    <input 
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="10-digit mobile number"
                      className="px-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:ring-1 focus:ring-saffron focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-temple-700 uppercase">{t('emailAddress')}</label>
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="devotee@example.com"
                      className="px-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:ring-1 focus:ring-saffron focus:outline-none"
                    />
                  </div>

                  {/* Gotra */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-temple-700 uppercase">{t('gotra')}</label>
                    <input 
                      type="text"
                      value={formData.gotra}
                      onChange={(e) => setFormData(prev => ({ ...prev, gotra: e.target.value }))}
                      placeholder="e.g. Kashyap"
                      className="px-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:ring-1 focus:ring-saffron focus:outline-none"
                    />
                  </div>

                  {/* Address */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-temple-700 uppercase">{t('address')}</label>
                    <input 
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="City, State"
                      className="px-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:ring-1 focus:ring-saffron focus:outline-none"
                    />
                  </div>

                  {/* Family members */}
                  <div className="flex flex-col space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-temple-700 uppercase">{t('familyMembers')}</label>
                    <input 
                      type="text"
                      value={formData.familyMembers}
                      onChange={(e) => setFormData(prev => ({ ...prev, familyMembers: e.target.value }))}
                      placeholder="e.g. Sabita Mishra, Sourav Mishra"
                      className="px-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:ring-1 focus:ring-saffron focus:outline-none"
                    />
                  </div>

                  {/* Special request */}
                  <div className="flex flex-col space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-temple-700 uppercase">{t('specialRequest')}</label>
                    <textarea 
                      rows={2}
                      value={formData.specialRequest}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialRequest: e.target.value }))}
                      placeholder="e.g. Health wishes, children's birth annotations"
                      className="px-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:ring-1 focus:ring-saffron focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-saffron hover:bg-saffron-dark text-white font-bold rounded-xl shadow-md transition-colors text-sm"
                  >
                    {loading ? 'Opening payment...' : t('bookSevaBtn')} 
                  </button>
                </div>
              </form>
            ) : (
              /* Success Panel */
              <div className="glass-card p-8 border-t-4 border-emerald-600 space-y-6 box-glow text-center">
                <CheckCircle2 size={56} className="text-emerald-600 mx-auto animate-pulse" />
                
                <div>
                  <h3 className="text-2xl font-bold font-outfit text-emerald-800">Seva Booking Initiated!</h3>
                  <p className="text-xs text-temple-600 mt-2 font-semibold">
                    Your request was successfully saved. Keep the Reference Number to track status.
                  </p>
                </div>

                <div className="p-5 bg-temple-50 rounded-xl border border-saffron/10 text-left max-w-md mx-auto space-y-2 text-xs md:text-sm">
                  <p className="flex justify-between">
                    <span className="font-bold text-temple-600">Reference:</span> 
                    <strong className="text-saffron select-all">{successBooking.bookingReference}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-bold text-temple-600">Devotee:</span> 
                    <span className="font-semibold text-temple-800">{successBooking.devoteeName}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-bold text-temple-600">Seva:</span> 
                    <span className="font-semibold text-temple-800">{successBooking.sevaType}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-bold text-temple-600">Date:</span> 
                    <span className="font-semibold text-temple-800">{successBooking.selectedDate}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-bold text-temple-600">Contribution:</span> 
                    <span className="font-semibold text-maroon font-outfit">₹{successBooking.amount}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-bold text-temple-600">Payment Status:</span> 
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">PAID</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-bold text-temple-600">Approval Status:</span> 
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full text-[10px]">PENDING COMMITTEE APPROVAL</span>
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => generateReceiptPDF(successBooking)}
                    className="px-4 py-2.5 bg-maroon text-cream-light hover:bg-maroon-light font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <FileText size={14} />
                    <span>Download Receipt Slip</span>
                  </button>
                  <button
                    onClick={() => setSuccessBooking(null)}
                    className="px-4 py-2.5 border border-saffron text-saffron hover:bg-saffron/5 font-bold rounded-xl text-xs"
                  >
                    Book Another Seva
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Track Booking Status Layout */
          <div className="glass-card p-8 space-y-6 box-glow border-t-4 border-gold">
            <h3 className="text-xl font-bold font-outfit text-maroon">Check Seva Status</h3>
            <p className="text-xs text-temple-600 font-semibold leading-relaxed">
              Enter the unique 16-digit booking reference code provided upon submission to download the receipt and check real-time managing trust approvals.
            </p>

            <form onSubmit={handleTrackSubmit} className="flex gap-3">
              <input 
                type="text"
                required
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                placeholder="Format: SEVA-761012-XXXX"
                className="flex-1 px-4 py-3 bg-temple-50 border border-saffron/20 rounded-xl text-xs font-semibold uppercase focus:ring-1 focus:ring-saffron focus:outline-none"
              />
              <button 
                type="submit"
                disabled={trackingLoading}
                className="px-6 py-3 bg-saffron hover:bg-saffron-dark text-white font-bold rounded-xl text-xs transition-colors shrink-0"
              >
                {trackingLoading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {trackError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold">
                {trackError}
              </div>
            )}

            {trackResult && (
              <div className="border border-saffron/10 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-saffron/10 pb-3">
                  <h4 className="font-bold text-sm text-temple-800">Booking Record Details</h4>
                  <div className="flex gap-2">
                    {trackResult.approvalStatus === 'approved' ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px] flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        <span>APPROVED</span>
                      </span>
                    ) : trackResult.approvalStatus === 'rejected' ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-full text-[10px] flex items-center gap-1">
                        <XCircle size={10} />
                        <span>REJECTED</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full text-[10px]">
                        PENDING APPROVAL
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-temple-500 block">Devotee Name:</span>
                    <strong className="text-temple-900">{trackResult.devoteeName}</strong>
                  </div>
                  <div>
                    <span className="text-temple-500 block">Auspicious Date:</span>
                    <strong className="text-temple-900">{trackResult.selectedDate}</strong>
                  </div>
                  <div>
                    <span className="text-temple-500 block">Seva Category:</span>
                    <strong className="text-temple-900">{trackResult.sevaType}</strong>
                  </div>
                  <div>
                    <span className="text-temple-500 block">Contribution Amount:</span>
                    <strong className="text-maroon font-outfit">₹{trackResult.amount}</strong>
                  </div>
                  {trackResult.gotra && (
                    <div>
                      <span className="text-temple-500 block">Gotra:</span>
                      <strong className="text-temple-900">{trackResult.gotra}</strong>
                    </div>
                  )}
                  {trackResult.rejectionReason && (
                    <div className="col-span-2 p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg">
                      <span className="font-bold text-[10px] uppercase block">Reason for Rejection:</span>
                      <p className="mt-1 text-[11px] font-semibold">{trackResult.rejectionReason}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-saffron/10 flex justify-end">
                  <button 
                    onClick={() => generateReceiptPDF(trackResult)}
                    className="px-4 py-2 bg-maroon hover:bg-maroon-light text-cream-light font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <FileText size={14} />
                    <span>Download Official Receipt Slip</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
