import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/client';
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

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [notices, setNotices] = useState([]);
  const [subscribeValue, setSubscribeValue] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Temple open/closed status (simple daytime check for demo purposes)
  const currentHour = new Date().getHours();
  const isTempleOpen = currentHour >= 5 && currentHour < 21;

  // Countdown timer for next festival (Rath Yatra 2027)
  useEffect(() => {
    const targetDate = new Date('2027-07-16T08:00:00').getTime();

    const updateTimer = () => {
      const now = Date.now();
      const distance = targetDate - now;

      if (distance <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, []);

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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subscribeValue.trim()) return;
    setSubscribed(true);
    setSubscribeValue('');
  };

  const timings = [
    { key: 'morningAarti', time: '5:00 AM' },
    { key: 'noonBhoga', time: '12:30 PM' },
    { key: 'eveningAarti', time: '7:00 PM' },
    { key: 'closingTime', time: '9:00 PM' },
  ];

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
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/darshan"
              className="px-6 py-3 rounded-full bg-saffron hover:bg-saffron-dark transition-colors font-semibold shadow-lg"
            >
              {t('viewTimings')}
            </Link>
            <Link
              to="/visit"
              className="px-6 py-3 rounded-full border border-gold text-gold hover:bg-gold hover:text-temple-dark transition-colors font-semibold"
            >
              {t('getDirections')}
            </Link>
            <Link
              to="/donation"
              className="px-6 py-3 rounded-full bg-gold text-temple-dark hover:bg-gold-light transition-colors font-semibold shadow-lg"
            >
              {t('donateNow')}
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 py-16">
        {/* Temple Status + Daily Timings */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card rounded-2xl p-8 shadow-md flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold font-outfit mb-4 flex items-center gap-2">
                <Bell size={20} className="text-gold" />
                {t('templeStatus')}
              </h2>
              <div className="flex items-center gap-2 text-lg font-semibold">
                {isTempleOpen ? (
                  <>
                    <CheckCircle className="text-green-600" size={22} />
                    <span className="text-green-700">{t('open')}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="text-maroon" size={22} />
                    <span className="text-maroon">{t('closed')}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-temple-500 mt-3">{t('lastUpdated')}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 shadow-md">
            <h2 className="text-xl font-bold font-outfit mb-4 flex items-center gap-2">
              <Clock size={20} className="text-gold" />
              {t('dailyTimings')}
            </h2>
            <ul className="space-y-2">
              {timings.map((item) => (
                <li key={item.key} className="flex justify-between border-b border-gold/20 pb-2">
                  <span>{t(item.key)}</span>
                  <span className="font-semibold">{item.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Festival Countdown */}
        <section className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-outfit mb-8">
            {t('upcomingFestival')}
          </h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {[
              { label: t('days'), value: countdown.days },
              { label: t('hours'), value: countdown.hours },
              { label: t('minutes'), value: countdown.minutes },
              { label: t('seconds'), value: countdown.seconds },
            ].map((unit) => (
              <div
                key={unit.label}
                className="glass-card rounded-2xl px-6 py-5 min-w-[90px] shadow-md"
              >
                <div className="text-3xl md:text-4xl font-extrabold text-saffron">
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="text-sm text-temple-500 mt-1">{unit.label}</div>
              </div>
            ))}
          </div>
        </section>

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

        {/* Subscribe */}
        <section className="glass-card rounded-2xl p-8 md:p-12 text-center shadow-md">
          <h2 className="text-2xl font-bold font-outfit mb-2 flex items-center justify-center gap-2">
            <Mail size={20} className="text-gold" />
            {t('subscribeTitle')}
          </h2>
          <p className="text-temple-500 mb-6 max-w-xl mx-auto">{t('subscribeDesc')}</p>

          {subscribed ? (
            <p className="text-green-700 font-semibold">{t('success')}</p>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
            >
              <input
                type="text"
                value={subscribeValue}
                onChange={(e) => setSubscribeValue(e.target.value)}
                placeholder={t('subscribePlaceholder')}
                className="flex-grow px-4 py-3 rounded-full border border-gold/30 bg-cream text-temple-900 focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-saffron hover:bg-saffron-dark text-white font-semibold transition-colors"
              >
                {t('subscribeBtn')}
              </button>
            </form>
          )}
        </section>

        {/* Fraud Warning */}
        <section className="text-center text-sm text-maroon border border-maroon/30 rounded-xl p-4 max-w-3xl mx-auto flex items-center justify-center gap-2">
          <HeartHandshake size={16} />
          <span>{t('fraudWarning')}</span>
        </section>

        {/* Location */}
        <section className="text-center text-temple-500 flex items-center justify-center gap-2">
          <MapPin size={16} />
          <span>{t('location')}</span>
        </section>
      </div>
    </div>
  );
}
