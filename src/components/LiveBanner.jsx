import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

// Red bar at the very top of every page while a live arati / pujan is on
export default function LiveBanner() {
  const [live, setLive] = useState(null);
  useEffect(() => {
    let stop = false;
    const load = () => api.getLive().then((l) => { if (!stop) setLive(l); }).catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => { stop = true; clearInterval(t); };
  }, []);
  if (!live?.isLive) return null;
  return (
    <Link to="/live" className="block bg-red-700 text-white text-center text-xs sm:text-sm font-bold py-2 px-3 hover:bg-red-800">
      <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse mr-2 align-middle"></span>
      LIVE NOW: {live.title || (live.kind === 'pujan' ? 'Live Pujan' : 'Live Arati')} &mdash; Watch now &rarr;
    </Link>
  );
}
