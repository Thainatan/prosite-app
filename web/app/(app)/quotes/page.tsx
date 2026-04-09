'use client';
import { useState } from 'react';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtD = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

type Status = 'draft' | 'sent' | 'approved' | 'rejected';
const STATUS: Record<Status, { label: string; bg: string; color: string }> = {
  draft:    { label: 'Draft',    bg: '#F3F4F6', color: '#6B7280' },
  sent:     { label: 'Sent',     bg: '#E0F2FE', color: '#0EA5E9' },
  approved: { label: 'Approved', bg: '#EAFAF3', color: '#34C78A' },
  rejected: { label: 'Rejected', bg: '#FFF0EF', color: '#F0584C' },
};

interface LineItem { id: string; description: string; qty: number; unit: string; price: number; }
interface Quote {
  id: string; number: string; client: string; property: string;
  service: string; status: Status; date: string; validUntil: string;
  items: LineItem[]; notes?: string;
}

const QUOTES: Quote[] = [
  { id:'1', number:'BF-Q-089', client:'Linda Davis', property:'321 Cedar Blvd, Sarasota', service:'Kitchen Remodel', status:'approved', date:'2026-03-28', validUntil:'2026-04-28',
    items:[
      {id:'i1',description:'Demo & site preparation',qty:1,unit:'job',price:2800},
      {id:'i2',description:'Rough framing & drywall',qty:1,unit:'job',price:4200},
      {id:'i3',description:'Custom cabinet installation',qty:1,unit:'job',price:18500},
      {id:'i4',description:'Countertop — quartz 3cm',qty:45,unit:'sqft',price:185},
      {id:'i5',description:'Tile backsplash installation',qty:32,unit:'sqft',price:28},
      {id:'i6',description:'Plumbing fixtures & connections',qty:1,unit:'job',price:3200},
      {id:'i7',description:'Electrical rough-in & fixtures',qty:1,unit:'job',price:2800},
      {id:'i8',description:'Paint & finish',qty:1,unit:'job',price:2400},
    ],
    notes:'Includes removal and disposal of existing cabinets. Appliances by owner.'
  },
  { id:'2', number:'BF-Q-090', client:'Michael Brown', property:'654 Elm Street, North Port', service:'Outdoor Kitchen', status:'sent', date:'2026-04-02', validUntil:'2026-05-02',
    items:[
      {id:'i9',description:'Foundation & concrete work',qty:1,unit:'job',price:8500},
      {id:'i10',description:'Stucco framing & exterior finish',qty:1,unit:'job',price:12000},
      {id:'i11',description:'Outdoor cabinetry installation',qty:1,unit:'job',price:14000},
      {id:'i12',description:'Granite countertop',qty:38,unit:'sqft',price:195},
      {id:'i13',description:'Gas line & connections',qty:1,unit:'job',price:2800},
      {id:'i14',description:'Electrical & lighting',qty:1,unit:'job',price:3200},
    ],
    notes:'Includes built-in grill rough-in. Grill and appliances by owner.'
  },
  { id:'3', number:'BF-Q-091', client:'Patricia Wilson', property:'567 Maple Ave, Bradenton', service:'Bathroom Remodel', status:'approved', date:'2026-03-20', validUntil:'2026-04-20',
    items:[
      {id:'i15',description:'Demo & tile removal',qty:1,unit:'job',price:1800},
      {id:'i16',description:'Shower pan & waterproofing',qty:1,unit:'job',price:2400},
      {id:'i17',description:'Floor & wall tile installation',qty:85,unit:'sqft',price:32},
      {id:'i18',description:'Vanity & fixture installation',qty:1,unit:'job',price:2200},
      {id:'i19',description:'Plumbing rough-in & fixtures',qty:1,unit:'job',price:2800},
    ],
    notes:'Client to select tile from allowance budget of $1,800.'
  },
  { id:'4', number:'BF-Q-092', client:'Robert Johnson', property:'890 Pine Road, Venice', service:'Flooring', status:'draft', date:'2026-04-06', validUntil:'2026-05-06',
    items:[
      {id:'i20',description:'Remove existing carpet — 2nd floor',qty:820,unit:'sqft',price:1.5},
      {id:'i21',description:'LVP flooring installation',qty:820,unit:'sqft',price:8.5},
      {id:'i22',description:'Baseboards & trim',qty:180,unit:'lnft',price:6},
    ],
  },
];

function QuoteDetail({ quote, onClose }: { quote: Quote; onClose: () => void }) {
  const subtotal = quote.items.reduce((a, i) => a + i.qty * i.price, 0);
  const tax = 0;
  const total = subtotal + tax;
  const st = STATUS[quote.status];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[16px] w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.18)] border border-[#EAECF2]" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-[#EAECF2]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-[18px] font-bold text-[#1A1D2E]">{quote.service}</h2>
                <span className="font-mono text-[11.5px] text-[#A0A8B8]">{quote.number}</span>
                <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
              </div>
              <p className="text-[12.5px] text-[#6B7280]">{quote.client} · {quote.property}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">✕</button>
          </div>
          <div className="flex gap-0 mt-4 border border-[#EAECF2] rounded-[10px] overflow-hidden divide-x divide-[#EAECF2]">
            {[{l:'Date',v:fmtD(quote.date)},{l:'Valid Until',v:fmtD(quote.validUntil)},{l:'Items',v:String(quote.items.length)},{l:'Total',v:fmt(total)}].map(({l,v})=>(
              <div key={l} className="flex-1 px-3 py-2.5 text-center"><p className="text-[10px] font-bold text-[#A0A8B8] uppercase mb-1">{l}</p><p className="text-[13px] font-bold text-[#1A1D2E]">{v}</p></div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-[10.5px] font-bold text-[#A0A8B8] uppercase tracking-wide mb-2">Line Items</p>
          <div className="bg-[#F9FAFB] rounded-[10px] border border-[#EAECF2] overflow-hidden mb-4">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-[#EAECF2] bg-[#F3F4F6]">
              <span className="col-span-6 text-[10.5px] font-bold text-[#6B7280] uppercase">Description</span>
              <span className="col-span-2 text-[10.5px] font-bold text-[#6B7280] uppercase text-center">Qty</span>
              <span className="col-span-2 text-[10.5px] font-bold text-[#6B7280] uppercase text-right">Unit Price</span>
              <span className="col-span-2 text-[10.5px] font-bold text-[#6B7280] uppercase text-right">Total</span>
            </div>
            {quote.items.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-[#EAECF2] last:border-0">
                <span className="col-span-6 text-[13px] text-[#374151]">{item.description}</span>
                <span className="col-span-2 text-[13px] text-[#6B7280] text-center">{item.qty} {item.unit}</span>
                <span className="col-span-2 text-[13px] text-[#6B7280] text-right">{fmt(item.price)}</span>
                <span className="col-span-2 text-[13px] font-semibold text-[#1A1D2E] text-right">{fmt(item.qty * item.price)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end mb-4">
            <div className="w-64 bg-[#F7F8FC] rounded-[10px] border border-[#EAECF2] p-4 space-y-2">
              <div className="flex justify-between text-[13px]"><span className="text-[#6B7280]">Subtotal</span><span className="font-semibold text-[#1A1D2E]">{fmt(subtotal)}</span></div>
              <div className="flex justify-between text-[13px]"><span className="text-[#6B7280]">Tax</span><span className="font-semibold text-[#1A1D2E]">$0</span></div>
              <div className="flex justify-between border-t-2 border-[#1A1D2E] pt-2">
                <span className="text-[14px] font-bold text-[#1A1D2E]">Total</span>
                <span className="text-[20px] font-bold text-[#1A1D2E]">{fmt(total)}</span>
              </div>
            </div>
          </div>

          {quote.notes && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[10px] p-4">
              <p className="text-[10.5px] font-bold text-[#92400E] uppercase mb-2">Notes & Exclusions</p>
              <p className="text-[13px] text-[#78350F]">{quote.notes}</p>
            </div>
          )}

          {quote.status === 'approved' && (
            <div className="mt-4 bg-[#EAFAF3] border border-[#A7F3D0] rounded-[10px] p-4 flex items-center gap-3">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#34C78A" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
              <div><p className="text-[13px] font-bold text-[#065F46]">Quote Approved</p><p className="text-[11.5px] text-[#34C78A]">Client approved and signed</p></div>
            </div>
          )}

          {quote.status === 'sent' && (
            <div className="mt-4 bg-[#F7F8FC] border border-[#EAECF2] rounded-[10px] p-4">
              <p className="text-[11px] font-bold text-[#A0A8B8] uppercase mb-2">Client Signature</p>
              <input className="w-full h-10 bg-white border border-[#EAECF2] rounded-[9px] px-3 text-[13px] italic outline-none focus:border-[#34C78A] font-serif" placeholder="Client types full name to approve…"/>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-[#EAECF2] bg-[#F9FAFB]">
          <button onClick={onClose} className="h-9 px-4 rounded-[9px] border border-[#EAECF2] bg-white text-[13px] font-semibold text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">Close</button>
          <div className="flex-1"/>
          <button className="h-9 px-4 rounded-[9px] border border-[#EAECF2] bg-white text-[13px] font-semibold text-[#6B7280] hover:bg-[#F3F4F6]">PDF</button>
          {quote.status === 'approved' && <button className="h-9 px-4 rounded-[9px] bg-[#34C78A] text-white text-[13px] font-semibold hover:bg-[#2BAF78]">Convert to Project →</button>}
          {quote.status !== 'approved' && <button className="h-9 px-4 rounded-[9px] bg-[#4F7EF7] text-white text-[13px] font-semibold hover:bg-[#3A6AE8]">Send to Client</button>}
        </div>
      </div>
    </div>
  );
}

export default function QuotesPage() {
  const [selected, setSelected] = useState<Quote | null>(null);
  const [search, setSearch] = useState('');
  const filtered = QUOTES.filter(q =>
    !search || q.client.toLowerCase().includes(search.toLowerCase()) || q.number.includes(search) || q.service.toLowerCase().includes(search.toLowerCase())
  );
  const totalApproved = QUOTES.filter(q => q.status === 'approved').reduce((a, q) => a + q.items.reduce((b, i) => b + i.qty * i.price, 0), 0);
  const totalPending = QUOTES.filter(q => q.status === 'sent').reduce((a, q) => a + q.items.reduce((b, i) => b + i.qty * i.price, 0), 0);

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <header className="bg-white border-b border-[#EAECF2] h-14 flex items-center justify-between px-6 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-bold text-[#1A1D2E]">Quotes</h1>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#EEF3FF] text-[#4F7EF7] rounded-full">{QUOTES.length} total</span>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quotes..." className="flex-1 max-w-sm h-[34px] bg-[#F7F8FC] border border-[#EAECF2] rounded-full px-4 text-[13px] outline-none focus:border-[#4F7EF7] transition-all"/>
        <button className="h-[34px] px-4 bg-[#4F7EF7] text-white text-[13px] font-semibold rounded-[9px] hover:bg-[#3A6AE8]">+ New Quote</button>
      </header>

      <div className="bg-white border-b border-[#EAECF2] px-6 py-2.5 flex gap-6">
        <span className="text-[12px] text-[#A0A8B8]">Approved: <b className="text-[#34C78A]">{fmt(totalApproved)}</b></span>
        <span className="text-[12px] text-[#A0A8B8]">Pending: <b className="text-[#F5A623]">{fmt(totalPending)}</b></span>
        <span className="text-[12px] text-[#A0A8B8]">Win rate: <b className="text-[#4F7EF7]">67%</b></span>
      </div>

      <div className="p-5">
        <div className="bg-white rounded-[14px] border border-[#EAECF2] overflow-hidden">
          {filtered.map(q => {
            const total = q.items.reduce((a, i) => a + i.qty * i.price, 0);
            const st = STATUS[q.status];
            return (
              <div key={q.id} onClick={() => setSelected(q)} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F7F8FC] cursor-pointer border-b border-[#EAECF2] last:border-0 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[14px] font-bold text-[#1A1D2E]">{q.service}</span>
                    <span className="font-mono text-[11px] text-[#A0A8B8]">{q.number}</span>
                  </div>
                  <p className="text-[12px] text-[#6B7280]">{q.client} · {q.property}</p>
                </div>
                <div className="text-center flex-shrink-0">
                  <p className="text-[11.5px] text-[#A0A8B8]">{fmtD(q.date)}</p>
                </div>
                <div className="text-center flex-shrink-0">
                  <p className="text-[11.5px] text-[#A0A8B8]">Valid {fmtD(q.validUntil)}</p>
                </div>
                <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                <div className="text-right flex-shrink-0">
                  <p className="text-[14px] font-bold text-[#1A1D2E]">{fmt(total)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && <QuoteDetail quote={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}