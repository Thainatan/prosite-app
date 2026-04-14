'use client';
import { useEffect, useState } from 'react';
import { Search, Building2, ChevronDown, RefreshCw, Calendar, X } from 'lucide-react';
import { apiFetch } from '../../../../lib/api';

interface TenantRow {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  createdAt: string;
  planExpiresAt: string | null;
  stats: {
    clientsCount: number;
    quotesCount: number;
    projectsCount: number;
    invoicesCount: number;
    invoicesPaidTotal: number;
    invoicesUnpaidTotal: number;
    teamCount: number;
    lastActivity: string | null;
  };
}

const PLAN_COLORS: Record<string, string> = { TRIAL: '#F59E0B', SOLO: '#3B82F6', COMPANY: '#8B5CF6', ENTERPRISE: '#EC4899', FREE_FOREVER: '#22C55E' };
const STATUS_COLOR: Record<string, string> = { ACTIVE: '#22C55E', SUSPENDED: '#EF4444', CANCELLED: '#9CA3AF', INACTIVE: '#9CA3AF' };

function daysAgo(dateStr: string | null) {
  if (!dateStr) return 'Never';
  const d = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  if (d < 1) return 'Today';
  if (d < 2) return 'Yesterday';
  if (d < 30) return `${Math.floor(d)}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'activity' | 'revenue'>('newest');
  const [extendModal, setExtendModal] = useState<TenantRow | null>(null);
  const [extendDate, setExtendDate] = useState('');
  const [extendLoading, setExtendLoading] = useState(false);
  const [changePlanModal, setChangePlanModal] = useState<TenantRow | null>(null);
  const [newPlan, setNewPlan] = useState('');
  const [toast, setToast] = useState('');

  const load = () => {
    setLoading(true);
    apiFetch('/admin/tenants').then(r => r.json()).then(d => { setTenants(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = tenants
    .filter(t => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.slug.toLowerCase().includes(search.toLowerCase())) return false;
      if (planFilter !== 'ALL' && t.plan !== planFilter) return false;
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'activity') {
        const da = a.stats.lastActivity ? new Date(a.stats.lastActivity).getTime() : 0;
        const db2 = b.stats.lastActivity ? new Date(b.stats.lastActivity).getTime() : 0;
        return db2 - da;
      }
      return b.stats.invoicesPaidTotal - a.stats.invoicesPaidTotal;
    });

  const handleExtend = async () => {
    if (!extendModal || !extendDate) return;
    setExtendLoading(true);
    await apiFetch(`/admin/tenants/${extendModal.id}`, { method: 'PATCH', body: JSON.stringify({ planExpiresAt: extendDate }) });
    setExtendModal(null);
    setExtendLoading(false);
    showToast('Trial extended');
    load();
  };

  const handleChangePlan = async () => {
    if (!changePlanModal || !newPlan) return;
    await apiFetch(`/admin/tenants/${changePlanModal.id}`, { method: 'PATCH', body: JSON.stringify({ plan: newPlan }) });
    setChangePlanModal(null);
    showToast('Plan updated');
    load();
  };

  const handleSuspend = async (t: TenantRow) => {
    if (!confirm(`Suspend ${t.name}?`)) return;
    await apiFetch(`/admin/tenants/${t.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'SUSPENDED' }) });
    showToast('Account suspended');
    load();
  };

  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 9, color: 'white', fontSize: 13, outline: 'none',
  };

  const sel: React.CSSProperties = {
    ...inp, padding: '0 12px', height: 38, cursor: 'pointer',
    appearance: 'none', WebkitAppearance: 'none', backgroundImage: 'none',
  };

  return (
    <div style={{ padding: 28, color: 'white' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#22C55E', color: 'white', padding: '10px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, zIndex: 100 }}>{toast}</div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Building2 size={20} color="#E8834A" strokeWidth={2}/>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Companies</h1>
          <span style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 10px', borderRadius: 99, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{tenants.length}</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>All registered companies on the platform</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} color="rgba(255,255,255,0.35)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company name or slug…"
            style={{ ...inp, width: '100%', height: 38, paddingLeft: 36, paddingRight: 12, boxSizing: 'border-box' }}/>
        </div>
        <div style={{ position: 'relative' }}>
          <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} style={{ ...sel, paddingRight: 32 }}>
            <option value="ALL">All Plans</option>
            {['TRIAL','SOLO','COMPANY','ENTERPRISE','FREE_FOREVER'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <ChevronDown size={12} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
        </div>
        <div style={{ position: 'relative' }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...sel, paddingRight: 32 }}>
            <option value="ALL">All Statuses</option>
            {['ACTIVE','SUSPENDED','CANCELLED','INACTIVE'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={12} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
        </div>
        <div style={{ position: 'relative' }}>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ ...sel, paddingRight: 32 }}>
            <option value="newest">Newest First</option>
            <option value="activity">Most Active</option>
            <option value="revenue">Most Revenue</option>
          </select>
          <ChevronDown size={12} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
        </div>
        <button onClick={load} style={{ height: 38, width: 38, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCw size={14} color="rgba(255,255,255,0.5)"/>
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#1A2D3F', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Company', 'Plan', 'Users', 'Clients', 'Quotes', 'Projects', 'Revenue', 'Last Active', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10.5, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }}
                    onClick={() => window.location.href = `/admin/tenants/${t.id}`}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'white' }}>{t.name}</div>
                      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)' }}>{t.slug}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: `${PLAN_COLORS[t.plan] || '#6B7280'}20`, color: PLAN_COLORS[t.plan] || '#9CA3AF', padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{t.plan}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t.stats.teamCount}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t.stats.clientsCount}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t.stats.quotesCount}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t.stats.projectsCount}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#22C55E', fontWeight: 600 }}>${t.stats.invoicesPaidTotal.toFixed(0)}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{daysAgo(t.stats.lastActivity)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: `${STATUS_COLOR[t.status] || '#9CA3AF'}20`, color: STATUS_COLOR[t.status] || '#9CA3AF', padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{t.status}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <a href={`/admin/tenants/${t.id}`} style={{ fontSize: 11.5, color: '#E8834A', fontWeight: 600, textDecoration: 'none', padding: '4px 8px', border: '1px solid rgba(232,131,74,0.3)', borderRadius: 6 }}>View</a>
                        <button onClick={() => { setExtendModal(t); setExtendDate(t.planExpiresAt ? t.planExpiresAt.slice(0,10) : ''); }}
                          style={{ fontSize: 11.5, color: '#F59E0B', fontWeight: 600, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>Extend</button>
                        <button onClick={() => handleSuspend(t)}
                          style={{ fontSize: 11.5, color: '#EF4444', fontWeight: 600, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>Suspend</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>No companies found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Extend Trial Modal */}
      {extendModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1A2D3F', borderRadius: 16, padding: 28, width: 380, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'white' }}>Extend Trial — {extendModal.name}</h3>
              <button onClick={() => setExtendModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}><X size={18}/></button>
            </div>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>New Expiry Date</label>
            <input type="date" value={extendDate} onChange={e => setExtendDate(e.target.value)}
              style={{ width: '100%', height: 40, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, color: 'white', fontSize: 14, padding: '0 12px', boxSizing: 'border-box', outline: 'none' }}/>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setExtendModal(null)} style={{ flex: 1, height: 40, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleExtend} disabled={extendLoading || !extendDate}
                style={{ flex: 1, height: 40, background: '#E8834A', border: 'none', borderRadius: 9, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{extendLoading ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
