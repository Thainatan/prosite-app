'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtD = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
type COStatus = typeof STATUSES[number];
const ST: Record<COStatus, { label: string; bg: string; color: string }> = {
  PENDING:  { label: 'Pending',  bg: '#FFF7E9', color: '#F5A623' },
  APPROVED: { label: 'Approved', bg: '#EAFAF3', color: '#34C78A' },
  REJECTED: { label: 'Rejected', bg: '#FFF0EF', color: '#F0584C' },
};

interface ChangeOrder {
  id: string; changeOrderNumber: string; title: string; description: string;
  status: string; totalCost: number; createdAt: string;
  project: { id: string; name: string; jobNumber: string } | null;
}
interface Project { id: string; name: string; jobNumber: string; }

export default function ChangeOrdersPage() {
  const [orders, setOrders] = useState<ChangeOrder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<ChangeOrder | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({ projectId: '', title: '', description: '', amount: '', status: 'PENDING' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    Promise.all([
      fetch(`${API}/change-orders`).then(r => r.json()),
      fetch(`${API}/projects`).then(r => r.json()),
    ]).then(([co, proj]) => {
      if (Array.isArray(co)) setOrders(co);
      if (Array.isArray(proj)) setProjects(proj);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    if (!form.amount || isNaN(Number(form.amount))) e.amount = 'Enter a valid amount';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/change-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (data.error) { alert('Error: ' + data.error); return; }
      const updated = await fetch(`${API}/change-orders`).then(r => r.json());
      if (Array.isArray(updated)) setOrders(updated);
      setShowNew(false);
      setForm({ projectId: '', title: '', description: '', amount: '', status: 'PENDING' });
      showToast('Change order created.');
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`${API}/change-orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!data.error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (selected?.id === id) setSelected(s => s ? { ...s, status } : null);
      showToast('Status updated.');
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`${API}/change-orders/${id}`, { method: 'DELETE' });
    setOrders(prev => prev.filter(o => o.id !== id));
    setSelected(null);
    showToast('Change order deleted.');
  };

  const inp = (err?: string) => `w-full h-9 bg-[#F7F8FC] border rounded-[9px] px-3 text-[13px] text-[#1A1D2E] outline-none ${err ? 'border-[#F0584C]' : 'border-[#EAECF2]'}`;
  const lbl = 'block text-[11.5px] font-semibold text-[#6B7280] mb-1.5';
  const pending = orders.filter(o => o.status === 'PENDING').length;
  const totalApproved = orders.filter(o => o.status === 'APPROVED').reduce((s, o) => s + o.totalCost, 0);

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      {toast && <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-[12px] text-[13px] font-semibold bg-[#EAFAF3] text-[#059669] border border-[#A7F3D0] shadow">{toast}</div>}

      <header className="bg-white border-b border-[#EAECF2] h-14 flex items-center justify-between px-6 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-bold text-[#1A1D2E]">Change Orders</h1>
          {pending > 0 && <span className="text-[11px] font-bold px-2.5 py-1 bg-[#FFF7E9] text-[#F5A623] rounded-full">{pending} pending</span>}
        </div>
        <button onClick={() => setShowNew(true)} className="h-[34px] px-4 bg-[#4F7EF7] text-white text-[13px] font-semibold rounded-[9px]">+ New Change Order</button>
      </header>

      <div className="bg-white border-b border-[#EAECF2] px-6 py-3 flex gap-4">
        {[
          { label: 'Pending',  value: String(pending), color: '#F5A623', bg: '#FFF7E9' },
          { label: 'Approved', value: String(orders.filter(o => o.status === 'APPROVED').length), color: '#34C78A', bg: '#EAFAF3' },
          { label: 'Approved Value', value: fmt(totalApproved), color: '#1A1D2E', bg: '#F7F8FC' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="px-4 py-2.5 rounded-[10px]" style={{ background: bg }}>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: color + '99' }}>{label}</p>
            <p className="text-[16px] font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="p-5">
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-[14px] border border-[#EAECF2] h-20 animate-pulse"/>)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-[14px] font-semibold text-[#1A1D2E] mb-2">No change orders yet</p>
            <p className="text-[12px] text-[#6B7280] mb-4">Track scope changes and additional costs for your projects</p>
            <button onClick={() => setShowNew(true)} className="inline-flex px-6 py-2.5 bg-[#4F7EF7] text-white rounded-[9px] text-[14px] font-semibold">+ New Change Order</button>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] border border-[#EAECF2] overflow-hidden">
            {orders.map(co => {
              const st = ST[co.status as COStatus] || ST.PENDING;
              return (
                <div key={co.id} onClick={() => setSelected(co)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#F7F8FC] cursor-pointer border-b border-[#EAECF2] last:border-0 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13.5px] font-bold text-[#1A1D2E]">{co.title || 'Change Order'}</span>
                      <span className="font-mono text-[11px] text-[#A0A8B8]">{co.changeOrderNumber}</span>
                    </div>
                    <p className="text-[12px] text-[#6B7280]">{co.project?.name || 'No project'}{co.description ? ` · ${co.description.slice(0,60)}${co.description.length>60?'...':''}` : ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[14px] font-bold text-[#1A1D2E]">{fmt(co.totalCost)}</p>
                    <p className="text-[11px] text-[#A0A8B8]">{fmtD(co.createdAt)}</p>
                  </div>
                  <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-[16px] w-full max-w-md shadow-[0_24px_80px_rgba(0,0,0,0.18)] border border-[#EAECF2]" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-[#EAECF2] flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-bold text-[#1A1D2E] mb-1">{selected.title || 'Change Order'}</h2>
                <p className="text-[12px] text-[#6B7280]">{selected.changeOrderNumber} · {selected.project?.name || 'No project'}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-[#F9FAFB] border border-[#EAECF2] rounded-[10px] p-4">
                <p className="text-[11px] text-[#A0A8B8] mb-1">Description</p>
                <p className="text-[13px] text-[#1A1D2E]">{selected.description}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-[#6B7280]">Amount</span>
                <span className="text-[20px] font-bold text-[#1A1D2E]">{fmt(selected.totalCost)}</span>
              </div>
              <div>
                <p className="text-[11.5px] font-bold text-[#6B7280] mb-2">Update Status</p>
                <div className="flex gap-2">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => handleStatusChange(selected.id, s)}
                      className="flex-1 h-9 rounded-[9px] border text-[12px] font-semibold transition-all"
                      style={{ background: selected.status === s ? ST[s].bg : 'white', color: selected.status === s ? ST[s].color : '#6B7280', borderColor: selected.status === s ? ST[s].color : '#EAECF2' }}>
                      {ST[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t border-[#EAECF2] bg-[#F9FAFB]">
              <button onClick={() => setSelected(null)} className="flex-1 h-10 rounded-[9px] border border-[#EAECF2] bg-white text-[13px] font-semibold text-[#6B7280]">Close</button>
              <button onClick={() => { if(window.confirm('Delete this change order?')) handleDelete(selected.id); }} className="h-10 px-4 rounded-[9px] bg-[#FFF0EF] text-[#F0584C] text-[13px] font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-[16px] w-full max-w-lg shadow-[0_24px_80px_rgba(0,0,0,0.18)] border border-[#EAECF2]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#EAECF2]">
              <h2 className="text-[17px] font-bold text-[#1A1D2E]">New Change Order</h2>
              <button onClick={() => setShowNew(false)} className="w-8 h-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={lbl}>Project</label>
                <select className={inp()} value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                  <option value="">— Select Project (optional) —</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.jobNumber})</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Title *</label>
                <input className={inp(errors.title)} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Additional plumbing work"/>
                {errors.title && <p className="text-[11px] text-[#F0584C] mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className={lbl}>Description *</label>
                <textarea className="w-full bg-[#F7F8FC] border border-[#EAECF2] rounded-[9px] px-3 py-2 text-[13px] text-[#1A1D2E] outline-none resize-none"
                  rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the scope change..."/>
                {errors.description && <p className="text-[11px] text-[#F0584C] mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className={lbl}>Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#9CA3AF]">$</span>
                  <input className={`${inp(errors.amount)} pl-6`} type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0"/>
                </div>
                {errors.amount && <p className="text-[11px] text-[#F0584C] mt-1">{errors.amount}</p>}
              </div>
              <div>
                <label className={lbl}>Status</label>
                <div className="flex gap-2">
                  {STATUSES.map(s => (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                      className="flex-1 h-9 rounded-[9px] border text-[12px] font-semibold transition-all"
                      style={{ background: form.status === s ? ST[s].bg : 'white', color: form.status === s ? ST[s].color : '#6B7280', borderColor: form.status === s ? ST[s].color : '#EAECF2' }}>
                      {ST[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t border-[#EAECF2] bg-[#F9FAFB]">
              <button onClick={() => setShowNew(false)} className="flex-1 h-10 rounded-[9px] border border-[#EAECF2] bg-white text-[13px] font-semibold text-[#6B7280]">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="flex-2 h-10 px-6 rounded-[9px] bg-[#4F7EF7] text-white text-[13px] font-bold disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Change Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
