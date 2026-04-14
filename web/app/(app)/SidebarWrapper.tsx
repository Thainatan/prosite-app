'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, FileText, HardHat, Receipt,
  ClipboardList, Calendar, BarChart3, Settings, UserCog,
  ChevronRight, LogOut, Bell, CheckSquare, Wrench, X, Smartphone, Tag, Shield,
} from 'lucide-react';
import { canSeeRoute } from '../../lib/permissions';

const ALL_NAV = [
  { section: 'MAIN', items: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', tutorialId: 'nav-dashboard' },
    { href: '/schedule',  icon: Calendar,        label: 'Schedule',  tutorialId: 'nav-schedule'  },
    { href: '/tasks',     icon: CheckSquare,     label: 'Tasks',     tutorialId: 'nav-tasks'     },
  ]},
  { section: 'SALES', items: [
    { href: '/clients', icon: Users,         label: 'Clients', tutorialId: 'nav-clients' },
    { href: '/quotes',  icon: FileText,      label: 'Quotes',  tutorialId: 'nav-quotes'  },
    { href: '/leads',   icon: ClipboardList, label: 'Leads',   tutorialId: 'nav-leads'   },
  ]},
  { section: 'OPERATIONS', items: [
    { href: '/projects',       icon: HardHat,       label: 'Projects',       tutorialId: 'nav-projects'       },
    { href: '/subcontractors', icon: Wrench,        label: 'Subcontractors', tutorialId: 'nav-subcontractors' },
    { href: '/change-orders',  icon: ClipboardList, label: 'Change Orders',  tutorialId: 'nav-change-orders'  },
    { href: '/invoices',       icon: Receipt,       label: 'Invoices',       tutorialId: 'nav-invoices'       },
  ]},
  { section: 'REPORTS', items: [
    { href: '/reports', icon: BarChart3, label: 'Reports', tutorialId: 'nav-reports' },
  ]},
  { section: 'SETTINGS', items: [
    { href: '/team',     icon: UserCog,  label: 'Team',        tutorialId: 'nav-team'     },
    { href: '/settings', icon: Settings, label: 'Settings',    tutorialId: 'nav-settings' },
    { href: '/promo',    icon: Tag,      label: 'Promo Codes', tutorialId: 'nav-promo'    },
  ]},
];

export default function SidebarWrapper() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState('ADMIN');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('User');
  const [userInitials, setUserInitials] = useState('U');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [appInstalled, setAppInstalled] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('prosite_user');
      if (raw) {
        const u = JSON.parse(raw);
        setUserRole(u.role || 'ADMIN');
        setUserEmail(u.email || '');
        setUserName(u.firstName || 'User');
        setUserInitials(`${(u.firstName || 'U')[0]}${(u.lastName || '')[0] || ''}`.toUpperCase());
      }
    } catch {}

    // Open sidebar from MobileHeader hamburger or BottomNav "More"
    const openHandler = () => setMobileOpen(true);
    window.addEventListener('open-sidebar', openHandler);

    // PWA install prompt
    if (localStorage.getItem('pwa_installed')) setAppInstalled(true);
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    window.addEventListener('appinstalled', () => {
      setAppInstalled(true);
      localStorage.setItem('pwa_installed', '1');
    });
    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
      window.removeEventListener('open-sidebar', openHandler);
    };
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const active = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const isSuperAdmin = userRole === 'SUPER_ADMIN' || userEmail === 'admin@prosite.com';

  const filteredNav = ALL_NAV.map(section => ({
    ...section,
    items: (section.items as Array<{ href: string; icon: React.FC<{ size: number; color: string; strokeWidth: number }>; label: string; tutorialId?: string }>).filter(item => {
      // Promo codes: SUPER_ADMIN only
      if (item.href === '/promo') return isSuperAdmin;
      return canSeeRoute(isSuperAdmin ? 'SUPER_ADMIN' : userRole, item.href);
    }),
  })).filter(section => section.items.length > 0);

  const handleLogout = () => {
    localStorage.removeItem('prosite_token');
    localStorage.removeItem('prosite_user');
    document.cookie = 'prosite_token=; path=/; max-age=0';
    window.location.href = '/login';
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setAppInstalled(true);
      localStorage.setItem('pwa_installed', '1');
    }
    setInstallPrompt(null);
  };

  const roleLabel: Record<string, string> = {
    ADMIN: 'Admin', OFFICE_MANAGER: 'Office Mgr', PROJECT_MANAGER: 'Project Mgr',
    FIELD_TECH: 'Field Tech', SUBCONTRACTOR: 'Subcontractor',
  };

  const sidebarContent = (
    <aside style={{
      width: '100%', background: '#1C2B3A', height: '100%',
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Logo + close */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="ProSite" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain' }}/>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>ProSite</div>
            <div style={{ fontSize: 10, color: '#E8834A', fontWeight: 700, letterSpacing: '0.06em' }}>REMODELING OS</div>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button onClick={() => setMobileOpen(false)} className="sidebar-close-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'none', color: 'rgba(255,255,255,0.6)', width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
          <X size={18}/>
        </button>
      </div>

      {/* Notifications */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '7px 10px', cursor: 'pointer' }}>
          <Bell size={14} color="#E8834A"/>
          <span style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 500, flex: 1 }}>3 notifications</span>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8834A' }}/>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
        {filteredNav.map(({ section, items }) => (
          <div key={section} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', padding: '8px 8px 4px', textTransform: 'uppercase' }}>
              {section}
            </div>
            {items.map(({ href, icon: Icon, label, tutorialId }) => {
              const isActive = active(href);
              return (
                <a key={href} href={href} data-tutorial={tutorialId} style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: isActive ? '10px 10px 10px 7px' : '10px 10px',
                  borderRadius: 8, marginBottom: 2, textDecoration: 'none',
                  background: isActive ? 'rgba(232,131,74,0.12)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#8BA3B8',
                  fontWeight: isActive ? 600 : 400, fontSize: 13.5,
                  borderLeft: isActive ? '3px solid #E8834A' : '3px solid transparent',
                  minHeight: 44,
                }}>
                  <Icon size={16} color={isActive ? '#E8834A' : '#8BA3B8'} strokeWidth={isActive ? 2.5 : 1.8}/>
                  <span style={{ flex: 1 }}>{label}</span>
                  {isActive && <ChevronRight size={13} color="#E8834A"/>}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* PWA Install */}
      {installPrompt && !appInstalled && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleInstall} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px', borderRadius: 8, cursor: 'pointer', minHeight: 44,
            background: 'transparent', border: '1px solid rgba(232,131,74,0.4)',
            color: '#E8834A', fontSize: 12.5, fontWeight: 600,
          }}>
            <Smartphone size={14} color="#E8834A"/>
            <span>Install App</span>
          </button>
        </div>
      )}

      {/* Admin Panel — SUPER_ADMIN only */}
      {isSuperAdmin && (
        <div style={{ padding: '0 12px 6px' }}>
          <a href="/admin/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: 9, minHeight: 44,
            padding: '9px 12px', borderRadius: 9, textDecoration: 'none',
            background: 'rgba(232,131,74,0.1)', border: '1px solid rgba(232,131,74,0.25)',
          }}>
            <Shield size={15} color="#E8834A" strokeWidth={2.5}/>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#E8834A' }}>Admin Panel</span>
            <ChevronRight size={12} color="#E8834A"/>
          </a>
        </div>
      )}

      <div style={{ padding: '0 16px 4px', display: 'flex', justifyContent: 'center' }}>
        <Wrench size={18} color="rgba(232,131,74,0.3)" strokeWidth={1.5}/>
      </div>

      {/* User */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, cursor: 'pointer', minHeight: 44 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#E8834A,#D4713A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{userInitials}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{userName}</div>
            <div style={{ fontSize: 11, color: '#E8834A', fontWeight: 500 }}>{roleLabel[userRole] || userRole}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, minWidth: 32, minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={14} color="rgba(255,255,255,0.3)"/>
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop sidebar (flex column, 240px) ── */}
      <div className="desktop-sidebar" style={{ flexShrink: 0, width: 240, minHeight: '100vh' }}>
        {sidebarContent}
      </div>

      {/* ── Mobile: dark overlay backdrop (z-index 150) ── */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'none',               /* CSS shows on mobile */
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 150,
            animation: 'fadeIn 0.2s ease forwards',
          }}
        />
      )}

      {/* ── Mobile: sliding sidebar (z-index 200) ── */}
      <div
        className="mobile-sidebar"
        style={{
          display: 'none',                /* CSS shows on mobile */
          position: 'fixed', top: 0, left: 0,
          height: '100vh', width: 280,
          zIndex: 200,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {sidebarContent}
      </div>
    </>
  );
}
