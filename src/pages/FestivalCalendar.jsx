import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/client';
import { Search, Calendar as CalendarIcon, MapPin, Phone, Clock, AlertTriangle, Grid, List, Download, Share2, Info, ArrowLeft, ArrowRight } from 'lucide-react';

export default function FestivalCalendar() {
  const { t, language } = useLanguage();
  const [festivals, setFestivals] = useState([]);
  const [filteredFestivals, setFilteredFestivals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All'); // 'All' or month name
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'calendar'
  const [selectedFestival, setSelectedFestival] = useState(null);
  
  // Notice / Alerts State
  const [notices, setNotices] = useState([]);

  // Monthly Calendar States
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(6); // Default to July (month index 6) for 2026 Rath Yatra season
  const [currentCalendarYear] = useState(2026); // Fixed year 2026

  // Today's Festival State
  const [todaysFestivals, setTodaysFestivals] = useState([]);
  
  // Next Festival Countdown State
  const [nextFestival, setNextFestival] = useState(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [shareCopiedId, setShareCopiedId] = useState(null);

  const monthsList = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const categoriesList = [
    "All", "Major Festival", "Jagannath Ritual", "Local Temple Festival", 
    "Special Puja", "Ekadashi / Purnima / Amavasya", "Community Event"
  ];

  // Fetch data
  useEffect(() => {
    api.getFestivals().then(res => {
      // Sort festivals chronologically
      const sorted = res.sort((a, b) => new Date(a.date) - new Date(b.date));
      setFestivals(sorted);
      setFilteredFestivals(sorted);
      
      // Calculate today's festivals
      const todayStr = new Date().toISOString().split('T')[0];
      const currentYearToday = todayStr.replace(/^\d{4}/, '2026'); // Map today to 2026 calendar
      const foundToday = sorted.filter(f => f.date === currentYearToday && f.isPublished);
      setTodaysFestivals(foundToday);

      // Find next festival (chronologically today or in the future)
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const upcoming = sorted.filter(f => {
        const fDate = new Date(f.date).getTime();
        return fDate >= todayStart && f.isPublished;
      });
      if (upcoming.length > 0) {
        setNextFestival(upcoming[0]);
      } else if (sorted.length > 0) {
        // Wrap around if all festivals passed
        setNextFestival(sorted[0]);
      }
    });

    // Fetch notices for notices box
    api.getNotices().then(res => {
      const festivalNotices = res.filter(n => n.category === 'festival' || n.category === 'urgent');
      setNotices(festivalNotices);
    });
  }, []);

  // Filter & Search logic
  useEffect(() => {
    let result = festivals;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => 
        (f.festivalNameEnglish && f.festivalNameEnglish.toLowerCase().includes(q)) ||
        (f.festivalNameOdia && f.festivalNameOdia.includes(q)) ||
        (f.festivalNameHindi && f.festivalNameHindi.includes(q)) ||
        (f.shortDescription && f.shortDescription.toLowerCase().includes(q)) ||
        (f.fullDescription && f.fullDescription.toLowerCase().includes(q))
      );
    }

    // Month filter (only for grid/list view)
    if (selectedMonth !== 'All' && viewMode !== 'calendar') {
      result = result.filter(f => {
        const monthIndex = new Date(f.date).getMonth();
        return monthsList[monthIndex] === selectedMonth;
      });
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(f => f.category === selectedCategory);
    }

    setFilteredFestivals(result);
  }, [searchQuery, selectedMonth, selectedCategory, festivals, viewMode]);

  // Countdown timer logic
  useEffect(() => {
    if (!nextFestival) return;
    
    // Parse target date
    const targetDate = new Date(`${nextFestival.date}T08:00:00`).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextFestival]);

  // Translate helpers
  const getFestName = (fest) => {
    if (language === 'or') return fest.festivalNameOdia || fest.festivalNameEnglish;
    if (language === 'hi') return fest.festivalNameHindi || fest.festivalNameEnglish;
    return fest.festivalNameEnglish;
  };

  const getFestDesc = (fest) => {
    return fest.fullDescription || fest.shortDescription;
  };

  const getNoticeTitle = (notice) => {
    if (language === 'or') return notice.titleOr;
    if (language === 'hi') return notice.titleHi;
    return notice.titleEn;
  };

  // Add to Calendar .ics file download helper
  const downloadCalendarReminder = (fest) => {
    const title = getFestName(fest);
    const dateFormatted = fest.date.replace(/-/g, '');
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Sidheswar Temple Trust//Festival Calendar//EN
BEGIN:VEVENT
UID:uid-${fest.id}@shreejagannathtemplesidheswar.vercel.app
DTSTAMP:${dateFormatted}T000000Z
DTSTART:${dateFormatted}T080000Z
DTEND:${dateFormatted}T200000Z
SUMMARY:Temple Festival: ${title}
DESCRIPTION:${fest.shortDescription}
LOCATION:Sidheswar Shree Jagannath Temple, 9JMV+VVC, Sidhaswar, Odisha 761054
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fest.id}_reminder.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy share text helper
  const handleShareClick = (fest) => {
    const title = getFestName(fest);
    const dateStr = new Date(fest.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const shareText = `Explore the divine rituals of Lord Jagannath! Join us for the festival "${title}" at Sidheswar Shree Jagannath Temple, Digapahandi on ${dateStr}. Category: ${fest.category}. Guidelines: ${fest.visitorGuidelines || 'Follow queue lines.'} JAI JAGANNATH!`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      setShareCopiedId(fest.id);
      setTimeout(() => setShareCopiedId(null), 3000);
    });
  };

  // Calendar view helper structures
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
  };

  const handlePrevMonth = () => {
    setCurrentCalendarMonth(prev => (prev === 0 ? 11 : prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarMonth(prev => (prev === 11 ? 0 : prev + 1));
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentCalendarMonth, currentCalendarYear);
    const firstDay = getFirstDayOfMonth(currentCalendarMonth, currentCalendarYear);
    
    const cells = [];
    
    // Pad initial blank days
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`blank-${i}`} className="h-20 bg-slate-50/50 dark:bg-temple-darker/20 border border-saffron/5"></div>);
    }

    // Populate active calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(currentCalendarMonth + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${currentCalendarYear}-${monthStr}-${dayStr}`;

      const dayFestivals = festivals.filter(f => f.date === dateKey && f.isPublished);

      cells.push(
        <div 
          key={day} 
          onClick={() => {
            if (dayFestivals.length > 0) {
              setSelectedFestival(dayFestivals[0]);
            }
          }}
          className={`h-20 p-2 border border-saffron/10 flex flex-col justify-between cursor-pointer transition-all ${
            dayFestivals.length > 0 
              ? 'bg-gold/5 dark:bg-gold/10 hover:bg-gold/10 hover:shadow-inner border-l-4 border-l-saffron'
              : 'bg-white dark:bg-temple-dark hover:bg-slate-50'
          }`}
        >
          <span className={`text-xs font-bold font-outfit ${dayFestivals.length > 0 ? 'text-saffron-dark dark:text-gold' : 'text-temple-700 dark:text-cream-light/60'}`}>
            {day}
          </span>
          <div className="space-y-1 overflow-hidden">
            {dayFestivals.map(f => (
              <div 
                key={f.id} 
                className="text-[9px] truncate px-1.5 py-0.5 rounded font-extrabold text-glow bg-saffron text-white border border-saffron/20 max-w-full"
                title={getFestName(f)}
              >
                {getFestName(f)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900 pb-20">
      
      {/* Page Header Banner */}
      <div className="relative bg-temple-dark text-cream-light py-20 border-b border-gold/20 text-center">
        <div className="absolute inset-0 bg-[url('/assets/temple_chariot_sunset.jpg')] bg-cover bg-center opacity-25"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-glow text-white">
            {t('festivals')}
          </h2>
          <div className="mt-4 flex justify-center items-center gap-2">
            <span className="w-10 h-0.5 bg-gold"></span>
            <CalendarIcon size={20} className="text-gold" />
            <span className="w-10 h-0.5 bg-gold"></span>
          </div>
          
          {/* Today's Festival Badge */}
          {todaysFestivals.length > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-saffron text-white font-bold text-xs rounded-full shadow-lg animate-bounce">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <span>Today's Festival: {todaysFestivals.map(getFestName).join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8">
        
        {/* Next Festival Countdown Header Widget */}
        {nextFestival && (
          <div className="glass-card p-6 bg-gradient-to-r from-maroon via-maroon-light to-maroon text-cream-light flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-gold shadow-md">
            <div>
              <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Next Temple Festival Countdown</span>
              <h3 className="text-lg md:text-xl font-bold font-outfit text-white mt-1">
                {getFestName(nextFestival)}
              </h3>
              <p className="text-xs text-cream-light/75 mt-1 font-semibold">
                Date: {new Date(nextFestival.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} | Status: {nextFestival.status}
              </p>
            </div>
            
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-extrabold text-base border border-white/20 text-gold shadow-inner">
                  {countdown.days}
                </div>
                <span className="text-[9px] uppercase font-bold mt-1 text-cream-light/80">Days</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-extrabold text-base border border-white/20 text-gold shadow-inner">
                  {countdown.hours}
                </div>
                <span className="text-[9px] uppercase font-bold mt-1 text-cream-light/80">Hours</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-extrabold text-base border border-white/20 text-gold shadow-inner">
                  {countdown.minutes}
                </div>
                <span className="text-[9px] uppercase font-bold mt-1 text-cream-light/80">Mins</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-extrabold text-base border border-white/20 text-gold shadow-inner">
                  {countdown.seconds}
                </div>
                <span className="text-[9px] uppercase font-bold mt-1 text-cream-light/80">Secs</span>
              </div>
            </div>
          </div>
        )}

        {/* Notices box link */}
        {notices.length > 0 && (
          <div className="p-4 bg-amber-50 dark:bg-temple-darker border border-amber-200 dark:border-gold/30 text-amber-800 dark:text-gold text-xs rounded-xl flex items-start gap-2.5 shadow-sm font-semibold">
            <Info size={16} className="text-saffron shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold uppercase text-[10px] tracking-wider text-saffron block mb-1">Festival Alert Announcements</span>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                {notices.slice(0, 2).map(notice => (
                  <li key={notice.id}>{getNoticeTitle(notice)}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Toolbar & Filters */}
        <div className="glass-card p-6 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
          {/* Search bar */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="absolute left-3 top-3.5 text-temple-400" size={16} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by festival name..."
              className="w-full pl-10 pr-4 py-3 bg-temple-50 dark:bg-temple-darker border border-saffron/20 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-saffron focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full justify-start lg:justify-end">
            {/* Month Filter */}
            {viewMode !== 'calendar' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-temple-700 uppercase whitespace-nowrap">Month:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2.5 bg-temple-50 dark:bg-temple-darker border border-saffron/20 rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="All">All Months</option>
                  {monthsList.map((m, idx) => (
                    <option key={idx} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-temple-700 uppercase whitespace-nowrap">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2.5 bg-temple-50 dark:bg-temple-darker border border-saffron/20 rounded-xl text-xs font-bold focus:outline-none"
              >
                {categoriesList.map((c, idx) => (
                  <option key={idx} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>
            </div>

            {/* View Mode toggles */}
            <div className="flex gap-1.5 shrink-0 border-l border-saffron/10 pl-4">
              <button 
                onClick={() => setViewMode('calendar')}
                className={`p-2.5 rounded-lg flex items-center gap-1 text-xs font-bold ${viewMode === 'calendar' ? 'bg-saffron text-white shadow-sm' : 'hover:bg-saffron/10 text-temple-800 dark:text-cream-light'}`}
                title="Calendar Monthly Grid"
              >
                <CalendarIcon size={14} />
                <span className="hidden sm:inline">Monthly Grid</span>
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg flex items-center gap-1 text-xs font-bold ${viewMode === 'grid' ? 'bg-saffron text-white shadow-sm' : 'hover:bg-saffron/10 text-temple-800 dark:text-cream-light'}`}
                title="Grid View"
              >
                <Grid size={14} />
                <span className="hidden sm:inline">Grid Feed</span>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg flex items-center gap-1 text-xs font-bold ${viewMode === 'list' ? 'bg-saffron text-white shadow-sm' : 'hover:bg-saffron/10 text-temple-800 dark:text-cream-light'}`}
                title="List View"
              >
                <List size={14} />
                <span className="hidden sm:inline">List Feed</span>
              </button>
            </div>
          </div>
        </div>

        {/* Warning Notification Banner */}
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 text-xs rounded-xl font-bold flex items-start gap-2 leading-relaxed">
          <AlertTriangle className="text-rose-600 shrink-0 mt-0.5 animate-pulse" size={16} />
          <span>Notice: Festival dates and timings may change according to temple committee decisions, local tradition, and official announcements. Please verify schedules with the temple trust board closer to event dates.</span>
        </div>

        {/* Empty State */}
        {filteredFestivals.length === 0 && viewMode !== 'calendar' && (
          <div className="glass-card p-12 text-center text-temple-600 font-semibold border-t-4 border-maroon">
            <CalendarIcon size={48} className="text-maroon mx-auto mb-4 animate-bounce" />
            <p>No upcoming festivals found matching your search filters.</p>
            <button onClick={() => { setSearchQuery(''); setSelectedMonth('All'); setSelectedCategory('All'); }} className="mt-4 text-xs text-saffron underline font-bold">Reset Filters</button>
          </div>
        )}

        {/* 1. Monthly Calendar view */}
        {viewMode === 'calendar' && (
          <div className="glass-card p-6 border-t-4 border-maroon shadow-md space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-outfit text-maroon dark:text-gold flex items-center gap-2">
                <CalendarIcon className="text-saffron" />
                <span>{monthsList[currentCalendarMonth]} {currentCalendarYear} Calendar Grid</span>
              </h3>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevMonth} 
                  className="p-2 border border-saffron/20 hover:border-saffron text-saffron hover:bg-saffron/5 rounded-lg"
                >
                  <ArrowLeft size={16} />
                </button>
                <span className="text-xs font-bold font-outfit uppercase px-3 py-1.5 bg-temple-50 dark:bg-temple-darker border border-saffron/10 rounded-lg">
                  {monthsList[currentCalendarMonth]}
                </span>
                <button 
                  onClick={handleNextMonth} 
                  className="p-2 border border-saffron/20 hover:border-saffron text-saffron hover:bg-saffron/5 rounded-lg"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Weekdays Labels */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-temple-500 uppercase">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendarGrid()}
            </div>
            
            <div className="text-[10px] text-temple-500 font-semibold italic text-right">
              * Click on days with colored banners to view specific festival schedules and guidelines.
            </div>
          </div>
        )}

        {/* 2. Grid View */}
        {viewMode === 'grid' && filteredFestivals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFestivals.map((fest) => (
              <div key={fest.id} className="glass-card flex flex-col justify-between overflow-hidden border-b-4 border-transparent hover:border-saffron hover:shadow-md transition-all duration-300">
                <div className="h-44 bg-slate-200 relative overflow-hidden">
                  <img 
                    src={fest.imageUrl || "/assets/temple_spire_flags.jpg"} 
                    alt={fest.festivalNameEnglish} 
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => { e.target.src = "/assets/temple_spire_flags.jpg"; }}
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-maroon/90 text-gold rounded-full text-xs font-bold font-outfit shadow-md">
                    {new Date(fest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  {fest.status.includes('Tentative') && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500/90 text-white rounded text-[9px] font-bold shadow-md">
                      Tentative
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-saffron uppercase tracking-widest">{fest.category}</span>
                    <h3 className="text-base font-bold font-outfit text-maroon dark:text-gold mt-0.5">{getFestName(fest)}</h3>
                    <p className="text-xs text-temple-600 leading-relaxed mt-2 line-clamp-3 font-semibold">
                      {getFestDesc(fest)}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-saffron/10 flex items-center justify-between">
                    <button 
                      onClick={() => setSelectedFestival(fest)}
                      className="px-4 py-2 bg-saffron hover:bg-saffron-dark text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      View Details
                    </button>
                    
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleShareClick(fest)}
                        className="p-2 border border-saffron/20 hover:border-saffron text-saffron hover:bg-saffron/5 rounded-lg text-xs font-bold relative"
                        title="Share Festival"
                      >
                        <Share2 size={13} />
                        {shareCopiedId === fest.id && (
                          <span className="absolute bottom-8 right-0 bg-black text-white text-[9px] p-1 rounded whitespace-nowrap">Copied!</span>
                        )}
                      </button>
                      <button 
                        onClick={() => downloadCalendarReminder(fest)}
                        className="p-2 border border-saffron/20 hover:border-saffron text-saffron hover:bg-saffron/5 rounded-lg text-xs font-bold"
                        title="Add to Calendar (.ics)"
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. List View */}
        {viewMode === 'list' && filteredFestivals.length > 0 && (
          <div className="space-y-4">
            {filteredFestivals.map((fest) => (
              <div key={fest.id} className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-sm transition-shadow border-l-4 border-l-transparent hover:border-l-saffron">
                <div className="flex items-center gap-4 w-full sm:w-2/3">
                  <div className="w-16 h-16 bg-saffron/10 text-saffron rounded-xl flex flex-col items-center justify-center shrink-0 border border-saffron/20 font-outfit">
                    <span className="text-xs font-semibold uppercase">{new Date(fest.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-lg font-extrabold -mt-1">{new Date(fest.date).getDate()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-saffron uppercase tracking-widest">{fest.category}</span>
                      {fest.status.includes('Tentative') && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">Tentative</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-temple-900 dark:text-cream-light mt-0.5">{getFestName(fest)}</h3>
                    <p className="text-xs text-temple-600 line-clamp-1 mt-1 font-semibold">{getFestDesc(fest)}</p>
                  </div>
                </div>

                <div className="flex gap-2.5 shrink-0 w-full sm:w-auto justify-end">
                  <button 
                    onClick={() => setSelectedFestival(fest)}
                    className="px-4 py-2 bg-saffron hover:bg-saffron-dark text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleShareClick(fest)}
                    className="p-2 border border-saffron/20 hover:border-saffron text-saffron hover:bg-saffron/5 rounded-lg text-xs relative"
                    title="Share Festival"
                  >
                    <Share2 size={13} />
                    {shareCopiedId === fest.id && (
                      <span className="absolute bottom-8 right-0 bg-black text-white text-[9px] p-1 rounded whitespace-nowrap">Copied!</span>
                    )}
                  </button>
                  <button 
                    onClick={() => downloadCalendarReminder(fest)}
                    className="p-2 border border-saffron/20 text-saffron rounded-lg text-xs hover:bg-saffron/5"
                    title="Add to Calendar"
                  >
                    <Download size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Festival Detail Modal Popup */}
      {selectedFestival && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-temple-dark rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-gold/30 shadow-2xl animate-slide-up">
            <div className="p-6 border-b border-saffron/10 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-saffron uppercase tracking-widest">{selectedFestival.category}</span>
                <h3 className="text-xl font-bold font-outfit text-maroon dark:text-gold flex items-center gap-2 mt-0.5">
                  <CalendarIcon className="text-saffron" size={20} />
                  <span>{getFestName(selectedFestival)}</span>
                </h3>
              </div>
              <button 
                onClick={() => setSelectedFestival(null)}
                className="text-temple-500 hover:text-maroon font-bold text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Event Image Banner with containment rule */}
              <div className="h-56 bg-temple-100 dark:bg-temple-darker rounded-xl overflow-hidden border border-saffron/10">
                <img 
                  src={selectedFestival.imageUrl || "/assets/temple_spire_flags.jpg"} 
                  alt={selectedFestival.festivalNameEnglish}
                  className="w-full h-full object-contain object-center"
                  onError={(e) => { e.target.src = "/assets/temple_spire_flags.jpg"; }}
                />
              </div>

              {/* Status Alert block */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                selectedFestival.status.includes('Confirmed')
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <AlertTriangle className={selectedFestival.status.includes('Confirmed') ? 'text-emerald-600 shrink-0 mt-0.5' : 'text-amber-600 shrink-0 mt-0.5'} size={18} />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Festival Schedule Status</h4>
                  <p className="text-xs font-semibold mt-1">
                    {selectedFestival.status}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-saffron uppercase tracking-wider">About the Rituals</h4>
                <p className="text-xs md:text-sm text-temple-700 dark:text-cream-light/90 leading-relaxed font-semibold">
                  {getFestDesc(selectedFestival)}
                </p>
              </div>

              {/* Ritual Schedule */}
              {selectedFestival.ritualSchedule && (
                <div className="p-4 bg-temple-50 dark:bg-temple-darker border border-saffron/10 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-maroon dark:text-gold uppercase tracking-wider flex items-center gap-1">
                    <Clock size={14} />
                    <span>Special Ritual Schedule</span>
                  </h4>
                  <p className="text-xs text-temple-700 dark:text-cream-light/80 leading-relaxed font-semibold whitespace-pre-line">
                    {selectedFestival.ritualSchedule}
                  </p>
                </div>
              )}

              {/* Timing changes & guidelines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-saffron/10">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-saffron uppercase tracking-wider flex items-center gap-1">
                    <Clock size={14} />
                    <span>Darshan Timings ({selectedFestival.startTime || 'Morning'} - {selectedFestival.endTime || 'Night'})</span>
                  </h4>
                  <p className="text-xs text-temple-600 dark:text-cream-light/70 leading-relaxed font-semibold">
                    The temple gates open early at {selectedFestival.startTime || '05:00 AM'}. Rituals will continue until closure at {selectedFestival.endTime || '09:30 PM'}. Timings are subject to change.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-saffron uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={14} />
                    <span>Parking & Visitor Information</span>
                  </h4>
                  <p className="text-xs text-temple-600 dark:text-cream-light/70 leading-relaxed font-semibold">
                    {selectedFestival.parkingInformation || 'Standard parking is available at the High School Bypass ground. Rickshaws operate to the temple.'}
                  </p>
                </div>
              </div>

              {/* Guidelines & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-saffron/10">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-saffron uppercase tracking-wider flex items-center gap-1">
                    <Info size={14} />
                    <span>Visitor Guidelines</span>
                  </h4>
                  <p className="text-xs text-temple-600 dark:text-cream-light/70 leading-relaxed font-semibold">
                    {selectedFestival.visitorGuidelines || 'Devotees are requested to maintain line queue discipline, keep footwear at outer counters, and cooperate with volunteers.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-saffron uppercase tracking-wider flex items-center gap-1">
                    <Phone size={14} />
                    <span>Emergency Contact Office</span>
                  </h4>
                  <p className="text-xs text-temple-600 dark:text-cream-light/70 leading-relaxed font-semibold">
                    Office Contact: {selectedFestival.contactInformation || '+91 93378 22942'}
                  </p>
                </div>
              </div>

              {/* Warning clause */}
              <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold italic leading-relaxed">
                * Note: VIP darshan passes or paid entries are NOT available. The temple committee strongly forbids paid prioritization bookings.
              </p>
            </div>

            {/* Modal Footer with Last Updated date */}
            <div className="p-6 bg-temple-50 dark:bg-temple-darker border-t border-saffron/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10px] text-temple-500 font-semibold">
                Information Last Updated: {new Date(selectedFestival.lastUpdated || selectedFestival.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleShareClick(selectedFestival)}
                  className="px-4 py-2 border border-saffron text-saffron hover:bg-saffron/5 font-bold rounded-lg text-xs flex items-center gap-1.5 relative"
                >
                  <Share2 size={13} />
                  <span>Share</span>
                  {shareCopiedId === selectedFestival.id && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-[9px] p-1 rounded whitespace-nowrap">Copied!</span>
                  )}
                </button>
                <button 
                  onClick={() => downloadCalendarReminder(selectedFestival)}
                  className="px-4 py-2 border border-saffron text-saffron hover:bg-saffron/5 font-bold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Add to Calendar</span>
                </button>
                <button 
                  onClick={() => setSelectedFestival(null)}
                  className="px-4 py-2 bg-maroon text-cream-light hover:bg-maroon-light font-bold rounded-lg text-xs"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
