import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/client';
import SubscribeBox from '../components/SubscribeBox';
import PanchangCard from '../components/PanchangCard';
import DailyTimings from '../components/DailyTimings';
import UpcomingEvents from '../components/UpcomingEvents';
import LocationCard from '../components/LocationCard';
import { SITE } from '../config/site';
import {
  Clock,
  MapPin,
  HeartHandshake,
  Bell,
  ImageIcon,
  Mail,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();

  const [notices, setNotices] = useState([]);

  // Fetch latest notices for the homepage preview
  useEffect(() => {
    let isMounted = true;
    api
      .getNotices()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setNotices(data.slice(0, 3));
        }
      })
      .catch(() => {
        if (isMounted) setNotices([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const galleryPreview = [
    { src: '/assets/jagannath_tulasi_closeup.jpg', alt: 'Lord Jagannath Darshan' },
    { src: '/assets/temple_chariot_sunset.jpg', alt: 'Temple and Chariot at Sunset' },
    { src: '/assets/temple_spire_flags.jpg', alt: 'Temple Spires with Flags' },
    { src: '/assets/jagannath_sanctum_seva.jpg', alt: 'Lord Jagannath adorned with Tulasi' },
    { src: '/assets/deity_procession_close.jpg', alt: 'Lord Jagannath Procession' },
    { src: '/assets/procession_night_street.jpg', alt: 'Night Procession with Devotees' },
  ];

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-temple-dark text-cream-light py-24 md:py-32">
        <div
          className="absolute inset-0 bg-[url('/assets/jagannath_tulasi_closeup.jpg')] bg-cover bg-center opacity-30"
          aria-hidden="true"
        ></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <p className="uppercase tracking-widest text-gold font-semibold mb-3">
            {t('jaiJagannath')}
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold font-outfit text-white text-glow mb-6">
            {t('templeName')}
          </h1>
          <p className="text-lg md:text-xl text-cream-light/90 max-w-2xl mx-auto mb-10">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            <Link
              to="/donation"
              className="px-8 py-4 rounded-full bg-gold text-temple-dark hover:bg-gold-light transition-colors font-extrabold text-lg shadow-xl ring-2 ring-gold/40"
            >
              {t('donateNow')}
            </Link>
            <Link
              to="/seva"
              className="px-8 py-4 rounded-full bg-saffron hover:bg-saffron-dark text-white transition-colors font-extrabold text-lg shadow-xl"
            >
              {t('bookSeva')}
            </Link>
            <Link
              to="/darshan"
              className="px-6 py-4 rounded-full border border-cream-light/70 text-cream-light hover:bg-cream-light hover:text-temple-dark transition-colors font-semibold"
            >
              {t('viewTimings')}
            </Link>
            <a
              href={SITE.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-full border border-gold text-gold hover:bg-gold hover:text-temple-dark transition-colors font-semibold"
            >
              {t('getDirections')}
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 py-16">
        {/* Daily darshan & aarti timings (with open/closed status) */}
        <DailyTimings />

        {/* Upcoming festivals & events */}
        <UpcomingEvents />

        {/* Recent Notices */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold font-outfit">
              {t('recentNotices')}
            </h2>
            <Link to="/notices" className="text-saffron font-semibold hover:underline">
              {t('viewAllNotices')}
            </Link>
          </div>
          {notices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {notices.map((notice) => (
                <div key={notice.id} className="glass-card rounded-2xl p-6 shadow-md">
                  <h3 className="font-bold text-lg mb-2">{notice.title || notice.titleEn}</h3>
                  <p className="text-sm text-temple-500 line-clamp-3">
                    {notice.description || notice.descriptionEn}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-temple-500">{t('loading')}</p>
          )}
        </section>

        {/* Gallery Preview */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold font-outfit mb-6 flex items-center gap-2">
            <ImageIcon size={22} className="text-gold" />
            {t('photoGalleryPreview')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryPreview.map((img) => (
              <div
                key={img.src}
                className="rounded-xl overflow-hidden aspect-square shadow-md group"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/gallery" className="text-saffron font-semibold hover:underline">
              {t('learnMore')}
            </Link>
          </div>
        </section>

        {/* Today's Panchang */}
        <PanchangCard />

        {/* Location, address, contact + Google Map */}
        <LocationCard />

        {/* Subscribe */}
        <SubscribeBox />

        {/* Fraud Warning */}
        <section className="text-center text-sm text-maroon border border-maroon/30 rounded-xl p-4 max-w-3xl mx-auto flex items-center justify-center gap-2">
          <HeartHandshake size={16} />
          <span>{t('fraudWarning')}</span>
        </section>

      </div>
    </div>
  );
}
