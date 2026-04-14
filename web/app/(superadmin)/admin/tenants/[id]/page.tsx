'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Building2, Shield, Users, FileText, DollarSign, Wrench, Calendar, Tag, X, Printer } from 'lucide-react';
import { apiFetch } from '../../../../../lib/api';

interface TenantDetail {
  id: string; name: string; slug: string; plan: string; status: string;
  createdAt: string; planExpiresAt: string | null;
  stats: {
    clientsCount: number; quotesCount: number; projectsActive: number; projectsCompleted: number;
    invoicesTotal: number; invoicesPaid: number; invoicesOutstanding: number;
    teamMembersCount: number; subcontractorsCount: number; tasksCount: number;
    lastActivity: string | null;
  };
  teamMembers: { firstName: string; lastName: string; role: string; email: string; status: string }[];
  timeline: { type: string; label: string; createdAt: string }[];
  promoUsed: boolean;
}

const PLAN_COLORS: Record<string, string> = { TRIAL: '#F59E0B', SOLO: '#3B82F6', COMPANY: '#8B5CF6', ENTERPRISE: '#EC4899', FREE_FOREVER: '#22C55E' };
const STATUS_COLOR: Record<string, string> = { ACTIVE: '#22C55E', SUSPENDED: '#EF4444', CANCELLED: '#9CA3AF', INACTIVE: '#9CA3AF' };
const PLAN_OPTIONS = ['TRIAL','SOLO','COMPANY','ENTERPRISE','FREE_FOREVER'];

function StatBox({ label, value, sub, color = '#E8834A' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: '#1A2D3F', borderRadius: 12, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const d = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  if (d < 1) return 'Today';
  if (d < 2) return 'Yesterday';
  if (d < 7) return `${Math.floor(d)} days ago`;
  if (d < 30) return `${Math.floor(d / 7)} weeks ago`;
  if (d < 365) return `${Math.floor(d / 30)} months ago`;
  return `${Math.floor(d / 365)} years ago`;
}

export default function TenantDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [planModal, setPlanModal] = useState(false);
  const [trialModal, setTrialModal] = useState(false);
  const [promoModal, setPromoModal] = useState(false);
  const [newPlan, setNewPlan] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const load = () => {
    apiFetch(`/admin/tenants/${id}`).then(r => r.json()).then(d => { setTenant(d); setLoading(false); });
  };
  useEffect(() => { if (id) load(); }, [id]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleChangePlan = async () => {
    if (!newPlan) return;
    setSaving(true);
    await apiFetch(`/admin/tenants/${id}`, { method: 'PATCH', body: JSON.stringify({ plan: newPlan }) });
    setSaving(false); setPlanModal(false); showToast('Plan updated'); load();
  };

  const handleExtendTrial = async () => {
    if (!newExpiry) return;
    setSaving(true);
    await apiFetch(`/admin/tenants/${id}`, { method: 'PATCH', body: JSON.stringify({ planExpiresAt: newExpiry, plan: 'TRIAL' }) });
    setSaving(false); setTrialModal(false); showToast('Trial extended'); load();
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setSaving(true);
    const res = await apiFetch('/promo/apply', { method: 'POST', body: JSON.stringify({ code: promoCode.trim() }) });
    const data = await res.json();
    setSaving(false); setPromoModal(false);
    showToast(data.success ? 'Promo applied!' : data.message || 'Failed');
    if (data.success) load();
  };

  const handleSuspend = async () => {
    if (!confirm(`Suspend ${tenant?.name}? They will lose access.`)) return;
    await apiFetch(`/admin/tenants/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'SUSPENDED' }) });
    showToast('Account suspended'); load();
  };

  const handleActivate = async () => {
    await apiFetch(`/admin/tenants/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'ACTIVE' }) });
    showToast('Account activated'); load();
  };

  const handlePrint = () => window.print();

  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 9, color: 'white', fontSize: 14, padding: '0 12px',
    width: '100%', height: 42, boxSizing: 'border-box', outline: 'none',
  };

  const TIMELINE_COLORS: Record<string, string> = { client: '#22C55E', project: '#3B82F6', invoice: '#8B5CF6', quote: '#E8834A' };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>;
  if (!tenant || (tenant as any).error) return <div style={{ padding: 28, color: 'rgba(255,255,255,0.4)' }}>Tenant not found</div>;

  const daysSinceCreated = Math.floor((Date.now() - new Date(tenant.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{ padding: 28, color: 'white' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: '#22C55E', color: 'white', padding: '10px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, zIndex: 200 }}>{toast}</div>}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <a href="/admin/tenants" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', fontSize: 12.5, textDecoration: 'none', marginBottom: 16 }}>
          <ArrowLeft size={13}/> Back to Companies
        </a>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(232,131,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={22} color="#E8834A" strokeWidth={2}/>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'white' }}>{tenant.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ background: `${PLAN_COLORS[tenant.plan] || '#6B7280'}20`, color: PLAN_COLORS[tenant.plan] || '#9CA3AF', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{tenant.plan}</span>
                <span style={{ background: `${STATUS_COLOR[tenant.status] || '#9CA3AF'}20`, color: STATUS_COLOR[tenant.status] || '#9CA3AF', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{tenant.status}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Created {daysSinceCreated} days ago · {tenant.slug}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => { setNewExpiry(tenant.planExpiresAt ? tenant.planExpiresAt.slice(0,10) : ''); setTrialModal(true); }}
              style={{ padding: '8px 14px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 9, color: '#F59E0B', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              <Calendar size={13} style={{ marginRight: 5, verticalAlign: 'middle' }}/>Extend Trial
            </button>
            <button onClick={() => { setNewPlan(tenant.plan); setPlanModal(true); }}
              style={{ padding: '8px 14px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 9, color: '#3B82F6', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              Change Plan
            </button>
            <button onClick={() => setPromoModal(true)}
              style={{ padding: '8px 14px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 9, color: '#8B5CF6', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              <Tag size={13} style={{ marginRight: 5, verticalAlign: 'middle' }}/>Promo
            </button>
            {tenant.status === 'SUSPENDED'
              ? <button onClick={handleActivate} style={{ padding: '8px 14px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 9, color: '#22C55E', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Activate</button>
              : <button onClick={handleSuspend} style={{ padding: '8px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 9, color: '#EF4444', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Suspend</button>
            }
            <button onClick={handlePrint} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: 'rgba(255,255,255,0.6)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              <Printer size={13} style={{ marginRight: 5, verticalAlign: 'middle' }}/>Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatBox label="Clients" value={tenant.stats.clientsCount}/>
        <StatBox label="Quotes" value={tenant.stats.quotesCount}/>
        <StatBox label="Projects" value={`${tenant.stats.projectsActive} active`} sub={`${tenant.stats.projectsCompleted} completed`}/>
        <StatBox label="Invoices Paid" value={`$${tenant.stats.invoicesPaid.toFixed(0)}`} sub={`$${tenant.stats.invoicesOutstanding.toFixed(0)} outstanding`} color="#22C55E"/>
        <StatBox label="Team Members" value={tenant.stats.teamMembersCount} color="#3B82F6"/>
        <StatBox label="Subcontractors" value={tenant.stats.subcontractorsCount} color="#8B5CF6"/>
        <StatBox label="Tasks" value={tenant.stats.tasksCount} color="#F59E0B"/>
        <StatBox label="Last Activity" value={tenant.stats.lastActivity ? timeAgo(tenant.stats.lastActivity) : 'Never'} color={tenant.stats.lastActivity ? '#22C55E' : '#EF4444'}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Activity Timeline */}
        <div style={{ background: '#1A2D3F', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Activity Timeline</span>
          </div>
          <div style={{ padding: '4px 0' }}>
            {tenant.timeline.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>No activity yet</div>
            ) : tenant.timeline.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: TIMELINE_COLORS[item.type] || '#6B7280', marginTop: 5, flexShrink: 0 }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{timeAgo(item.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Plan management */}
          <div style={{ background: '#1A2D3F', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 14 }}>Plan Management</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>Current Plan</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: PLAN_COLORS[tenant.plan] || '#9CA3AF' }}>{tenant.plan}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>Status</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: STATUS_COLOR[tenant.status] || '#9CA3AF' }}>{tenant.status}</span>
              </div>
              {tenant.planExpiresAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>Plan Expires</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{new Date(tenant.planExpiresAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Team */}
          {tenant.teamMembers.length > 0 && (
            <div style={{ background: '#1A2D3F', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13, fontWeight: 700, color: 'white' }}>
                Team Members
              </div>
              {tenant.teamMembers.slice(0,6).map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(232,131,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#E8834A' }}>{m.firstName[0]}{m.lastName[0]}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'white' }}>{m.firstName} {m.lastName}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Change Plan Modal */}
      {planModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1A2D3F', borderRadius: 16, padding: 28, width: 360, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'white' }}>Change Plan</h3>
              <button onClick={() => setPlanModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}><X size={18}/></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {PLAN_OPTIONS.map(p => (
                <button key={p} onClick={() => setNewPlan(p)} style={{ height: 40, borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `2px solid ${newPlan === p ? PLAN_COLORS[p] || '#E8834A' : 'rgba(255,255,255,0.1)'}`, background: newPlan === p ? `${PLAN_COLORS[p] || '#E8834A'}15` : 'transparent', color: newPlan === p ? (PLAN_COLORS[p] || '#E8834A') : 'rgba(255,255,255,0.6)' }}>{p}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setPlanModal(false)} style={{ flex: 1, height: 40, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleChangePlan} disabled={saving} style={{ flex: 1, height: 40, background: '#E8834A', border: 'none', borderRadius: 9, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Trial Modal */}
      {trialModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1A2D3F', borderRadius: 16, padding: 28, width: 360, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'white' }}>Extend Trial</h3>
              <button onClick={() => setTrialModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}><X size={18}/></button>
            </div>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>New Expiry Date</label>
            <input type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} style={{ ...inp }}/>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setTrialModal(false)} style={{ flex: 1, height: 40, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleExtendTrial} disabled={saving} style={{ flex: 1, height: 40, background: '#E8834A', border: 'none', borderRadius: 9, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Saving…' : 'Extend'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Promo Modal */}
      {promoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1A2D3F', borderRadius: 16, padding: 28, width: 360, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'white' }}>Apply Promo Code</h3>
              <button onClick={() => setPromoModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}><X size={18}/></button>
            </div>
            <input type="text" placeholder="PARTNER90" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} style={{ ...inp }}/>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setPromoModal(false)} style={{ flex: 1, height: 40, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleApplyPromo} disabled={saving} style={{ flex: 1, height: 40, background: '#8B5CF6', border: 'none', borderRadius: 9, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Applying…' : 'Apply'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          aside, button { display: none !important; }
          * { color: #000 !important; background: white !important; border-color: #ccc !important; }
        }
      `}</style>
    </div>
  );
}
