'use client';
import './globals.css';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import SidebarWrapper from './(app)/SidebarWrapper';
import BottomNav from '../components/BottomNav';
import { TutorialProvider } from '../components/tutorial/TutorialContext';
import TutorialHelpButton from '../components/tutorial/TutorialHelpButton';

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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E8834A" />

        {/* PWA / Apple */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ProSite" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />

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
        <TutorialProvider>
          <LayoutContent>{children}</LayoutContent>
        </TutorialProvider>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic =
    pathname === '/home' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/' ||
    pathname === '/offline' ||
    pathname === '/install' ||
    pathname === '/download' ||
    pathname.startsWith('/invite') ||
    pathname.startsWith('/admin');

  if (isPublic) return <>{children}</>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarWrapper />
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>{children}</main>
      <TutorialHelpButton />
      <BottomNav />
    </div>
  );
}
