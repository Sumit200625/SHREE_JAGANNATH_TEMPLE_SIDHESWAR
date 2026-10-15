import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/client';

// Real subscription form: saves the mobile number / email so the temple office can send notices.
export default function SubscribeBox() {
  const { t } = useLanguage();
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    setStatus('loading');
    setError('');
    try {
      await api.subscribe(value.trim());
      setStatus('done');
      setValue('');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  return (
    <section className="glass-card rounded-2xl p-8 md:p-12 text-center shadow-md">
      <h2 className="text-2xl font-bold font-outfit mb-2 flex items-center justify-center gap-2">
        <Mail size={20} className="text-gold" />
        {t('subscribeTitle')}
      </h2>
      <p className="text-temple-500 mb-6 max-w-xl mx-auto">{t('subscribeDesc')}</p>

      {status === 'done' ? (
        <p className="text-green-700 font-semibold">Thank you! You are subscribed to temple notices.</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <input
            type="text"
            inputMode="email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('subscribePlaceholder')}
            aria-label="Mobile number or email"
            className="flex-grow px-4 py-3 rounded-full border border-gold/30 bg-cream text-temple-900 focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 rounded-full bg-saffron hover:bg-saffron-dark text-white font-semibold transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? '...' : t('subscribeBtn')}
          </button>
        </form>
      )}
      {error && <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p>}
    </section>
  );
}
