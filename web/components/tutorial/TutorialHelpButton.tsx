'use client';
import { useState, useEffect, useRef } from 'react';
import { HelpCircle, RotateCcw, Play, List, EyeOff, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTutorial } from './TutorialContext';
import { TUTORIALS, shouldShowTutorial } from '../../lib/tutorials';

const PAGE_TUTORIAL_MAP: Record<string, string> = {
  '/dashboard': 'welcome',
  '/clients': 'create_client',
  '/quotes/new': 'create_quote',
  '/schedule': 'create_task',
  '/settings': 'settings_setup',
};

export default function TutorialHelpButton() {
  const pathname = usePathname();
  const { startTutorial, isDisabled, setDisabled, getTutorialStatus, resetTutorial } = useTutorial();
  const [open, setOpen] = useState(false);
  const [badge, setBadge] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pageTutorialId = PAGE_TUTORIAL_MAP[pathname] || null;

  useEffect(() => {
    if (pageTutorialId) {
      setBadge(shouldShowTutorial(pageTutorialId));
    } else {
      setBadge(false);
    }
  }, [pathname, pageTutorialId]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (isDisabled) return null;

  return (
    <div ref={menuRef} style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9000, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Menu */}
      {open && (
        <div style={{
          position: 'absolute', bottom: 56, right: 0, width: 220,
          background: 'white', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          border: '1px solid #E8E4DF', overflow: 'hidden',
          animation: 'tutorialFadeIn 0.15s ease-out',
        }}>
          <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tutorials</div>
          </div>

          {pageTutorialId && (
            <MenuItem
              icon={<RotateCcw size={13} />}
              label="Restart page tutorial"
              color="#E8834A"
              onClick={() => {
                setOpen(false);
                resetTutorial(pageTutorialId);
                startTutorial(pageTutorialId);
              }}
            />
          )}

          <MenuItem
            icon={<Play size={13} />}
            label="Start full tour"
            color="#4F7EF7"
            onClick={() => {
              setOpen(false);
              startTutorial('welcome');
            }}
          />

          <MenuItem
            icon={<List size={13} />}
            label="All tutorials"
            color="#6B7280"
            onClick={() => {
              setOpen(false);
              window.location.href = '/settings#tutorials';
            }}
          />

          <div style={{ borderTop: '1px solid #F3F4F6' }}>
            <MenuItem
              icon={<EyeOff size={13} />}
              label="Disable tutorials"
              color="#9CA3AF"
              onClick={() => {
                setOpen(false);
                setDisabled(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Tutorial help"
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: open ? '#1C2B3A' : '#E8834A',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(232,131,74,0.4)',
          transition: 'all 0.2s',
          position: 'relative',
        }}
      >
        {open ? <X size={18} color="white" /> : <HelpCircle size={20} color="white" />}
        {badge && !open && (
          <div style={{
            position: 'absolute', top: -2, right: -2, width: 12, height: 12,
            background: '#22C55E', borderRadius: '50%', border: '2px solid white',
          }} />
        )}
      </button>
    </div>
  );
}

function MenuItem({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 9,
        padding: '9px 14px', background: hov ? '#F8F6F3' : 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        color, fontSize: 13, fontWeight: 600, transition: 'background 0.1s',
      }}
    >
      {icon} {label}
    </button>
  );
}
