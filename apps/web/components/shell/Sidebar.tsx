'use client';

import type { ComponentType } from 'react';
import { Database, Globe2, Layers3, Radio, ShieldCheck, Sparkles, Bell, X } from 'lucide-react';

export type ShellSection =
  | 'Live Map' | 'Weather Layers' | 'Reports' | 'Analytics' | 'Alerts'
  | 'Scenario Lab' | 'Evidence Explorer' | 'Admin Panel';

const primary: Array<[ShellSection, ComponentType<{size?: number}>]> = [
  ['Live Map', Globe2],
  ['Weather Layers', Layers3],
  ['Reports', Database],
  ['Analytics', Sparkles],
  ['Alerts', Bell],
];

type SidebarProps = {
  active: ShellSection;
  mobileOpen: boolean;
  onNavigate: (section: ShellSection) => void;
  onClose: () => void;
};

export function Sidebar({ active, mobileOpen, onNavigate, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand">
        <img src="/synapse-logo.png" alt="SYNAPSE" />
        <div>
          <div className="brand-name">MEGH<span>NETRA</span></div>
          <small>WEATHER INTELLIGENCE</small>
        </div>
        <button className="mobile-close" onClick={onClose} aria-label="Close navigation"><X size={18}/></button>
      </div>

      <nav aria-label="Primary navigation">
        {primary.map(([name, Icon]) => (
          <button
            key={name}
            className={active === name ? 'active' : ''}
            onClick={() => onNavigate(name)}
          >
            <Icon size={18}/>
            <span>{name}</span>
            {name === 'Alerts' && <em>12</em>}
          </button>
        ))}

        <div className="nav-divider"/>

        <button className={active === 'Scenario Lab' ? 'active' : ''} onClick={() => onNavigate('Scenario Lab')}>
          <Radio size={18}/><span>Scenario Lab</span><span className="soon">LAB</span>
        </button>
        <button className={active === 'Evidence Explorer' ? 'active' : ''} onClick={() => onNavigate('Evidence Explorer')}>
          <ShieldCheck size={18}/><span>Evidence Explorer</span>
        </button>
        <button className={active === 'Admin Panel' ? 'active' : ''} onClick={() => onNavigate('Admin Panel')}>
          <Database size={18}/><span>Admin Panel</span>
        </button>
      </nav>

      <div className="sidebar-foot">
        <div className="system">
          <span className="live-dot"/>
          <div><b>System operational</b><small>46 providers connected</small></div>
        </div>
        <div className="version">MEGHNETRA <span>v0.1 prototype</span></div>
      </div>
    </aside>
  );
}
