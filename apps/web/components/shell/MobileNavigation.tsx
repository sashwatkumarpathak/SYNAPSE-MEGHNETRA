'use client';

import type { ShellSection } from './Sidebar';

type MobileNavigationProps = {
  open: boolean;
  active: ShellSection;
  onNavigate: (section: ShellSection) => void;
  onClose: () => void;
};

const sections: ShellSection[] = [
  'Live Map','Weather Layers','Reports','Analytics','Alerts',
  'Scenario Lab','Evidence Explorer','Admin Panel',
];

export function MobileNavigation({ open, active, onNavigate, onClose }: MobileNavigationProps) {
  if (!open) return null;

  return (
    <div className="mobile-nav-overlay" role="dialog" aria-label="MEGHNETRA navigation">
      <button className="mobile-nav-backdrop" onClick={onClose} aria-label="Close navigation"/>
      <div className="mobile-nav-sheet">
        <div className="mobile-nav-title">MEGHNETRA <span>COMMAND</span></div>
        {sections.map(section => (
          <button
            key={section}
            className={active === section ? 'active' : ''}
            onClick={() => { onNavigate(section); onClose(); }}
          >
            {section}
          </button>
        ))}
      </div>
    </div>
  );
}
