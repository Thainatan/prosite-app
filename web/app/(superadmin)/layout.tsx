'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('prosite_user');
      if (raw) {
        const user = JSON.parse(raw);
        if (user.role !== 'SUPER_ADMIN') {
          window.location.href = '/dashboard';
          return;
        }
      } else {
        window.location.href = '/login';
        return;
      }
    } catch {
      window.location.href = '/login';
      return;
    }
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#0F1E2D',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Verifying access…</div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <AdminSidebar />
      <main style={{ flex: 1, background: '#111D29', overflowY: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
