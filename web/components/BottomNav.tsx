'use client';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, HardHat, Menu } from 'lucide-react';

const TABS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home'     },
  { href: '/clients',   icon: Users,           label: 'Clients'  },
  { href: '/quotes',    icon: FileText,         label: 'Quotes'   },
  { href: '/projects',  icon: HardHat,          label: 'Jobs'     },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const openSidebar = () => {
    window.dispatchEvent(new CustomEvent('open-sidebar'));
  };

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {TABS.map(({ href, icon: Icon, label }) => {
        const active = isActive(href);
        return (
          <a
            key={href}
            href={href}
            className={`bottom-nav-tab${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon
              size={22}
              color={active ? '#E8834A' : '#9CA3AF'}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span>{label}</span>
          </a>
        );
      })}

      <button
        className="bottom-nav-tab"
        onClick={openSidebar}
        aria-label="More options"
      >
        <Menu size={22} color="#9CA3AF" strokeWidth={1.8}/>
        <span>More</span>
      </button>
    </nav>
  );
}
