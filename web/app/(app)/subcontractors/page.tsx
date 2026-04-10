'use client';
import { useState, useEffect, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const getH = () => ({ Authorization: 'Bearer ' + (typeof window !== 'undefined' ? localStorage.getItem('prosite_token') || '' : '') });

const TRADES = ['Electrical','Plumbing','HVAC','Framing','Drywall','Flooring','Painting','Roofing','Tile','Concrete','Landscaping','Windows','Cabinets','Other'];
const TRADE_COLORS: Record<string, { bg: string; color: string }> = {
  Electrical: { bg: '#FFF7E9', color: '#F5A623' },
  Plumbing:   { bg: '#E0F2FE', color: '#0EA5E9' },
  HVAC:       { bg: '#EEF3FF', color: '#E8834A' },
  Framing:    { bg: '#EAFAF3', color: '#34C78A' },
  Drywall:    { bg: '#F3F4F6', color: '#6B7280' },
  Flooring:   { bg: '#FDF2F8', color: '#EC4899' },
  Painting:   { bg: '#FFF0EF', color: '#F0584C' },
  Roofing:    { bg: '#F3F4F6', color: '#374151' },
  Tile:       { bg: '#EDE9FE', color: '#8B5CF6' },
  Concrete:   { bg: '#F3F4F6', color: '#9CA3AF' },
  Landscaping:{ bg: '#EAFAF3', color: '#059669' },
  Windows:    { bg: '#E0F2FE', color: '#0284C7' },
  Cabinets:   { bg: '#FFF7E9', color: '#D97706' },
  Other:      { bg: '#F3F4F6', color: '#6B7280' },
};
const tradeStyle = (t: string) => TRADE_COLORS[t] || TRADE_COLORS.Other;

interface Sub {
  id: string; firstName: string; lastName: string; company: string;
  trade: string; phone: string; email: string; address: string;
  city: string; state: string; zip: string; licenseNumber: string;
  insuranceExp: string | null; rating: number; notes: string; status: string;
  createdAt: string;
}

const EMPTY_FORM = () => ({
  firstName: '', lastName: '', company: '', trade: 'Electrical',
  phone: '', email: '', address: '', city: '', state: 'FL', zip: '',
  licenseNumber: '', insuranceExp: '', rating: 5, notes: '', status: 'ACTIVE',
});

function Stars({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button" onClick={() => onChange?.(i)}
          className={`text-lg ${onChange ? 'cursor-pointer' : 'cursor-default'} ${i <= rating ? 'text-[#F5A623]' : 'text-[#D1D5DB]'}`}>★</button>
      ))}
    </div>
  );
}

function DotsMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} className="w-8 h-8 rounded-full flex items-center justify-center text-[#A0A8B8] hover:bg-[#F3F4F6] text-[18px] font-bold">⋯</button>
      {open && (
        <div className="absolute right-0 top-9 z-50 bg-white border border-[#EAECF2] rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-32 overflow-hidden">
          <button onClick={() => { onEdit(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#1A1A2E] hover:bg-[#F7F8FC] border-b border-[#EAECF2]">Edit</button>
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#F0584C] hover:bg-[#FFF0EF]">Delete</button>
        </div>
      )}
    </div>
  );
}

function SubModal({ initial, onClose, onSave }: {
  initial?: Sub | null; onClose: () => void; onSave: (s: Sub) => void;
}) {
  const [form, setForm] = useState(initial ? {
    firstName: initial.firstName, lastName: initial.lastName, company: initial.company,
    trade: initial.trade, phone: initial.phone, email: initial.email,
    address: initial.address, city: initial.city, state: initial.state, zip: initial.zip,
    licenseNumber: initial.licenseNumber, insuranceExp: initial.insuranceExp?.split('T')[0] || '',
    rating: initial.rating, notes: initial.notes, status: initial.status,
  } : EMPTY_FORM());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.trade) e.trade = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const method = initial ? 'PATCH' : 'POST';
      const url = initial ? `${API}/subcontractors/${initial.id}` : `${API}/subcontractors`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getH() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) return;
      onSave(data);
    } finally { setSaving(false); }
  };

  const inp = (err?: string) => `w-full h-9 bg-[#F7F8FC] border rounded-[9px] px-3 text-[13px] text-[#1A1A2E] outline-none ${err ? 'border-[#F0584C]' : 'border-[#EAECF2]'}`;
  const lbl = 'block text-[11.5px] font-semibold text-[#6B7280] mb-1.5';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[16px] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_24px_80px_rgba(0,0,0,0.18)] border border-[#EAECF2]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#EAECF2]">
          <h2 className="text-[17px] font-bold text-[#1A1A2E]">{initial ? 'Edit Subcontractor' : 'New Subcontractor'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>First Name *</label>
              <input className={inp(errors.firstName)} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="First name"/>
              {errors.firstName && <p className="text-[11px] text-[#F0584C] mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className={lbl}>Last Name *</label>
              <input className={inp(errors.lastName)} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Last name"/>
              {errors.lastName && <p className="text-[11px] text-[#F0584C] mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className={lbl}>Company</label>
            <input className={inp()} value={form.company} onChange={e => set('company', e.target.value)} placeholder="Company name"/>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Trade *</label>
              <select className={inp(errors.trade)} value={form.trade} onChange={e => set('trade', e.target.value)}>
                {TRADES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Phone *</label>
              <input className={inp(errors.phone)} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 555-5555"/>
              {errors.phone && <p className="text-[11px] text-[#F0584C] mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className={lbl}>Email</label>
            <input className={inp()} value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@company.com" type="email"/>
          </div>

          <div>
            <label className={lbl}>Address</label>
            <input className={inp()} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address"/>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={lbl}>City</label>
              <input className={inp()} value={form.city} onChange={e => set('city', e.target.value)}/>
            </div>
            <div>
              <label className={lbl}>State</label>
              <input className={inp()} value={form.state} onChange={e => set('state', e.target.value)} maxLength={2}/>
            </div>
            <div>
              <label className={lbl}>Zip</label>
              <input className={inp()} value={form.zip} onChange={e => set('zip', e.target.value)}/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>License #</label>
              <input className={inp()} value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)}/>
            </div>
            <div>
              <label className={lbl}>Insurance Exp</label>
              <input className={inp()} type="date" value={form.insuranceExp} onChange={e => set('insuranceExp', e.target.value)}/>
            </div>
          </div>

          <div>
            <label className={lbl}>Rating</label>
            <Stars rating={form.rating} onChange={r => set('rating', r)}/>
          </div>

          <div>
            <label className={lbl}>Status</label>
            <div className="flex gap-2">
              {['ACTIVE','INACTIVE'].map(s => (
                <button key={s} type="button" onClick={() => set('status', s)}
                  className="flex-1 h-9 rounded-[9px] border text-[12.5px] font-semibold capitalize transition-all"
                  style={{ background: form.status === s ? '#EEF3FF' : 'white', color: form.status === s ? '#E8834A' : '#6B7280', borderColor: form.status === s ? '#E8834A' : '#EAECF2' }}>
                  {s === 'ACTIVE' ? 'Active' : 'Inactive'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={lbl}>Notes</label>
            <textarea className="w-full bg-[#F7F8FC] border border-[#EAECF2] rounded-[9px] px-3 py-2 text-[13px] text-[#1A1A2E] outline-none resize-none"
              rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}/>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-[#EAECF2] bg-[#F9FAFB]">
          <button onClick={onClose} className="flex-1 h-10 rounded-[9px] border border-[#EAECF2] bg-white text-[13px] font-semibold text-[#6B7280]">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-2 h-10 px-6 rounded-[9px] bg-[#E8834A] text-white text-[13px] font-bold disabled:opacity-50">
            {saving ? 'Saving...' : initial ? 'Save Changes' : 'Add Subcontractor'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubcontractorsPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tradeFilter, setTradeFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editSub, setEditSub] = useState<Sub | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Sub | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    fetch(`${API}/subcontractors`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSubs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = (sub: Sub) => {
    setSubs(prev => {
      const idx = prev.findIndex(s => s.id === sub.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = sub; return n; }
      return [sub, ...prev];
    });
    setShowModal(false);
    setEditSub(null);
    showToast(editSub ? 'Subcontractor updated.' : 'Subcontractor added.');
  };

  const handleDelete = async (sub: Sub) => {
    await fetch(`${API}/subcontractors/${sub.id}`, { method: 'DELETE', headers: getH() });
    setSubs(prev => prev.filter(s => s.id !== sub.id));
    setConfirmDelete(null);
    showToast('Subcontractor deleted.');
  };

  const trades = ['All', ...new Set(subs.map(s => s.trade))];
  const filtered = subs.filter(s => {
    const matchTrade = tradeFilter === 'All' || s.trade === tradeFilter;
    const matchSearch = !search || `${s.firstName} ${s.lastName} ${s.company}`.toLowerCase().includes(search.toLowerCase());
    return matchTrade && matchSearch;
  });

  const initials = (s: Sub) => `${s.firstName[0] || ''}${s.lastName[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      {toast && <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-[12px] text-[13px] font-semibold bg-[#EAFAF3] text-[#059669] border border-[#A7F3D0] shadow">{toast}</div>}

      <header className="bg-white border-b border-[#EAECF2] h-14 flex items-center justify-between px-6 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-bold text-[#1A1A2E]">Subcontractors</h1>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#EEF3FF] text-[#E8834A] rounded-full">{subs.filter(s => s.status === 'ACTIVE').length} active</span>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subs..." className="flex-1 max-w-sm h-[34px] bg-[#F7F8FC] border border-[#EAECF2] rounded-full px-4 text-[13px] outline-none focus:border-[#E8834A] transition-all"/>
        <button onClick={() => { setEditSub(null); setShowModal(true); }} className="h-[34px] px-4 bg-[#E8834A] text-white text-[13px] font-semibold rounded-[9px]">+ New Sub</button>
      </header>

      {/* Trade filters */}
      <div className="bg-white border-b border-[#EAECF2] px-6 py-2.5 flex gap-2 flex-wrap">
        {trades.map(t => (
          <button key={t} onClick={() => setTradeFilter(t)}
            className="text-[11px] font-bold px-3 py-1 rounded-full border transition-all"
            style={tradeFilter === t ? { background: '#1A1A2E', color: 'white', borderColor: '#1A1A2E' } : { background: 'white', color: '#6B7280', borderColor: '#EAECF2' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-[14px] border border-[#EAECF2] h-20 animate-pulse"/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔧</div>
            <p className="text-[14px] font-semibold text-[#1A1A2E] mb-2">{search || tradeFilter !== 'All' ? 'No subs found' : 'No subcontractors yet'}</p>
            <p className="text-[12px] text-[#6B7280] mb-4">Add your trusted trade partners to assign them to projects</p>
            <button onClick={() => setShowModal(true)} className="inline-flex px-6 py-2.5 bg-[#E8834A] text-white rounded-[9px] text-[14px] font-semibold">+ Add Subcontractor</button>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] border border-[#EAECF2] overflow-hidden">
            {filtered.map(sub => {
              const ts = tradeStyle(sub.trade);
              const insExpired = sub.insuranceExp ? new Date(sub.insuranceExp) < new Date() : false;
              return (
                <div key={sub.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F7F8FC] border-b border-[#EAECF2] last:border-0 transition-colors">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #4F7EF7, #8B5CF6)' }}>
                    {initials(sub)}
                  </div>

                  {/* Name + company */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13.5px] font-bold text-[#1A1A2E]">{sub.firstName} {sub.lastName}</span>
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: ts.bg, color: ts.color }}>{sub.trade}</span>
                      {sub.status === 'INACTIVE' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#9CA3AF]">Inactive</span>}
                    </div>
                    <p className="text-[12px] text-[#6B7280]">
                      {sub.company && `${sub.company} · `}{sub.phone}
                      {insExpired && <span className="ml-2 text-[#F0584C] font-semibold">⚠ Ins. Expired</span>}
                    </p>
                  </div>

                  {/* Rating */}
                  <Stars rating={sub.rating}/>

                  {/* Dots */}
                  <DotsMenu
                    onEdit={() => { setEditSub(sub); setShowModal(true); }}
                    onDelete={() => setConfirmDelete(sub)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <SubModal
          initial={editSub}
          onClose={() => { setShowModal(false); setEditSub(null); }}
          onSave={handleSave}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white border border-[#EAECF2] rounded-[16px] p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-[16px] font-bold text-[#1A1A2E] mb-2">Delete Subcontractor?</h3>
            <p className="text-[13px] text-[#6B7280] mb-5">"{confirmDelete.firstName} {confirmDelete.lastName}" will be permanently deleted.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 h-10 rounded-[9px] border border-[#EAECF2] text-[#6B7280] text-[13px] font-semibold">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 h-10 rounded-[9px] bg-[#F0584C] text-white text-[13px] font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
