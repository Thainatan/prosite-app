'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Gift, Check, ArrowRight, Zap } from 'lucide-react';

interface PromoInfo {
  valid: boolean;
  description?: string;
  trialDays?: number;
  plan?: string;
  type?: string;
}

export default function InvitePage() {
  const params = useParams();
  const code = (params?.code as string || '').toUpperCase();
  const [promo, setPromo] = useState<PromoInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    fetch('https://prosite-app-production.up.railway.app/promo/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then(r => r.json())
      .then(d => { setPromo(d); setLoading(false); })
      .catch(() => { setPromo({ valid: false }); setLoading(false); });
  }, [code]);

  const trialDays = promo?.trialDays ?? 14;
  const isForever = promo?.plan === 'FREE_FOREVER';
  const planLabel = promo?.plan ? promo.plan.replace('_', ' ') : 'Company';

  return (
    <div style={{ fontFamily: 'sans-serif', background: 'linear-gradient(135deg,#1C2B3A 0%,#2D4A6B 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

      {/* Card */}
      <div style={{ background: 'white', borderRadius: 24, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          <img src="/logo.png" alt="ProSite" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1C2B3A' }}>ProSite</div>
            <div style={{ fontSize: 10, color: '#E8834A', fontWeight: 700, letterSpacing: '0.06em' }}>REMODELING OS</div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '24px 0', color: '#9CA3AF', fontSize: 14 }}>Validating your invite...</div>
        ) : !promo?.valid ? (
          <>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Gift size={32} color="#EF4444" strokeWidth={1.8} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1C2B3A', margin: '0 0 10px' }}>Invalid Invite Code</h2>
            <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 28px' }}>This invite link has expired or doesn't exist. You can still start a free trial without a code.</p>
            <a href="/register" style={{ display: 'inline-block', padding: '14px 32px', background: '#E8834A', color: 'white', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              Start Free Trial →
            </a>
          </>
        ) : (
          <>
            {/* Gift icon */}
            <div style={{ width: 72, height: 72, borderRadius: 20, background: '#FEF3EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              {isForever ? <Zap size={36} color="#E8834A" strokeWidth={1.8} /> : <Gift size={36} color="#E8834A" strokeWidth={1.8} />}
            </div>

            <div style={{ display: 'inline-block', background: '#E8834A', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 999, marginBottom: 16, letterSpacing: '0.06em' }}>
              EXCLUSIVE INVITE
            </div>

            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1C2B3A', margin: '0 0 10px' }}>
              {isForever ? 'Free Forever Access' : `${trialDays}-Day Free Trial`}
            </h2>

            <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 28px', lineHeight: 1.6 }}>
              {promo.description || (isForever
                ? 'You\'ve been given free lifetime access to ProSite.'
                : `You've been invited to try ProSite free for ${trialDays} days — no credit card required.`)}
            </p>

            {/* Perks */}
            <div style={{ background: '#F7F8FC', borderRadius: 14, padding: '18px 20px', marginBottom: 28, textAlign: 'left' }}>
              {[
                isForever ? 'Free forever — no billing ever' : `${trialDays} days free (vs. standard 14)`,
                `${planLabel} plan features included`,
                'Quotes, projects, invoices, team management',
                'Mobile app — works on iOS & Android',
                'No credit card required',
              ].map(perk => (
                <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <Check size={15} color="#22C55E" strokeWidth={2.5} />
                  <span style={{ fontSize: 14, color: '#374151' }}>{perk}</span>
                </div>
              ))}
            </div>

            {/* Promo code display */}
            <div style={{ background: '#1C2B3A', borderRadius: 10, padding: '10px 18px', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#8BA3B8', fontWeight: 600 }}>YOUR CODE</span>
              <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 800, color: '#E8834A', letterSpacing: '0.1em' }}>{code}</span>
            </div>

            <br />

            <a
              href={`/register?code=${encodeURIComponent(code)}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', background: '#E8834A', color: 'white', borderRadius: 14, fontSize: 16, fontWeight: 700, textDecoration: 'none', marginBottom: 14 }}
            >
              Claim Your Invite <ArrowRight size={18} />
            </a>

            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>By signing up you agree to our terms of service.</p>
          </>
        )}
      </div>

      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 24 }}>© 2026 ProSite · Built for remodeling contractors</p>
    </div>
  );
}
