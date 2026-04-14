'use client';
import { useState, useEffect } from 'react';
import { X, CheckCircle, Circle, Settings, Users, FileText, Building2, UserPlus, BookOpen } from 'lucide-react';
import { shouldShowTutorial } from '../lib/tutorials';
import { useTutorial } from './tutorial/TutorialContext';

const STEPS = [
  { id: 'company-info',   label: 'Add your company info',      href: '/settings',       Icon: Settings,  tutorialId: 'settings_setup' },
  { id: 'upload-logo',    label: 'Upload your logo',           href: '/settings',       Icon: Building2, tutorialId: 'settings_setup' },
  { id: 'first-client',   label: 'Add your first client',      href: '/clients',        Icon: Users,     tutorialId: 'create_client'  },
  { id: 'first-quote',    label: 'Create your first quote',    href: '/quotes/new',     Icon: FileText,  tutorialId: 'create_quote'   },
  { id: 'invite-member',  label: 'Invite a team member',       href: '/team',           Icon: UserPlus,  tutorialId: null             },
];

const STORAGE_KEY = 'onboarding_completed_steps';

export default function OnboardingChecklist() {
  const [visible, setVisible] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [tick, setTick] = useState(0);
  const { startTutorial } = useTutorial();

  useEffect(() => {
    const isNew = typeof window !== 'undefined' && localStorage.getItem('onboarding_new') === '1';
    if (!isNew) return;

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
    setCompleted(saved);
    setVisible(true);
  }, []);

  const toggle = (id: string) => {
    const next = completed.includes(id) ? completed.filter(c => c !== id) : [...completed, id];
    setCompleted(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.removeItem('onboarding_new');
  };

  const handleStepClick = (id: string, href: string, tutorialId: string | null) => {
    toggle(id);
    if (tutorialId && shouldShowTutorial(tutorialId)) {
      // If on the same page, start tutorial directly; otherwise navigate (tutorial auto-starts on the target page)
      if (window.location.pathname === href || (href === '/settings' && window.location.pathname === '/settings')) {
        startTutorial(tutorialId);
        setTick(t => t + 1);
      } else {
        window.location.href = href;
      }
    } else {
      window.location.href = href;
    }
  };

  if (!visible) return null;

  const pct = Math.round((completed.length / STEPS.length) * 100);

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
      background: 'white', borderRadius: 16, width: 340,
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #E8E4DF',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2D4A6B 100%)', padding: '16px 20px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'white', marginBottom: 2 }}>
              Welcome to ProSite!
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
              {completed.length} of {STEPS.length} steps completed
            </div>
          </div>
          <button onClick={dismiss} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, cursor: 'pointer', padding: 4, display: 'flex', color: 'rgba(255,255,255,0.7)' }}>
            <X size={15}/>
          </button>
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 99, height: 4 }}>
          <div style={{ width: `${pct}%`, background: '#E8834A', height: '100%', borderRadius: 99, transition: 'width 0.4s' }}/>
        </div>
      </div>

      {/* Steps */}
      <div style={{ padding: '12px 0' }}>
        {STEPS.map(({ id, label, href, Icon, tutorialId }) => {
          const done = completed.includes(id);
          const hasTutorial = tutorialId && shouldShowTutorial(tutorialId);
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px', cursor: 'pointer', transition: 'background 0.1s' }}
              onClick={() => handleStepClick(id, href, tutorialId)}
              onMouseEnter={e => (e.currentTarget.style.background = '#F8F6F3')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {done
                ? <CheckCircle size={18} color="#22C55E" strokeWidth={2}/>
                : <Circle size={18} color="#D1D5DB" strokeWidth={2}/>}
              <Icon size={14} color={done ? '#9CA3AF' : '#E8834A'} strokeWidth={2}/>
              <span style={{ fontSize: 13, color: done ? '#9CA3AF' : '#1A1A2E', textDecoration: done ? 'line-through' : 'none', flex: 1 }}>
                {label}
              </span>
              {!done && hasTutorial && (
                <span title="Tutorial available"><BookOpen size={12} color="#E8834A" strokeWidth={2}/></span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 20px 16px', borderTop: '1px solid #F3F4F6' }}>
        <button onClick={dismiss} style={{ fontSize: 12, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          I&apos;ll do this later
        </button>
      </div>
    </div>
  );
}
