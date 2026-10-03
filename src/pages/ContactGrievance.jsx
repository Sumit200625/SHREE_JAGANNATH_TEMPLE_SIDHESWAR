import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/client';
import { Mail, Phone, Clock, Send, MessageSquare, ShieldAlert, Award, FileText, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function ContactGrievance() {
  const { t } = useLanguage();

  // FAQ Accordion
  const [faqs, setFaqs] = useState([]);
  const [openFaqId, setOpenFaqId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'general_inquiry',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [successTicket, setSuccessTicket] = useState(null);

  useEffect(() => {
    api.getFAQs().then(res => setFaqs(res));
  }, []);

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    api.submitTicket(formData).then(res => {
      setLoading(false);
      setSuccessTicket(res);
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        type: 'general_inquiry',
        subject: '',
        message: ''
      });
    });
  };

  const getFaqQuestion = (faq) => {
    return faq.questionEn;
  };

  const getFaqAnswer = (faq) => {
    return faq.answerEn;
  };

  const formTypes = [
    { code: 'general_inquiry', label: 'General Inquiry (ସାଧାରଣ ପଚରାଉଚରା)' },
    { code: 'feedback', label: 'Devotee Feedback (ମତାମତ)' },
    { code: 'grievance', label: 'Grievance / Complaint (ଅଭିଯୋଗ)' },
    { code: 'lost_found', label: 'Lost & Found Report (ହଜିଥିବା ବସ୍ତୁ ରିପୋର୍ଟ)' },
    { code: 'fraud_report', label: 'Report Fraud / Scams (ଜାଲିଆତି ରିପୋର୍ଟ)' }
  ];

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900 pb-20">
      
      {/* Page Header */}
      <div className="relative bg-temple-dark text-cream-light py-20 border-b border-gold/20 text-center">
        <div className="absolute inset-0 bg-[url('/assets/temple_exterior.png')] bg-cover bg-center opacity-25"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-glow text-white">
            {t('contact')}
          </h2>
          <div className="mt-4 flex justify-center items-center gap-2">
            <span className="w-10 h-0.5 bg-gold"></span>
            <MessageSquare size={20} className="text-gold" />
            <span className="w-10 h-0.5 bg-gold"></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        
        {/* Contact info grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Item 1 */}
          <div className="glass-card p-6 border-t-4 border-saffron text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-saffron/10 text-saffron rounded-full flex items-center justify-center"><Phone size={20} /></div>
            <h4 className="font-bold text-sm text-temple-900">Phone Helplines</h4>
            <p className="text-xs text-temple-600 leading-relaxed font-semibold">
              Helpline: +91 94371 XXXXX (Manager)<br />
              Emergency: +91 93378 22942
            </p>
          </div>

          {/* Item 2 */}
          <div className="glass-card p-6 border-t-4 border-gold text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gold/10 text-gold-dark rounded-full flex items-center justify-center"><Mail size={20} /></div>
            <h4 className="font-bold text-sm text-temple-900">Email Correspondence</h4>
            <p className="text-xs text-temple-600 leading-relaxed font-semibold">
              info@siddheswarjagannath.org<br />
              trust@siddheswarjagannath.org
            </p>
          </div>

          {/* Item 3 */}
          <div className="glass-card p-6 border-t-4 border-maroon text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-maroon/10 text-maroon rounded-full flex items-center justify-center"><Clock size={20} /></div>
            <h4 className="font-bold text-sm text-temple-900">Office Timings</h4>
            <p className="text-xs text-temple-600 leading-relaxed font-semibold">
              Morning: 09:00 AM - 12:00 PM<br />
              Evening: 05:00 PM - 08:00 PM
            </p>
          </div>

        </div>

        {/* Contact Form & FAQs split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Contact form panel */}
          <div className="glass-card p-8 space-y-6 border-t-4 border-saffron box-glow">
            {!successTicket ? (
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold">
                <div>
                  <h3 className="text-xl font-bold font-outfit text-maroon">Submit Ticket / Query</h3>
                  <p className="text-xs text-temple-500 mt-1 font-semibold">
                    Submit general inquiries, report fraud warnings, or lodge official complaints.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="flex flex-col space-y-1 col-span-1 sm:col-span-2">
                    <label className="text-temple-700 uppercase">Submission Category</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
                    >
                      {formTypes.map((t, idx) => (
                        <option key={idx} value={t.code}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Name */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-temple-700 uppercase">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Rama Chandra Mishra"
                      className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-temple-700 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="devotee@example.com"
                      className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col space-y-1 col-span-1 sm:col-span-2">
                    <label className="text-temple-700 uppercase">Mobile Number</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="10-digit number"
                      className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
                    />
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col space-y-1 col-span-1 sm:col-span-2">
                    <label className="text-temple-700 uppercase">Subject</label>
                    <input 
                      type="text" 
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief summary of query"
                      className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
                    />
                  </div>

                  {/* Message */}
                  <div className="flex flex-col space-y-1 col-span-1 sm:col-span-2">
                    <label className="text-temple-700 uppercase">Message details</label>
                    <textarea 
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Type details here..."
                      className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-saffron hover:bg-saffron-dark text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={14} />
                    <span>{loading ? 'Submitting...' : 'Submit Message'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Success form block */
              <div className="space-y-6 text-center py-10">
                <CheckCircle2 size={48} className="text-emerald-600 mx-auto" />
                <div>
                  <h4 className="text-lg font-bold text-emerald-800">Support Ticket Generated!</h4>
                  <p className="text-xs text-temple-600 mt-2 font-semibold">
                    We received your submission. Write down the ticket code below. The managing office will reply shortly.
                  </p>
                </div>

                <div className="p-4 bg-temple-50 rounded-xl border border-saffron/10 text-left max-w-sm mx-auto space-y-1.5 text-xs font-semibold">
                  <p className="flex justify-between"><span className="text-temple-500">Ticket No:</span> <strong className="text-saffron select-all">{successTicket.ticketNumber}</strong></p>
                  <p className="flex justify-between"><span className="text-temple-500">Category:</span> <span className="text-temple-800 capitalize">{successTicket.type.replace(/_/g, ' ')}</span></p>
                  <p className="flex justify-between"><span className="text-temple-500">Sender:</span> <span className="text-temple-800">{successTicket.name}</span></p>
                </div>

                <button 
                  onClick={() => setSuccessTicket(null)}
                  className="px-4 py-2 border border-saffron text-saffron hover:bg-saffron/5 font-bold rounded-lg text-xs"
                >
                  Submit Another Message
                </button>
              </div>
            )}
          </div>

          {/* FAQ Accordion panel */}
          <div className="glass-card p-8 space-y-6 border-t-4 border-maroon">
            <h3 className="text-xl font-bold font-outfit text-maroon">Frequently Asked Questions</h3>
            <p className="text-xs text-temple-500 font-semibold leading-relaxed">
              Find quick answers to common queries regarding temple visits, dress code guidelines, and online puja bookings.
            </p>

            <div className="space-y-4">
              {faqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div key={faq.id} className="border border-saffron/10 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left px-5 py-4 bg-temple-50/50 hover:bg-saffron/5 flex items-center justify-between text-xs md:text-sm font-bold text-temple-800 focus:outline-none"
                    >
                      <span>{getFaqQuestion(faq)}</span>
                      {isOpen ? <ChevronUp size={16} className="text-saffron" /> : <ChevronDown size={16} className="text-saffron" />}
                    </button>
                    {isOpen && (
                      <div className="px-5 py-4 bg-white border-t border-saffron/5 text-xs text-temple-600 leading-relaxed font-semibold">
                        {getFaqAnswer(faq)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick WhatsApp contact trigger */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-emerald-800">Chat with Office on WhatsApp</h4>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Need instant help? Connect with our manager directly.</p>
              </div>
              <a 
                href="https://api.whatsapp.com/send?phone=919437199999&text=Hello%20Siddheswar%20Temple%20Office"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-sm transition-colors"
              >
                Chat Now
              </a>
            </div>
          </div>

        </div>

        {/* Sevak Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Mukhya Sevaks Card */}
          <div className="lg:col-span-2 glass-card p-6 border-t-4 border-gold box-glow">
            <h4 className="font-extrabold text-base text-temple-900 mb-2 font-outfit">Mukhya Sevaks (Chief Servitors)</h4>
            <p className="text-xs text-temple-600 leading-relaxed font-semibold mb-4">
              For queries related to Nitikanti, daily prasad, or ritual guidelines, you may reach out to or consult our Chief Servitors:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-temple-800 font-extrabold list-disc pl-5">
              <li>Kishor Chandra Padhy</li>
              <li>Sarat Chandra Padhy</li>
              <li>Rama Chandra Padhy</li>
              <li>Krushna Chandra Padhy</li>
              <li>Binod Chandra Padhy</li>
              <li>Pramod Chandra Padhy</li>
            </ul>
            <div className="mt-4 pt-3 border-t border-saffron/10 text-xs text-temple-600 font-bold">
              Emergency Contact / Helpline: <a href="tel:+919337822942" className="text-saffron hover:underline">+91 93378 22942</a>
            </div>
          </div>

          {/* Website Creator / Head Sevak */}
          <div className="glass-card p-6 border-t-4 border-saffron flex flex-col justify-between box-glow">
            <div>
              <h4 className="font-extrabold text-base text-temple-900 mb-2 font-outfit">Website Seva (IT & Support)</h4>
              <p className="text-xs text-temple-600 leading-relaxed font-semibold">
                Designed and maintained as a devotional service to the Lord:
              </p>
              <div className="mt-3 p-3 bg-temple-50 dark:bg-temple-darker rounded-xl border border-saffron/10">
                <h5 className="font-extrabold text-xs text-temple-900">Sumit Kumar Padhy</h5>
                <p className="text-[10px] text-saffron font-bold">Head Sevak & Website Creator</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-saffron/10 text-xs text-temple-600 font-bold">
              Tech Support: <a href="tel:+919337822942" className="text-saffron hover:underline">+91 93378 22942</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
