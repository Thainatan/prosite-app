'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Building2, CheckCircle, Users, FileText, DollarSign, Check, Tag, X } from 'lucide-react';
import { setToken } from '../../../lib/auth';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const BENEFITS = [
  { Icon: FileText,   title: 'Professional Quotes',   desc: 'Create and send quotes in minutes' },
  { Icon: Building2,  title: 'Project Management',    desc: 'Track every job from quote to completion' },
  { Icon: DollarSign, title: 'Invoice & Payments',    desc: 'Get paid faster with digital invoices' },
  { Icon: Users,      title: 'Team Management',       desc: 'Assign tasks and manage your crew' },
];

const PLANS = [
  {
    key: 'SOLO',
    name: 'Solo',
    price: 29,
    users: '1 user',
    features: ['Unlimited quotes', 'Project tracking', 'Invoice generation'],
    popular: false,
  },
  {
    key: 'COMPANY',
    name: 'Company',
    price: 79,
    users: 'Up to 5 users',
    features: ['Everything in Solo', 'Team management', 'Subcontractor portal', 'Reports & analytics'],
    popular: true,
  },
  {
    key: 'ENTERPRISE',
    name: 'Enterprise',
    price: 149,
    users: 'Up to 20 users',
    features: ['Everything in Company', 'Custom branding', 'Priority support', 'API access'],
    popular: false,
  },
];

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: '', color: '#E8E4DF' },
    { label: 'Weak', color: '#EF4444' },
    { label: 'Fair', color: '#F59E0B' },
    { label: 'Good', color: '#3B82F6' },
    { label: 'Strong', color: '#22C55E' },
  ];
  return { score, ...levels[score] };
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    companyName: '', firstName: '', lastName: '',
    email: '', password: '', confirmPassword: '', plan: 'TRIAL',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [promoInfo, setPromoInfo] = useState<{ type: string; trialDays: number; plan: string; description: string } | null>(null);
  const promoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pw = passwordStrength(form.password);

  // Pre-fill promo code from URL ?code= param
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setPromoCode(code.toUpperCase());
      validatePromoCode(code.toUpperCase());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validatePromoCode = async (code: string) => {
    if (!code.trim()) { setPromoStatus('idle'); setPromoInfo(null); return; }
    setPromoStatus('checking');
    try {
      const res = await fetch(`${API}/promo/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoStatus('valid');
        setPromoInfo({ type: data.type, trialDays: data.trialDays, plan: data.plan, description: data.description });
      } else {
        setPromoStatus('invalid');
        setPromoInfo(null);
      }
    } catch {
      setPromoStatus('idle');
    }
  };

  const handlePromoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setPromoCode(val);
    setPromoStatus('idle');
    setPromoInfo(null);
    if (promoTimerRef.current) clearTimeout(promoTimerRef.current);
    if (val.trim()) {
      promoTimerRef.current = setTimeout(() => validatePromoCode(val), 500);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const body: Record<string, string> = {
        companyName: form.companyName,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        plan: 'TRIAL',
      };
      if (promoCode.trim() && promoStatus === 'valid') {
        body.promoCode = promoCode.trim();
      }
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('prosite_user', JSON.stringify(data.user));
        localStorage.setItem('onboarding_new', '1');
        window.location.href = '/dashboard';
      } else {
        setError('Registration failed. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Could not connect to server. Please try again.');
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', height: 48, background: '#FAF9F7', border: '1px solid #E8E4DF',
    borderRadius: 9, padding: '0 12px', fontSize: 16, color: '#1A1A2E',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
  };
  const focus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#E8834A';
    e.target.style.boxShadow = '0 0 0 3px rgba(232,131,74,0.15)';
  };
  const blur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#E8E4DF';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* LEFT PANEL (hidden on mobile) */}
      <div className="auth-left-panel" style={{
        flex: '0 0 42%', background: 'linear-gradient(145deg, #1C2B3A 0%, #2D4A6B 100%)',
        flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: '48px 44px', position: 'relative', overflow: 'hidden',
      }}>
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.05, width: '100%', height: '100%' }}>
          <defs>
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#E8834A"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 360, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <img src="/logo.png" alt="ProSite" style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'contain' }}/>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>ProSite</div>
              <div style={{ fontSize: 10, color: '#E8834A', fontWeight: 700, letterSpacing: '0.08em' }}>REMODELING OS</div>
            </div>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', margin: '0 0 10px', lineHeight: 1.3 }}>
            Join 500+ remodeling<br/>
            <span style={{ color: '#E8834A' }}>contractors</span> who trust<br/>
            ProSite
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 32px' }}>
            14-day free trial — no credit card required
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
            {BENEFITS.map(({ Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(232,131,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color="#E8834A" strokeWidth={2}/>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{title}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(232,131,74,0.1)', border: '1px solid rgba(232,131,74,0.2)', borderRadius: 10, padding: '12px 16px' }}>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              <span style={{ color: '#E8834A', fontWeight: 700 }}>Free for 14 days.</span>{' '}
              No credit card needed. Cancel anytime.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right-panel" style={{ flex: 1, background: 'white', overflowY: 'auto', padding: '40px 52px', boxShadow: '-8px 0 40px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#1A1A2E' }}>Create your account</h2>
            <p style={{ margin: 0, fontSize: 13.5, color: '#6B7280' }}>Start your free 14-day trial today</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Company Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Company Name *</label>
              <input type="text" value={form.companyName} onChange={set('companyName')}
                placeholder="ABC Remodeling LLC" required style={inp} onFocus={focus} onBlur={blur}/>
            </div>

            {/* Name row */}
            <div className="name-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 5 }}>First Name *</label>
                <input type="text" value={form.firstName} onChange={set('firstName')}
                  placeholder="John" required style={inp} onFocus={focus} onBlur={blur}/>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Last Name *</label>
                <input type="text" value={form.lastName} onChange={set('lastName')}
                  placeholder="Smith" required style={inp} onFocus={focus} onBlur={blur}/>
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Email *</label>
              <input type="email" value={form.email} onChange={set('email')}
                placeholder="john@abcremodeling.com" required style={inp} onFocus={focus} onBlur={blur}/>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 4 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Password *</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Min. 8 characters" required style={{ ...inp, paddingRight: 40 }}
                  onFocus={focus} onBlur={blur}/>
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            {form.password && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pw.score ? pw.color : '#E8E4DF', transition: 'background 0.2s' }}/>
                  ))}
                </div>
                {pw.label && <span style={{ fontSize: 11, color: pw.color, fontWeight: 600 }}>{pw.label}</span>}
              </div>
            )}

            {/* Confirm Password */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Confirm Password *</label>
              <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                placeholder="••••••••" required style={{ ...inp, borderColor: form.confirmPassword && form.confirmPassword !== form.password ? '#EF4444' : '#E8E4DF' }}
                onFocus={focus} onBlur={blur}/>
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#EF4444' }}>Passwords do not match</p>
              )}
            </div>

            {/* Plan Selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Choose your plan <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>(upgrade anytime)</span>
              </label>
              <div className="plan-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {PLANS.map(p => (
                  <div key={p.key} onClick={() => setForm(f => ({ ...f, plan: p.key }))}
                    style={{
                      border: `2px solid ${form.plan === p.key ? '#E8834A' : '#E8E4DF'}`,
                      borderRadius: 10, padding: '12px 10px', cursor: 'pointer',
                      background: form.plan === p.key ? 'rgba(232,131,74,0.06)' : 'white',
                      position: 'relative', transition: 'all 0.15s',
                    }}>
                    {p.popular && (
                      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#E8834A', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99, whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
                        POPULAR
                      </div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E', marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#E8834A' }}>${p.price}<span style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF' }}>/mo</span></div>
                    <div style={{ fontSize: 10.5, color: '#6B7280', marginTop: 4 }}>{p.users}</div>
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {p.features.slice(0,2).map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Check size={10} color="#22C55E" strokeWidth={3}/>
                          <span style={{ fontSize: 10, color: '#6B7280' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9CA3AF' }}>
                All plans include a 14-day free trial. No credit card required.
              </p>
            </div>

            {/* Promo Code */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                Promo Code <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>(optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Tag size={15} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                <input
                  type="text"
                  value={promoCode}
                  onChange={handlePromoChange}
                  placeholder="e.g. PARTNER90"
                  style={{
                    ...inp,
                    paddingLeft: 36,
                    paddingRight: promoCode ? 36 : 12,
                    borderColor: promoStatus === 'valid' ? '#22C55E' : promoStatus === 'invalid' ? '#EF4444' : '#E8E4DF',
                    boxShadow: promoStatus === 'valid' ? '0 0 0 3px rgba(34,197,94,0.15)' : promoStatus === 'invalid' ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none',
                    letterSpacing: '0.05em', fontWeight: 600,
                  }}
                />
                {promoCode && (
                  <button type="button" onClick={() => { setPromoCode(''); setPromoStatus('idle'); setPromoInfo(null); }}
                    style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}>
                    <X size={14}/>
                  </button>
                )}
              </div>
              {promoStatus === 'checking' && (
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9CA3AF' }}>Validating code…</p>
              )}
              {promoStatus === 'invalid' && (
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#EF4444', fontWeight: 600 }}>Invalid or expired promo code.</p>
              )}
              {promoStatus === 'valid' && promoInfo && (
                <div style={{
                  marginTop: 8, borderRadius: 9, padding: '10px 14px',
                  background: promoInfo.type === 'FREE_FOREVER' ? 'rgba(34,197,94,0.08)' : 'rgba(59,130,246,0.08)',
                  border: `1px solid ${promoInfo.type === 'FREE_FOREVER' ? '#22C55E' : '#3B82F6'}`,
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                }}>
                  <Check size={14} color={promoInfo.type === 'FREE_FOREVER' ? '#22C55E' : '#3B82F6'} style={{ marginTop: 1, flexShrink: 0 }} strokeWidth={3}/>
                  <div>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: promoInfo.type === 'FREE_FOREVER' ? '#15803D' : '#1D4ED8' }}>
                      {promoCode} applied!
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#374151' }}>
                      {promoInfo.type === 'FREE_FOREVER'
                        ? 'Free Forever access — no subscription needed.'
                        : `${promoInfo.trialDays} days free on ${promoInfo.plan} plan.`}
                      {promoInfo.description ? ` ${promoInfo.description}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div style={{ background: '#FFF0EF', border: '1px solid #FCA5A5', borderRadius: 9, padding: '10px 14px', marginBottom: 14 }}>
                <p style={{ color: '#E74C3C', fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', height: 48, background: loading ? '#F0C4A8' : '#E8834A',
              color: 'white', border: 'none', borderRadius: 10, fontSize: 15,
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading ? 'Creating account…' : (
                <><CheckCircle size={18}/>Start Free Trial</>
              )}
            </button>
          </form>

          <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', margin: '16px 0 0' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#E8834A', fontWeight: 700, textDecoration: 'none' }}>Sign in</a>
          </p>
          <p style={{ textAlign: 'center', color: '#C4C9D4', fontSize: 11, margin: '24px 0 0' }}>
            <a href="/home" style={{ color: '#C4C9D4', textDecoration: 'none' }}>← Back to home</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
