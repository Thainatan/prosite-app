'use client';
import { useEffect, useState } from 'react';
import { Shield, TrendingUp, TrendingDown, Users, DollarSign, Building2, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../../../lib/api';

interface Overview {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  paidTenants: number;
  totalRevenue: number;
  totalClients: number;
  totalQuotes: number;
  totalProjects: number;
  totalInvoices: number;
  newTenantsThisMonth: number;
  newTenantsLastMonth: number;
  growthRate: number;
}

interface TenantRow {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  createdAt: string;
  planExpiresAt: string | null;
  stats: { clientsCount: number; quotesCount: number; projectsCount: number; invoicesPaidTotal: number; lastActivity: string | null };
}

const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;
const fmtNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
const PLAN_COLORS: Record<string, string> = { TRIAL: '#F59E0B', SOLO: '#3B82F6', COMPANY: '#8B5CF6', ENTERPRISE: '#EC4899', FREE_FOREVER: '#22C55E' };
const STATUS_COLOR: Record<string, string> = { ACTIVE: '#22C55E', SUSPENDED: '#EF4444', CANCELLED: '#9CA3AF', INACTIVE: '#9CA3AF' };

function StatCard({ label, value, sub, color, icon: Icon }: { label: string; value: string; sub?: string; color: string; icon: any }) {
  return (
    <div style={{ background: '#1A2D3F', borderRadius: 14, padding: '18px 20px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color={color} strokeWidth={2}/>
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function BarChart({ data, color = '#E8834A', height = 80 }: { data: { label: string; value: number }[]; color?: string; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', height: `${Math.max((d.value / max) * (height - 20), 2)}px`, background: color, borderRadius: '3px 3px 0 0', opacity: 0.85, transition: 'height 0.3s' }}/>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%', textOverflow: 'ellipsis' }}>{d.label.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [signups, setSignups] = useState<{ label: string; value: number }[]>([]);
  const [revenue, setRevenue] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    Promise.all([
      apiFetch('/admin/overview').then(r => r.json()),
      apiFetch('/admin/tenants').then(r => r.json()),
      apiFetch('/admin/reports').then(r => r.json()),
    ]).then(([ov, ten, rep]) => {
      setOverview(ov);
      setTenants(Array.isArray(ten) ? ten : []);
      if (rep.signupsByMonth) setSignups(rep.signupsByMonth.slice(-6).map((s: any) => ({ label: s.month, value: s.count })));
      if (rep.revenueByMonth) setRevenue(rep.revenueByMonth.slice(-6).map((s: any) => ({ label: s.month, value: s.total })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const now = new Date();
  const trialsExpiringSoon = tenants.filter(t => {
    if (t.plan !== 'TRIAL' || !t.planExpiresAt) return false;
    const daysLeft = Math.ceil((new Date(t.planExpiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 3;
  });
  const suspended = tenants.filter(t => t.status === 'SUSPENDED');
  const inactive = tenants.filter(t => {
    if (!t.stats.lastActivity) return true;
    const daysAgo = (now.getTime() - new Date(t.stats.lastActivity).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo > 30;
  });

  const planCounts: Record<string, number> = {};
  tenants.forEach(t => { planCounts[t.plan] = (planCounts[t.plan] || 0) + 1; });
  const planTotal = tenants.length || 1;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <RefreshCw size={20} color="rgba(255,255,255,0.3)" style={{ animation: 'spin 1s linear infinite' }}/>
    </div>
  );

  return (
    <div style={{ padding: 28, color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield size={24} color="#E8834A" strokeWidth={2}/>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'white' }}>ProSite Admin Panel</h1>
            <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,0.4)' }}>
              {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div style={{ background: 'rgba(232,131,74,0.12)', border: '1px solid rgba(232,131,74,0.25)', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#E8834A', fontWeight: 600 }}>
          Logged in as Super Admin
        </div>
      </div>

      {/* Stats row */}
      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 24 }}>
          <StatCard label="Total Companies" value={fmtNum(overview.totalTenants)} sub={`+${overview.newTenantsThisMonth} this month`} color="#E8834A" icon={Building2}/>
          <StatCard label="Active This Month" value={fmtNum(overview.activeTenants)} sub="had activity in 30d" color="#22C55E" icon={TrendingUp}/>
          <StatCard label="Trial Accounts" value={fmtNum(overview.trialTenants)} sub={trialsExpiringSoon.length > 0 ? `${trialsExpiringSoon.length} expiring soon` : 'no expiring soon'} color="#F59E0B" icon={AlertTriangle}/>
          <StatCard label="Paid Accounts" value={fmtNum(overview.paidTenants)} sub="active subscriptions" color="#3B82F6" icon={Users}/>
          <StatCard label="Platform Revenue" value={fmt(overview.totalRevenue)} sub="all-time paid invoices" color="#8B5CF6" icon={DollarSign}/>
          <StatCard label="New This Month" value={fmtNum(overview.newTenantsThisMonth)} sub={overview.growthRate >= 0 ? `+${overview.growthRate}% vs last month` : `${overview.growthRate}% vs last month`} color={overview.growthRate >= 0 ? '#22C55E' : '#EF4444'} icon={overview.growthRate >= 0 ? TrendingUp : TrendingDown}/>
        </div>
      )}

      {/* Charts + plan distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 16, marginBottom: 24 }}>
        {/* Signups chart */}
        <div style={{ background: '#1A2D3F', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 16 }}>New Signups — Last 6 Months</div>
          <BarChart data={signups} color="#E8834A" height={100}/>
        </div>
        {/* Revenue chart */}
        <div style={{ background: '#1A2D3F', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 16 }}>Revenue Trend — Last 6 Months</div>
          <BarChart data={revenue.map(r => ({ ...r, value: r.value }))} color="#8B5CF6" height={100}/>
        </div>
        {/* Plan distribution */}
        <div style={{ background: '#1A2D3F', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 14 }}>Plan Distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(planCounts).map(([plan, count]) => (
              <div key={plan}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{plan}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{count}</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${(count / planTotal) * 100}%`, background: PLAN_COLORS[plan] || '#6B7280', borderRadius: 2 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(trialsExpiringSoon.length > 0 || suspended.length > 0) && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 12 }}>Alerts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {trialsExpiringSoon.map(t => (
              <div key={t.id} style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={14} color="#F59E0B"/>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                    <strong style={{ color: 'white' }}>{t.name}</strong> — trial expires {t.planExpiresAt ? new Date(t.planExpiresAt).toLocaleDateString() : 'soon'}
                  </span>
                </div>
                <a href={`/admin/tenants/${t.id}`} style={{ fontSize: 12, color: '#E8834A', fontWeight: 600, textDecoration: 'none' }}>Extend →</a>
              </div>
            ))}
            {suspended.map(t => (
              <div key={t.id} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                  <strong style={{ color: 'white' }}>{t.name}</strong> — account suspended
                </span>
                <a href={`/admin/tenants/${t.id}`} style={{ fontSize: 12, color: '#E8834A', fontWeight: 600, textDecoration: 'none' }}>View →</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent signups table */}
      <div style={{ background: '#1A2D3F', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Recent Signups</span>
          <a href="/admin/tenants" style={{ fontSize: 12, color: '#E8834A', fontWeight: 600, textDecoration: 'none' }}>View all →</a>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Company', 'Plan', 'Signed Up', 'Clients', 'Revenue', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.slice(0, 10).map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'white' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{t.slug}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: `${PLAN_COLORS[t.plan] || '#6B7280'}20`, color: PLAN_COLORS[t.plan] || '#9CA3AF', padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{t.plan}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t.stats.clientsCount}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#22C55E', fontWeight: 600 }}>${t.stats.invoicesPaidTotal.toFixed(0)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: `${STATUS_COLOR[t.status] || '#9CA3AF'}20`, color: STATUS_COLOR[t.status] || '#9CA3AF', padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{t.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <a href={`/admin/tenants/${t.id}`} style={{ fontSize: 12, color: '#E8834A', fontWeight: 600, textDecoration: 'none' }}>View →</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
