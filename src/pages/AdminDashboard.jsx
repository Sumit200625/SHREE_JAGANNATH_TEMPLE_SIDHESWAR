import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Image as ImageIcon, BarChart, Users, Bell, Gift, Heart, ShieldAlert, Award, FileText, CheckCircle2, XCircle, Database, HelpCircle, FileCheck, ClipboardList, Trash2, Edit } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active section in dashboard
  const [activeTab, setActiveTab] = useState('analytics');

  // Backend state elements
  const [analytics, setAnalytics] = useState(null);
  const [sevas, setSevas] = useState([]);
  const [donations, setDonations] = useState([]);
  const [notices, setNotices] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [gallery, setGallery] = useState([]);
  
  // Notice Form State
  const [noticeForm, setNoticeForm] = useState({ titleEn: '', contentEn: '', category: 'general', isPinned: false });
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  
  // FAQ Form State
  const [faqForm, setFaqForm] = useState({ questionEn: '', answerEn: '' });

  // Rejection state
  const [rejectingSevaId, setRejectingSevaId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Ticket Notes
  const [resolvingTicketId, setResolvingTicketId] = useState(null);
  const [ticketNotes, setTicketNotes] = useState('');

  const [loading, setLoading] = useState(true);

  // Initialize and check role redirects
  useEffect(() => {
    if (!user || user.role === 'devotee') {
      navigate('/login');
      return;
    }

    refreshDashboardData();
  }, [user, navigate]);

  const refreshDashboardData = () => {
    setLoading(true);
    const r = user.role;
    const can = (roles, fn, fallback = []) => (roles.includes(r) ? fn() : Promise.resolve(fallback));
    Promise.all([
      api.getAnalytics(),
      can(['super_admin', 'seva_manager'], api.getSevas),
      can(['super_admin', 'donation_manager'], api.getDonations),
      api.getNotices(),
      api.getFAQs(),
      can(['super_admin', 'content_editor'], api.getTickets),
      can(['super_admin'], api.getAuditLogs),
      can(['super_admin', 'content_editor'], () => api.getGallery({ all: true })),
    ]).then(([anal, sev, don, not, faq, tkt, aud, gal]) => {
      setGallery(gal);
      setAnalytics(anal);
      setSevas(sev);
      setDonations(don);
      setNotices(not);
      setFaqs(faq);
      setTickets(tkt);
      setAuditLogs(aud);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  // Seva actions
  const handleApproveSeva = (id) => {
    api.updateSevaStatus(id, 'approved', '').then(() => {
      refreshDashboardData();
    });
  };

  const handleRejectSevaSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason) return;
    api.updateSevaStatus(rejectingSevaId, 'rejected', rejectionReason).then(() => {
      setRejectingSevaId(null);
      setRejectionReason('');
      refreshDashboardData();
    });
  };

  // Notice Actions
  const handleNoticeSubmit = (e) => {
    e.preventDefault();
    if (editingNoticeId) {
      api.updateNotice(editingNoticeId, noticeForm).then(() => {
        setEditingNoticeId(null);
        setNoticeForm({ titleEn: '', contentEn: '', category: 'general', isPinned: false });
        refreshDashboardData();
      });
    } else {
      const payload = {
        ...noticeForm,
        titleOr: noticeForm.titleEn, // Mock sync translations
        titleHi: noticeForm.titleEn,
        contentOr: noticeForm.contentEn,
        contentHi: noticeForm.contentEn,
        expiryDate: new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10), // 90 days
        createdBy: user.name
      };
      api.createNotice(payload).then(() => {
        setNoticeForm({ titleEn: '', contentEn: '', category: 'general', isPinned: false });
        refreshDashboardData();
      });
    }
  };

  const handleEditNotice = (n) => {
    setEditingNoticeId(n.id);
    setNoticeForm({
      titleEn: n.titleEn,
      contentEn: n.contentEn,
      category: n.category,
      isPinned: n.isPinned
    });
  };

  const handleDeleteNotice = (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      api.deleteNotice(id).then(() => {
        refreshDashboardData();
      });
    }
  };

  // FAQ Actions
  const handleFAQSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...faqForm,
      questionOr: faqForm.questionEn,
      questionHi: faqForm.questionEn,
      answerOr: faqForm.answerEn,
      answerHi: faqForm.answerEn
    };
    api.addFAQ(payload).then(() => {
      setFaqForm({ questionEn: '', answerEn: '' });
      refreshDashboardData();
    });
  };

  const handleDeleteFAQ = (id) => {
    api.deleteFAQ(id).then(() => {
      refreshDashboardData();
    });
  };

  // Ticket Actions
  const handleResolveTicketSubmit = (e) => {
    e.preventDefault();
    api.updateTicketStatus(resolvingTicketId, 'resolved', ticketNotes).then(() => {
      setResolvingTicketId(null);
      setTicketNotes('');
      refreshDashboardData();
    });
  };

  // Database Backup download trigger
  const handleBackupClick = async () => {
    const backup = await api.backupDatabase();
    const link = document.createElement('a');
    link.href = backup.dataUri;
    link.setAttribute('download', backup.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Expose tab items depending on admin permissions
  const tabsList = [
    { code: 'analytics', label: 'Analytics Overview', icon: BarChart, roles: ['super_admin', 'donation_manager', 'seva_manager'] },
    { code: 'sevas', label: 'Manage Sevas', icon: Gift, roles: ['super_admin', 'seva_manager'] },
    { code: 'donations', label: 'Manage Donations', icon: Heart, roles: ['super_admin', 'donation_manager'] },
    { code: 'notices', label: 'Manage Notices', icon: Bell, roles: ['super_admin', 'content_editor', 'notice_manager'] },
    { code: 'tickets', label: 'Grievance Hotline', icon: ClipboardList, roles: ['super_admin', 'content_editor'] },
    { code: 'gallery', label: 'Photo Moderation', icon: ImageIcon, roles: ['super_admin', 'content_editor'] },
    { code: 'faqs', label: 'Edit FAQs', icon: HelpCircle, roles: ['super_admin', 'content_editor'] },
    { code: 'audit', label: 'System Logs', icon: FileCheck, roles: ['super_admin'] },
    { code: 'backup', label: 'Data Backups', icon: Database, roles: ['super_admin'] }
  ];

  const allowedTabs = tabsList.filter(t => t.roles.includes(user?.role));

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-bold text-temple-850">Syncing dashboard logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-temple-100 dark:bg-temple-darker flex flex-col lg:flex-row">
      
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 bg-temple-dark text-cream-light p-6 shrink-0 border-r border-gold/15 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
            <div className="w-8 h-8 text-gold">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" fill="none" />
                <path d="M 50 5 L 50 95 M 5 50 L 95 50" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Temple Console</h3>
              <p className="text-[10px] text-cream-light/60 font-semibold">{user.name.split(' ')[0]} ({user.role.replace('_', ' ')})</p>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-bold font-outfit">
            {allowedTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.code}
                  onClick={() => setActiveTab(tab.code)}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-2.5 transition-colors ${
                    activeTab === tab.code 
                      ? 'bg-saffron text-white shadow-md' 
                      : 'hover:bg-white/5 text-cream-light/80 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4 text-[10px] text-cream-light/40 text-center">
          Sidheswar Temple Admin v1.0.0
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        
        {/* Header bar */}
        <div className="flex justify-between items-center mb-8 border-b border-saffron/10 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold font-outfit text-maroon dark:text-gold capitalize">
              {activeTab.replace('_', ' ')} Workspace
            </h2>
            <p className="text-xs text-temple-500 mt-1 font-semibold">Active role permissions: {user.role.toUpperCase()}</p>
          </div>
          <button 
            onClick={refreshDashboardData} 
            className="px-3 py-1.5 bg-white border border-saffron/10 text-saffron font-bold text-xs rounded-lg hover:bg-saffron/5 shadow-sm"
          >
            Sync Logs
          </button>
        </div>

        {/* Dynamic workspace panels */}

        {/* 1. Analytics Overview */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1 */}
              <div className="glass-card p-6 border-t-4 border-maroon flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-temple-500 font-bold uppercase">Total Digital Hundi</span>
                  <p className="text-2xl font-extrabold font-outfit text-maroon mt-1">₹{analytics.totalDonations}</p>
                </div>
                <div className="p-3 bg-maroon/10 text-maroon rounded-full"><Heart size={20} /></div>
              </div>

              {/* Card 2 */}
              <div className="glass-card p-6 border-t-4 border-saffron flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-temple-500 font-bold uppercase">Pending Seva Bookings</span>
                  <p className="text-2xl font-extrabold font-outfit text-saffron mt-1">{analytics.pendingSevasCount}</p>
                </div>
                <div className="p-3 bg-saffron/10 text-saffron rounded-full"><Gift size={20} /></div>
              </div>

              {/* Card 3 */}
              <div className="glass-card p-6 border-t-4 border-gold flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-temple-500 font-bold uppercase">Open Grievance Tickets</span>
                  <p className="text-2xl font-extrabold font-outfit text-gold-dark mt-1">{analytics.openTicketsCount}</p>
                </div>
                <div className="p-3 bg-gold/15 text-gold-dark rounded-full"><ClipboardList size={20} /></div>
              </div>

              {/* Card 4 */}
              <div className="glass-card p-6 border-t-4 border-emerald-600 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-temple-500 font-bold uppercase">Approved Sevas Count</span>
                  <p className="text-2xl font-extrabold font-outfit text-emerald-800 mt-1">{analytics.approvedSevasCount}</p>
                </div>
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-full"><CheckCircle2 size={20} /></div>
              </div>

            </div>

            {/* Category Breakdown */}
            <div className="glass-card p-6 max-w-md border-t-4 border-saffron space-y-4">
              <h3 className="text-md font-bold text-temple-800">Donation Category Summary</h3>
              <div className="space-y-2 text-xs font-semibold">
                {Object.entries(analytics.categoryBreakdown).map(([cat, sum]) => (
                  <div key={cat} className="flex justify-between p-2 bg-temple-50 rounded-lg">
                    <span className="capitalize">{cat.replace(/_/g, ' ')}</span>
                    <strong className="text-maroon">₹{sum}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Manage Sevas */}
        {activeTab === 'sevas' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6 border-t-4 border-maroon">
              <h3 className="text-md font-bold text-temple-800 mb-4">Pending Seva Approval Requests</h3>
              <div className="overflow-x-auto text-xs font-semibold">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-temple-50 border-b border-saffron/10 text-[10px] text-temple-500 uppercase">
                      <th className="p-3">Reference</th>
                      <th className="p-3">Devotee</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Seva Category</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-saffron/5 text-temple-800">
                    {sevas.map((seva) => (
                      <tr key={seva.id} className="hover:bg-saffron/5">
                        <td className="p-3 font-bold text-saffron">{seva.bookingReference}</td>
                        <td className="p-3">{seva.devoteeName}</td>
                        <td className="p-3">{seva.selectedDate}</td>
                        <td className="p-3">{seva.sevaType}</td>
                        <td className="p-3 text-maroon font-bold font-outfit">₹{seva.amount}</td>
                        <td className="p-3 text-right space-x-2">
                          {seva.approvalStatus === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleApproveSeva(seva.id)}
                                className="px-3 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => setRejectingSevaId(seva.id)}
                                className="px-3 py-1 bg-rose-600 text-white rounded font-bold hover:bg-rose-700"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              seva.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {seva.approvalStatus.toUpperCase()}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rejection Modal overlay */}
            {rejectingSevaId && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <form onSubmit={handleRejectSevaSubmit} className="bg-white rounded-xl p-6 w-full max-w-sm border border-saffron/10 space-y-4 text-xs font-semibold">
                  <h4 className="font-bold text-sm text-rose-800">Enter Rejection Reason</h4>
                  <textarea 
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Suara cooking slot fully booked for this date"
                    className="w-full px-3 py-2 bg-temple-50 border border-saffron/20 rounded-lg focus:outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 text-[10px]">
                    <button type="button" onClick={() => setRejectingSevaId(null)} className="px-3 py-1.5 border border-saffron text-saffron rounded-lg">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 bg-rose-600 text-white rounded-lg">Reject Booking</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* 3. Manage Donations */}
        {activeTab === 'donations' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6 border-t-4 border-gold">
              <h3 className="text-md font-bold text-temple-800 mb-4">Digital Hundi Transaction Records</h3>
              <div className="overflow-x-auto text-xs font-semibold">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-temple-50 border-b border-saffron/10 text-[10px] text-temple-500 uppercase">
                      <th className="p-3">Receipt No</th>
                      <th className="p-3">Donor Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">txnId</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-saffron/5 text-temple-800">
                    {donations.map((don) => (
                      <tr key={don.id} className="hover:bg-saffron/5">
                        <td className="p-3 font-bold text-saffron">{don.receiptNumber}</td>
                        <td className="p-3">{don.donorName}</td>
                        <td className="p-3 capitalize">{don.category.replace(/_/g, ' ')}</td>
                        <td className="p-3 font-mono text-[10px] text-temple-500">{don.transactionId}</td>
                        <td className="p-3 text-maroon font-bold font-outfit">₹{don.amount}</td>
                        <td className="p-3 text-temple-500 font-semibold">{new Date(don.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. Manage Notices */}
        {activeTab === 'notices' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Create/Edit Form */}
            <div className="glass-card p-6 border-t-4 border-saffron h-fit space-y-4">
              <h3 className="text-md font-bold text-temple-800">{editingNoticeId ? 'Edit Announcement' : 'Publish New Notice'}</h3>
              
              <form onSubmit={handleNoticeSubmit} className="space-y-4 text-xs font-semibold">
                {/* Title */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-temple-700 uppercase">Announcement Title (English)</label>
                  <input 
                    type="text"
                    required
                    value={noticeForm.titleEn}
                    onChange={(e) => setNoticeForm(prev => ({ ...prev, titleEn: e.target.value }))}
                    placeholder="e.g. Rath Yatra Parking Updates"
                    className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-temple-700 uppercase">Notice details (English)</label>
                  <textarea
                    rows={4}
                    required
                    value={noticeForm.contentEn}
                    onChange={(e) => setNoticeForm(prev => ({ ...prev, contentEn: e.target.value }))}
                    placeholder="Write detailed announcements here..."
                    className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none resize-none"
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-temple-700 uppercase">Notice Category</label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm(prev => ({ ...prev, category: e.target.value }))}
                    className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
                  >
                    <option value="general">General</option>
                    <option value="urgent">Urgent</option>
                    <option value="festival">Festival</option>
                    <option value="closure">Closure</option>
                    <option value="committee">Committee</option>
                  </select>
                </div>

                {/* Pinned checkbox */}
                <div className="flex items-center gap-2 pl-1">
                  <input 
                    type="checkbox"
                    id="pinNoticeCheck"
                    checked={noticeForm.isPinned}
                    onChange={(e) => setNoticeForm(prev => ({ ...prev, isPinned: e.target.checked }))}
                    className="w-4 h-4 text-saffron accent-saffron cursor-pointer"
                  />
                  <label htmlFor="pinNoticeCheck" className="text-xs text-temple-800 cursor-pointer select-none">Pin this to top of notice board</label>
                </div>

                <div className="pt-2 flex justify-end gap-2 text-[10px]">
                  {editingNoticeId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingNoticeId(null);
                        setNoticeForm({ titleEn: '', contentEn: '', category: 'general', isPinned: false });
                      }}
                      className="px-3 py-1.5 border border-saffron text-saffron rounded-lg font-bold"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-saffron text-white rounded-lg font-bold hover:bg-saffron-dark"
                  >
                    {editingNoticeId ? 'Save Changes' : 'Publish Notice'}
                  </button>
                </div>
              </form>
            </div>

            {/* List of current notices */}
            <div className="lg:col-span-2 glass-card p-6 border-t-4 border-maroon space-y-4">
              <h3 className="text-md font-bold text-temple-800">Current Pinned/Active Announcements</h3>
              
              <div className="space-y-3">
                {notices.map((n) => (
                  <div key={n.id} className="p-4 bg-temple-50 rounded-xl border border-saffron/10 flex items-start justify-between gap-4 text-xs font-semibold">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 text-[9px] text-temple-500">
                        <span className={`px-1.5 py-0.5 rounded-full ${n.category === 'urgent' ? 'bg-rose-100 text-rose-800' : 'bg-temple-100 text-temple-800'}`}>{n.category}</span>
                        {n.isPinned && <span className="text-gold-dark font-extrabold">PINNED</span>}
                      </div>
                      <h4 className="font-bold text-temple-900">{n.titleEn}</h4>
                      <p className="text-[10px] text-temple-600 line-clamp-2">{n.contentEn}</p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => handleEditNotice(n)}
                        className="p-2 border border-saffron/20 hover:border-saffron text-saffron hover:bg-saffron/5 rounded"
                        title="Edit Notice"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteNotice(n.id)}
                        className="p-2 border border-rose-200 hover:border-rose-600 text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete Notice"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 5. Grievance Hotline */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6 border-t-4 border-maroon">
              <h3 className="text-md font-bold text-temple-800 mb-4">Lodge/Fraud/Grievance Tickets Logs</h3>
              
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-temple-500 font-semibold border border-dashed border-saffron/20 rounded-xl">
                  <ClipboardList size={32} className="mx-auto mb-2 text-saffron/40" />
                  <p>No devotee inquiry tickets or fraud complaints found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto text-xs font-semibold">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-temple-50 border-b border-saffron/10 text-[10px] text-temple-500 uppercase">
                        <th className="p-3">Ticket</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Devotee</th>
                        <th className="p-3">Subject</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-saffron/5 text-temple-800">
                      {tickets.map((tkt) => (
                        <tr key={tkt.id} className="hover:bg-saffron/5">
                          <td className="p-3 font-bold text-saffron">{tkt.ticketNumber}</td>
                          <td className="p-3 capitalize">{tkt.type.replace(/_/g, ' ')}</td>
                          <td className="p-3">{tkt.name} (+91 {tkt.phone})</td>
                          <td className="p-3 truncate max-w-[150px]">{tkt.subject}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tkt.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {tkt.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {tkt.status === 'open' ? (
                              <button 
                                onClick={() => setResolvingTicketId(tkt.id)}
                                className="px-3 py-1 bg-saffron text-white rounded font-bold hover:bg-saffron-dark"
                              >
                                Resolve
                              </button>
                            ) : (
                              <span className="text-[10px] text-temple-500 italic">Resolved</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Resolve Ticket Modal */}
            {resolvingTicketId && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <form onSubmit={handleResolveTicketSubmit} className="bg-white rounded-xl p-6 w-full max-w-sm border border-saffron/10 space-y-4 text-xs font-semibold">
                  <h4 className="font-bold text-sm text-maroon">Add Resolution Notes</h4>
                  <textarea 
                    required
                    value={ticketNotes}
                    onChange={(e) => setTicketNotes(e.target.value)}
                    placeholder="e.g. Contacted devotee and returned the lost items at shoe counter office..."
                    className="w-full px-3 py-2 bg-temple-50 border border-saffron/20 rounded-lg focus:outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 text-[10px]">
                    <button type="button" onClick={() => setResolvingTicketId(null)} className="px-3 py-1.5 border border-saffron text-saffron rounded-lg">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 bg-maroon text-cream-light rounded-lg">Complete Resolution</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* 6. Edit FAQs */}
        {activeTab === 'faqs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Create FAQ */}
            <div className="glass-card p-6 border-t-4 border-saffron h-fit space-y-4">
              <h3 className="text-md font-bold text-temple-800">Add New FAQ</h3>
              
              <form onSubmit={handleFAQSubmit} className="space-y-4 text-xs font-semibold">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-temple-700 uppercase">Question (English)</label>
                  <input 
                    type="text" 
                    required
                    value={faqForm.questionEn}
                    onChange={(e) => setFaqForm(prev => ({ ...prev, questionEn: e.target.value }))}
                    placeholder="e.g. Is drinking water available?"
                    className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-temple-700 uppercase">Answer (English)</label>
                  <textarea 
                    rows={3}
                    required
                    value={faqForm.answerEn}
                    onChange={(e) => setFaqForm(prev => ({ ...prev, answerEn: e.target.value }))}
                    placeholder="Describe answer details..."
                    className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none resize-none"
                  />
                </div>

                <button type="submit" className="w-full py-2.5 bg-saffron hover:bg-saffron-dark text-white font-bold rounded-xl shadow-md transition-colors">
                  Add FAQ Card
                </button>
              </form>
            </div>

            {/* List current FAQs */}
            <div className="lg:col-span-2 glass-card p-6 border-t-4 border-maroon space-y-4">
              <h3 className="text-md font-bold text-temple-800">Existing FAQs</h3>
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.id} className="p-4 bg-temple-50 rounded-xl border border-saffron/10 flex justify-between gap-4 text-xs font-semibold">
                    <div>
                      <h4 className="text-temple-900 font-bold">{faq.questionEn}</h4>
                      <p className="text-[10px] text-temple-600 mt-1 font-medium leading-relaxed">{faq.answerEn}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteFAQ(faq.id)} 
                      className="p-1.5 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. System logs (Audit Trail) */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-temple-600">
              {gallery.filter(g => !g.isApproved).length} photo(s) waiting for approval.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...gallery].sort((a, b) => Number(a.isApproved) - Number(b.isApproved)).map((g) => (
                <div key={g.id} className="glass-card overflow-hidden">
                  <img src={g.thumbnailUrl || g.imageUrl} alt={g.altText || g.title} loading="lazy" className="w-full h-40 object-cover" />
                  <div className="p-3 space-y-2 text-xs font-semibold">
                    <div>
                      <p className="font-bold text-temple-900">{g.title}</p>
                      <p className="text-temple-500">{g.category} · by {g.uploadedBy || 'Temple Trust'}</p>
                    </div>
                    <div className="flex gap-2">
                      {!g.isApproved && (
                        <button onClick={() => api.approveGalleryItem(g.id).then(refreshDashboardData)} className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg font-bold">Approve</button>
                      )}
                      <button onClick={() => window.confirm('Delete this photo?') && api.deleteGalleryItem(g.id).then(refreshDashboardData)} className="flex-1 py-1.5 bg-rose-600 text-white rounded-lg font-bold">Delete</button>
                    </div>
                    {g.isApproved && <span className="text-emerald-700">Published</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6 border-t-4 border-maroon space-y-4">
              <h3 className="text-md font-bold text-temple-800">Chronological Administrative Audit Trail</h3>
              <p className="text-xs text-temple-500 font-semibold leading-relaxed">
                Log registry tracking admin logins, seva approvals, and modifications to site notices.
              </p>
              
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 bg-temple-50 rounded-xl border border-saffron/5 flex items-start justify-between gap-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-saffron font-bold uppercase">{log.action}</span>
                        <span className="text-temple-500">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-temple-800 mt-1 font-medium">{log.description}</p>
                    </div>
                    <span className="text-[10px] font-bold text-temple-500 select-none">by: {log.adminName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 8. Database Backup */}
        {activeTab === 'backup' && (
          <div className="glass-card p-8 border-t-4 border-saffron max-w-lg space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-saffron font-bold">
              <Database size={24} />
              <h3 className="text-lg font-bold font-outfit uppercase tracking-wider">Database Maintenance</h3>
            </div>
            <p className="text-xs text-temple-600 leading-relaxed font-semibold">
              Backup all tables, audit registries, notices, and bookings. Downloads a structured JSON database export to your local storage path, which can be imported directly during backend integration.
            </p>

            <button 
              onClick={handleBackupClick}
              className="py-3 px-6 bg-saffron hover:bg-saffron-dark text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-2"
            >
              <Database size={16} />
              <span>Generate & Download JSON Backup</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
