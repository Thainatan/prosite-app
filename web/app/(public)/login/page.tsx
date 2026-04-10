'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      if (data.token) {
        localStorage.setItem('prosite_token', data.token);
        localStorage.setItem('prosite_user', JSON.stringify(data.user));
        document.cookie = `prosite_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        window.location.href = '/dashboard';
      } else {
        setError('Login failed. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Could not connect to server. Please try again.');
      setLoading(false);
    }
  };

  const features = [
    { icon: '📋', text: 'Create professional quotes in under 2 minutes' },
    { icon: '🏗️', text: 'Track every project from start to final invoice' },
    { icon: '💰', text: 'Get paid faster with automated invoicing' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Left panel */}
      <div style={{ flex: 1, background: 'linear-gradient(145deg, #1C2B3A 0%, #2D4A6B 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 48px', position: 'relative', overflow: 'hidden' }}>
        {/* Background pattern */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.06, width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E8834A" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 420, width: '100%' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <img src="/logo.png" alt="ProSite" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'contain' }}/>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>ProSite</div>
              <div style={{ fontSize: 11, color: '#E8834A', fontWeight: 700, letterSpacing: '0.08em' }}>REMODELING OS</div>
            </div>
          </div>

          {/* Construction SVG illustration */}
          <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'center' }}>
            <svg width="200" height="160" viewBox="0 0 200 160" fill="none">
              {/* House outline */}
              <path d="M100 20 L160 70 L160 140 L40 140 L40 70 Z" fill="none" stroke="#E8834A" strokeWidth="2.5" strokeLinejoin="round"/>
              {/* Roof */}
              <path d="M30 72 L100 15 L170 72" fill="none" stroke="#E8834A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Door */}
              <rect x="82" y="100" width="36" height="40" rx="4" fill="rgba(232,131,74,0.3)" stroke="#E8834A" strokeWidth="2"/>
              {/* Windows */}
              <rect x="48" y="85" width="24" height="22" rx="3" fill="rgba(255,255,255,0.1)" stroke="#E8834A" strokeWidth="1.5"/>
              <rect x="128" y="85" width="24" height="22" rx="3" fill="rgba(255,255,255,0.1)" stroke="#E8834A" strokeWidth="1.5"/>
              {/* Window crosses */}
              <line x1="60" y1="85" x2="60" y2="107" stroke="#E8834A" strokeWidth="1"/>
              <line x1="48" y1="96" x2="72" y2="96" stroke="#E8834A" strokeWidth="1"/>
              <line x1="140" y1="85" x2="140" y2="107" stroke="#E8834A" strokeWidth="1"/>
              <line x1="128" y1="96" x2="152" y2="96" stroke="#E8834A" strokeWidth="1"/>
              {/* Scaffolding */}
              <line x1="165" y1="140" x2="185" y2="140" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
              <line x1="175" y1="140" x2="175" y2="40" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
              <line x1="170" y1="90" x2="185" y2="90" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <line x1="170" y1="60" x2="185" y2="60" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <line x1="181" y1="140" x2="181" y2="40" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              {/* Chimney */}
              <rect x="118" y="28" width="16" height="30" rx="2" fill="none" stroke="#E8834A" strokeWidth="2"/>
              {/* Ground line */}
              <line x1="20" y1="140" x2="180" y2="140" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
            </svg>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 12px', lineHeight: 1.2 }}>
            Run Your Entire<br/>Remodeling Business<br/><span style={{ color: '#E8834A' }}>From One Place</span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 32px', lineHeight: 1.6 }}>
            The all-in-one OS built specifically for remodeling contractors.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {features.map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232,131,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>{icon}</div>
                <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ width: 440, background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', boxShadow: '-8px 0 40px rgba(0,0,0,0.08)' }}>
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, color: '#1A1A2E' }}>Welcome back</h2>
          <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>Sign in to your ProSite account</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com" required
              style={{ width: '100%', height: 44, background: '#FAF9F7', border: '1px solid #E8E4DF', borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#1A1A2E', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              onFocus={e => { e.target.style.borderColor = '#E8834A'; e.target.style.boxShadow = '0 0 0 3px rgba(232,131,74,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = '#E8E4DF'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              style={{ width: '100%', height: 44, background: '#FAF9F7', border: '1px solid #E8E4DF', borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#1A1A2E', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              onFocus={e => { e.target.style.borderColor = '#E8834A'; e.target.style.boxShadow = '0 0 0 3px rgba(232,131,74,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = '#E8E4DF'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <a href="#" style={{ fontSize: 13, color: '#E8834A', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
          </div>

          {error && (
            <div style={{ background: '#FFF0EF', border: '1px solid #F0584C', borderRadius: 9, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ color: '#E74C3C', fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-press" style={{
            width: '100%', height: 46, background: loading ? '#F0C4A8' : '#E8834A',
            color: 'white', border: 'none', borderRadius: 10, fontSize: 15,
            fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
          }}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #E8E4DF', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
            Don&apos;t have an account?{' '}
            <a href="/register" style={{ color: '#E8834A', fontWeight: 700, textDecoration: 'none' }}>Start free trial</a>
          </p>
        </div>

        {/* Demo hint */}
        <div style={{ marginTop: 16, background: '#FEF3EC', borderRadius: 10, padding: '12px 16px', border: '1px solid #F0C4A8' }}>
          <p style={{ fontSize: 12, color: '#E8834A', margin: 0, fontWeight: 600 }}>
            Demo credentials:<br/>
            <span style={{ fontFamily: 'monospace' }}>admin@prosite.com</span> / <span style={{ fontFamily: 'monospace' }}>prosite123</span>
          </p>
        </div>

        <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 20 }}>
          © 2026 ProSite · <a href="/home" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Back to home</a>
        </p>
      </div>
    </div>
  );
}
