'use client';
import { useState } from 'react';
import ClientAutocomplete from '../../components/ClientAutocomplete';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const TYPE_ICON: Record<string, string> = { deposit: '🏁', progress: '🔨', final: '✅' };

interface LineItem { id: string; description: string; amount: number; }
const EMPTY_LINE: () => LineItem = () => ({ id: Date.now().toString(), description: '', amount: 0 });

export default function NewInvoicePage() {
  const [clientId, setClientId] = useState('');
  const [type, setType] = useState('deposit');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineItem[]>([EMPTY_LINE()]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = lines.reduce((a, l) => a + Number(l.amount || 0), 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!clientId) e.client = 'Select a client';
    if (lines.every(l => !l.description.trim())) e.lines = 'Add at least one line item';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async (status: 'DRAFT' | 'SENT') => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          projectId: 'DIRECT',
          type,
          lineItems: lines.filter(l => l.description.trim()).map(l => ({ description: l.description, amount: Number(l.amount) })),
          subtotal: total,
          total,
          dueDate: dueDate || null,
          notes,
          createdById: 'system',
          status,
        }),
      });
      const data = await res.json();
      if (data.error) { alert('Error: ' + data.error); return; }
      window.location.href = '/invoices';
    } finally { setSaving(false); }
  };

  const inp = (err?: string) => `w-full h-10 bg-[#F7F8FC] border rounded-[9px] px-3 text-[13px] text-[#1A1D2E] outline-none focus:border-[#4F7EF7] transition-all ${err ? 'border-[#F0584C]' : 'border-[#EAECF2]'}`;
  const lbl = 'block text-[12px] font-semibold text-[#6B7280] mb-1.5';

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <header className="bg-white border-b border-[#EAECF2] h-14 flex items-center px-6 gap-4">
        <a href="/invoices" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F3F4F6] text-[#6B7280] text-lg" style={{ textDecoration: 'none' }}>←</a>
        <h1 className="text-[17px] font-bold text-[#1A1D2E]">New Invoice</h1>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Client */}
        <div className="bg-white rounded-[14px] border border-[#EAECF2] p-5">
          <h2 className="text-[14px] font-bold text-[#1A1D2E] mb-4">Client</h2>
          <ClientAutocomplete
            value={clientId}
            onSelect={(id) => { setClientId(id); setErrors(e => ({ ...e, client: '' })); }}
            placeholder="Search or add client..."
            theme="light"
          />
          {errors.client && <p className="text-[11px] text-[#F0584C] mt-1.5">{errors.client}</p>}
        </div>

        {/* Type + Due Date */}
        <div className="bg-white rounded-[14px] border border-[#EAECF2] p-5">
          <h2 className="text-[14px] font-bold text-[#1A1D2E] mb-4">Invoice Details</h2>
          <div className="space-y-4">
            <div>
              <label className={lbl}>Invoice Type</label>
              <div className="flex gap-2">
                {(['deposit','progress','final'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className="flex-1 h-10 rounded-[9px] border text-[13px] font-semibold capitalize transition-all"
                    style={{ background: type === t ? '#EEF3FF' : 'white', color: type === t ? '#4F7EF7' : '#6B7280', borderColor: type === t ? '#4F7EF7' : '#EAECF2' }}>
                    {TYPE_ICON[t]} {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={lbl}>Due Date</label>
              <input type="date" className={inp()} value={dueDate} onChange={e => setDueDate(e.target.value)}/>
            </div>
            <div>
              <label className={lbl}>Notes</label>
              <textarea className="w-full bg-[#F7F8FC] border border-[#EAECF2] rounded-[9px] px-3 py-2 text-[13px] text-[#1A1D2E] outline-none resize-none focus:border-[#4F7EF7]"
                rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment terms, special instructions..."/>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-[14px] border border-[#EAECF2] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-bold text-[#1A1D2E]">Line Items</h2>
            <button onClick={() => setLines(p => [...p, EMPTY_LINE()])} className="text-[12.5px] font-semibold text-[#4F7EF7]">+ Add line</button>
          </div>
          {errors.lines && <p className="text-[11px] text-[#F0584C] mb-3">{errors.lines}</p>}

          {/* Header */}
          <div className="grid grid-cols-[1fr_120px_32px] gap-2 mb-2">
            <span className="text-[11px] font-bold text-[#A0A8B8] uppercase px-1">Description</span>
            <span className="text-[11px] font-bold text-[#A0A8B8] uppercase text-right px-1">Amount</span>
            <span/>
          </div>

          <div className="space-y-2">
            {lines.map((line) => (
              <div key={line.id} className="grid grid-cols-[1fr_120px_32px] gap-2 items-center">
                <input
                  className="w-full h-10 bg-[#F7F8FC] border border-[#EAECF2] rounded-[9px] px-3 text-[13px] text-[#1A1D2E] outline-none focus:border-[#4F7EF7]"
                  placeholder="Description..."
                  value={line.description}
                  onChange={e => setLines(p => p.map(l => l.id === line.id ? { ...l, description: e.target.value } : l))}
                />
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[#9CA3AF]">$</span>
                  <input
                    type="number" className="w-full h-10 bg-[#F7F8FC] border border-[#EAECF2] rounded-[9px] pl-6 pr-2 text-[13px] text-[#1A1D2E] outline-none text-right focus:border-[#4F7EF7]"
                    value={line.amount || ''}
                    onChange={e => setLines(p => p.map(l => l.id === line.id ? { ...l, amount: parseFloat(e.target.value) || 0 } : l))}
                  />
                </div>
                {lines.length > 1 ? (
                  <button onClick={() => setLines(p => p.filter(l => l.id !== line.id))} className="w-8 h-8 flex items-center justify-center text-[#F0584C] hover:bg-[#FFF0EF] rounded">✕</button>
                ) : <div/>}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#EAECF2]">
            <span className="text-[13px] font-semibold text-[#6B7280]">Total</span>
            <span className="text-[22px] font-bold text-[#1A1D2E]">{fmt(total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <a href="/invoices" className="flex-1 h-11 rounded-[9px] border border-[#EAECF2] bg-white flex items-center justify-center text-[13px] font-semibold text-[#6B7280] no-underline" style={{ textDecoration: 'none' }}>Cancel</a>
          <button onClick={() => handleSave('DRAFT')} disabled={saving} className="flex-1 h-11 rounded-[9px] border border-[#4F7EF7] text-[#4F7EF7] text-[13px] font-bold disabled:opacity-50 bg-white">
            Save Draft
          </button>
          <button onClick={() => handleSave('SENT')} disabled={saving} className="flex-1 h-11 rounded-[9px] bg-[#4F7EF7] text-white text-[13px] font-bold disabled:opacity-50">
            {saving ? 'Saving...' : 'Send Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}
