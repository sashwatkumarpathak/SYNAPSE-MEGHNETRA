'use client';

import { Bell, Menu, Search, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import type { WeatherEvent } from '@/lib/demo-data';
import { CommandPalette } from './CommandPalette';
import type { ShellSection } from './Sidebar';

type TopbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onMenu: () => void;
  onNavigate: (section: ShellSection) => void;
  searchResults: WeatherEvent[];
  onSearchSelect: (event: WeatherEvent) => void;
};

export function Topbar({ query, onQueryChange, onMenu, onNavigate, searchResults, onSearchSelect }: TopbarProps) {
  const [notifications,setNotifications]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  return (
    <header className="topbar">
      <button className="hamb" onClick={onMenu} aria-label="Open navigation"><Menu/></button>
      <div className="search">
        <Search size={18}/>
        <input
          value={query}
          onChange={event => { onQueryChange(event.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(Boolean(query))}
          onKeyDown={event => {
            if (event.key === 'Enter' && searchResults[0]) {
              onSearchSelect(searchResults[0]);
              setSearchOpen(false);
            }
            if (event.key === 'Escape') setSearchOpen(false);
          }}
          placeholder="Search city, state, event or coordinates…"
          aria-label="Search weather intelligence"
        />
        <kbd>⌘ K</kbd>
        {searchOpen && query && (
          <div className="global-search-results">
            {searchResults.length ? searchResults.slice(0,5).map(event => (
              <button key={event.id} onMouseDown={e=>e.preventDefault()} onClick={() => { onSearchSelect(event); setSearchOpen(false); }}>
                <span><b>{event.city}</b><small>{event.type} · {event.state}</small></span>
                <strong>{event.confidence}%</strong>
              </button>
            )) : <div className="search-empty">No matching weather event. Try a city, state or event name.</div>}
          </div>
        )}
      </div>
      <CommandPalette onNavigate={onNavigate}/>
      <div className="top-actions">
        <div className="live-pill"><span className="live-dot"/>LIVE <b>DEMO FEED</b></div>
        <button className="icon-btn" aria-label="Notifications" onClick={()=>setNotifications(v=>!v)}><Bell size={18}/><i/></button>
        <div className="avatar" title="SYNAPSE operator">S</div>
      </div>
      {notifications && <div className="notification-popover"><div className="popover-head"><b>Signal inbox</b><button onClick={()=>setNotifications(false)}><X size={14}/></button></div><div className="notification-item"><ShieldCheck size={14}/><span><b>7 verified sources</b><small>Visakhapatnam rainfall signal</small></span></div><div className="notification-item"><Bell size={14}/><span><b>12 alert signals</b><small>Review queue ready</small></span></div></div>}
    </header>
  );
}
