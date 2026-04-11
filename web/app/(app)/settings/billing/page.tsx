'use client';
import { useState, useEffect } from 'react';
import { CreditCard, Check, Zap, Building2, Shield, ExternalLink } from 'lucide-react';
import { apiFetch } from '../../../../lib/api';

interface BillingStatus {
  plan: string;
  status: string;
  planExpiresAt: string | null;
  daysLeftInTrial: number | null;
  hasStripe: boolean;
}

const PLANS = [
  {
    key: 'SOLO',
    name: 'Solo',
    price: 29,
    users: '1 user',
    Icon: Zap,
    features: ['Unlimited quotes', 'Project tracking', 'Invoice generation', 'Client management'],
  },
  {
    key: 'COMPANY',
    name: 'Company',
    price: 79,
    users: 'Up to 5 users',
    Icon: Building2,
    popular: true,
    features: ['Everything in Solo', 'Team management', 'Subcontractor portal', 'Reports & analytics', 'Priority support'],
  },
  {
    key: 'ENTERPRISE',
    name: 'Enterprise',
    price: 149,
    users: 'Up to 20 users',
    Icon: Shield,
    features: ['Everything in Company', 'Custom branding', 'API access', 'Dedicated support', 'White-label option'],
  },
];

const brand = '#E8834A';

export default function BillingPage() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      window.history.replaceState({}, '', '/settings/billing');
    }
    apiFetch('/billing/status')
      .then(r => r.json())
      .then(d => { setStatus(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleUpgrade = async (plan: string) => {
    setCheckoutLoading(plan);
    try {
      const res = await apiFetch('/billing/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan,
          successUrl: window.location.origin + '/settings/billing?success=1',
          cancelUrl: window.location.origin + '/settings/billing',
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Could not start checkout');
    } catch {
      alert('Could not connect to billing service');
    } finally {
      setCheckoutLoading('');
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await apiFetch('/billing/portal');
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
      else alert(data.error || 'Could not open billing portal');
    } catch {
      alert('Could not connect to billing service');
    } finally {
      setPortalLoading(false);
    }
  };

  const currentPlan = status?.plan ?? 'TRIAL';
  const isTrial = currentPlan === 'TRIAL';

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F3', padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <CreditCard size={22} color={brand} strokeWidth={2}/>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1A1A2E' }}>Billing & Plans</h1>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>Manage your subscription and billing information.</p>
        </div>

        {/* Current Plan Card */}
        {!loading && status && (
          <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', marginBottom: 28, border: '1px solid #E8E4DF', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500, marginBottom: 4 }}>Current Plan</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#1A1A2E' }}>{currentPlan}</span>
                  {isTrial && status.daysLeftInTrial !== null && (
                    <span style={{ fontSize: 12, background: status.daysLeftInTrial <= 3 ? '#FEF2F2' : '#EFF6FF', color: status.daysLeftInTrial <= 3 ? '#EF4444' : '#3B82F6', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>
                      {status.daysLeftInTrial > 0 ? `${status.daysLeftInTrial} days left` : 'Expired'}
                    </span>
                  )}
                </div>
              </div>
              {!isTrial && status.hasStripe && (
                <button onClick={handlePortal} disabled={portalLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', background: 'white', border: `1px solid #E8E4DF`, borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                  <ExternalLink size={14}/>
                  {portalLoading ? 'Opening…' : 'Manage Billing'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Plan Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {PLANS.map(({ key, name, price, users, Icon, popular, features }) => {
            const isCurrent = currentPlan === key;
            return (
              <div key={key} style={{
                background: 'white', borderRadius: 14, padding: '22px 20px',
                border: `2px solid ${isCurrent ? brand : popular ? '#BFDBFE' : '#E8E4DF'}`,
                boxShadow: isCurrent ? `0 0 0 4px rgba(232,131,74,0.12)` : '0 1px 4px rgba(0,0,0,0.04)',
                position: 'relative',
              }}>
                {popular && !isCurrent && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#3B82F6', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 99, whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>
                    MOST POPULAR
                  </div>
                )}
                {isCurrent && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: brand, color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 99, whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>
                    CURRENT PLAN
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FEF3EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color={brand} strokeWidth={2}/>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1A2E' }}>{name}</span>
                </div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: '#1A1A2E' }}>${price}</span>
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>/month</span>
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>{users}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
                  {features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Check size={12} color="#22C55E" strokeWidth={3}/>
                      <span style={{ fontSize: 12, color: '#374151' }}>{f}</span>
                    </div>
                  ))}
                </div>
                {isCurrent
                  ? <div style={{ height: 38, borderRadius: 9, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#6B7280' }}>Current Plan</div>
                  : (
                    <button onClick={() => handleUpgrade(key)} disabled={checkoutLoading === key}
                      style={{ width: '100%', height: 38, borderRadius: 9, background: brand, color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: checkoutLoading === key ? 0.7 : 1 }}>
                      {checkoutLoading === key ? 'Loading…' : isTrial ? 'Start Plan' : 'Upgrade'}
                    </button>
                  )
                }
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
          All plans include a 14-day free trial. Cancel anytime. Prices in USD.
        </p>
      </div>
    </div>
  );
}
