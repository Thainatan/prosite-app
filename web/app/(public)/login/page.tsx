'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 800));
    if (email === 'admin@prosite.com' && password === 'prosite123') {
      window.location.href = '/dashboard';
    } else {
      setError('Invalid credentials. Use admin@prosite.com / prosite123');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#0F1117', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:420 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <img src="/logo.png" alt="ProSite" style={{ width:40, height:40, borderRadius:10, objectFit:'contain' }}/>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:22, fontWeight:800, color:'white' }}>ProSite</div>
              <div style={{ fontSize:10, color:'#4F7EF7', fontWeight:600, letterSpacing:'0.08em' }}>REMODELING OS</div>
            </div>
          </div>
          <p style={{ color:'#8892B0', fontSize:14, margin:0 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{ background:'#161924', borderRadius:16, border:'1px solid #1E2130', padding:32 }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#E2E8F0', marginBottom:6 }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required
                style={{ width:'100%', height:44, background:'#0F1117', border:'1px solid #1E2130', borderRadius:10, padding:'0 14px', fontSize:14, color:'white', outline:'none', boxSizing:'border-box' }}
              />
            </div>
            <div style={{ marginBottom:8 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#E2E8F0', marginBottom:6 }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ width:'100%', height:44, background:'#0F1117', border:'1px solid #1E2130', borderRadius:10, padding:'0 14px', fontSize:14, color:'white', outline:'none', boxSizing:'border-box' }}
              />
            </div>
            <div style={{ textAlign:'right', marginBottom:20 }}>
              <a href="#" style={{ fontSize:13, color:'#4F7EF7', textDecoration:'none', fontWeight:600 }}>Forgot password?</a>
            </div>

            {error && (
              <div style={{ background:'#2D1515', border:'1px solid #F0584C', borderRadius:9, padding:'10px 14px', marginBottom:16 }}>
                <p style={{ color:'#F0584C', fontSize:13, margin:0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width:'100%', height:46, background: loading ? '#2D3A6B' : '#4F7EF7',
              color:'white', border:'none', borderRadius:10, fontSize:15,
              fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid #1E2130', textAlign:'center' }}>
            <p style={{ fontSize:13, color:'#8892B0', margin:0 }}>
              Don't have an account?{' '}
              <a href="/register" style={{ color:'#4F7EF7', fontWeight:700, textDecoration:'none' }}>Start free trial</a>
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <div style={{ marginTop:16, background:'#1A1D2E', borderRadius:10, padding:'12px 16px', border:'1px solid #2D3A6B' }}>
          <p style={{ fontSize:12, color:'#4F7EF7', margin:0, fontWeight:600 }}>
            Demo credentials:<br/>
            <span style={{ fontFamily:'monospace' }}>admin@prosite.com</span> / <span style={{ fontFamily:'monospace' }}>prosite123</span>
          </p>
        </div>

        <p style={{ textAlign:'center', color:'#3D4466', fontSize:12, marginTop:20 }}>
          © 2026 ProSite · <a href="/home" style={{ color:'#3D4466' }}>Back to home</a>
        </p>
      </div>
    </div>
  );
}