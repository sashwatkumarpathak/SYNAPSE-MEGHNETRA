'use client';

import { useEffect, useState } from 'react';

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(6);

  useEffect(() => {
    const started = performance.now();
    const duration = 2300;

    const timer = window.setInterval(() => {
      const elapsed = performance.now() - started;
      const ratio = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - ratio, 1.7);
      setProgress(Math.max(6, Math.min(100, Math.round(eased * 100))));
    }, 60);

    const done = window.setTimeout(onDone, duration);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div className="loading-screen" aria-label="Loading SYNAPSE-MEGHNETRA">
      <div className="loading-grid" />
      <div className="loading-vignette" />
      <div className="loading-hud hud-left" />
      <div className="loading-hud hud-right" />

      <div className="loading-art">
        <img
          src="/SYNAPSE-MEGHNETRA Logo.png"
          alt="SYNAPSE-MEGHNETRA — Real Data, Reliable Insights, A Safer India"
        />
        <div className="loading-sweep" />
        <div className="loading-focus-ring" />
      </div>

      <div className="loading-scanline" />
      <div className="loading-status">
        <span className="loading-status-dot" />
        <span>ESTABLISHING NATIONAL WEATHER INTELLIGENCE GRAPH</span>
        <b>{progress}%</b>
      </div>

      <div className="loading-progress">
        <i style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-meta">
        <span>REAL DATA</span>
        <span>RELIABLE INSIGHTS</span>
        <span>A SAFER INDIA</span>
      </div>
    </div>
  );
}
