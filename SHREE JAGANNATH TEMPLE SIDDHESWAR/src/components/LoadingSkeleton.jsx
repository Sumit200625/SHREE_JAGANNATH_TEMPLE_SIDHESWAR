import React from 'react';

// Chakra Fullscreen Spinner
export function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-darker flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 text-saffron animate-spin-slow">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="3" fill="none" className="stroke-saffron" />
            <circle cx="50" cy="50" r="12" fill="currentColor" className="fill-gold" />
            <path d="M 50 5 L 50 95 M 5 50 L 95 50 M 18 18 L 82 82 M 18 82 L 82 18" stroke="currentColor" strokeWidth="2.5" className="stroke-saffron" />
            <path d="M 50 20 L 50 35 M 50 65 L 50 80 M 20 50 L 35 50 M 65 50 L 80 50" stroke="currentColor" strokeWidth="3.5" className="stroke-gold" />
          </svg>
        </div>
        <p className="text-maroon dark:text-gold font-bold font-outfit text-lg tracking-widest animate-pulse">
          JAI JAGANNATH
        </p>
      </div>
    </div>
  );
}

// Notice board item skeleton card
export function NoticeSkeleton() {
  return (
    <div className="p-5 bg-white dark:bg-temple-dark rounded-xl border border-saffron/10 space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      </div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6"></div>
      </div>
    </div>
  );
}

// Grid list card skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-temple-dark border border-saffron/10 rounded-2xl overflow-hidden space-y-4 animate-pulse">
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-2/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-24 pt-2"></div>
      </div>
    </div>
  );
}

// Timings Schedule card skeleton
export function TimingCardSkeleton() {
  return (
    <div className="p-6 bg-white dark:bg-temple-dark border border-saffron/10 rounded-2xl flex gap-4 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0"></div>
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3"></div>
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-24"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
      </div>
    </div>
  );
}
