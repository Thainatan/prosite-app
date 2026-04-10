'use client';
import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, ChevronLeft, Send, Save } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

interface LineItem { id: string; section: string; description: string; qty: number; unit: string; price: number; }
interface Client { id: string; firstName: string; lastName: string; phone: string; address: string; city: string; state: string; }

const SERVICES = ['Kitchen Remodel','Bathroom Remodel','Flooring','Painting','Outdoor Kitchen','Closet & Cabinetry','Interior Finish','Drywall Repair','Other'];
const UNITS = ['job','sqft','lnft','hr','ea','lot'];
const SECTIONS = ['Demo & Prep','Framing & Drywall','Plumbing','Electrical','Tile & Flooring','Cabinetry','Countertops','Paint & Finish','Fixtures & Hardware','Cleanup','Other'];

export default function NewQuotePage() {
  const [clientId, setClientId] = useState('');
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [service, setService] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', section: 'Demo & Prep', description: '', qty: 1, unit: 'job', price: 0 },
  ]);

  useEffect(() => {
    fetch(`${API}/clients`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setClientsList(data); })
      .catch(() => {});
  }, []);

  const addItem = () => setItems(p => [...p, { id: Date.now().toString(), section: 'Other', description: '', qty: 1, unit: 'job', price: 0 }]);
  const removeItem = (id: string) => setItems(p => p.filter(i => i.id !== id));
  const updateItem = (id: string, key: keyof LineItem, value: string | number) => setItems(p => p.map(i => i.id === id ? { ...i, [key]: value } : i));
  const subtotal = items.reduce((a, i) => a + i.qty * i.price, 0);

  const handleSave = async (action: 'draft' | 'send') => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientId || null,
          serviceType: service || 'OTHER',
          title: title || 'New Quote',
          subtotal: subtotal,
          total: subtotal,
          items: items,
        }),
      });
      const data = await res.json();
      if (data.error) { alert('Error: ' + data.error); setLoading(false); return; }
      setSaved(true);
      setTimeout(() => { window.location.href = '/quotes'; }, 1000);
    } catch (e) {
      alert('Error saving quote. Check connection.');
      setLoading(false);
    }
  };

  const inp = 'w-full h-10 bg-[#0F1117] border border-[#1E2130] rounded-[9px] px-3 text-[13px] text-white placeholder-[#3D4466] outline-none focus:border-[#4F7EF7] transition-all';
  const lbl = 'block text-[11.5px] font-semibold text-[#8892B0] mb-1.5';

  if (saved) return (
    <div style={{minHeight:'100vh',background:'#0A0D14',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(52,199,138,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
          <FileText size={28} color="#34C78A"/>
        </div>
        <h2 style={{fontSize:20,fontWeight:800,color:'white',marginBottom:8}}>Quote Saved!</h2>
        <p style={{color:'#8892B0',fontSize:14}}>Redirecting...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0D14]">
      <header className="bg-[#0F1117] border-b border-[#1E2130] h-14 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <a href="/quotes" className="flex items-center gap-1.5 text-[#8892B0] hover:text-white transition-colors" style={{textDecoration:'none'}}>
            <ChevronLeft size={16}/>
            <span className="text-[13px] font-medium">Quotes</span>
          </a>
          <span className="text-[#1E2130]">/</span>
          <span className="text-[13px] font-semibold text-white">New Quote</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSave('draft')} disabled={loading} className="flex items-center gap-2 h-9 px-4 rounded-[9px] border border-[#1E2130] bg-[#161924] text-[13px] font-semibold text-[#8892B0] hover:text-white transition-all">
            <Save size={14}/>Save Draft
          </button>
          <button onClick={() => handleSave('send')} disabled={loading} className="flex items-center gap-2 h-9 px-4 rounded-[9px] bg-[#4F7EF7] text-white text-[13px] font-semibold hover:bg-[#3A6AE8] transition-all">
            <Send size={14}/>{loading ? 'Saving...' : 'Save & Send'}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-5">
        <div className="bg-[#0F1117] rounded-[14px] border border-[#1E2130] p-5">
          <h2 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2">
            <FileText size={16} color="#4F7EF7"/>Quote Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Client</label>
              <select className={inp} value={clientId} onChange={e => setClientId(e.target.value)}>
                <option value="">Select client...</option>
                {clientsList.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
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

        <div className="bg-[#0F1117] rounded-[14px] border border-[#1E2130] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2130]">
            <h2 className="text-[15px] font-bold text-white">Line Items</h2>
            <button onClick={addItem} className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] bg-[#1E2A4A] text-[#4F7EF7] text-[12.5px] font-semibold hover:bg-[#2D3A6B] transition-all">
              <Plus size={13}/>Add Item
            </button>
          </div>
          <div className="grid grid-cols-12 gap-2 px-5 py-2.5 bg-[#161924] border-b border-[#1E2130]">
            {['Section','Description','Qty','Unit','Price','Total',''].map((h,i) => (
              <div key={i} className={`text-[10.5px] font-bold text-[#3D4466] uppercase ${i===1?'col-span-3':i===0?'col-span-2':'col-span-1'} ${i>=4?'text-right':''}`}>{h}</div>
            ))}
          </div>
          {items.map(item => (
            <div key={item.id} className="grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-[#1E2130] items-center hover:bg-[#161924]">
              <div className="col-span-2">
                <select value={item.section} onChange={e => updateItem(item.id,'section',e.target.value)} className="w-full h-8 bg-[#0A0D14] border border-[#1E2130] rounded-[7px] px-2 text-[11.5px] text-[#8892B0] outline-none">
                  {SECTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-3">
                <input value={item.description} onChange={e => updateItem(item.id,'description',e.target.value)} placeholder="Description..." className="w-full h-8 bg-[#0A0D14] border border-[#1E2130] rounded-[7px] px-2 text-[12.5px] text-white placeholder-[#3D4466] outline-none"/>
              </div>
              <div className="col-span-1">
                <input type="number" value={item.qty} onChange={e => updateItem(item.id,'qty',parseFloat(e.target.value)||0)} className="w-full h-8 bg-[#0A0D14] border border-[#1E2130] rounded-[7px] px-2 text-[12.5px] text-white outline-none text-center"/>
              </div>
              <div className="col-span-1">
                <select value={item.unit} onChange={e => updateItem(item.id,'unit',e.target.value)} className="w-full h-8 bg-[#0A0D14] border border-[#1E2130] rounded-[7px] px-1 text-[11.5px] text-[#8892B0] outline-none">
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-[#3D4466]">$</span>
                  <input type="number" value={item.price} onChange={e => updateItem(item.id,'price',parseFloat(e.target.value)||0)} className="w-full h-8 bg-[#0A0D14] border border-[#1E2130] rounded-[7px] pl-5 pr-2 text-[12.5px] text-white outline-none text-right"/>
                </div>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-[13px] font-semibold text-white">{fmt(item.qty*item.price)}</span>
              </div>
              <div className="col-span-1 flex justify-end">
                {items.length > 1 && (
                  <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-[6px] hover:bg-[#2D1515] flex items-center justify-center">
                    <Trash2 size={13} color="#F0584C"/>
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-end px-5 py-4">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#8892B0]">Subtotal</span>
                <span className="font-semibold text-white">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-white/10 pt-2.5">
                <span className="text-[15px] font-bold text-white">Total</span>
                <span className="text-[22px] font-bold text-[#4F7EF7]">{fmt(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0F1117] rounded-[14px] border border-[#1E2130] p-5">
          <h2 className="text-[15px] font-bold text-white mb-4">Notes & Exclusions</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Scope Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional scope details..." className="w-full h-24 bg-[#0A0D14] border border-[#1E2130] rounded-[9px] px-3 py-2.5 text-[13px] text-white placeholder-[#3D4466] outline-none resize-none"/>
            </div>
            <div>
              <label className={lbl}>Exclusions</label>
              <textarea value={exclusions} onChange={e => setExclusions(e.target.value)} placeholder="What is NOT included..." className="w-full h-24 bg-[#0A0D14] border border-[#1E2130] rounded-[9px] px-3 py-2.5 text-[13px] text-white placeholder-[#3D4466] outline-none resize-none"/>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pb-8">
          <a href="/quotes" style={{display:'flex',alignItems:'center',height:40,padding:'0 20px',borderRadius:9,border:'1px solid #1E2130',fontSize:13,fontWeight:600,color:'#8892B0',textDecoration:'none'}}>Cancel</a>
          <button onClick={() => handleSave('draft')} disabled={loading} className="flex items-center gap-2 h-10 px-5 rounded-[9px] border border-[#1E2130] bg-[#161924] text-[13px] font-semibold text-[#8892B0] hover:text-white">
            <Save size={14}/>Save Draft
          </button>
          <button onClick={() => handleSave('send')} disabled={loading} className="flex items-center gap-2 h-10 px-5 rounded-[9px] bg-[#4F7EF7] text-white text-[13px] font-semibold hover:bg-[#3A6AE8]">
            <Send size={14}/>{loading ? 'Saving...' : 'Save & Send'}
          </button>
        </div>
      </div>
    </div>
  );
}