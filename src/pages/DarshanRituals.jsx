import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/client';
import { DEFAULT_TIMINGS } from '../../shared/catalog';
import { isTempleOpen } from '../utils/templeStatus';
import { Clock, Info, ShieldAlert, Award, Footprints, Shield, CameraOff, Sparkles, Accessibility, HelpCircle } from 'lucide-react';

export default function DarshanRituals() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);

  // Dynamic Open/Closed status (uses the timings below, so it follows any change made in the Admin panel)
  const [dailyRituals, setDailyRituals] = useState(DEFAULT_TIMINGS);
  useEffect(() => {
    const check = () => setIsOpen(isTempleOpen(dailyRituals));
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [dailyRituals]);

  useEffect(() => { api.getTimings().then((r) => r.rows?.length && setDailyRituals(r.rows)).catch(() => {}); }, []);

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900 pb-20">
      
      {/* Page Header */}
      <div className="relative bg-temple-dark text-cream-light py-20 border-b border-gold/20 text-center">
        <div className="absolute inset-0 bg-[url('/assets/jagannath_sanctum_seva.jpg')] bg-cover bg-center opacity-25"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-glow text-white">
            {t('darshan')}
          </h2>
          <div className="mt-4 flex justify-center items-center gap-2">
            <span className="w-10 h-0.5 bg-gold"></span>
            <Clock size={20} className="text-gold" />
            <span className="w-10 h-0.5 bg-gold"></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-16">
        
        {/* Timing Status & Quick Warning */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Live Badge */}
          <div className="glass-card p-6 border-t-4 border-saffron text-center flex flex-col justify-center items-center">
            <h3 className="text-sm font-bold text-temple-500 uppercase tracking-wider">{t('templeStatus')}</h3>
            <span className={`mt-3 px-4 py-1.5 rounded-full font-bold text-sm inline-flex items-center gap-2 ${
              isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-emerald-600 animate-ping' : 'bg-rose-600'}`}></span>
              <span>{isOpen ? t('open') : t('closed')}</span>
            </span>
          </div>

          {/* Quick Notice */}
          <div className="lg:col-span-3 bg-white dark:bg-temple-darker p-6 rounded-2xl border border-saffron/10 flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-saffron/10 text-saffron rounded-full shrink-0"><Info size={24} /></div>
            <div>
              <h4 className="font-bold text-base text-temple-800">Special Festival Rituals Notice</h4>
              <p className="text-xs text-temple-600 leading-relaxed mt-2 font-semibold">
                During solar or lunar eclipses, Ekadashi days, and major annual celebrations (Rath Yatra, Snana Purnima), the daily Nitis (rituals) undergo major adjustments. Please review the pinned notice board on the home page or enquire at the counter.
              </p>
            </div>
          </div>
        </div>

        {/* Daily Schedule Table */}
        <section className="bg-white dark:bg-temple-darker rounded-2xl border border-saffron/10 overflow-hidden box-glow">
          <div className="bg-maroon text-cream-light p-6">
            <h3 className="text-xl font-bold font-outfit tracking-wide flex items-center gap-2">
              <Clock className="text-gold" />
              <span>{language === 'or' ? "ଦୈନିକ ନୀତିକାନ୍ତି ସୂଚୀ" : language === 'hi' ? "दैनिक अनुष्ठान अनुसूची" : "Daily Niti & Rituals Schedule"}</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-temple-50 dark:bg-temple-dark border-b border-saffron/10 text-xs font-bold text-temple-800 uppercase tracking-wider">
                  <th className="p-5 w-1/4">Time</th>
                  <th className="p-5 w-1/3">Ritual Name</th>
                  <th className="p-5">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-saffron/5 text-xs md:text-sm text-temple-700 font-medium">
                {dailyRituals.map((ritual, idx) => (
                  <tr key={idx} className="hover:bg-saffron/5 transition-colors">
                    <td className="p-5 font-bold text-saffron">{ritual.time}</td>
                    <td className="p-5 font-extrabold text-temple-900">
                      {language === 'or' ? ritual.eventOr : language === 'hi' ? ritual.eventHi : ritual.eventEn}
                    </td>
                    <td className="p-5 text-temple-600 leading-relaxed font-semibold">
                      {language === 'or' ? ritual.descOr : language === 'hi' ? ritual.descHi : ritual.descEn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Guidelines & Devotee Rules */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-saffron uppercase tracking-widest">Code of Conduct</span>
            <h3 className="text-2xl md:text-3xl font-extrabold font-outfit text-maroon mt-1">
              Devotee Guidelines & Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Dress Code */}
            <div className="glass-card p-6 border-t-4 border-maroon space-y-3">
              <div className="w-10 h-10 bg-maroon/10 text-maroon rounded-full flex items-center justify-center"><Shield size={20} /></div>
              <h4 className="font-bold text-sm text-temple-900">Dress Code</h4>
              <p className="text-xs text-temple-600 leading-relaxed font-semibold">
                Devotees must wear clean, traditional clothing. Men are advised to wear Dhotis, Kurtas, or Pyjamas. Women should wear Sarees or Salwar Kameez. Shorts, miniskirts, sleeveless shirts, and skin-tight clothing are prohibited.
              </p>
            </div>

            {/* Footwear */}
            <div className="glass-card p-6 border-t-4 border-saffron space-y-3">
              <div className="w-10 h-10 bg-saffron/10 text-saffron rounded-full flex items-center justify-center"><Footprints size={20} /></div>
              <h4 className="font-bold text-sm text-temple-900">Footwear Prohibition</h4>
              <p className="text-xs text-temple-600 leading-relaxed font-semibold">
                No leather or synthetic footwear is allowed past the lion's gate (Singhadwara). A free shoe counter managed by volunteers is situated next to the entry counter. Leather belts or purses are also prohibited inside the sanctum.
              </p>
            </div>

            {/* Photography & Mobile */}
            <div className="glass-card p-6 border-t-4 border-gold space-y-3">
              <div className="w-10 h-10 bg-gold/10 text-gold rounded-full flex items-center justify-center"><CameraOff size={20} /></div>
              <h4 className="font-bold text-sm text-temple-900">No Mobile / Camera</h4>
              <p className="text-xs text-temple-600 leading-relaxed font-semibold">
                Photography, videography, and taking selfies of deities are strictly prohibited. Mobile phones must be kept in lockers at the counter or switched off. Security officers are authorized to seize violating devices.
              </p>
            </div>

            {/* Cleanliness */}
            <div className="glass-card p-6 border-t-4 border-emerald-600 space-y-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center"><Sparkles size={20} /></div>
              <h4 className="font-bold text-sm text-temple-900">Hygiene & Waste</h4>
              <p className="text-xs text-temple-600 leading-relaxed font-semibold">
                Siddheswar is a plastic-free zone. Do not throw plastic bags, leaves, or paper cups in the courtyard. Wash hands and feet at the clean taps before standing in the darshan queue. Spit chewing or gutkha is heavily penalized.
              </p>
            </div>

          </div>
        </section>

        {/* Accessibility & Assistance Details */}
        <section className="bg-white dark:bg-temple-darker p-8 md:p-12 rounded-2xl border border-saffron/10 flex flex-col lg:flex-row gap-10 items-center box-glow">
          <div className="space-y-4 lg:w-2/3">
            <div className="flex items-center gap-2 text-gold-dark font-bold">
              <Accessibility size={20} />
              <span className="uppercase text-xs tracking-wider">Universal Accessibility</span>
            </div>
            <h3 className="text-2xl font-bold font-outfit text-maroon">Senior Citizen & Disabled Devotee Assistance</h3>
            <p className="text-xs md:text-sm text-temple-700 leading-relaxed font-semibold">
              We ensure every devotee can access the holy darshan without hardship. The temple provides:
            </p>
            <ul className="space-y-3 text-xs text-temple-600 font-semibold list-disc pl-5">
              <li>Wheelchair ramps at the entrance and corridors leading to the natamandira.</li>
              <li>Free wheelchair service with dedicated temple attendants upon request at the help desk.</li>
              <li>Priority fast-track queue for senior citizens (above 65 years) and mothers with infants.</li>
              <li>Benches and clean drinking water dispensers along the queues.</li>
            </ul>
          </div>
          <div className="p-8 bg-temple-50 dark:bg-temple-dark rounded-xl border border-saffron/10 lg:w-1/3 text-center flex flex-col items-center gap-3 shrink-0">
            <Accessibility size={48} className="text-saffron animate-bounce" />
            <h4 className="font-bold text-sm text-temple-800">Need Help?</h4>
            <p className="text-xs text-temple-500 font-semibold">
              Contact the Volunteer Desk at the main gate or call our helpline.
            </p>
            <a href="tel:+919337822942" className="px-4 py-2 bg-saffron text-white rounded-lg text-xs font-bold hover:bg-saffron-dark transition-colors">
              Call Desk: +91 93378 22942
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
