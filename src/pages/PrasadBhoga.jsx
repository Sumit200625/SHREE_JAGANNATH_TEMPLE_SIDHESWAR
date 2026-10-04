import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Gift, Clock, MapPin, Award, CheckCircle2, ChevronRight, HelpCircle, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrasadBhoga() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Group booking state
  const [formData, setFormData] = useState({
    name: user ? user.name : '',
    phone: user ? user.phone : '',
    email: user ? user.email : '',
    selectedDate: '',
    headcount: 20,
    prasadType: 'Full Mahaprasad Meal',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const menuItems = [
    { nameEn: "Sukhila Kora & Khaja (Dry Prasad)", nameOr: "ଶୁଖିଲା କୋରା ଓ ଖଜା", price: "₹50 / Pack", descEn: "Crispy sweet wheat flour shells dipped in sugar syrup, lasts for weeks.", descOr: "ଗହମ ଚୂନା ତିଆରି ଶୁଖିଲା ଖଜା ଓ ନଡ଼ିଆ କୋରା ଭୋଗ।" },
    { nameEn: "Meetha Kanika & Khechudi", nameOr: "ମିଠା କାନିକା ଓ ଖେଚୁଡ଼ି", price: "₹100 / Kudua", descEn: "Saffron flavored sweetened rice and traditional spiced lentil-rice mixture.", descOr: "ଅତି ସୁଆଦିଆ ମିଠା କାନିକା ଭାତ ଓ ସୁବାସିତ ଖେଚୁଡ଼ି ଭୋଗ।" },
    { nameEn: "Divya Dalma", nameOr: "ଦିବ୍ୟ ଡାଲମା", price: "₹80 / Kudua", descEn: "Lentils slow-cooked with pumpkin, raw banana, eggplant, and grated coconut.", descOr: "ମନ୍ଦିର ରୋଷଶାଳାର ସ୍ୱତନ୍ତ୍ର ପନିପରିବା ଡାଲମା ଭୋଗ।" },
    { nameEn: "Saga Bhaja & Besara", nameOr: "ଶାଗ ଭଜା ଓ ବେସର", price: "₹60 / Plate", descEn: "Stir-fried green leaves and mustard paste vegetable stew.", descOr: "ସରିଷା ବେସର ତରକାରୀ ଓ ସତେଜ ଶାଗ ଭଜା।" },
    { nameEn: "Sweet Kheeri (Rice Pudding)", nameOr: "ମିଠା କ୍ଷୀରି", price: "₹75 / Kudua", descEn: "Rich milk pudding slow-cooked with cardamom and bay leaves.", descOr: "ଘନ କ୍ଷୀରି ଭୋଗ।" }
  ];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formData.headcount < 5) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const bookingRef = `PRASD-REQ-${Math.floor(100000 + Math.random() * 900000)}`;
      setSuccess({
        ...formData,
        referenceCode: bookingRef
      });
      // reset
      setFormData(prev => ({
        ...prev,
        selectedDate: '',
        notes: ''
      }));
    }, 600);
  };

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900 pb-20">
      
      {/* Page Header */}
      <div className="relative bg-temple-dark text-cream-light py-20 border-b border-gold/20 text-center">
        <div className="absolute inset-0 bg-[url('/assets/jagannath_sanctum_seva.jpg')] bg-cover bg-center opacity-25"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-glow text-white">
            {t('prasad')}
          </h2>
          <div className="mt-4 flex justify-center items-center gap-2">
            <span className="w-10 h-0.5 bg-gold"></span>
            <Utensils size={20} className="text-gold" />
            <span className="w-10 h-0.5 bg-gold"></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        
        {/* Core Prasad Details Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Timings */}
          <div className="glass-card p-6 border-t-4 border-saffron space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-saffron/10 text-saffron rounded-full flex items-center justify-center"><Clock size={20} /></div>
              <h3 className="text-lg font-bold text-temple-900 font-outfit">Mahaprasad Availability</h3>
              <p className="text-xs text-temple-600 leading-relaxed font-semibold">
                Daily cooked Mahaprasad is offered to the deities at noon. Dry prasad (Khaja) is available at counters from 09:00 AM. Wet meals (rice, dalma) are ready for devotees starting from 01:00 PM until 03:00 PM.
              </p>
            </div>
            <span className="text-[10px] text-temple-500 font-bold block pt-4">Daily offered: 1:00 PM onwards</span>
          </div>

          {/* Card 2: Location */}
          <div className="glass-card p-6 border-t-4 border-gold space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-gold/10 text-gold-dark rounded-full flex items-center justify-center"><MapPin size={20} /></div>
              <h3 className="text-lg font-bold text-temple-900 font-outfit">Anandabazar Complex</h3>
              <p className="text-xs text-temple-600 leading-relaxed font-semibold">
                Prasad must be collected and consumed only within the dedicated Anandabazar complex located behind the main temple. Stalls are managed by hereditary cooks (Suaras) appointed by the temple trust.
              </p>
            </div>
            <span className="text-[10px] text-temple-500 font-bold block pt-4">Location: Temple Backside</span>
          </div>

          {/* Card 3: Free Seva */}
          <div className="glass-card p-6 border-t-4 border-maroon space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-maroon/10 text-maroon rounded-full flex items-center justify-center"><Gift size={20} /></div>
              <h3 className="text-lg font-bold text-temple-900 font-outfit">Sponsor Annadan Seva</h3>
              <p className="text-xs text-temple-600 leading-relaxed font-semibold">
                Want to feed visiting pilgrims? You can sponsor a day's Mahaprasad meals for local saints, ascetics, and poor devotees through our secure Seva Contribution Portal.
              </p>
            </div>
            <Link to="/seva" className="text-xs text-saffron font-bold hover:underline block pt-4">
              Sponsor Seva Now &rarr;
            </Link>
          </div>

        </div>

        {/* Prasad Price Menu & Group Request Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Price Menu */}
          <div className="glass-card p-8 space-y-6 box-glow border-t-4 border-maroon">
            <h3 className="text-xl font-bold font-outfit text-maroon">Prasad / Bhoga Price List</h3>
            <p className="text-xs text-temple-500 font-semibold leading-relaxed">
              Standard prices for daily offerings. Subject to marginal changes during big festivals.
            </p>
            
            <div className="space-y-4">
              {menuItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-temple-50 rounded-xl border border-saffron/5 flex items-start justify-between text-xs md:text-sm font-semibold">
                  <div>
                    <h4 className="text-temple-900 font-bold flex items-center gap-1">
                      <span>{item.nameEn}</span>
                      <span className="text-xs text-temple-400 font-medium">({item.nameOr})</span>
                    </h4>
                    <p className="text-[10px] text-temple-500 font-medium mt-0.5">{item.descEn}</p>
                  </div>
                  <span className="text-maroon font-outfit font-bold whitespace-nowrap">{item.price}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gold/10 border border-gold/20 rounded-xl text-xs text-temple-800 leading-relaxed font-semibold">
              <strong>Note:</strong> Pure vegetarian cooking. No garlic or onion (Mahaprasad standard) is used in the kitchen. All vessels are clay-made earthen pots.
            </div>
          </div>

          {/* Group Request Form */}
          <div className="glass-card p-8 space-y-6 box-glow border-t-4 border-saffron">
            {!success ? (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold font-outfit text-maroon">Group Prasad Request</h3>
                  <p className="text-xs text-temple-500 mt-1 font-semibold">
                    Submit requests for large groups (minimum 10 devotees) at least 48 hours in advance.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-temple-700 uppercase">Contact Person</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Sabita Patnaik"
                      className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-temple-700 uppercase">Mobile Number</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="10-digit number"
                      className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  {/* Headcount */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-temple-700 uppercase">Number of Devotees</label>
                    <input 
                      type="number" 
                      required
                      min={10}
                      max={500}
                      value={formData.headcount}
                      onChange={(e) => setFormData(prev => ({ ...prev, headcount: Number(e.target.value) }))}
                      className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  {/* Date */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-temple-700 uppercase">Auspicious Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.selectedDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, selectedDate: e.target.value }))}
                      className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  {/* Prasad Category */}
                  <div className="flex flex-col space-y-1 col-span-1 sm:col-span-2">
                    <label className="text-xs font-bold text-temple-700 uppercase">Prasad Type</label>
                    <select
                      value={formData.prasadType}
                      onChange={(e) => setFormData(prev => ({ ...prev, prasadType: e.target.value }))}
                      className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value="Full Mahaprasad Meal">Full Mahaprasad Meal (Rice, Dalma, Kanika, Saga, Sweet)</option>
                      <option value="Dry Prasad Packs Only">Dry Prasad Packs Only (Sukhila Khaja Packs)</option>
                      <option value="Only Kanika & Dalma">Only Kanika & Dalma (Medium Meal)</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="flex flex-col space-y-1 col-span-1 sm:col-span-2">
                    <label className="text-xs font-bold text-temple-700 uppercase">Additional Instructions</label>
                    <textarea 
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="e.g. Memorial ceremony, senior citizen seating assistance needed"
                      className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl text-xs focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-saffron hover:bg-saffron-dark text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                  >
                    {loading ? 'Submitting...' : 'Request Group Prasad'}
                  </button>
                </div>
              </form>
            ) : (
              /* Success message block */
              <div className="space-y-6 text-center py-6">
                <CheckCircle2 size={48} className="text-emerald-600 mx-auto" />
                <div>
                  <h4 className="text-lg font-bold text-emerald-800">Prasad Request Submitted!</h4>
                  <p className="text-xs text-temple-600 mt-2 font-semibold">
                    We received your group request. Please note booking is finalized only after confirmation.
                  </p>
                </div>

                <div className="p-4 bg-temple-50 rounded-xl border border-saffron/10 text-left max-w-sm mx-auto space-y-1.5 text-xs font-semibold">
                  <p className="flex justify-between"><span className="text-temple-500">Ref Code:</span> <strong className="text-saffron select-all">{success.referenceCode}</strong></p>
                  <p className="flex justify-between"><span className="text-temple-500">Group Size:</span> <span className="text-temple-800">{success.headcount} Devotees</span></p>
                  <p className="flex justify-between"><span className="text-temple-500">Date:</span> <span className="text-temple-800">{success.selectedDate}</span></p>
                  <p className="flex justify-between"><span className="text-temple-500">Type:</span> <span className="text-temple-800">{success.prasadType}</span></p>
                </div>

                <div className="p-3 bg-gold/10 border border-gold/20 rounded-xl text-xs text-temple-800 text-left max-w-sm mx-auto font-semibold">
                  <strong>Important:</strong> Deposit 50% advance at the Temple Office counters within 24 hours of submission to secure Suara cooking slots.
                </div>

                <button 
                  onClick={() => setSuccess(null)}
                  className="px-4 py-2 border border-saffron text-saffron hover:bg-saffron/5 font-bold rounded-lg text-xs"
                >
                  Submit Another Request
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
