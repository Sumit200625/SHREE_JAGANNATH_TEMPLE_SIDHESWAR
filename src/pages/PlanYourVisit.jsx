import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Bus, Car, Eye, Heart, ShieldAlert, Award, Phone, HeartPulse, Clock, Landmark, ShieldCheck } from 'lucide-react';

export default function PlanYourVisit() {
  const { t, language } = useLanguage();

  const distances = [
    { targetEn: "Digapahandi Main Bus Stand", targetOr: "ଦିଗପହଣ୍ଡି ମୁଖ୍ୟ ବସଷ୍ଟାଣ୍ଡ", distance: "4 km", time: "10 mins" },
    { targetEn: "Brahmapur (Berhampur) Railway Station", targetOr: "ବ୍ରହ୍ମପୁର ରେଳ ଷ୍ଟେସନ", distance: "30 km", time: "50 mins" },
    { targetEn: "Biju Patnaik Airport (Bhubaneswar)", targetOr: "ଭୁବନେଶ୍ୱର ବିମାନବନ୍ଦର", distance: "180 km", time: "3.5 hours" }
  ];

  const accommodations = [
    { nameEn: "Sidheswar Temple Dharamshala", nameOr: "ସିଦ୍ଧେଶ୍ୱର ମନ୍ଦିର ଧର୍ମଶାଳା", typeEn: "Trust Managed (Budget)", descEn: "Basic neat rooms. Book in advance at the counter. Double bedroom at ₹300/night.", descOr: "ମନ୍ଦିର ଟ୍ରଷ୍ଟ ଦ୍ୱାରା ପରିଚାଳିତ କମ୍ ବ୍ୟୟ ବିଶିଷ୍ଟ ରୁମ୍।" },
    { nameEn: "Digapahandi Government Guest House", nameOr: "ଦିଗପହଣ୍ଡି ସରକାରୀ ପାନ୍ଥନିବାସ", typeEn: "Government (Budget)", descEn: "Requires government booking. 4.5 km from the temple.", descOr: "ଦିଗପହଣ୍ଡି ବ୍ଲକ୍ ମୁଖ୍ୟ କାର୍ଯ୍ୟାଳୟ ନିକଟରେ ଅବସ୍ଥିତ।" },
    { nameEn: "Brahmapur City Hotels", nameOr: "ବ୍ରହ୍ମପୁର ସହରର ବିଭିନ୍ନ ହୋଟେଲ", typeEn: "Private (Premium/Budget)", descEn: "Wide options located in Brahmapur city (30 km away). Recommended for luxury stay.", descOr: "ବ୍ରହ୍ମପୁର ସହରରେ ଅବସ୍ଥିତ ବିଭିନ୍ନ ଘରୋଇ ହୋଟେଲ।" }
  ];

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900 pb-20">
      
      {/* Page Header */}
      <div className="relative bg-temple-dark text-cream-light py-20 border-b border-gold/20 text-center">
        <div className="absolute inset-0 bg-[url('/assets/temple_exterior.png')] bg-cover bg-center opacity-25"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-glow text-white">
            {t('visit')}
          </h2>
          <div className="mt-4 flex justify-center items-center gap-2">
            <span className="w-10 h-0.5 bg-gold"></span>
            <MapPin size={20} className="text-gold" />
            <span className="w-10 h-0.5 bg-gold"></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        
        {/* Address and Route Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Detailed Address Card */}
          <div className="glass-card p-6 border-t-4 border-saffron space-y-4">
            <div className="w-10 h-10 bg-saffron/10 text-saffron rounded-full flex items-center justify-center"><MapPin size={20} /></div>
            <h3 className="text-lg font-bold font-outfit text-temple-900">Temple Address</h3>
            <p className="text-xs text-temple-600 leading-relaxed font-semibold">
              Shree Jagannath Temple,<br />
              9JMV+VVC, Sidhaswar,<br />
              Odisha 761054
            </p>
            <div className="pt-2">
              <a 
                href="https://maps.google.com/?q=9JMV%2BVVC,+Sidhaswar,+Odisha+761054" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full text-center py-2.5 bg-saffron hover:bg-saffron-dark text-white rounded-xl text-xs font-bold transition-colors block"
              >
                Open Google Maps Navigation
              </a>
            </div>
          </div>

          {/* Distances Metric Grid */}
          <div className="lg:col-span-2 glass-card p-6 border-t-4 border-gold space-y-4">
            <h3 className="text-lg font-bold font-outfit text-temple-900">{t('distances')}</h3>
            <div className="divide-y divide-saffron/5">
              {distances.map((dist, idx) => (
                <div key={idx} className="py-3 flex justify-between text-xs font-semibold">
                  <div>
                    <span className="text-temple-900 block font-bold">
                      {language === 'or' ? dist.targetOr : dist.targetEn}
                    </span>
                    <span className="text-[10px] text-temple-500 font-semibold">Estimated travel: {dist.time}</span>
                  </div>
                  <strong className="text-maroon text-sm font-outfit">{dist.distance}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transport & Parking guides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Transport Info */}
          <div className="glass-card p-8 space-y-6 border-t-4 border-maroon">
            <div className="flex items-center gap-2 text-maroon font-bold">
              <Bus size={20} />
              <h3 className="text-lg font-bold font-outfit">Local Transport & Bus Guides</h3>
            </div>
            
            <div className="text-xs text-temple-600 space-y-4 leading-relaxed font-semibold">
              <p>
                <strong>From Brahmapur:</strong> Frequent local government (OSRTC) and private buses run from Haladiapadar Bus Stand and Railway Station directly to Digapahandi Main Stand. Buses operate every 15-20 minutes. Cost is approximately ₹50 per passenger.
              </p>
              <p>
                <strong>From Digapahandi to Siddheswar Village:</strong> Shared autos and private auto-rickshaws are available 24/7 at the Digapahandi Bus Stand to carry pilgrims to Siddheswar Temple (4 km away). Private auto rates are around ₹100-120 per ride.
              </p>
            </div>
          </div>

          {/* Parking Availability */}
          <div className="glass-card p-8 space-y-6 border-t-4 border-saffron">
            <div className="flex items-center gap-2 text-saffron font-bold">
              <Car size={20} />
              <h3 className="text-lg font-bold font-outfit">Parking Facilities at Temple</h3>
            </div>

            <div className="text-xs text-temple-600 space-y-4 leading-relaxed font-semibold">
              <p>
                <strong>Two-Wheelers:</strong> Dedicated free two-wheeler parking is available inside the boundary gates, next to the shoe counter building. Security guards manage locks.
              </p>
              <p>
                <strong>Cars & Tourist Buses:</strong> A paved parking ground is situated 150 meters before the Singhadwara entrance gates. Dedicated parking slots are free for devotees. During major festivals, additional parking stands at local high schools are activated.
              </p>
            </div>
          </div>

        </div>

        {/* Nearby Stays (Dharamshalas) */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-saffron uppercase tracking-widest font-outfit">Accommodations</span>
            <h3 className="text-2xl font-bold text-maroon mt-1">Nearby Dharamshalas & Hotels</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {accommodations.map((hotel, idx) => (
              <div key={idx} className="glass-card p-6 border border-saffron/10 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <span className="text-[10px] bg-saffron/15 text-saffron font-bold px-2 py-0.5 rounded-full">{hotel.typeEn}</span>
                  <h4 className="font-bold text-sm text-temple-900 mt-2">
                    {language === 'or' ? hotel.nameOr : hotel.nameEn}
                  </h4>
                  <p className="text-xs text-temple-600 leading-relaxed mt-2 font-semibold">
                    {language === 'or' ? hotel.descOr : hotel.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Emergencies & Best Season Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Medical */}
          <div className="glass-card p-6 bg-rose-50 border border-rose-100 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold">
              <HeartPulse size={18} />
              <h4 className="text-xs font-bold uppercase tracking-wider">Medical Support</h4>
            </div>
            <p className="text-[11px] text-rose-700 leading-relaxed font-semibold">
              Digapahandi Community Health Center (CHC) is situated 4 km away. A first-aid center and emergency pharmacy are available in the temple office block.
            </p>
          </div>

          {/* Emergency contacts */}
          <div className="glass-card p-6 bg-amber-50 border border-amber-100 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold">
              <Phone size={18} />
              <h4 className="text-xs font-bold uppercase tracking-wider">Emergency Helplines</h4>
            </div>
            <ul className="text-[11px] text-amber-700 leading-relaxed font-semibold space-y-1">
              <li>Emergency Helpdesk: +91 93378 22942</li>
              <li>Digapahandi Police Station: 112 / +91 6814 24XXXX</li>
              <li>Ambulance Emergency: 108</li>
            </ul>
          </div>

          {/* Season */}
          <div className="glass-card p-6 bg-temple-50 border border-saffron/10 space-y-3">
            <div className="flex items-center gap-2 text-temple-800 font-bold">
              <Clock size={18} />
              <h4 className="text-xs font-bold uppercase tracking-wider">Best Time to Visit</h4>
            </div>
            <p className="text-[11px] text-temple-600 leading-relaxed font-semibold">
              October to February (Winter season) offers pleasant climate. Alternatively, visit during Rath Yatra (July) or Kartika Purnima (November) for visual splendor.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
