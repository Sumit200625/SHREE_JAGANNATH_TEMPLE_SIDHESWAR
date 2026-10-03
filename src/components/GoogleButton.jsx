import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';

let gsiPromise;
const loadGsi = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  gsiPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = resolve;
    s.onerror = () => { gsiPromise = null; reject(new Error('Could not load Google Sign-In.')); };
    document.head.appendChild(s);
  });
  return gsiPromise;
};

// Real "Continue with Google" button. The ID token is verified on the server.
export default function GoogleButton({ onCredential, onError }) {
  const ref = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | unavailable

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { googleClientId } = await api.config();
        if (!googleClientId) { setStatus('unavailable'); return; }
        await loadGsi();
        if (cancelled || !ref.current) return;
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (r) => onCredential(r.credential),
          ux_mode: 'popup',
        });
        const width = Math.min(340, ref.current.parentElement?.clientWidth || 320);
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', logo_alignment: 'left', width,
        });
        setStatus('ready');
      } catch (e) {
        setStatus('unavailable');
        onError?.(e.message);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center min-h-[44px]">
      <div ref={ref} />
      {status === 'loading' && <span className="text-xs text-temple-500 font-semibold">Loading Google sign-in…</span>}
      {status === 'unavailable' && <span className="text-xs text-rose-700 font-semibold">Google sign-in is unavailable right now. Use email below.</span>}
    </div>
  );
}
