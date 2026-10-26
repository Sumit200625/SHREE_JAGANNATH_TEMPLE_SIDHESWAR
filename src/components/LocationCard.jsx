import React from 'react';
import { MapPin, Phone, Mail, Navigation, MessageCircle } from 'lucide-react';
import { SITE } from '../config/site';

export default function LocationCard() {
  return (
    <section className="glass-card rounded-2xl overflow-hidden shadow-md border-t-4 border-maroon">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-6 md:p-8 space-y-4">
          <h2 className="text-2xl font-bold font-outfit flex items-center gap-2"><MapPin size={22} className="text-maroon" /> Find the Temple</h2>
          <p className="font-semibold text-temple-800 leading-relaxed">{SITE.address}</p>
          <div className="space-y-2 text-sm font-semibold">
            <a href={SITE.phoneTel} className="flex items-center gap-2 text-temple-800 hover:text-saffron"><Phone size={16} className="text-saffron" /> {SITE.phoneDisplay}</a>
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-temple-800 hover:text-saffron"><MessageCircle size={16} className="text-emerald-600" /> WhatsApp the temple office</a>
            <a href={SITE.emailLink} className="flex items-center gap-2 text-temple-800 hover:text-saffron break-all"><Mail size={16} className="text-saffron" /> {SITE.email}</a>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href={SITE.mapsLink} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full bg-maroon text-cream-light font-bold text-sm flex items-center gap-2 hover:bg-maroon-light"><Navigation size={16} /> Get Directions</a>
            <a href={SITE.phoneTel} className="px-5 py-2.5 rounded-full border-2 border-saffron text-saffron font-bold text-sm flex items-center gap-2 hover:bg-saffron hover:text-white"><Phone size={16} /> Call Now</a>
          </div>
        </div>
        <div className="min-h-[280px] bg-temple-50">
          <iframe
            title="Shree Jagannath Temple Sidheswar on Google Maps" src={SITE.mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full min-h-[280px] border-0" allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
