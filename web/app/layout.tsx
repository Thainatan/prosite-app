'use client';
import './globals.css';
import { usePathname } from 'next/navigation';
import SidebarWrapper from './(app)/SidebarWrapper';

const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {GMAPS_KEY && (
          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places`}
            async
            defer
          />
        )}
      </head>
      <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#F8F6F3' }}>
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
