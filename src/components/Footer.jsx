import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Youtube, Facebook, Instagram, Mail, Phone, MapPin, ShieldAlert, Award } from 'lucide-react';
import { SITE } from '../config/site';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-temple-dark text-cream-light pt-16 pb-8 border-t-2 border-gold overflow-hidden">
      {/* Devotional Wave Background Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-saffron via-gold to-maroon"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 text-gold">
                {/* Logo */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" fill="none" />
                  <circle cx="50" cy="50" r="12" fill="currentColor" />
                  <path d="M 50 5 L 50 95 M 5 50 L 95 50" stroke="currentColor" strokeWidth="3" />
                </svg>
              </div>
              <div>
                <h3 className="text-md font-bold text-gold uppercase tracking-wider">{t('templeName')}</h3>
                <span className="text-xs text-temple-300">{t('location')}</span>
              </div>
            </div>
            
            <p className="text-xs text-temple-200 leading-relaxed font-medium italic">
              "Jai Jagannath - May the Lord of the Universe bless humanity with harmony, wisdom, health, and infinite peace."
            </p>
            
            {/* Social media icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a href={SITE.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-saffron hover:text-white rounded-full text-gold hover:scale-115 transition-all duration-300" aria-label="YouTube">
                <Youtube size={16} />
              </a>
              <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-saffron hover:text-white rounded-full text-gold hover:scale-115 transition-all duration-300" aria-label="Facebook">
                <Facebook size={16} />
              </a>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-saffron hover:text-white rounded-full text-gold hover:scale-115 transition-all duration-300" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href={SITE.emailLink} className="p-2 bg-white/5 hover:bg-saffron hover:text-white rounded-full text-gold hover:scale-115 transition-all duration-300" aria-label="Email">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/10 pb-2">Quick Links</h3>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs text-temple-200 font-medium">
              <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-gold transition-colors">About Temple</Link></li>
              <li><Link to="/darshan" className="hover:text-gold transition-colors">Darshan Timings</Link></li>
              <li><Link to="/festivals" className="hover:text-gold transition-colors">Festival Calendar</Link></li>
              <li><Link to="/seva" className="hover:text-gold transition-colors">Seva Booking</Link></li>
              <li><Link to="/donation" className="hover:text-gold transition-colors">Donate Hundi</Link></li>
              <li><Link to="/prasad" className="hover:text-gold transition-colors">Prasad Info</Link></li>
              <li><Link to="/gallery" className="hover:text-gold transition-colors">Photo Gallery</Link></li>
              <li><Link to="/notices" className="hover:text-gold transition-colors">News Board</Link></li>
              <li><Link to="/visit" className="hover:text-gold transition-colors">Plan Your Visit</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Office</Link></li>
              <li><Link to="/login" className="hover:text-gold transition-colors">Admin Login</Link></li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/10 pb-2">Temple Office</h3>
            <ul className="space-y-3 text-xs text-temple-200">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-saffron shrink-0 mt-0.5" />
                <span>
                  9JMV+VVC, Sidhaswar,<br />
                  Odisha 761054
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-saffron shrink-0" />
                <a href={SITE.phoneTel} className="hover:text-gold">Helpline / WhatsApp: {SITE.phoneDisplay}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-saffron shrink-0" />
                <a href={SITE.emailLink} className="hover:text-gold break-all">Email: {SITE.email}</a>
              </li>
            </ul>
          </div>

          {/* Important Security Notice / Fraud Warning */}
          <div className="flex flex-col space-y-4 bg-maroon-dark/40 p-4 border border-saffron/20 rounded-xl">
            <div className="flex items-center gap-2 text-gold">
              <ShieldAlert size={18} className="animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Fraud Alert</h3>
            </div>
            <p className="text-[11px] text-cream-light/85 leading-relaxed">
              Use ONLY official temple payment gateways, bank transfer details, and verified mobile numbers displayed on this website. The temple committee never requests personal money transfers via private numbers.
            </p>
            <div className="flex gap-2">
              <a 
                href="https://maps.google.com/?q=9JMV%2BVVC,+Sidhaswar,+Odisha+761054" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full text-center py-1.5 bg-saffron text-white rounded-lg text-xs font-bold hover:bg-saffron-dark transition-colors"
              >
                Google Maps Location
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div className="border-t border-white/10 pt-8 mt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-temple-300">
          <p>
            &copy; {currentYear} Sidheswar Shree Jagannath Temple Managing Trust, Digapahandi. All Rights Reserved.
          </p>
          <div className="flex space-x-4">
            <Link to="/contact?tab=grievance" className="hover:text-gold transition-colors">Report Grievance</Link>
            <span>|</span>
            <span className="hover:text-gold cursor-pointer">Privacy Policy</span>
            <span>|</span>
            <span className="hover:text-gold cursor-pointer">Terms and Conditions</span>
          </div>
        </div>

        {/* Traditional Odia Devotional Signature */}
        <div className="text-center mt-6 text-gold/30 font-odia text-sm">
          ଜୟ ଜଗନ୍ନାଥ | ଜୟ ପତିତପାବନ | ଶ୍ରୀ ସିଦ୍ଧେଶ୍ୱର ପୀଠ
        </div>
      </div>
    </footer>
  );
}
