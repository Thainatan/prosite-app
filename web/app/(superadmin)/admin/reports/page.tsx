'use client';
import { useEffect, useState } from 'react';
import { BarChart3, DollarSign, TrendingUp, Users, Printer, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../../../lib/api';

interface ReportData {
  revenueByMonth: { month: string; total: number }[];
  signupsByMonth: { month: string; count: number }[];
  tenantsByPlan: Record<string, number>;
  topTenants: { id: string; name: string; plan: string; status: string; createdAt: string; invoicesPaid: number; clientsCount: number }[];
  totalRevenue: number;
  totalTenants: number;
}

const PLAN_COLORS: Record<string, string> = { TRIAL: '#F59E0B', SOLO: '#3B82F6', COMPANY: '#8B5CF6', ENTERPRISE: '#EC4899', FREE_FOREVER: '#22C55E' };
const STATUS_COLOR: Record<string, string> = { ACTIVE: '#22C55E', SUSPENDED: '#EF4444', CANCELLED: '#9CA3AF', INACTIVE: '#9CA3AF' };

function BarChart({ data, color, height = 100 }: { data: { label: string; value: number }[]; color: string; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: height + 20 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            {d.value > 0 ? (d.value >= 1000 ? `$${(d.value/1000).toFixed(1)}k` : String(d.value)) : ''}
          </span>
          <div style={{ width: '100%', height: `${Math.max((d.value / max) * height, 2)}px`, background: color, borderRadius: '3px 3px 0 0', opacity: 0.85 }}/>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%', textAlign: 'center' }}>{d.label.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'6' | '12'>('6');

  const load = () => {
    setLoading(true);
    apiFetch('/admin/reports').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const handlePrint = () => window.print();

  if (loading || !data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <RefreshCw size={20} color="rgba(255,255,255,0.3)"/>
    </div>
  );

  const n = Number(range);
  const revenue = data.revenueByMonth.slice(-n);
  const signups = data.signupsByMonth.slice(-n);

  const totalPlanCount = Object.values(data.tenantsByPlan).reduce((s, v) => s + v, 0) || 1;
  const revenueThisMonth = revenue[revenue.length - 1]?.total ?? 0;
  const revenueLastMonth = revenue[revenue.length - 2]?.total ?? 0;
  const revGrowth = revenueLastMonth > 0 ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100) : 0;
  const signupsThisMonth = signups[signups.length - 1]?.count ?? 0;
  const signupsLastMonth = signups[signups.length - 2]?.count ?? 0;

  const btn = (v: '6' | '12') => ({
    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' as const,
    background: range === v ? '#E8834A' : 'rgba(255,255,255,0.06)',
    border: `1px solid ${range === v ? '#E8834A' : 'rgba(255,255,255,0.1)'}`,
    color: range === v ? 'white' : 'rgba(255,255,255,0.5)',
  });

  return (
    <div style={{ padding: 28, color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <BarChart3 size={20} color="#E8834A" strokeWidth={2}/>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Platform Reports</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Platform-wide analytics and insights</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={btn('6')} onClick={() => setRange('6')}>6 Months</button>
          <button style={btn('12')} onClick={() => setRange('12')}>12 Months</button>
          <button onClick={handlePrint} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Printer size={13}/> Print
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', value: `$${data.totalRevenue.toFixed(0)}`, sub: `${revenueThisMonth > 0 ? '+' : ''}$${revenueThisMonth.toFixed(0)} this month`, color: '#22C55E', icon: DollarSign },
          { label: 'Revenue Growth', value: `${revGrowth >= 0 ? '+' : ''}${revGrowth}%`, sub: 'vs last month', color: revGrowth >= 0 ? '#22C55E' : '#EF4444', icon: TrendingUp },
          { label: 'Total Companies', value: String(data.totalTenants), sub: `${signupsThisMonth} new this month`, color: '#E8834A', icon: Users },
          { label: 'New Signups MoM', value: `${signupsThisMonth > signupsLastMonth ? '+' : ''}${signupsThisMonth - signupsLastMonth}`, sub: `${signupsThisMonth} this month vs ${signupsLastMonth} last month`, color: '#3B82F6', icon: TrendingUp },
        ].map(card => (
          <div key={card.label} style={{ background: '#1A2D3F', borderRadius: 14, padding: '18px 20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{card.label}</span>
              <card.icon size={15} color={card.color} strokeWidth={2}/>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#1A2D3F', borderRadius: 14, padding: 22, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'white', marginBottom: 20 }}>Revenue by Month</div>
          <BarChart data={revenue.map(r => ({ label: r.month, value: r.total }))} color="#22C55E" height={120}/>
        </div>
        <div style={{ background: '#1A2D3F', borderRadius: 14, padding: 22, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'white', marginBottom: 20 }}>New Signups per Month</div>
          <BarChart data={signups.map(s => ({ label: s.month, value: s.count }))} color="#E8834A" height={120}/>
        </div>
      </div>

      {/* Plan distribution + Top tenants */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginBottom: 24 }}>
        {/* Plan distribution */}
        <div style={{ background: '#1A2D3F', borderRadius: 14, padding: 22, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'white', marginBottom: 16 }}>Plan Distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(data.tenantsByPlan).filter(([, v]) => v > 0).map(([plan, count]) => (
              <div key={plan}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>{plan}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'white' }}>{count} ({Math.round((count / totalPlanCount) * 100)}%)</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${(count / totalPlanCount) * 100}%`, background: PLAN_COLORS[plan] || '#6B7280', borderRadius: 3 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top tenants */}
        <div style={{ background: '#1A2D3F', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13.5, fontWeight: 700, color: 'white' }}>
            Top Companies by Revenue
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['#', 'Company', 'Plan', 'Revenue', 'Clients', 'Joined', 'Status'].map(h => (
                    <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 10.5, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.topTenants.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }} onClick={() => window.location.href = `/admin/tenants/${t.id}`}>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>#{i + 1}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13.5, fontWeight: 600, color: 'white' }}>{t.name}</td>
                    <td style={{ padding: '10px 16px' }}><span style={{ background: `${PLAN_COLORS[t.plan] || '#6B7280'}20`, color: PLAN_COLORS[t.plan] || '#9CA3AF', padding: '2px 7px', borderRadius: 99, fontSize: 10.5, fontWeight: 700 }}>{t.plan}</span></td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: '#22C55E', fontWeight: 700 }}>${t.invoicesPaid.toFixed(0)}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{t.clientsCount}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '10px 16px' }}><span style={{ background: `${STATUS_COLOR[t.status] || '#9CA3AF'}20`, color: STATUS_COLOR[t.status] || '#9CA3AF', padding: '2px 7px', borderRadius: 99, fontSize: 10.5, fontWeight: 700 }}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          aside, button { display: none !important; }
          * { color: #000 !important; background: white !important; border-color: #ccc !important; }
          @page { margin: 1cm; }
        }
        @media print {
          footer::after { content: "Confidential — ProSite Admin Report"; display: block; text-align: center; margin-top: 20px; font-size: 10px; color: #aaa; }
        }
      `}</style>
    </div>
  );
}
