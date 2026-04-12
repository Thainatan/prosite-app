'use client';

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#F8F6F3',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{ textAlign: 'center', padding: '0 24px', maxWidth: 400 }}>
        <img src="/logo.png" alt="ProSite" style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'contain', margin: '0 auto 24px', display: 'block' }}/>

        {/* Hard hat SVG illustration */}
        <svg width="120" height="100" viewBox="0 0 120 100" fill="none" style={{ margin: '0 auto 24px', display: 'block' }}>
          <rect x="10" y="70" width="100" height="18" rx="9" fill="#E8E4DF"/>
          <path d="M20 70 C20 40 40 25 60 25 C80 25 100 40 100 70Z" fill="#1C2B3A"/>
          <path d="M25 70 C25 45 42 32 60 32 C78 32 95 45 95 70Z" fill="#E8834A"/>
          <rect x="54" y="14" width="12" height="18" rx="4" fill="#1C2B3A"/>
          <circle cx="60" cy="12" r="6" fill="#E8834A"/>
          <rect x="0" y="68" width="120" height="6" rx="3" fill="#1C2B3A"/>
        </svg>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A1A2E', margin: '0 0 10px' }}>
          You&apos;re offline
        </h1>
        <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 28px', lineHeight: 1.6 }}>
          Check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            height: 44, padding: '0 28px',
            background: '#E8834A', color: 'white',
            border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
