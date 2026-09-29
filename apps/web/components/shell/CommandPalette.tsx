'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ShellSection } from './Sidebar';
import { BarChart3, Bell, Database, FlaskConical, Map, Search, ShieldCheck, X } from 'lucide-react';

type CommandItem = {
  label: string;
  group: string;
  icon: React.ComponentType<{ size?: number }>;
};

const items: CommandItem[] = [
  { label: 'Live Map', group: 'Navigation', icon: Map },
  { label: 'Weather Layers', group: 'Navigation', icon: Map },
  { label: 'Analytics', group: 'Navigation', icon: BarChart3 },
  { label: 'Alerts', group: 'Navigation', icon: Bell },
  { label: 'Scenario Lab', group: 'Intelligence', icon: FlaskConical },
  { label: 'Evidence Explorer', group: 'Intelligence', icon: ShieldCheck },
  { label: 'Admin Panel', group: 'System', icon: Database },
];

export function CommandPalette({onNavigate}:{onNavigate:(section:ShellSection)=>void}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(value => !value);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filtered = useMemo(
    () => items.filter(item => item.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  if (!open) return null;

  return (
    <div className="command-overlay" role="dialog" aria-modal="true" aria-label="MEGHNETRA command palette">
      <button className="command-backdrop" aria-label="Close command palette" onClick={() => setOpen(false)} />
      <section className="command-palette">
        <header className="command-header">
          <Search size={17} />
          <input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search MEGHNETRA..." />
          <kbd>ESC</kbd>
          <button aria-label="Close" onClick={() => setOpen(false)}><X size={16} /></button>
        </header>
        <div className="command-hint">Navigate the national weather intelligence console</div>
        <div className="command-results">
          {filtered.map(({ label, group, icon: Icon }) => (
            <button key={label} className="command-item" onClick={() => { onNavigate(label as ShellSection); setOpen(false); }}>
              <span className="command-item-icon"><Icon size={15} /></span>
              <span>{label}</span>
              <small>{group}</small>
            </button>
          ))}
          {!filtered.length && <div className="command-empty">No MEGHNETRA command matches.</div>}
        </div>
      </section>
    </div>
  );
}
