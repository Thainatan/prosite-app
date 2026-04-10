'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, FileText, HardHat, Receipt,
  ClipboardList, Calendar, BarChart3, Settings, UserCog,
  ChevronRight, LogOut, Bell, CheckSquare, Wrench
} from 'lucide-react';
import { ROLE_PERMISSIONS } from '../../lib/permissions';

const ALL_NAV = [
  { section: 'MAIN', items: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/schedule',  icon: Calendar,        label: 'Schedule'  },
    { href: '/tasks',     icon: CheckSquare,     label: 'Tasks'     },
  ]},
  { section: 'SALES', items: [
    { href: '/clients', icon: Users,         label: 'Clients' },
    { href: '/quotes',  icon: FileText,      label: 'Quotes'  },
    { href: '/leads',   icon: ClipboardList, label: 'Leads'   },
  ]},
  { section: 'OPERATIONS', items: [
    { href: '/projects',       icon: HardHat,       label: 'Projects'      },
    { href: '/subcontractors', icon: Wrench,        label: 'Subcontractors'},
    { href: '/change-orders',  icon: ClipboardList, label: 'Change Orders' },
    { href: '/invoices',       icon: Receipt,       label: 'Invoices'      },
  ]},
  { section: 'REPORTS', items: [
    { href: '/reports', icon: BarChart3, label: 'Reports' },
  ]},
  { section: 'SETTINGS', items: [
    { href: '/team',     icon: UserCog,  label: 'Team'     },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

function canSee(role: string, href: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes('*')) return true;
  return perms.some(p => href === p || href.startsWith(p + '/'));
}

export default function SidebarWrapper() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState('ADMIN');
  const [userName, setUserName] = useState('User');
  const [userInitials, setUserInitials] = useState('U');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('prosite_user');
      if (raw) {
        const u = JSON.parse(raw);
        setUserRole(u.role || 'ADMIN');
        setUserName(u.firstName || 'User');
        setUserInitials(`${(u.firstName || 'U')[0]}${(u.lastName || '')[0] || ''}`.toUpperCase());
      }
    } catch {}
  }, []);

  const active = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const filteredNav = ALL_NAV.map(section => ({
    ...section,
    items: section.items.filter(item => canSee(userRole, item.href)),
  })).filter(section => section.items.length > 0);

  const handleLogout = () => {
    localStorage.removeItem('prosite_token');
    localStorage.removeItem('prosite_user');
    document.cookie = 'prosite_token=; path=/; max-age=0';
    window.location.href = '/login';
  };

  const roleLabel: Record<string, string> = {
    ADMIN: 'Admin', OFFICE_MANAGER: 'Office Mgr', PROJECT_MANAGER: 'Project Mgr',
    FIELD_TECH: 'Field Tech', SUBCONTRACTOR: 'Subcontractor',
  };

  return (
    <aside style={{
      width: 240, background: '#1C2B3A', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="ProSite" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain' }}/>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>ProSite</div>
            <div style={{ fontSize: 10, color: '#E8834A', fontWeight: 700, letterSpacing: '0.06em' }}>REMODELING OS</div>
          </div>
        </div>
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
            {items.map(({ href, icon: Icon, label }) => {
              const isActive = active(href);
              return (
                <a key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: isActive ? '8px 10px 8px 7px' : '8px 10px',
                  borderRadius: 8, marginBottom: 1, textDecoration: 'none',
                  background: isActive ? 'rgba(232,131,74,0.12)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#8BA3B8',
                  fontWeight: isActive ? 600 : 400, fontSize: 13.5,
                  borderLeft: isActive ? '3px solid #E8834A' : '3px solid transparent',
                  transition: 'all 0.15s ease',
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

      {/* Wrench decoration */}
      <div style={{ padding: '0 16px 4px', display: 'flex', justifyContent: 'center' }}>
        <Wrench size={18} color="rgba(232,131,74,0.3)" strokeWidth={1.5}/>
      </div>

      {/* User */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, cursor: 'pointer' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#E8834A,#D4713A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{userInitials}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{userName}</div>
            <div style={{ fontSize: 11, color: '#E8834A', fontWeight: 500 }}>{roleLabel[userRole] || userRole}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <LogOut size={14} color="rgba(255,255,255,0.3)"/>
          </button>
        </div>
      </div>
    </aside>
  );
}
