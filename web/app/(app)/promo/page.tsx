'use client';
import { useState, useEffect } from 'react';
import {
  Tag, Plus, Copy, Check, Trash2, Pencil, ToggleLeft, ToggleRight,
  RefreshCw, Zap, Gift, Percent, DollarSign, X,
} from 'lucide-react';
import { apiFetch } from '../../../lib/api';

interface PromoCode {
  id: string;
  code: string;
  type: string;
  trialDays: number;
  discountPercent: number;
  discountFixed: number;
  plan: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  description: string;
  createdAt: string;
}

const TYPE_META: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  TRIAL_EXTENSION: { label: 'Trial Extension', color: '#3B82F6', bg: '#EFF6FF', Icon: RefreshCw },
  FREE_FOREVER:   { label: 'Free Forever',     color: '#22C55E', bg: '#F0FDF4', Icon: Gift },
  DISCOUNT_PERCENT: { label: 'Discount %',     color: '#E8834A', bg: '#FFF7ED', Icon: Percent },
  DISCOUNT_FIXED:   { label: 'Discount $',     color: '#8B5CF6', bg: '#F5F3FF', Icon: DollarSign },
};

const PLANS = ['SOLO', 'COMPANY', 'ENTERPRISE'];

const EMPTY: Partial<PromoCode> = {
  code: '', type: 'TRIAL_EXTENSION', trialDays: 90, discountPercent: 0,
  discountFixed: 0, plan: 'COMPANY', maxUses: 1, isActive: true,
  description: '', expiresAt: null,
};

function genCode(prefix: string) {
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

const TEMPLATES = [
  { label: 'Partner 90d', data: { code: 'PARTNER90', type: 'TRIAL_EXTENSION', trialDays: 90, plan: 'COMPANY', maxUses: 0, description: 'Partner program — 90 day trial on Company plan' } },
  { label: 'Free Forever', data: { code: genCode('FREE'), type: 'FREE_FOREVER', trialDays: 0, plan: 'SOLO', maxUses: 1, description: 'Free forever account' } },
  { label: 'Beta 180d', data: { code: 'BETA2026', type: 'TRIAL_EXTENSION', trialDays: 180, plan: 'COMPANY', maxUses: 50, description: 'Beta testers — 6 month free trial' } },
];

export default function PromoAdminPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [form, setForm] = useState<Partial<PromoCode>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState('');
  const [toast, setToast] = useState('');

  const load = () => {
    setLoading(true);
    apiFetch('/promo').then(r => r.json()).then(d => {
      setCodes(Array.isArray(d) ? d : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const openCreate = (template?: any) => {
    setEditing(null);
    setForm(template ? { ...EMPTY, ...template } : { ...EMPTY });
    setShowModal(true);
  };

  const openEdit = (c: PromoCode) => {
    setEditing(c);
    setForm({ ...c });
    setShowModal(true);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const handleSave = async () => {
    if (!form.code?.trim()) { showToast('Code is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const res = await apiFetch(`/promo/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) });
        const d = await res.json();
        if (d.error) { showToast(d.error); return; }
        showToast('Code updated');
      } else {
        const res = await apiFetch('/promo', { method: 'POST', body: JSON.stringify(form) });
        const d = await res.json();
        if (d.error) { showToast(d.error); return; }
        showToast('Code created');
      }
      setShowModal(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c: PromoCode) => {
    await apiFetch(`/promo/${c.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !c.isActive }) });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;
    await apiFetch(`/promo/${id}`, { method: 'DELETE' });
    showToast('Code deleted');
    load();
  };

  const set = (k: keyof PromoCode) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const v = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm(f => ({ ...f, [k]: v }));
  };

  const inp: React.CSSProperties = {
    width: '100%', height: 40, background: '#FAF9F7', border: '1px solid #E8E4DF',
    borderRadius: 8, padding: '0 10px', fontSize: 13, color: '#1A1A2E',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 1100 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#1C2B3A', color: 'white', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Tag size={22} color="#E8834A" strokeWidth={2}/>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1A1A2E' }}>Promo Codes</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>Manage partner and discount codes</p>
          </div>
        </div>
        <button onClick={() => openCreate()} style={{
          display: 'flex', alignItems: 'center', gap: 7, height: 40, padding: '0 18px',
          background: '#E8834A', color: 'white', border: 'none', borderRadius: 9,
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>
          <Plus size={15}/> New Code
        </button>
      </div>

      {/* Quick Templates */}
      <div style={{ background: 'white', border: '1px solid #E8E4DF', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', marginBottom: 10 }}>QUICK TEMPLATES</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TEMPLATES.map(t => (
            <button key={t.label} onClick={() => openCreate(t.data)} style={{
              height: 34, padding: '0 14px', background: '#F8F6F3', border: '1px solid #E8E4DF',
              borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid #E8E4DF', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Loading…</div>
        ) : codes.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Tag size={36} color="#E8E4DF" strokeWidth={1.5}/>
            <p style={{ color: '#9CA3AF', marginTop: 12 }}>No promo codes yet. Create one above.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F6F3', borderBottom: '1px solid #E8E4DF' }}>
                {['Code', 'Type', 'Plan', 'Uses', 'Expires', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map(c => {
                const meta = TYPE_META[c.type] || TYPE_META.TRIAL_EXTENSION;
                const MetaIcon = meta.Icon;
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    {/* Code */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: '#1A1A2E', background: '#F8F6F3', padding: '3px 8px', borderRadius: 6 }}>
                          {c.code}
                        </span>
                        <button onClick={() => copyCode(c.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#9CA3AF' }}>
                          {copied === c.code ? <Check size={13} color="#22C55E"/> : <Copy size={13}/>}
                        </button>
                      </div>
                      {c.description && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{c.description}</div>}
                    </td>
                    {/* Type */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.bg, color: meta.color, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                        <MetaIcon size={10} strokeWidth={2.5}/>{meta.label}
                      </span>
                      {c.type === 'TRIAL_EXTENSION' && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{c.trialDays} days</div>}
                      {c.type === 'DISCOUNT_PERCENT' && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{c.discountPercent}% off</div>}
                      {c.type === 'DISCOUNT_FIXED' && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>${c.discountFixed} off</div>}
                    </td>
                    {/* Plan */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', background: '#F3F4F6', padding: '2px 8px', borderRadius: 6 }}>{c.plan}</span>
                    </td>
                    {/* Uses */}
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>
                      {c.usedCount}/{c.maxUses === 0 ? '∞' : c.maxUses}
                      {c.maxUses > 0 && (
                        <div style={{ width: 60, height: 3, background: '#E8E4DF', borderRadius: 2, marginTop: 4 }}>
                          <div style={{ width: `${Math.min(100, (c.usedCount / c.maxUses) * 100)}%`, height: '100%', background: '#E8834A', borderRadius: 2 }}/>
                        </div>
                      )}
                    </td>
                    {/* Expires */}
                    <td style={{ padding: '12px 14px', fontSize: 12, color: c.expiresAt && new Date(c.expiresAt) < new Date() ? '#EF4444' : '#6B7280' }}>
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    {/* Status */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, background: c.isActive ? '#F0FDF4' : '#F9FAFB', color: c.isActive ? '#22C55E' : '#9CA3AF', padding: '3px 10px', borderRadius: 99 }}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => openEdit(c)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 6, color: '#6B7280' }}>
                          <Pencil size={14}/>
                        </button>
                        <button onClick={() => handleToggle(c)} title={c.isActive ? 'Deactivate' : 'Activate'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 6, color: c.isActive ? '#E8834A' : '#22C55E' }}>
                          {c.isActive ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}
                        </button>
                        <button onClick={() => handleDelete(c.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 6, color: '#EF4444' }}>
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: 'white', borderRadius: 16, padding: '28px 32px', width: 500, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1A1A2E' }}>
                {editing ? 'Edit Promo Code' : 'New Promo Code'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                <X size={18}/>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Code */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Code *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={form.code || ''} onChange={set('code')} placeholder="e.g. PARTNER90" style={{ ...inp, flex: 1, textTransform: 'uppercase' }}/>
                  <button onClick={() => setForm(f => ({ ...f, code: genCode('PROMO') }))} style={{ height: 40, padding: '0 12px', background: '#F8F6F3', border: '1px solid #E8E4DF', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151', whiteSpace: 'nowrap' }}>
                    Auto-generate
                  </button>
                </div>
              </div>

              {/* Type */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Type *</label>
                <select value={form.type || 'TRIAL_EXTENSION'} onChange={set('type')} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="TRIAL_EXTENSION">Trial Extension — extends trial by X days</option>
                  <option value="FREE_FOREVER">Free Forever — never expires, never charged</option>
                  <option value="DISCOUNT_PERCENT">Discount % — X% off subscription</option>
                  <option value="DISCOUNT_FIXED">Discount Fixed — $X off subscription</option>
                </select>
              </div>

              {/* Plan */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Plan to Grant *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {PLANS.map(p => (
                    <button key={p} onClick={() => setForm(f => ({ ...f, plan: p }))} style={{
                      flex: 1, height: 36, borderRadius: 8, border: `2px solid ${form.plan === p ? '#E8834A' : '#E8E4DF'}`,
                      background: form.plan === p ? 'rgba(232,131,74,0.06)' : 'white',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', color: form.plan === p ? '#E8834A' : '#374151',
                    }}>{p}</button>
                  ))}
                </div>
              </div>

              {/* Trial Days */}
              {form.type === 'TRIAL_EXTENSION' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Trial Days</label>
                  <input type="number" value={form.trialDays ?? 90} onChange={set('trialDays')} min={1} style={inp}/>
                </div>
              )}

              {/* Discount % */}
              {form.type === 'DISCOUNT_PERCENT' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Discount Percent (%)</label>
                  <input type="number" value={form.discountPercent ?? 0} onChange={set('discountPercent')} min={0} max={100} style={inp}/>
                </div>
              )}

              {/* Discount $ */}
              {form.type === 'DISCOUNT_FIXED' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Discount Amount ($)</label>
                  <input type="number" value={form.discountFixed ?? 0} onChange={set('discountFixed')} min={0} style={inp}/>
                </div>
              )}

              {/* Max Uses */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Max Uses <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(0 = unlimited)</span></label>
                <input type="number" value={form.maxUses ?? 1} onChange={set('maxUses')} min={0} style={inp}/>
              </div>

              {/* Expires At */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Expires At (optional)</label>
                <input type="date" value={form.expiresAt ? form.expiresAt.substring(0, 10) : ''}
                  onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value || null }))} style={inp}/>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Description (internal note)</label>
                <textarea value={form.description || ''} onChange={set('description')} placeholder="e.g. For NARI members"
                  style={{ ...inp, height: 68, padding: '8px 10px', resize: 'none' }}/>
              </div>

              {/* Active */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {form.isActive
                    ? <ToggleRight size={28} color="#22C55E"/>
                    : <ToggleLeft size={28} color="#9CA3AF"/>}
                </button>
                <span style={{ fontSize: 13, fontWeight: 600, color: form.isActive ? '#22C55E' : '#9CA3AF' }}>
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, height: 42, borderRadius: 9, border: '1px solid #E8E4DF', background: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 2, height: 42, borderRadius: 9, background: saving ? '#F0C4A8' : '#E8834A', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Code'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
