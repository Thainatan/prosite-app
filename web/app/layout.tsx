'use client';
import './globals.css';
import { usePathname } from 'next/navigation';
import SidebarWrapper from './(app)/SidebarWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#F7F8FC' }}>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === '/home' || pathname === '/login' || pathname === '/register' || pathname === '/';
  if (isPublic) return <>{children}</>;
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarWrapper />
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  );
}