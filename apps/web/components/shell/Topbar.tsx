'use client';

import { Bell, Menu, Search, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { CommandPalette } from './CommandPalette';
import { SystemStatus } from './SystemStatus';
import type { ShellSection } from './Sidebar';

type TopbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onMenu: () => void;
  onNavigate: (section: ShellSection) => void;
};

export function Topbar({ query, onQueryChange, onMenu, onNavigate }: TopbarProps) {
  const [notifications,setNotifications]=useState(false);
  return (
    <header className="topbar">
      <button className="hamb" onClick={onMenu} aria-label="Open navigation"><Menu/></button>
      <div className="search">
        <Search size={18}/>
        <input value={query} onChange={event => onQueryChange(event.target.value)} placeholder="Search city, state, event or coordinates…"/>
        <kbd>⌘ K</kbd>
      </div>
      <CommandPalette onNavigate={onNavigate}/>
      <div className="top-actions">
        <SystemStatus compact/>
        <div className="live-pill"><span className="live-dot"/>LIVE <b>DEMO FEED</b></div>
        <button className="icon-btn" aria-label="Notifications" onClick={()=>setNotifications(v=>!v)}><Bell size={18}/><i/></button>
        <div className="avatar" title="SYNAPSE operator">S</div>
      </div>
      {notifications && <div className="notification-popover"><div className="popover-head"><b>Signal inbox</b><button onClick={()=>setNotifications(false)}><X size={14}/></button></div><div className="notification-item"><ShieldCheck size={14}/><span><b>7 verified sources</b><small>Visakhapatnam rainfall signal</small></span></div><div className="notification-item"><Bell size={14}/><span><b>12 alert signals</b><small>Review queue ready</small></span></div></div>}
    </header>
  );
}
