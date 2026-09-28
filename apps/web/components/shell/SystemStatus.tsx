'use client';

import { Activity, Radio, Wifi } from 'lucide-react';

type SystemStatusProps = { compact?: boolean; sources?: number };

export function SystemStatus({ compact = false, sources = 46 }: SystemStatusProps) {
  return (
    <div className={compact ? 'system-status compact' : 'system-status'} aria-label="MEGHNETRA system status">
      <span className="system-status-live" />
      {!compact && (
        <>
          <span className="system-status-label">SYSTEM OPERATIONAL</span>
          <span className="system-status-divider" />
          <span className="system-status-item"><Wifi size={11} /> Connected</span>
          <span className="system-status-item"><Radio size={11} /> Live</span>
          <span className="system-status-item"><Activity size={11} /> {sources} sources</span>
        </>
      )}
    </div>
  );
}
