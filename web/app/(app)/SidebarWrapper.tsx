'use client';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, HardHat, Receipt,
  ClipboardList, Calendar, BarChart3, Settings, UserCog,
  ChevronRight, LogOut, Bell
} from 'lucide-react';

const NAV = [
  { section: 'MAIN', items: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/schedule',  icon: Calendar,        label: 'Schedule'  },
  ]},
  { section: 'SALES', items: [
    { href: '/clients', icon: Users,         label: 'Clients' },
    { href: '/quotes',  icon: FileText,      label: 'Quotes'  },
    { href: '/leads',   icon: ClipboardList, label: 'Leads'   },
  ]},
  { section: 'OPERATIONS', items: [
    { href: '/projects',      icon: HardHat,       label: 'Projects'      },
    { href: '/change-orders', icon: ClipboardList, label: 'Change Orders' },
    { href: '/invoices',      icon: Receipt,       label: 'Invoices'      },
  ]},
  { section: 'REPORTS', items: [
    { href: '/reports', icon: BarChart3, label: 'Reports' },
  ]},
  { section: 'SETTINGS', items: [
    { href: '/team',     icon: UserCog,  label: 'Team'     },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

export default function SidebarWrapper() {
  const pathname = usePathname();
  const active = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside style={{ width:240, background:'#0F1117', minHeight:'100vh', display:'flex', flexDirection:'column', flexShrink:0, borderRight:'1px solid #1E2130' }}>

      {/* Logo */}
      <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid #1E2130' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <img src="/logo.png" alt="ProSite" style={{ width:32, height:32, borderRadius:8, objectFit:'contain' }}/>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:'white' }}>ProSite</div>
            <div style={{ fontSize:10, color:'#4F7EF7', fontWeight:600, letterSpacing:'0.05em' }}>REMODELING OS</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ padding:'10px 12px', borderBottom:'1px solid #1E2130' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#1A1D2E', borderRadius:8, padding:'7px 10px', cursor:'pointer' }}>
          <Bell size={14} color="#F5A623"/>
          <span style={{ fontSize:12, color:'#E5E7EB', fontWeight:500, flex:1 }}>3 notifications</span>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#F5A623' }}/>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'10px', overflowY:'auto' }}>
        {NAV.map(({ section, items }) => (
          <div key={section} style={{ marginBottom:6 }}>
            <div style={{ fontSize:9.5, fontWeight:700, color:'#3D4466', letterSpacing:'0.1em', padding:'8px 8px 4px', textTransform:'uppercase' }}>
              {section}
            </div>
            {items.map(({ href, icon: Icon, label }) => (
              <a key={href} href={href} style={{
                display:'flex', alignItems:'center', gap:9, padding:'8px 10px',
                borderRadius:8, marginBottom:1, textDecoration:'none',
                background: active(href) ? '#1E2A4A' : 'transparent',
                color: active(href) ? '#FFFFFF' : '#8892B0',
                fontWeight: active(href) ? 600 : 400, fontSize:13.5,
              }}>
                <Icon size={16} color={active(href) ? '#4F7EF7' : '#8892B0'} strokeWidth={active(href) ? 2.5 : 1.8}/>
                <span style={{ flex:1 }}>{label}</span>
                {active(href) && <ChevronRight size={13} color="#4F7EF7"/>}
              </a>
            ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop:'1px solid #1E2130', padding:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:9, cursor:'pointer' }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#4F7EF7,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'white' }}>TB</span>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#E2E8F0' }}>Thainatan</div>
            <div style={{ fontSize:11, color:'#4F7EF7', fontWeight:500 }}>Admin</div>
          </div>
          <LogOut size={14} color="#3D4466"/>
        </div>
      </div>
    </aside>
  );
}