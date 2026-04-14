'use client';
import { useEffect, useState } from 'react';
import { Tag, Plus, Copy, Trash2, Edit2, X, Check, RefreshCw, ChevronDown } from 'lucide-react';
import { apiFetch } from '../../../../lib/api';

interface PromoCode {
  id: string; code: string; type: string; trialDays: number;
  discountPercent: number; discountFixed: number; plan: string;
  maxUses: number; usedCount: number; expiresAt: string | null;
  isActive: boolean; description: string; createdAt: string;
}
interface PromoUsage { id: string; tenantId: string; tenantName: string; usedAt: string; plan: string; status: string; }

const TYPE_COLORS: Record<string, string> = { TRIAL_EXTENSION: '#3B82F6', FREE_FOREVER: '#22C55E', DISCOUNT_PERCENT: '#F59E0B', DISCOUNT_FIXED: '#8B5CF6' };
const PLAN_COLORS: Record<string, string> = { TRIAL: '#F59E0B', SOLO: '#3B82F6', COMPANY: '#8B5CF6', ENTERPRISE: '#EC4899', FREE_FOREVER: '#22C55E' };
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://prosite-app-you9.vercel.app';

const TEMPLATES = [
  { label: '90 Day Partner Trial', code: 'PARTNER', type: 'TRIAL_EXTENSION', trialDays: 90, plan: 'COMPANY', maxUses: 0, description: 'Partner program — 90 day trial', discountPercent: 0, discountFixed: 0 },
  { label: '180 Day Beta Trial', code: 'BETA', type: 'TRIAL_EXTENSION', trialDays: 180, plan: 'COMPANY', maxUses: 50, description: 'Beta testers — 6 month trial', discountPercent: 0, discountFixed: 0 },
  { label: 'Free Forever Solo', code: 'FREESOЛО', type: 'FREE_FOREVER', trialDays: 0, plan: 'SOLO', maxUses: 0, description: 'Free forever — Solo plan', discountPercent: 0, discountFixed: 0 },
  { label: 'Free Forever Company', code: 'FREECO', type: 'FREE_FOREVER', trialDays: 0, plan: 'COMPANY', maxUses: 0, description: 'Free forever — Company plan', discountPercent: 0, discountFixed: 0 },
];

const emptyForm = { code: '', type: 'TRIAL_EXTENSION', trialDays: 90, discountPercent: 0, discountFixed: 0, plan: 'COMPANY', maxUses: 0, expiresAt: '', isActive: true, description: '' };

function genCode(prefix = 'PROMO') {
  return prefix.toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export default function AdminPromoPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<PromoCode | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [usageModal, setUsageModal] = useState<PromoCode | null>(null);
  const [usages, setUsages] = useState<PromoUsage[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [copied, setCopied] = useState('');

  const load = () => { setLoading(true); apiFetch('/admin/promo').then(r => r.json()).then(d => { setCodes(Array.isArray(d) ? d : []); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = (template?: typeof TEMPLATES[0]) => {
    setForm(template ? { ...emptyForm, ...template, code: genCode(template.code), expiresAt: '' } : { ...emptyForm, code: genCode() });
    setEditTarget(null);
    setModal('create');
  };

  const openEdit = (c: PromoCode) => {
    setForm({ code: c.code, type: c.type, trialDays: c.trialDays, discountPercent: c.discountPercent, discountFixed: c.discountFixed, plan: c.plan, maxUses: c.maxUses, expiresAt: c.expiresAt ? c.expiresAt.slice(0,10) : '', isActive: c.isActive, description: c.description });
    setEditTarget(c);
    setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    const body = { ...form, trialDays: Number(form.trialDays), discountPercent: Number(form.discountPercent), discountFixed: Number(form.discountFixed), maxUses: Number(form.maxUses), expiresAt: form.expiresAt || null };
    if (modal === 'create') {
      await apiFetch('/admin/promo', { method: 'POST', body: JSON.stringify(body) });
      showToast('Promo code created');
    } else if (editTarget) {
      await apiFetch(`/admin/promo/${editTarget.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      showToast('Promo code updated');
    }
    setSaving(false); setModal(null); load();
  };

  const handleDelete = async (c: PromoCode) => {
    if (!confirm(`Delete ${c.code}?`)) return;
    await apiFetch(`/admin/promo/${c.id}`, { method: 'DELETE' });
    showToast('Deleted'); load();
  };

  const handleViewUsage = async (c: PromoCode) => {
    setUsageModal(c);
    const res = await apiFetch(`/admin/promo/${c.id}/usage`);
    const data = await res.json();
    setUsages(Array.isArray(data) ? data : []);
  };

  const handleCopyLink = (code: string) => {
    navigator.clipboard.writeText(`${FRONTEND_URL}/register?code=${code}`);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  const totalUses = codes.reduce((s, c) => s + c.usedCount, 0);
  const activeCodes = codes.filter(c => c.isActive).length;

  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 9, color: 'white', fontSize: 13.5, padding: '0 12px',
    width: '100%', height: 42, boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div style={{ padding: 28, color: 'white' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: '#22C55E', color: 'white', padding: '10px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, zIndex: 200 }}>{toast}</div>}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Tag size={20} color="#E8834A" strokeWidth={2}/>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Promo Codes</h1>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)' }}>Total: <strong style={{ color: 'white' }}>{codes.length}</strong></span>
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)' }}>Active: <strong style={{ color: '#22C55E' }}>{activeCodes}</strong></span>
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)' }}>Total uses: <strong style={{ color: 'white' }}>{totalUses}</strong></span>
          </div>
        </div>
        <button onClick={() => openCreate()} style={{ display: 'flex', alignItems: 'center', gap: 7, height: 40, padding: '0 16px', background: '#E8834A', border: 'none', borderRadius: 9, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={15}/> Create Code
        </button>
      </div>

      {/* Quick Templates */}
      <div style={{ background: '#1A2D3F', borderRadius: 12, padding: '14px 18px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10, fontWeight: 600 }}>QUICK TEMPLATES</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TEMPLATES.map(t => (
            <button key={t.label} onClick={() => openCreate(t)} style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.75)', fontSize: 12.5, cursor: 'pointer', fontWeight: 500 }}>
              {t.label}
            </button>
          ))}
        </div>
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
                  {['Code', 'Type', 'Plan', 'Uses', 'Max', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {codes.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 13.5, fontWeight: 700, color: 'white', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 6 }}>{c.code}</span>
                        <button onClick={() => handleCopyLink(c.code)} title="Copy register link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: copied === c.code ? '#22C55E' : 'rgba(255,255,255,0.3)' }}>
                          {copied === c.code ? <Check size={13}/> : <Copy size={13}/>}
                        </button>
                      </div>
                      {c.description && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{c.description}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: `${TYPE_COLORS[c.type] || '#6B7280'}20`, color: TYPE_COLORS[c.type] || '#9CA3AF', padding: '3px 8px', borderRadius: 99, fontSize: 10.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {c.type === 'TRIAL_EXTENSION' ? `${c.trialDays}d TRIAL` : c.type === 'FREE_FOREVER' ? 'FREE' : c.type === 'DISCOUNT_PERCENT' ? `${c.discountPercent}% OFF` : `$${c.discountFixed} OFF`}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: `${PLAN_COLORS[c.plan] || '#6B7280'}20`, color: PLAN_COLORS[c.plan] || '#9CA3AF', padding: '3px 8px', borderRadius: 99, fontSize: 10.5, fontWeight: 700 }}>{c.plan}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{c.usedCount}</span>
                        {c.maxUses > 0 && (
                          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, width: 40 }}>
                            <div style={{ height: '100%', width: `${Math.min((c.usedCount / c.maxUses) * 100, 100)}%`, background: '#E8834A', borderRadius: 2 }}/>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>{c.maxUses === 0 ? '∞' : c.maxUses}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: c.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: c.isActive ? '#22C55E' : '#EF4444', padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                        {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleViewUsage(c)} style={{ fontSize: 11, color: '#3B82F6', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontWeight: 600 }}>Usage</button>
                        <button onClick={() => openEdit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}><Edit2 size={13}/></button>
                        <button onClick={() => handleDelete(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.5)', padding: 4 }}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {codes.length === 0 && <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>No promo codes yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1A2D3F', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'white' }}>{modal === 'create' ? 'Create Promo Code' : 'Edit Promo Code'}</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}><X size={18}/></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Code */}
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Code *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} style={{ ...inp, flex: 1 }} placeholder="PARTNER90"/>
                  <button type="button" onClick={() => set('code', genCode())} style={{ height: 42, padding: '0 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>Auto</button>
                </div>
              </div>

              {/* Type */}
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Type *</label>
                <select value={form.type} onChange={e => set('type', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="TRIAL_EXTENSION">Trial Extension</option>
                  <option value="FREE_FOREVER">Free Forever</option>
                  <option value="DISCOUNT_PERCENT">Discount %</option>
                  <option value="DISCOUNT_FIXED">Discount Fixed $</option>
                </select>
              </div>

              {/* Plan */}
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Plan to Grant *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['SOLO','COMPANY','ENTERPRISE'].map(p => (
                    <button key={p} type="button" onClick={() => set('plan', p)} style={{ flex: 1, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `2px solid ${form.plan === p ? (PLAN_COLORS[p] || '#E8834A') : 'rgba(255,255,255,0.1)'}`, background: form.plan === p ? `${PLAN_COLORS[p] || '#E8834A'}15` : 'transparent', color: form.plan === p ? (PLAN_COLORS[p] || '#E8834A') : 'rgba(255,255,255,0.5)' }}>{p}</button>
                  ))}
                </div>
              </div>

              {/* Conditional fields */}
              {form.type === 'TRIAL_EXTENSION' && (
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Trial Days</label>
                  <input type="number" value={form.trialDays} onChange={e => set('trialDays', e.target.value)} style={inp} min={1}/>
                </div>
              )}
              {form.type === 'DISCOUNT_PERCENT' && (
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Discount %</label>
                  <input type="number" value={form.discountPercent} onChange={e => set('discountPercent', e.target.value)} style={inp} min={1} max={100}/>
                </div>
              )}
              {form.type === 'DISCOUNT_FIXED' && (
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Discount Amount ($)</label>
                  <input type="number" value={form.discountFixed} onChange={e => set('discountFixed', e.target.value)} style={inp} min={1}/>
                </div>
              )}

              {/* Max Uses */}
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Max Uses <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(0 = unlimited)</span></label>
                <input type="number" value={form.maxUses} onChange={e => set('maxUses', e.target.value)} style={inp} min={0}/>
              </div>

              {/* Expires At */}
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Expires At <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(optional)</span></label>
                <input type="date" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} style={inp}/>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Description <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(internal note)</span></label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
                  style={{ ...inp, height: 'auto', padding: '10px 12px', resize: 'vertical' }} placeholder="Internal note about this code…"/>
              </div>

              {/* Active Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 9 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Is Active</span>
                <button type="button" onClick={() => set('isActive', !form.isActive)} style={{ width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', background: form.isActive ? '#22C55E' : 'rgba(255,255,255,0.15)', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: 3, left: form.isActive ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }}/>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, height: 42, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.code} style={{ flex: 2, height: 42, background: '#E8834A', border: 'none', borderRadius: 9, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : modal === 'create' ? 'Create Code' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Modal */}
      {usageModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1A2D3F', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, border: '1px solid rgba(255,255,255,0.1)', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'white' }}>Usage — {usageModal.code}</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{usages.length} uses</p>
              </div>
              <button onClick={() => setUsageModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}><X size={18}/></button>
            </div>
            {usages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No usages yet</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Company', 'Used On', 'Plan', 'Status'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10.5, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usages.map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: 'white', fontWeight: 600 }}>{u.tenantName}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{new Date(u.usedAt).toLocaleDateString()}</td>
                      <td style={{ padding: '10px 12px' }}><span style={{ background: `${PLAN_COLORS[u.plan] || '#6B7280'}20`, color: PLAN_COLORS[u.plan] || '#9CA3AF', padding: '2px 7px', borderRadius: 99, fontSize: 10.5, fontWeight: 700 }}>{u.plan}</span></td>
                      <td style={{ padding: '10px 12px' }}><span style={{ fontSize: 11, color: u.status === 'ACTIVE' ? '#22C55E' : '#9CA3AF', fontWeight: 600 }}>{u.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
