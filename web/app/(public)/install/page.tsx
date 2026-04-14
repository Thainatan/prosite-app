'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  HardHat, FileText, DollarSign, Calendar, Users,
  Share2, PlusSquare, Home, ArrowDown, Check, Star,
  Smartphone, ChevronDown, ChevronUp, Gift,
} from 'lucide-react';

const FEATURES = [
  { icon: HardHat,    title: 'Project Management',  desc: 'Track every job from quote to completion. Assign crews, upload photos, manage checklists.' },
  { icon: FileText,   title: 'Professional Quotes',  desc: 'Create and send branded quotes in minutes. Clients approve digitally — no paper needed.' },
  { icon: DollarSign, title: 'Invoice & Payments',   desc: 'Generate deposit, progress, and final invoices. See exactly what\'s paid and what\'s owed.' },
  { icon: Calendar,   title: 'Schedule & Tasks',     desc: 'Calendar view for all site visits, inspections, and meetings. Never miss an appointment.' },
  { icon: Users,      title: 'Team Management',      desc: 'Add office staff, project managers, and field techs. Each role sees only what they need.' },
];

const IOS_STEPS = [
  { icon: Share2,     title: 'Tap the Share button',        desc: 'Open this page in Safari, then tap the Share icon at the bottom of the screen.' },
  { icon: PlusSquare, title: 'Add to Home Screen',          desc: 'Scroll down in the share sheet and tap "Add to Home Screen".' },
  { icon: Home,       title: 'Tap Add',                     desc: 'Tap "Add" in the top right corner. ProSite will appear on your home screen instantly.' },
];

const ANDROID_STEPS = [
  { icon: ArrowDown,  title: 'Open in Chrome',              desc: 'Open this page in Chrome. Look for the install banner or use the menu.' },
  { icon: PlusSquare, title: 'Add to Home Screen',          desc: 'Tap the 3-dot menu in the top right, then tap "Add to Home Screen" or "Install App".' },
  { icon: Home,       title: 'Tap Install',                 desc: 'Tap "Install" or "Add". ProSite appears on your home screen ready to launch.' },
];

// CSS phone frame mockup content
function PhoneMockup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      flexShrink: 0, width: 180,
      background: '#1A1A2E',
      borderRadius: 28,
      padding: '10px 6px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      border: '2px solid #2D3748',
    }}>
      {/* Notch */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <div style={{ width: 60, height: 8, background: '#2D3748', borderRadius: 4 }}/>
      </div>
      {/* Screen */}
      <div style={{ background: '#F8F6F3', borderRadius: 20, overflow: 'hidden', minHeight: 280 }}>
        {/* Status bar */}
        <div style={{ background: '#1C2B3A', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 8, fontWeight: 700, color: 'white' }}>9:41</span>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)' }}>●●●</span>
        </div>
        {/* Page header */}
        <div style={{ background: '#1C2B3A', padding: '8px 10px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: '#E8834A' }}/>
          <span style={{ fontSize: 9, fontWeight: 800, color: 'white' }}>ProSite</span>
        </div>
        {children}
      </div>
      {/* Home bar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <div style={{ width: 50, height: 4, background: '#4A5568', borderRadius: 2 }}/>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <PhoneMockup title="Dashboard">
      <div style={{ padding: '8px 8px' }}>
        <div style={{ background: 'linear-gradient(135deg,#1C2B3A,#2D4A6B)', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: 'white' }}>Good morning, John!</div>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Monday, April 13</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 8 }}>
          {[
            { label: 'Leads', val: '8',    bg: '#EEF3FF', color: '#4F7EF7' },
            { label: 'Quotes', val: '3',   bg: '#FEF3EC', color: '#E8834A' },
            { label: 'Active', val: '12',  bg: '#EAFAF3', color: '#2ECC71' },
            { label: 'Owed',  val: '$24k', bg: '#FFF0EF', color: '#E74C3C' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 6, padding: '6px 7px' }}>
              <div style={{ fontSize: 6, fontWeight: 700, color: s.color, textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'white', borderRadius: 6, padding: '6px 8px', border: '1px solid #E8E4DF' }}>
          <div style={{ fontSize: 7, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 }}>Active Projects</div>
          {['Kitchen Remodel', 'Master Bath', 'Deck Addition'].map(p => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 7, color: '#374151' }}>{p}</span>
              <span style={{ fontSize: 6, background: '#EAFAF3', color: '#2ECC71', padding: '1px 5px', borderRadius: 10, fontWeight: 700 }}>Active</span>
            </div>
          ))}
        </div>
      </div>
    </PhoneMockup>
  );
}

function QuotesMockup() {
  return (
    <PhoneMockup title="Quotes">
      <div style={{ padding: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#1A1A2E' }}>Quotes</div>
          <div style={{ background: '#E8834A', borderRadius: 5, padding: '3px 8px' }}>
            <span style={{ fontSize: 7, fontWeight: 700, color: 'white' }}>+ New</span>
          </div>
        </div>
        {[
          { num: 'Q-0042', name: 'Johnson Kitchen', val: '$18,400', status: 'SENT', color: '#3B82F6' },
          { num: 'Q-0041', name: 'Rivera Bath',     val: '$9,200',  status: 'APPROVED', color: '#22C55E' },
          { num: 'Q-0040', name: 'Chen Deck',       val: '$12,800', status: 'DRAFT',    color: '#9CA3AF' },
          { num: 'Q-0039', name: 'Mills Addition',  val: '$34,000', status: 'SENT',     color: '#3B82F6' },
        ].map(q => (
          <div key={q.num} style={{ background: 'white', borderRadius: 6, padding: '6px 8px', marginBottom: 5, border: '1px solid #E8E4DF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 7, fontWeight: 700, color: '#1A1A2E' }}>{q.name}</div>
                <div style={{ fontSize: 6, color: '#9CA3AF' }}>{q.num}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 7, fontWeight: 800, color: '#E8834A' }}>{q.val}</div>
                <span style={{ fontSize: 6, fontWeight: 700, color: q.color }}>{q.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PhoneMockup>
  );
}

function ProjectsMockup() {
  return (
    <PhoneMockup title="Projects">
      <div style={{ padding: '8px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>Projects</div>
        {[
          { name: 'Johnson Kitchen Remodel',  num: 'JOB-0042', status: 'In Progress',  bg: '#EAFAF3', color: '#2ECC71', pct: 65 },
          { name: 'Rivera Master Bathroom',   num: 'JOB-0041', status: 'Punch List',   bg: '#EEF3FF', color: '#4F7EF7', pct: 88 },
          { name: 'Chen Deck Addition',       num: 'JOB-0040', status: 'Scheduled',    bg: '#F3F4F6', color: '#6B7280', pct: 0  },
        ].map(p => (
          <div key={p.num} style={{ background: 'white', borderRadius: 6, padding: '7px 8px', marginBottom: 5, border: '1px solid #E8E4DF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 7, fontWeight: 700, color: '#1A1A2E', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: 6, color: '#9CA3AF' }}>{p.num}</div>
              </div>
              <span style={{ fontSize: 6, fontWeight: 700, padding: '2px 5px', borderRadius: 8, background: p.bg, color: p.color, alignSelf: 'flex-start' }}>{p.status}</span>
            </div>
            {p.pct > 0 && (
              <div>
                <div style={{ height: 3, background: '#E8E4DF', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 2 }}/>
                </div>
                <div style={{ fontSize: 6, color: '#9CA3AF', marginTop: 2 }}>{p.pct}% complete</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </PhoneMockup>
  );
}

function InstallContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const promoCode = searchParams.get('code')?.toUpperCase() || '';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('pwa_installed')) { setInstalled(true); return; }
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      localStorage.setItem('pwa_installed', '1');
    });
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setInstalled(true);
      localStorage.setItem('pwa_installed', '1');
    }
    setInstallPrompt(null);
  };

  const registerHref = promoCode ? `/register?code=${promoCode}` : '/register';

  const promoMessages: Record<string, string> = {
    BETA2026:     '90 days free on Company plan — no credit card needed.',
    PARTNER90:    '90 days free on Company plan — partner access.',
    FREEPARTNER:  'Free Forever access — no subscription ever.',
    ENTERPRISE90: '90 days free on Enterprise plan.',
  };
  const promoMsg = promoMessages[promoCode] || '90 days free — special invite applied.';

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#F8F6F3', minHeight: '100vh' }}>

      {/* ── Nav ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 60, background: '#1C2B3A',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="ProSite" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain' }}/>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>ProSite</div>
            <div style={{ fontSize: 9, color: '#E8834A', fontWeight: 700, letterSpacing: '0.08em' }}>REMODELING OS</div>
          </div>
        </div>
        <a href="/login" style={{ fontSize: 13, fontWeight: 600, color: '#E8834A', textDecoration: 'none', padding: '8px 16px', border: '1px solid rgba(232,131,74,0.4)', borderRadius: 8 }}>
          Sign In
        </a>
      </nav>

      {/* ── Promo Banner ── */}
      {promoCode && (
        <div style={{
          background: 'linear-gradient(90deg, #22C55E, #16A34A)',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <Gift size={16} color="white" strokeWidth={2.5}/>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
            Special invite: {promoMsg}
          </span>
        </div>
      )}

      {/* ── Hero / App Store Header ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #E8E4DF', padding: '32px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {/* App icon */}
          <div style={{
            width: 120, height: 120, borderRadius: 28, flexShrink: 0,
            overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid #E8E4DF',
          }}>
            <img src="/logo.png" alt="ProSite" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#1C2B3A' }}/>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: '#1A1A2E' }}>ProSite</h1>
            <p style={{ margin: '0 0 10px', fontSize: 15, color: '#6B7280' }}>Remodeling Management OS</p>

            {/* Rating row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#F59E0B" color="#F59E0B"/>)}
              </div>
              <span style={{ fontSize: 13, color: '#6B7280' }}>5.0 · Business</span>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>·</span>
              <span style={{ fontSize: 13, color: '#6B7280' }}>Free</span>
            </div>

            {/* Install button */}
            {installed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#EAFAF3', borderRadius: 12, width: 'fit-content' }}>
                <Check size={18} color="#22C55E" strokeWidth={2.5}/>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#15803D' }}>Installed</span>
              </div>
            ) : installPrompt ? (
              <button onClick={handleInstall} style={{
                padding: '12px 32px', background: '#E8834A', color: 'white',
                border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(232,131,74,0.35)',
              }}>
                <Smartphone size={18}/>
                Install Now
              </button>
            ) : (
              <button
                onClick={() => document.getElementById('install-instructions')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: '12px 32px', background: '#E8834A', color: 'white',
                  border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(232,131,74,0.35)',
                }}
              >
                <Smartphone size={18}/>
                Add to Home Screen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Phone Mockups / Screenshots ── */}
      <div style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2D4A6B 100%)', padding: '40px 24px', overflow: 'hidden' }}>
        <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 28px' }}>
          Preview
        </p>
        <div style={{
          display: 'flex', gap: 20, justifyContent: 'center',
          overflowX: 'auto', paddingBottom: 8,
          WebkitOverflowScrolling: 'touch' as const,
        }}>
          <DashboardMockup />
          <QuotesMockup />
          <ProjectsMockup />
        </div>
      </div>

      {/* ── Features ── */}
      <div style={{ padding: '48px 24px', maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E', margin: '0 0 24px', textAlign: 'center' }}>
          What&apos;s in ProSite
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} style={{
              display: 'flex', alignItems: 'flex-start', gap: 16,
              padding: '18px 0',
              borderBottom: i < FEATURES.length - 1 ? '1px solid #E8E4DF' : 'none',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: 'rgba(232,131,74,0.1)', border: '1px solid rgba(232,131,74,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={22} color="#E8834A" strokeWidth={2}/>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Install Instructions ── */}
      <div id="install-instructions" style={{ background: 'white', borderTop: '1px solid #E8E4DF', borderBottom: '1px solid #E8E4DF', padding: '48px 24px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E', margin: '0 0 8px', textAlign: 'center' }}>
            How to Install
          </h2>
          <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280', margin: '0 0 28px' }}>
            No App Store needed — installs directly from your browser.
          </p>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, background: '#F8F6F3', borderRadius: 12, padding: 4 }}>
            {([['ios', 'iPhone / iPad'], ['android', 'Android']] as const).map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 700, transition: 'all 0.2s',
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#E8834A' : '#6B7280',
                boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(activeTab === 'ios' ? IOS_STEPS : ANDROID_STEPS).map(({ icon: Icon, title, desc }, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: '#FEF3EC', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <Icon size={20} color="#E8834A" strokeWidth={2}/>
                    <div style={{
                      position: 'absolute', top: -6, right: -6, width: 18, height: 18,
                      borderRadius: '50%', background: '#E8834A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: 'white' }}>{i + 1}</span>
                    </div>
                  </div>
                  {i < 2 && <div style={{ width: 2, flex: 1, background: '#E8E4DF', marginTop: 6, minHeight: 20 }}/>}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Success confirmation */}
          <div style={{
            background: '#F0FDF4', borderRadius: 14, padding: '16px 18px',
            display: 'flex', gap: 12, alignItems: 'flex-start',
            border: '1px solid #BBF7D0',
          }}>
            <Check size={18} color="#22C55E" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 1 }}/>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#15803D', marginBottom: 2 }}>
                ProSite icon will appear on your home screen!
              </div>
              <div style={{ fontSize: 12, color: '#16A34A' }}>
                {activeTab === 'ios' ? 'Works on iOS 14+ · Safari only · No App Store needed'
                  : 'Works on Android 8+ · Chrome recommended · No Play Store needed'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: '56px 24px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: 'rgba(232,131,74,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <HardHat size={28} color="#E8834A" strokeWidth={2}/>
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: '#1A1A2E' }}>
          New to ProSite?
        </h2>
        <p style={{ margin: '0 0 28px', fontSize: 15, color: '#6B7280', lineHeight: 1.6 }}>
          Create your free account — no credit card needed.{' '}
          {promoCode && <strong style={{ color: '#22C55E' }}>Your special invite is waiting!</strong>}
        </p>
        <a href={registerHref} style={{
          display: 'block', padding: '16px 32px',
          background: '#E8834A', color: 'white', borderRadius: 14,
          fontSize: 16, fontWeight: 700, textDecoration: 'none',
          boxShadow: '0 6px 20px rgba(232,131,74,0.35)',
          transition: 'transform 0.15s',
        }}>
          Start Free Trial {promoCode && `— ${promoCode}`}
        </a>
        <p style={{ margin: '16px 0 0', fontSize: 12, color: '#9CA3AF' }}>
          {promoCode ? '14+ days free · No credit card · Cancel anytime' : '14 days free · No credit card · Cancel anytime'}
        </p>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid #E8E4DF', padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>
          © 2026 ProSite · Built for remodeling contractors ·{' '}
          <a href="/login" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Sign In</a>
        </p>
      </div>
    </div>
  );
}

export default function InstallPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#1C2B3A' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/logo.png" alt="ProSite" style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 16 }}/>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>Loading…</div>
        </div>
      </div>
    }>
      <InstallContent />
    </Suspense>
  );
}
