'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { SystemStatus } from './SystemStatus';

type TopbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onMenu: () => void;
};

export function Topbar({ query, onQueryChange, onMenu }: TopbarProps) {
  return (
    <header className="topbar">
      <button className="hamb" onClick={onMenu} aria-label="Open navigation"><Menu/></button>
      <div className="search">
        <Search size={18}/>
        <input
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder="Search city, state, event or coordinates…"
        />
        <kbd>⌘ K</kbd>
      </div>
      <CommandPalette/>
      <div className="top-actions">
        <SystemStatus compact/>
        <div className="live-pill"><span className="live-dot"/>LIVE <b>13:24 IST</b></div>
        <button className="icon-btn" aria-label="Notifications"><Bell size={18}/><i/></button>
        <div className="avatar">S</div>
      </div>
    </header>
  );
}
