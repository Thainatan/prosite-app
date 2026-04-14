'use client';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Tag, BarChart3, ArrowLeft, LogOut, Shield, ChevronRight } from 'lucide-react';

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/tenants',   icon: Building2,       label: 'Companies' },
  { href: '/admin/promo',     icon: Tag,             label: 'Promo Codes' },
  { href: '/admin/reports',   icon: BarChart3,       label: 'Reports' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const active = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = () => {
    localStorage.removeItem('prosite_token');
    localStorage.removeItem('prosite_user');
    document.cookie = 'prosite_token=; path=/; max-age=0';
    window.location.href = '/login';
  };

  return (
    <aside style={{
      width: 240, background: '#0F1E2D', height: '100vh', position: 'sticky', top: 0,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <img src="/logo.png" alt="ProSite" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain' }}/>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>ProSite</div>
            <div style={{ fontSize: 10, color: '#E8834A', fontWeight: 700, letterSpacing: '0.06em' }}>ADMIN PANEL</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(232,131,74,0.12)', borderRadius: 8, padding: '6px 10px', border: '1px solid rgba(232,131,74,0.2)' }}>
          <Shield size={13} color="#E8834A" strokeWidth={2.5}/>
          <span style={{ fontSize: 11, color: '#E8834A', fontWeight: 700, letterSpacing: '0.04em' }}>SUPER ADMIN</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', padding: '8px 8px 4px', textTransform: 'uppercase' }}>
          Management
        </div>
        {NAV.map(({ href, icon: Icon, label }) => {
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

        <div style={{ margin: '12px 0 6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}/>

        <a href="/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '8px 10px', borderRadius: 8, marginBottom: 1, textDecoration: 'none',
          color: '#8BA3B8', fontSize: 13.5, transition: 'all 0.15s ease',
        }}>
          <ArrowLeft size={16} color="#8BA3B8" strokeWidth={1.8}/>
          <span>Back to App</span>
        </a>
      </nav>

      {/* User footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#E8834A,#D4713A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={14} color="white" strokeWidth={2.5}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>admin@prosite.com</div>
            <div style={{ fontSize: 10.5, color: '#E8834A', fontWeight: 500 }}>Super Admin</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <LogOut size={14} color="rgba(255,255,255,0.3)"/>
          </button>
        </div>
      </div>
    </aside>
  );
}
