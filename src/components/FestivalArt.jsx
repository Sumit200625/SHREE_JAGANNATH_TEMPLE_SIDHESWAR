import React from 'react';
import { Flame, Sun, Moon, Flower2, Droplets, Music, BookOpen, Sparkles, Gift, Star, Wheat, Palette, Bell, Waves } from 'lucide-react';

// Illustrated banner for each festival (instead of repeating temple photographs).
const THEMES = {
  chariot: ['#7a0f0f', '#e35f24'], water: ['#0e5a7a', '#38bdf8'], lamp: ['#4a1d00', '#f59e0b'], sun: ['#9a3412', '#fbbf24'],
  moon: ['#1e1b4b', '#818cf8'], trident: ['#1f2937', '#6366f1'], colors: ['#be185d', '#f59e0b'], lotus: ['#9d174d', '#f472b6'],
  flute: ['#1e3a8a', '#38bdf8'], book: ['#14532d', '#facc15'], harvest: ['#365314', '#fbbf24'], mandala: ['#7a0f0f', '#d4af37'],
};
const base = (id) => String(id || '').replace(/_\d{4}$/, '');
const MOTIF = {
  fest_1: 'chariot', fest_13: 'chariot', fest_14: 'chariot', fest_12: 'chariot', fest_11: 'chariot', fest_15: 'chariot',
  fest_2: 'water', fest_9: 'water', fest_10: 'mandala',
  fest_3: 'sun', fest_7: 'sun', fest_24: 'sun',
  fest_4: 'book', fest_23: 'book',
  fest_5: 'trident', fest_6: 'colors', fest_8: 'lotus',
  fest_16: 'flute', fest_17: 'mandala', fest_18: 'harvest',
  fest_19: 'lotus', fest_20: 'moon', fest_21: 'lamp', fest_22: 'lamp',
};
const ART = { ekadashi: 'lamp', purnima: 'moon', amavasya: 'moon' };

const Chariot = () => (
  <g fill="none" stroke="#fff7e6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M60 150h120M70 150v-40h100v40" />
    <path d="M78 110V84h84v26M88 84V62h64v22M98 62V44h44v18" />
    <path d="M120 44V26M120 26l16 6-16 6" />
    <circle cx="86" cy="158" r="14" /><circle cx="154" cy="158" r="14" />
    <path d="M86 144v28M72 158h28M154 144v28M140 158h28" strokeWidth="2" />
  </g>
);
const Trident = () => (
  <g fill="none" stroke="#fff7e6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M120 40v130" /><path d="M92 62v22a28 28 0 0 0 56 0V62" /><path d="M92 62l-6-14M148 62l6-14M120 40l-6 14M120 40l6 14" />
    <path d="M104 118l16 12 16-12" strokeWidth="3" /><path d="M170 52a30 30 0 1 1-36-22 24 24 0 0 0 36 22z" strokeWidth="3" />
  </g>
);
const Kalash = () => (
  <g fill="none" stroke="#fff7e6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M92 70h56M100 70c-18 20-22 52-6 78h52c16-26 12-58-6-78" /><path d="M96 148h48" />
    <path d="M120 70V54M104 54c0-14 32-14 32 0" /><path d="M108 40c0-12 24-12 24 0" />
    <path d="M84 176c12-8 24-8 36 0s24 8 36 0" /><path d="M96 190c10-6 18-6 28 0s18 6 28 0" strokeWidth="2.5" />
  </g>
);

export default function FestivalArt({ festival, className = '', tall = false }) {
  const motif = ART[festival?.art] || MOTIF[base(festival?.baseId || festival?.id)] || 'mandala';
  const [c1, c2] = THEMES[motif] || THEMES.mandala;
  const gid = `fa-${motif}`;
  const icon = { sun: Sun, moon: Moon, colors: Palette, lotus: Flower2, flute: Music, book: BookOpen, harvest: Wheat, lamp: Flame, mandala: Sparkles }[motif];
  const Icon = icon;
  return (
    <div className={`relative overflow-hidden ${className}`} role="img" aria-label={festival?.festivalNameEnglish || 'Festival'}>
      <svg viewBox="0 0 240 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient>
          <radialGradient id={`${gid}-g`} cx="50%" cy="45%" r="55%"><stop offset="0" stopColor="#fff" stopOpacity=".28" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="240" height="200" fill={`url(#${gid})`} />
        <g stroke="#fff" strokeOpacity=".16" fill="none" strokeWidth="1.2">
          {[28, 52, 76, 100, 124].map((r) => <circle key={r} cx="120" cy="100" r={r} />)}
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1="120" y1="100" x2={120 + 130 * Math.cos((i * Math.PI) / 6)} y2={100 + 130 * Math.sin((i * Math.PI) / 6)} />)}
        </g>
        <circle cx="120" cy="100" r="80" fill={`url(#${gid}-g)`} />
        {motif === 'chariot' && <Chariot />}
        {motif === 'trident' && <Trident />}
        {motif === 'water' && <Kalash />}
      </svg>
      {Icon && (
        <div className="absolute inset-0 flex items-center justify-center text-white/95 drop-shadow-lg">
          <Icon size={tall ? 110 : 76} strokeWidth={1.6} />
        </div>
      )}
    </div>
  );
}
