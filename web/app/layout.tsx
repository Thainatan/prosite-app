'use client';
import './globals.css';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import SidebarWrapper from './(app)/SidebarWrapper';

const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);
  return null;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E8834A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ProSite" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        {GMAPS_KEY && (
          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places`}
            async
            defer
          />
        )}
      </head>
      <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#F8F6F3' }}>
        <ServiceWorkerRegistration />
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === '/home' || pathname === '/login' || pathname === '/register' || pathname === '/' || pathname === '/offline';
  if (isPublic) return <>{children}</>;
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarWrapper />
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>{children}</main>
    </div>
  );
}
