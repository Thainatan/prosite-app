'use client';
import { useState } from 'react';
import { Eye, EyeOff, HardHat, FileText, DollarSign } from 'lucide-react';
import { setToken } from '../../../lib/auth';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const FEATURES = [
  { Icon: HardHat,   title: 'Project Management',   desc: 'Track every job from quote to completion' },
  { Icon: FileText,  title: 'Professional Quotes',   desc: 'Create and send quotes in minutes' },
  { Icon: DollarSign,title: 'Invoice & Payments',    desc: 'Get paid faster with digital invoices' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
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
        setToken(data.token);
        localStorage.setItem('prosite_user', JSON.stringify(data.user));
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

  const inp: React.CSSProperties = {
    width: '100%', height: 46, background: '#FAF9F7', border: '1px solid #E8E4DF',
    borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#1A1A2E',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ─── LEFT PANEL ─── */}
      <div style={{
        flex: '0 0 45%', background: 'linear-gradient(145deg, #1C2B3A 0%, #2D4A6B 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: '60px 48px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle grid pattern */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.05, width: '100%', height: '100%' }}>
          <defs>
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#E8834A"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 380, width: '100%' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 52 }}>
            <img src="/logo.png" alt="ProSite" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'contain' }}/>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>ProSite</div>
              <div style={{ fontSize: 10, color: '#E8834A', fontWeight: 700, letterSpacing: '0.08em' }}>REMODELING OS</div>
            </div>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 12px', lineHeight: 1.25 }}>
            Run Your Entire<br/>Remodeling Business<br/>
            <span style={{ color: '#E8834A' }}>From One Place</span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: '0 0 36px', lineHeight: 1.6 }}>
            The all-in-one OS built for remodeling contractors.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(232,131,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color="#E8834A" strokeWidth={2}/>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'white' }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <p style={{ position: 'absolute', bottom: -32, left: 0, fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
            © 2026 ProSite. Built for remodeling contractors.
          </p>
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div style={{
        flex: 1, background: 'white', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 56px',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, color: '#1A1A2E' }}>Welcome back</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>Sign in to your ProSite account</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required autoFocus
                style={inp}
                onFocus={e => { e.target.style.borderColor = '#E8834A'; e.target.style.boxShadow = '0 0 0 3px rgba(232,131,74,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = '#E8E4DF'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ ...inp, paddingRight: 44 }}
                  onFocus={e => { e.target.style.borderColor = '#E8834A'; e.target.style.boxShadow = '0 0 0 3px rgba(232,131,74,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8E4DF'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 0 }}>
                  {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: 24 }}>
              <a href="mailto:support@prositeapp.com?subject=Password Reset Request" style={{ fontSize: 13, color: '#E8834A', textDecoration: 'none', fontWeight: 600 }}>
                Forgot password?
              </a>
            </div>

            {error && (
              <div style={{ background: '#FFF0EF', border: '1px solid #FCA5A5', borderRadius: 9, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ color: '#E74C3C', fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-press" style={{
              width: '100%', height: 48, background: loading ? '#F0C4A8' : '#E8834A',
              color: 'white', border: 'none', borderRadius: 10, fontSize: 15,
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#E8E4DF' }}/>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#E8E4DF' }}/>
          </div>

          <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', margin: 0 }}>
            Don&apos;t have an account?{' '}
            <a href="/register" style={{ color: '#E8834A', fontWeight: 700, textDecoration: 'none' }}>
              Start free trial
            </a>
          </p>

          <p style={{ textAlign: 'center', color: '#C4C9D4', fontSize: 11, marginTop: 32 }}>
            <a href="/home" style={{ color: '#C4C9D4', textDecoration: 'none' }}>← Back to home</a>
          </p>
        </div>
      </div>
    </div>
  );
}
