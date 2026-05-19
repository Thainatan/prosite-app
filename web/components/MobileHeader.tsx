'use client';
import { Menu, Bell } from 'lucide-react';

export default function MobileHeader() {
  const openSidebar = () => {
    window.dispatchEvent(new CustomEvent('open-sidebar'));
  };

  return (
    <header className="mobile-header">
      <button className="mobile-header-btn" onClick={openSidebar} aria-label="Open menu">
        <Menu size={22} color="#1C2B3A" strokeWidth={2}/>
      </button>

      <div className="mobile-header-logo">
        <div style={{ width: 28, height: 28, borderRadius: 7, background: '#C4685A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 7, fontWeight: 300, letterSpacing: '0.05em', color: '#E8C4BC' }}>finesse.</span>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 300, letterSpacing: '0.05em', color: '#1C2B3A', lineHeight: 1.1 }}>finesse.</div>
          <div style={{ fontSize: 8, fontWeight: 600, color: '#C4685A', letterSpacing: '0.08em' }}>REMODELING OS</div>
        </div>
      </div>

      <button className="mobile-header-btn" aria-label="Notifications">
        <div style={{ position: 'relative' }}>
          <Bell size={22} color="#1C2B3A" strokeWidth={1.8}/>
          {/* Notification dot */}
          <div style={{
            position: 'absolute', top: -2, right: -2,
            width: 8, height: 8, borderRadius: '50%',
            background: '#C4685A', border: '1.5px solid white',
          }}/>
        </div>
      </button>
    </header>
  );
}
