'use client';
import { useState, useEffect, useRef } from 'react';
import { FileText, Plus, Trash2, ChevronLeft, Send, Save, UserPlus, X } from 'lucide-react';
import ClientAutocomplete from '../../components/ClientAutocomplete';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const getH = () => ({ Authorization: 'Bearer ' + (typeof window !== 'undefined' ? localStorage.getItem('prosite_token') || '' : '') });
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

interface LineItem {
  id: string; section: string; description: string; qty: number; unit: string; price: number;
  subcontractorId?: string; subcontractorName?: string; subcontractorTrade?: string;
}
interface Sub { id: string; firstName: string; lastName: string; company: string; trade: string; status: string; }

const SERVICES = ['Kitchen Remodel','Bathroom Remodel','Flooring','Painting','Outdoor Kitchen','Closet & Cabinetry','Interior Finish','Drywall Repair','Other'];
const UNITS = ['job','sqft','lnft','hr','ea','lot'];
const SECTIONS = ['Demo & Prep','Framing & Drywall','Plumbing','Electrical','Tile & Flooring','Cabinetry','Countertops','Paint & Finish','Fixtures & Hardware','Cleanup','Other'];

const TRADE_COLOR: Record<string, string> = {
  Electrical:'#F5A623', Plumbing:'#0EA5E9', HVAC:'#E8834A', Framing:'#34C78A',
  Flooring:'#EC4899', Painting:'#F0584C', Tile:'#8B5CF6', Other:'#6B7280',
};

function SubPicker({ subs, onSelect, onClose }: {
  subs: Sub[]; onSelect: (s: Sub) => void; onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const filtered = subs.filter(s =>
    s.status === 'ACTIVE' &&
    (!q || `${s.firstName} ${s.lastName} ${s.company} ${s.trade}`.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div ref={ref} className="absolute right-0 top-9 z-50 w-56 bg-white border border-[#E8E4DF] rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
      <div className="p-2 border-b border-[#E8E4DF]">
        <input
          autoFocus
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search subs..."
          className="w-full h-7 bg-[#F8F6F3] border border-[#E8E4DF] rounded-[7px] px-2 text-[12px] text-white placeholder-[#9CA3AF] outline-none"
        />
      </div>
      <div className="max-h-48 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-[11px] text-[#9CA3AF] text-center py-3">No subs found</p>
        ) : filtered.map(s => (
          <button key={s.id} onClick={() => { onSelect(s); onClose(); }}
            className="w-full text-left px-3 py-2 hover:bg-[#E8E4DF] border-b border-[#E8E4DF] last:border-0 flex items-center justify-between gap-2">
            <span className="text-[12px] font-semibold text-white truncate">{s.firstName} {s.lastName}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ background: (TRADE_COLOR[s.trade] || '#6B7280') + '33', color: TRADE_COLOR[s.trade] || '#6B7280' }}>
              {s.trade}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NewQuotePage() {
  const [clientId, setClientId] = useState('');
  const [service, setService] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', section: 'Demo & Prep', description: '', qty: 1, unit: 'job', price: 0 },
  ]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [pickerForItem, setPickerForItem] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/subcontractors`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSubs(data); })
      .catch(() => {});
  }, []);

  const addItem = () => setItems(p => [...p, { id: Date.now().toString(), section: 'Other', description: '', qty: 1, unit: 'job', price: 0 }]);
  const removeItem = (id: string) => setItems(p => p.filter(i => i.id !== id));
  const updateItem = (id: string, key: keyof LineItem, value: string | number) =>
    setItems(p => p.map(i => i.id === id ? { ...i, [key]: value } : i));
  const assignSub = (itemId: string, sub: Sub) =>
    setItems(p => p.map(i => i.id === itemId ? { ...i, subcontractorId: sub.id, subcontractorName: `${sub.firstName} ${sub.lastName}`, subcontractorTrade: sub.trade } : i));
  const clearSub = (itemId: string) =>
    setItems(p => p.map(i => i.id === itemId ? { ...i, subcontractorId: undefined, subcontractorName: undefined, subcontractorTrade: undefined } : i));

  const subtotal = items.reduce((a, i) => a + i.qty * i.price, 0);

  const handleSave = async (action: 'draft' | 'send') => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getH() },
        body: JSON.stringify({
          clientId: clientId || null,
          serviceType: service || 'OTHER',
          title: title || 'New Quote',
          subtotal,
          total: subtotal,
          items: items.map(i => ({
            section: i.section, description: i.description, qty: i.qty,
            unit: i.unit, price: i.price, amount: i.qty * i.price,
            subcontractorId: i.subcontractorId || null,
            subcontractorName: i.subcontractorName || null,
          })),
        }),
      });
      const data = await res.json();
      if (data.error) { alert('Error: ' + data.error); setLoading(false); return; }
      setSaved(true);
      setTimeout(() => { window.location.href = '/quotes'; }, 1000);
    } catch {
      alert('Error saving quote. Check connection.');
      setLoading(false);
    }
  };

  const inp = 'w-full h-10 bg-white border border-[#E8E4DF] rounded-[9px] px-3 text-[13px] text-white placeholder-[#9CA3AF] outline-none focus:border-[#E8834A] transition-all';
  const lbl = 'block text-[11.5px] font-semibold text-[#6B7280] mb-1.5';

  if (saved) return (
    <div style={{minHeight:'100vh',background:'#F8F6F3',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(52,199,138,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
          <FileText size={28} color="#34C78A"/>
        </div>
        <h2 style={{fontSize:20,fontWeight:800,color:'white',marginBottom:8}}>Quote Saved!</h2>
        <p style={{color:'#6B7280',fontSize:14}}>Redirecting...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      <header className="bg-white border-b border-[#E8E4DF] h-14 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <a href="/quotes" className="flex items-center gap-1.5 text-[#6B7280] hover:text-white transition-colors" style={{textDecoration:'none'}}>
            <ChevronLeft size={16}/>
            <span className="text-[13px] font-medium">Quotes</span>
          </a>
          <span className="text-[#1E2130]">/</span>
          <span className="text-[13px] font-semibold text-white">New Quote</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSave('draft')} disabled={loading} className="flex items-center gap-2 h-9 px-4 rounded-[9px] border border-[#E8E4DF] bg-[#FAF9F7] text-[13px] font-semibold text-[#6B7280] hover:text-white transition-all">
            <Save size={14}/>Save Draft
          </button>
          <button onClick={() => handleSave('send')} disabled={loading} className="flex items-center gap-2 h-9 px-4 rounded-[9px] bg-[#E8834A] text-white text-[13px] font-semibold hover:bg-[#D4713A] transition-all">
            <Send size={14}/>{loading ? 'Saving...' : 'Save & Send'}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-5">
        {/* Quote Details */}
        <div className="bg-white rounded-[14px] border border-[#E8E4DF] p-5">
          <h2 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2">
            <FileText size={16} color="#4F7EF7"/>Quote Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Client</label>
              <ClientAutocomplete
                value={clientId}
                onSelect={(id) => setClientId(id)}
                placeholder="Search or add client..."
                theme="dark"
              />
            </div>
            <div>
              <label className={lbl}>Service Type</label>
              <select className={inp} value={service} onChange={e => setService(e.target.value)}>
                <option value="">Select service...</option>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={lbl}>Quote Title</label>
              <input className={inp} placeholder="e.g. Full Kitchen Remodel" value={title} onChange={e => setTitle(e.target.value)}/>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-[14px] border border-[#E8E4DF] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E4DF]">
            <h2 className="text-[15px] font-bold text-white">Line Items</h2>
            <button onClick={addItem} className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] bg-[#FEF3EC] text-[#E8834A] text-[12.5px] font-semibold hover:bg-[#2D3A6B] transition-all">
              <Plus size={13}/>Add Item
            </button>
          </div>

          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-5 py-2.5 bg-[#FAF9F7] border-b border-[#E8E4DF]">
            {[
              { label: 'Section', cls: 'col-span-2' },
              { label: 'Description', cls: 'col-span-3' },
              { label: 'Qty', cls: 'col-span-1' },
              { label: 'Unit', cls: 'col-span-1' },
              { label: 'Price', cls: 'col-span-2 text-right' },
              { label: 'Total', cls: 'col-span-2 text-right' },
              { label: '', cls: 'col-span-1' },
            ].map(({ label, cls }) => (
              <div key={label} className={`text-[10.5px] font-bold text-[#9CA3AF] uppercase ${cls}`}>{label}</div>
            ))}
          </div>

          {items.map(item => (
            <div key={item.id} className="border-b border-[#E8E4DF] hover:bg-[#FAF9F7]">
              {/* Main row */}
              <div className="grid grid-cols-12 gap-2 px-5 py-2.5 items-center">
                <div className="col-span-2">
                  <select value={item.section} onChange={e => updateItem(item.id,'section',e.target.value)}
                    className="w-full h-8 bg-[#F8F6F3] border border-[#E8E4DF] rounded-[7px] px-2 text-[11.5px] text-[#6B7280] outline-none">
                    {SECTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-3">
                  <input value={item.description} onChange={e => updateItem(item.id,'description',e.target.value)}
                    placeholder="Description..." className="w-full h-8 bg-[#F8F6F3] border border-[#E8E4DF] rounded-[7px] px-2 text-[12.5px] text-white placeholder-[#9CA3AF] outline-none"/>
                </div>
                <div className="col-span-1">
                  <input type="number" value={item.qty} onChange={e => updateItem(item.id,'qty',parseFloat(e.target.value)||0)}
                    className="w-full h-8 bg-[#F8F6F3] border border-[#E8E4DF] rounded-[7px] px-2 text-[12.5px] text-white outline-none text-center"/>
                </div>
                <div className="col-span-1">
                  <select value={item.unit} onChange={e => updateItem(item.id,'unit',e.target.value)}
                    className="w-full h-8 bg-[#F8F6F3] border border-[#E8E4DF] rounded-[7px] px-1 text-[11.5px] text-[#6B7280] outline-none">
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-[#9CA3AF]">$</span>
                    <input type="number" value={item.price} onChange={e => updateItem(item.id,'price',parseFloat(e.target.value)||0)}
                      className="w-full h-8 bg-[#F8F6F3] border border-[#E8E4DF] rounded-[7px] pl-5 pr-2 text-[12.5px] text-white outline-none text-right"/>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[13px] font-semibold text-white">{fmt(item.qty*item.price)}</span>
                </div>
                {/* Actions: delete + assign sub */}
                <div className="col-span-1 flex items-center justify-end gap-1">
                  {/* Assign Sub button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPickerForItem(pickerForItem === item.id ? null : item.id)}
                      title="Assign subcontractor"
                      className={`w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors ${
                        item.subcontractorId
                          ? 'bg-[#FEF3EC] text-[#E8834A]'
                          : 'hover:bg-[#E8E4DF] text-[#9CA3AF] hover:text-[#6B7280]'
                      }`}>
                      <UserPlus size={12}/>
                    </button>
                    {pickerForItem === item.id && (
                      <SubPicker
                        subs={subs}
                        onSelect={sub => { assignSub(item.id, sub); setPickerForItem(null); }}
                        onClose={() => setPickerForItem(null)}
                      />
                    )}
                  </div>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-[6px] hover:bg-[#2D1515] flex items-center justify-center">
                      <Trash2 size={13} color="#F0584C"/>
                    </button>
                  )}
                </div>
              </div>

              {/* Sub badge row — only shown when a sub is assigned */}
              {item.subcontractorId && (
                <div className="px-5 pb-2 flex items-center gap-1.5">
                  <span className="text-[10px] text-[#9CA3AF] font-semibold">Sub:</span>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: (TRADE_COLOR[item.subcontractorTrade || ''] || '#6B7280') + '22', color: TRADE_COLOR[item.subcontractorTrade || ''] || '#6B7280' }}>
                    {item.subcontractorName} · {item.subcontractorTrade}
                  </span>
                  <button onClick={() => clearSub(item.id)} className="text-[#9CA3AF] hover:text-[#F0584C] transition-colors">
                    <X size={11}/>
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end px-5 py-4">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6B7280]">Subtotal</span>
                <span className="font-semibold text-white">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-white/10 pt-2.5">
                <span className="text-[15px] font-bold text-white">Total</span>
                <span className="text-[22px] font-bold text-[#E8834A]">{fmt(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Exclusions */}
        <div className="bg-white rounded-[14px] border border-[#E8E4DF] p-5">
          <h2 className="text-[15px] font-bold text-white mb-4">Notes & Exclusions</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Scope Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional scope details..."
                className="w-full h-24 bg-[#F8F6F3] border border-[#E8E4DF] rounded-[9px] px-3 py-2.5 text-[13px] text-white placeholder-[#9CA3AF] outline-none resize-none"/>
            </div>
            <div>
              <label className={lbl}>Exclusions</label>
              <textarea value={exclusions} onChange={e => setExclusions(e.target.value)} placeholder="What is NOT included..."
                className="w-full h-24 bg-[#F8F6F3] border border-[#E8E4DF] rounded-[9px] px-3 py-2.5 text-[13px] text-white placeholder-[#9CA3AF] outline-none resize-none"/>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pb-8">
          <a href="/quotes" style={{display:'flex',alignItems:'center',height:40,padding:'0 20px',borderRadius:9,border:'1px solid #1E2130',fontSize:13,fontWeight:600,color:'#6B7280',textDecoration:'none'}}>Cancel</a>
          <button onClick={() => handleSave('draft')} disabled={loading} className="flex items-center gap-2 h-10 px-5 rounded-[9px] border border-[#E8E4DF] bg-[#FAF9F7] text-[13px] font-semibold text-[#6B7280] hover:text-white">
            <Save size={14}/>Save Draft
          </button>
          <button onClick={() => handleSave('send')} disabled={loading} className="flex items-center gap-2 h-10 px-5 rounded-[9px] bg-[#E8834A] text-white text-[13px] font-semibold hover:bg-[#D4713A]">
            <Send size={14}/>{loading ? 'Saving...' : 'Save & Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
