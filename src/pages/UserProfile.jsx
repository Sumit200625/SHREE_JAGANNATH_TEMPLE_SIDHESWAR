import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { User, Gift, Heart, Settings, FileText, Bell, CheckCircle2, XCircle, LogOut } from 'lucide-react';

export default function UserProfile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Tabs: 'history' or 'donations' or 'settings'
  const [activeTab, setActiveTab] = useState('history');

  // Booking / Donation state logs
  const [sevas, setSevas] = useState([]);
  const [donations, setDonations] = useState([]);
  
  // Profile edit states
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user ? user.name : '');
  const [gotra, setGotra] = useState(user ? user.gotra || '' : '');
  const [address, setAddress] = useState(user ? user.address || '' : '');
  const [notifPref, setNotifPref] = useState({
    whatsapp: true,
    email: true
  });
  
  const [updateMsg, setUpdateMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    api.getMySevas().then(setSevas).catch(() => {});
    api.getMyDonations().then(setDonations).catch(() => {});
  }, [user, navigate]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setUpdateMsg('');

    updateProfile({ name, gotra, address }).then(res => {
      setLoading(false);
      if (res.success) {
        setUpdateMsg("Profile updated successfully!");
        setEditMode(false);
      } else {
        setUpdateMsg(res.message);
      }
      setTimeout(() => setUpdateMsg(''), 4000);
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Receipt Download (Donation)
  const downloadDonationReceipt = (don) => {
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
Payment Mode:     UPI (Digital Hundi Secure Portal)
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

  // Receipt Download (Seva)
  const downloadSevaReceipt = (seva) => {
    const receiptContent = `========================================================
SIDHESWAR SHREE JAGANNATH TEMPLE TRUST, DIGAPAHANDI
OFFICIAL SEVA BOOKING RECEIPT 
========================================================
Booking Reference: ${seva.bookingReference}
Devotee Name:      ${seva.devoteeName}
Mobile Number:     ${seva.phone}
Gotra:             ${seva.gotra || "N/A"}
Selected Date:     ${seva.selectedDate}
Seva Category:     ${seva.sevaType}
Contribution Amt:  INR ${seva.amount}/-
Payment Status:    ${seva.paymentStatus.toUpperCase()} (UPI Direct Hundi)
Approval Status:   ${seva.approvalStatus.toUpperCase()}
========================================================`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${seva.bookingReference}_slip.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900 pb-20">
      
      {/* Profile Header banner */}
      <div className="bg-gradient-to-r from-maroon to-maroon-light text-cream-light py-10 px-4 border-b border-gold/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center font-bold text-2xl text-gold border border-white/20 select-none">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-outfit text-white">{user.name}</h2>
              <span className="text-xs text-cream-light/70">{user.email} | +91 {user.phone}</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="px-4 py-2 border border-white/20 hover:bg-white/10 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Profile Sidebar */}
          <div className="glass-card p-6 border-t-4 border-saffron space-y-6 shadow-sm h-fit">
            <h3 className="text-sm font-bold text-temple-800 uppercase tracking-wider border-b border-saffron/10 pb-2">Profile Actions</h3>
            
            <div className="flex flex-col space-y-2 text-xs font-bold text-temple-800">
              <button 
                onClick={() => setActiveTab('history')}
                className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors ${
                  activeTab === 'history' ? 'bg-saffron/15 text-saffron' : 'hover:bg-saffron/5'
                }`}
              >
                <Gift size={16} />
                <span>Seva History ({sevas.length})</span>
              </button>
              <button 
                onClick={() => setActiveTab('donations')}
                className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors ${
                  activeTab === 'donations' ? 'bg-saffron/15 text-saffron' : 'hover:bg-saffron/5'
                }`}
              >
                <Heart size={16} />
                <span>Donation History ({donations.length})</span>
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors ${
                  activeTab === 'settings' ? 'bg-saffron/15 text-saffron' : 'hover:bg-saffron/5'
                }`}
              >
                <Settings size={16} />
                <span>Account Settings</span>
              </button>
            </div>
          </div>

          {/* Main Tab Area */}
          <div className="lg:col-span-3">
            {activeTab === 'history' && (
              <div className="glass-card p-8 border-t-4 border-maroon space-y-6 box-glow">
                <h3 className="text-lg font-bold font-outfit text-maroon">Seva Booking Records</h3>
                
                {sevas.length === 0 ? (
                  <div className="p-8 text-center text-temple-500 font-semibold border border-dashed border-saffron/20 rounded-xl">
                    <Gift size={32} className="mx-auto mb-2 text-saffron/40" />
                    <p>No Seva bookings found under this profile.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sevas.map((seva) => (
                      <div key={seva.id} className="p-4 bg-temple-50 dark:bg-temple-darker border border-saffron/10 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-semibold">
                        <div className="space-y-2">
                          <p className="text-[10px] text-saffron font-bold">Reference: {seva.bookingReference}</p>
                          <h4 className="text-sm font-bold text-temple-900">{seva.sevaType}</h4>
                          <p className="text-[10px] text-temple-500 font-semibold">Date: {seva.selectedDate} | Gotra: {seva.gotra || "N/A"}</p>
                        </div>

                        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2">
                          <span className={`px-2 py-0.5 font-bold rounded-full text-[9px] ${
                            seva.approvalStatus === 'approved' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : seva.approvalStatus === 'rejected' 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {seva.approvalStatus.toUpperCase()}
                          </span>
                          <strong className="text-maroon font-outfit text-sm">₹{seva.amount}</strong>
                          <button 
                            onClick={() => downloadSevaReceipt(seva)}
                            className="text-saffron hover:underline flex items-center gap-1 text-[10px] font-bold"
                          >
                            <FileText size={12} />
                            <span>Slip</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'donations' && (
              <div className="glass-card p-8 border-t-4 border-maroon space-y-6 box-glow">
                <h3 className="text-lg font-bold font-outfit text-maroon">Digital Hundi Contributions</h3>
                
                {donations.length === 0 ? (
                  <div className="p-8 text-center text-temple-500 font-semibold border border-dashed border-saffron/20 rounded-xl">
                    <Heart size={32} className="mx-auto mb-2 text-saffron/40" />
                    <p>No donations found under this profile.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {donations.map((don) => (
                      <div key={don.id} className="p-4 bg-temple-50 dark:bg-temple-darker border border-saffron/10 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-semibold">
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-saffron font-bold">Receipt: {don.receiptNumber}</p>
                          <h4 className="text-sm font-bold text-temple-900 capitalize">{don.category.replace(/_/g, ' ')}</h4>
                          <p className="text-[10px] text-temple-500 font-semibold">Date: {new Date(don.date).toLocaleDateString()}</p>
                        </div>

                        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2">
                          <strong className="text-maroon font-outfit text-sm">₹{don.amount}</strong>
                          <button 
                            onClick={() => downloadDonationReceipt(don)}
                            className="text-saffron hover:underline flex items-center gap-1 text-[10px] font-bold"
                          >
                            <FileText size={12} />
                            <span>Receipt PDF</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="glass-card p-8 border-t-4 border-maroon space-y-6 box-glow">
                <h3 className="text-lg font-bold font-outfit text-maroon">Account & Profile Settings</h3>
                
                {updateMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold">
                    {updateMsg}
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-5 text-xs font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-temple-700 uppercase">Devotee Name</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
                      />
                    </div>

                    {/* Gotra */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-temple-700 uppercase">Gotra</label>
                      <input 
                        type="text" 
                        value={gotra}
                        onChange={(e) => setGotra(e.target.value)}
                        placeholder="e.g. Kashyap"
                        className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
                      />
                    </div>

                    {/* Address */}
                    <div className="flex flex-col space-y-1.5 col-span-1 sm:col-span-2">
                      <label className="text-temple-700 uppercase">Resident Address</label>
                      <input 
                        type="text" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="City, State"
                        className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Notification preferences */}
                  <div className="border-t border-saffron/10 pt-4 space-y-3">
                    <h4 className="font-bold text-sm text-temple-800 flex items-center gap-1">
                      <Bell size={14} className="text-saffron" />
                      <span>Notification Preferences</span>
                    </h4>
                    
                    <div className="flex items-center gap-6 text-xs text-temple-700">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          id="prefWA"
                          checked={notifPref.whatsapp}
                          onChange={(e) => setNotifPref(prev => ({ ...prev, whatsapp: e.target.checked }))}
                          className="w-4 h-4 text-saffron accent-saffron cursor-pointer"
                        />
                        <label htmlFor="prefWA" className="cursor-pointer select-none">Send updates on WhatsApp</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          id="prefEmail"
                          checked={notifPref.email}
                          onChange={(e) => setNotifPref(prev => ({ ...prev, email: e.target.checked }))}
                          className="w-4 h-4 text-saffron accent-saffron cursor-pointer"
                        />
                        <label htmlFor="prefEmail" className="cursor-pointer select-none">Send receipt emails</label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-saffron hover:bg-saffron-dark text-white font-bold rounded-xl shadow-sm transition-colors text-xs"
                    >
                      {loading ? 'Saving...' : 'Save Profile Details'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
