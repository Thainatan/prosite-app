'use client';
import { useState } from 'react';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtD = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

type IStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';
const IS: Record<IStatus, { label: string; bg: string; color: string }> = {
  draft:   { label: 'Draft',   bg: '#F3F4F6', color: '#6B7280' },
  sent:    { label: 'Sent',    bg: '#E0F2FE', color: '#0EA5E9' },
  partial: { label: 'Partial', bg: '#FFF7E9', color: '#F5A623' },
  paid:    { label: 'Paid',    bg: '#EAFAF3', color: '#34C78A' },
  overdue: { label: 'Overdue', bg: '#FFF0EF', color: '#F0584C' },
};

const TYPE_ICON: Record<string, string> = { deposit: '🏁', progress: '🔨', final: '✅' };

const INVOICES = [
  { id:'1', number:'BF-INV-031', type:'deposit' as const, client:'Linda Davis', project:'Smith Kitchen Remodel', jobNumber:'BF-2024-041', status:'paid' as IStatus, date:'2026-03-15', dueDate:'2026-03-20', total:16519, paid:16519, due:0, items:[{description:'Deposit — 30% of contract',amount:16519}], paymentNotes:'Check #4421 received Mar 18.' },
  { id:'2', number:'BF-INV-032', type:'progress' as const, client:'Linda Davis', project:'Smith Kitchen Remodel', jobNumber:'BF-2024-041', status:'sent' as IStatus, date:'2026-04-05', dueDate:'2026-04-10', total:18000, paid:0, due:18000, items:[{description:'Demo & rough framing complete',amount:8000},{description:'Cabinet installation complete',amount:10000}] },
  { id:'3', number:'BF-INV-033', type:'deposit' as const, client:'Michael Brown', project:'Garcia Outdoor Kitchen', jobNumber:'BF-2024-037', status:'paid' as IStatus, date:'2026-02-20', dueDate:'2026-02-25', total:19050, paid:19050, due:0, items:[{description:'Deposit — 30% of contract',amount:19050}], paymentNotes:'Bank transfer Feb 22.' },
  { id:'4', number:'BF-INV-034', type:'progress' as const, client:'Michael Brown', project:'Garcia Outdoor Kitchen', jobNumber:'BF-2024-037', status:'partial' as IStatus, date:'2026-03-20', dueDate:'2026-03-30', total:20400, paid:10000, due:10400, items:[{description:'Foundation & framing',amount:12000},{description:'Cabinetry installation',amount:8400}], paymentNotes:'Partial $10,000 received Mar 25.' },
  { id:'5', number:'BF-INV-035', type:'deposit' as const, client:'Patricia Wilson', project:'Johnson Master Bath', jobNumber:'BF-2024-039', status:'overdue' as IStatus, date:'2026-03-20', dueDate:'2026-03-28', total:5400, paid:0, due:5400, items:[{description:'Deposit — 30% of contract',amount:5400}] },
];

export default function InvoicesPage() {
  const [selected, setSelected] = useState<typeof INVOICES[0] | null>(null);
  const [filter, setFilter] = useState<IStatus | 'all'>('all');
  const [payOpen, setPayOpen] = useState(false);
  const filtered = INVOICES.filter(i => filter === 'all' || i.status === filter);
  const outstanding = INVOICES.filter(i => i.status !== 'paid').reduce((a, i) => a + i.due, 0);
  const collected = INVOICES.filter(i => i.status === 'paid').reduce((a, i) => a + i.total, 0);

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <header className="bg-white border-b border-[#EAECF2] h-14 flex items-center justify-between px-6 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-bold text-[#1A1D2E]">Invoices</h1>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#FFF0EF] text-[#F0584C] rounded-full">1 overdue</span>
        </div>
        <div className="flex items-center bg-[#F3F4F6] rounded-[9px] p-1 gap-1">
          {(['all','sent','partial','paid','overdue'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`h-7 px-3 rounded-[7px] text-[11.5px] font-semibold capitalize transition-all ${filter === s ? 'bg-white text-[#1A1D2E] shadow-sm' : 'text-[#9CA3AF]'}`}>
              {s === 'all' ? 'All' : IS[s].label}
            </button>
          ))}
        </div>
        <button className="h-[34px] px-4 bg-[#4F7EF7] text-white text-[13px] font-semibold rounded-[9px]">+ New Invoice</button>
      </header>

      <div className="bg-white border-b border-[#EAECF2] px-6 py-3 flex gap-4">
        {[
          { label:'Outstanding', value:fmt(outstanding), color:'#F0584C', bg:'#FFF0EF' },
          { label:'Collected',   value:fmt(collected),   color:'#34C78A', bg:'#EAFAF3' },
          { label:'Total Issued',value:fmt(INVOICES.reduce((a,i)=>a+i.total,0)), color:'#1A1D2E', bg:'#F7F8FC' },
        ].map(({label,value,color,bg}) => (
          <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-[10px]" style={{background:bg}}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{color:color+'99'}}>{label}</p>
              <p className="text-[16px] font-bold" style={{color}}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5">
        <div className="bg-white rounded-[14px] border border-[#EAECF2] overflow-hidden">
          {filtered.map(inv => {
            const st = IS[inv.status];
            const pct = inv.total > 0 ? Math.round((inv.paid/inv.total)*100) : 0;
            return (
              <div key={inv.id} onClick={() => setSelected(inv)} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F7F8FC] cursor-pointer border-b border-[#EAECF2] last:border-0 transition-colors">
                <div className="w-9 h-9 rounded-[10px] bg-[#F7F8FC] border border-[#EAECF2] flex items-center justify-center text-base flex-shrink-0">{TYPE_ICON[inv.type]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13.5px] font-bold text-[#1A1D2E]">{inv.project}</span>
                    <span className="font-mono text-[11px] text-[#A0A8B8]">{inv.number}</span>
                  </div>
                  <p className="text-[12px] text-[#6B7280]">{inv.client} · {inv.type} · Due {fmtD(inv.dueDate)}</p>
                </div>
                {inv.status === 'partial' && (
                  <div className="w-20">
                    <div className="flex justify-between text-[10px] font-semibold mb-1"><span className="text-[#A0A8B8]">Paid</span><span className="text-[#F5A623]">{pct}%</span></div>
                    <div className="h-1.5 bg-[#EAECF2] rounded-full overflow-hidden"><div className="h-full bg-[#F5A623] rounded-full" style={{width:`${pct}%`}}/></div>
                  </div>
                )}
                <div className="text-right flex-shrink-0">
                  <p className="text-[14px] font-bold text-[#1A1D2E]">{fmt(inv.total)}</p>
                  {inv.due > 0 ? <p className="text-[11px] font-medium text-[#F0584C]">{fmt(inv.due)} due</p> : <p className="text-[11px] text-[#34C78A] font-medium">Paid ✓</p>}
                </div>
                <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full w-16 text-center flex-shrink-0" style={{background:st.bg,color:st.color}}>{st.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-[16px] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.18)] border border-[#EAECF2]" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-[#EAECF2] flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{TYPE_ICON[selected.type]}</span>
                  <h2 className="text-[17px] font-bold text-[#1A1D2E] capitalize">{selected.type} Invoice</h2>
                  <span className="font-mono text-[11px] text-[#A0A8B8]">{selected.number}</span>
                  <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full" style={{background:IS[selected.status].bg,color:IS[selected.status].color}}>{IS[selected.status].label}</span>
                </div>
                <p className="text-[12.5px] text-[#6B7280]">{selected.project} · {selected.client}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="bg-[#F9FAFB] rounded-[10px] border border-[#EAECF2] overflow-hidden">
                {selected.items.map((item,i) => (
                  <div key={i} className="flex justify-between px-4 py-3 border-b border-[#EAECF2] last:border-0">
                    <span className="text-[13px] text-[#374151]">{item.description}</span>
                    <span className="text-[13px] font-bold text-[#1A1D2E] ml-4">{fmt(item.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#F7F8FC] border border-[#EAECF2] rounded-[12px] p-4 space-y-2">
                <div className="flex justify-between text-[13px]"><span className="text-[#6B7280]">Total</span><span className="font-bold text-[#1A1D2E]">{fmt(selected.total)}</span></div>
                <div className="flex justify-between text-[13px]"><span className="text-[#34C78A]">Paid</span><span className="font-bold text-[#34C78A]">{fmt(selected.paid)}</span></div>
                <div className="flex justify-between border-t-2 border-[#1A1D2E] pt-2.5">
                  <span className="text-[14px] font-bold text-[#1A1D2E]">Balance Due</span>
                  <span className="text-[20px] font-bold" style={{color:selected.due>0?'#F0584C':'#34C78A'}}>{selected.due>0?fmt(selected.due):'Paid ✓'}</span>
                </div>
              </div>
              {selected.paymentNotes && (
                <div className="bg-[#EAFAF3] border border-[#A7F3D0] rounded-[10px] p-3.5">
                  <p className="text-[10px] font-bold text-[#065F46] uppercase mb-1">Payment Record</p>
                  <p className="text-[13px] text-[#065F46]">{selected.paymentNotes}</p>
                </div>
              )}
              {selected.due > 0 && (
                <div className="border border-[#EAECF2] rounded-[12px] overflow-hidden">
                  <button onClick={() => setPayOpen(!payOpen)} className="w-full flex justify-between items-center px-4 py-3 hover:bg-[#F7F8FC]">
                    <span className="text-[13px] font-bold text-[#1A1D2E]">Record Payment</span>
                    <span className="text-[#A0A8B8]">{payOpen?'▲':'▼'}</span>
                  </button>
                  {payOpen && (
                    <div className="p-4 border-t border-[#EAECF2] bg-[#F9FAFB] space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input className="w-full h-9 bg-white border border-[#EAECF2] rounded-[9px] px-3 text-[13px] outline-none" placeholder="Amount" type="number"/>
                        <select className="w-full h-9 bg-white border border-[#EAECF2] rounded-[9px] px-2 text-[13px] outline-none">
                          {['Check','Bank Transfer','Cash','Zelle','Venmo'].map(m=><option key={m}>{m}</option>)}
                        </select>
                      </div>
                      <input className="w-full h-9 bg-white border border-[#EAECF2] rounded-[9px] px-3 text-[13px] outline-none" placeholder="Notes (check #, reference...)"/>
<button onClick={() => setSelected(null)} className="w-full h-9 rounded-[9px] bg-[#34C78A] text-white text-[13px] font-bold">Mark as Paid ✓</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2 p-4 border-t border-[#EAECF2] bg-[#F9FAFB]">
              <button onClick={() => setSelected(null)} className="flex-1 h-9 rounded-[9px] border border-[#EAECF2] bg-white text-[13px] font-semibold text-[#6B7280]">Close</button>
              <button className="h-9 px-4 rounded-[9px] border border-[#EAECF2] bg-white text-[13px] font-semibold text-[#6B7280]">PDF</button>
              {selected.status !== 'paid' && <button className="h-9 px-4 rounded-[9px] bg-[#4F7EF7] text-white text-[13px] font-semibold">Send Reminder</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}