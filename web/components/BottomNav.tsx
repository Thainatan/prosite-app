'use client';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, HardHat, Menu } from 'lucide-react';

const TABS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home'     },
  { href: '/clients',   icon: Users,           label: 'Clients'  },
  { href: '/quotes',    icon: FileText,         label: 'Quotes'   },
  { href: '/projects',  icon: HardHat,          label: 'Projects' },
];

export default function BottomNav() {
  const pathname = usePathname();

  const openSidebar = () => {
    window.dispatchEvent(new CustomEvent('open-sidebar'));
  };

  return (
    <nav className="bottom-nav">
      {TABS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <a key={href} href={href} className={`bottom-nav-tab${isActive ? ' active' : ''}`}>
            <Icon size={22} color={isActive ? '#E8834A' : '#9CA3AF'} strokeWidth={isActive ? 2.5 : 1.8}/>
            <span>{label}</span>
          </a>
        );
      })}
      <button className="bottom-nav-tab bottom-nav-more" onClick={openSidebar}>
        <Menu size={22} color="#9CA3AF" strokeWidth={1.8}/>
        <span>More</span>
      </button>
    </nav>
  );
}
