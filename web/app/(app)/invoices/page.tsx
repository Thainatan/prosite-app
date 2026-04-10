'use client';
import { useState, useEffect } from 'react';
import ClientAutocomplete, { Client } from '../components/ClientAutocomplete';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtD = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

type IStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';
const IS: Record<IStatus, { label: string; bg: string; color: string }> = {
  draft:   { label: 'Draft',   bg: '#F3F4F6', color: '#6B7280' },
  sent:    { label: 'Sent',    bg: '#E0F2FE', color: '#0EA5E9' },
  partial: { label: 'Partial', bg: '#FFF7E9', color: '#F5A623' },
  paid:    { label: 'Paid',    bg: '#EAFAF3', color: '#34C78A' },
  overdue: { label: 'Overdue', bg: '#FFF0EF', color: '#F0584C' },
};
const TYPE_ICON: Record<string, string> = { deposit: '🏁', progress: '🔨', final: '✅' };

function mapStatus(s: string): IStatus {
  return ({ DRAFT:'draft', SENT:'sent', PARTIAL:'partial', PAID:'paid', OVERDUE:'overdue' } as Record<string,IStatus>)[s] || 'draft';
}

interface DbInvoice {
  id: string; invoiceNumber: string; type: string; status: string;
  total: number; amountPaid: number; amountDue: number;
  dueDate: string | null; createdAt: string;
  lineItems: Array<{ description: string; amount: number }>;
  project: { name: string; jobNumber: string } | null;
  client: { firstName: string; lastName: string } | null;
}

interface Invoice {
  id: string; number: string; type: string; status: IStatus;
  total: number; paid: number; due: number;
  date: string; dueDate: string;
  project: string; jobNumber: string; client: string;
  items: Array<{ description: string; amount: number }>;
}

interface LineItem { id: string; description: string; amount: number; }

const EMPTY_LINE: () => LineItem = () => ({ id: Date.now().toString(), description: '', amount: 0 });

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<IStatus | 'all'>('all');
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [paying, setPaying] = useState(false);

  // New Invoice form state
  const [showNew, setShowNew] = useState(false);
  const [newClientId, setNewClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newType, setNewType] = useState('deposit');
  const [newLines, setNewLines] = useState<LineItem[]>([EMPTY_LINE()]);
  const [newSaving, setNewSaving] = useState(false);
  const [newErrors, setNewErrors] = useState<Record<string,string>>({});

  useEffect(() => { loadInvoices(); }, []);

  const loadInvoices = () => {
    fetch(`${API}/invoices`)
      .then(r => r.json())
      .then((data: DbInvoice[]) => {
        if (Array.isArray(data)) {
          setInvoices(data.map(inv => ({
            id: inv.id, number: inv.invoiceNumber, type: inv.type,
            status: mapStatus(inv.status),
            total: inv.total, paid: inv.amountPaid, due: inv.amountDue,
            date: inv.createdAt, dueDate: inv.dueDate || inv.createdAt,
            project: inv.project?.name || (inv.project === null ? 'Direct Invoice' : 'Unknown'),
            jobNumber: inv.project?.jobNumber || '',
            client: inv.client ? `${inv.client.firstName} ${inv.client.lastName}` : 'Unknown Client',
            items: Array.isArray(inv.lineItems) ? inv.lineItems : [],
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handlePay = async () => {
    if (!selected || !payAmount) return;
    setPaying(true);
    try {
      const res = await fetch(`${API}/invoices/${selected.id}/pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(payAmount), notes: payNotes }),
      });
      const data = await res.json();
      if (!data.error) { await loadInvoices(); setSelected(null); setPayOpen(false); setPayAmount(''); setPayNotes(''); }
    } finally { setPaying(false); }
  };

  const newTotal = newLines.reduce((a, l) => a + Number(l.amount || 0), 0);

  const validateNew = () => {
    const errs: Record<string,string> = {};
    if (!newClientId) errs.client = 'Select a client';
    if (newLines.every(l => !l.description)) errs.lines = 'Add at least one line item';
    setNewErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateInvoice = async () => {
    if (!validateNew()) return;
    setNewSaving(true);
    try {
      const res = await fetch(`${API}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: newClientId,
          projectId: 'DIRECT',
          type: newType,
          lineItems: newLines.filter(l => l.description).map(l => ({ description: l.description, amount: Number(l.amount) })),
          subtotal: newTotal,
          total: newTotal,
          createdById: 'system',
        }),
      });
      const data = await res.json();
      if (data.error) { alert('Error: ' + data.error); return; }
      await loadInvoices();
      setShowNew(false);
      setNewClientId(''); setNewClientName(''); setNewType('deposit');
      setNewLines([EMPTY_LINE()]); setNewErrors({});
    } finally { setNewSaving(false); }
  };

  const filtered = invoices.filter(i => filter === 'all' || i.status === filter);
  const outstanding = invoices.filter(i => i.status !== 'paid').reduce((a, i) => a + i.due, 0);
  const collected = invoices.filter(i => i.status === 'paid').reduce((a, i) => a + i.total, 0);
  const overdue = invoices.filter(i => i.status === 'overdue').length;

  const inp = (err?: string) => 'w-full h-9 bg-[#F7F8FC] border rounded-[9px] px-3 text-[13px] text-[#1A1D2E] outline-none ' + (err ? 'border-[#F0584C]' : 'border-[#EAECF2]');

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <header className="bg-white border-b border-[#EAECF2] h-14 flex items-center justify-between px-6 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-bold text-[#1A1D2E]">Invoices</h1>
          {overdue > 0 && <span className="text-[11px] font-bold px-2.5 py-1 bg-[#FFF0EF] text-[#F0584C] rounded-full">{overdue} overdue</span>}
        </div>
        <div className="flex items-center bg-[#F3F4F6] rounded-[9px] p-1 gap-1">
          {(['all','sent','partial','paid','overdue'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`h-7 px-3 rounded-[7px] text-[11.5px] font-semibold capitalize transition-all ${filter === s ? 'bg-white text-[#1A1D2E] shadow-sm' : 'text-[#9CA3AF]'}`}>
              {s === 'all' ? 'All' : IS[s].label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowNew(true)} className="h-[34px] px-4 bg-[#4F7EF7] text-white text-[13px] font-semibold rounded-[9px]">+ New Invoice</button>
      </header>

      <div className="bg-white border-b border-[#EAECF2] px-6 py-3 flex gap-4">
        {[
          { label:'Outstanding', value:fmt(outstanding), color:'#F0584C', bg:'#FFF0EF' },
          { label:'Collected',   value:fmt(collected),   color:'#34C78A', bg:'#EAFAF3' },
          { label:'Total Issued',value:fmt(invoices.reduce((a,i)=>a+i.total,0)), color:'#1A1D2E', bg:'#F7F8FC' },
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
        {loading ? (
          <div className="text-center py-12"><p className="text-[#6B7280]">Loading invoices...</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[14px] font-semibold text-[#1A1D2E] mb-2">{filter !== 'all' ? `No ${IS[filter as IStatus]?.label} invoices` : 'No invoices yet'}</p>
            <p className="text-[12px] text-[#6B7280] mb-4">Approve a quote or create a direct invoice</p>
            <button onClick={() => setShowNew(true)} className="inline-flex items-center px-6 py-2.5 bg-[#4F7EF7] text-white rounded-[9px] text-[14px] font-semibold">+ New Invoice</button>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] border border-[#EAECF2] overflow-hidden">
            {filtered.map(inv => {
              const st = IS[inv.status];
              const pct = inv.total > 0 ? Math.round((inv.paid/inv.total)*100) : 0;
              return (
                <div key={inv.id} onClick={() => { setSelected(inv); setPayOpen(false); }} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F7F8FC] cursor-pointer border-b border-[#EAECF2] last:border-0 transition-colors">
                  <div className="w-9 h-9 rounded-[10px] bg-[#F7F8FC] border border-[#EAECF2] flex items-center justify-center text-base flex-shrink-0">{TYPE_ICON[inv.type] || '📄'}</div>
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
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-[16px] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.18)] border border-[#EAECF2]" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-[#EAECF2] flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{TYPE_ICON[selected.type] || '📄'}</span>
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
                {selected.items.map((item, i) => (
                  <div key={i} className="flex justify-between px-4 py-3 border-b border-[#EAECF2] last:border-0">
                    <span className="text-[13px] text-[#374151]">{item.description}</span>
                    <span className="text-[13px] font-bold text-[#1A1D2E] ml-4">{fmt(item.amount)}</span>
                  </div>
                ))}
                {selected.items.length === 0 && <div className="px-4 py-3 text-[13px] text-[#A0A8B8]">No line items</div>}
              </div>
              <div className="bg-[#F7F8FC] border border-[#EAECF2] rounded-[12px] p-4 space-y-2">
                <div className="flex justify-between text-[13px]"><span className="text-[#6B7280]">Total</span><span className="font-bold text-[#1A1D2E]">{fmt(selected.total)}</span></div>
                <div className="flex justify-between text-[13px]"><span className="text-[#34C78A]">Paid</span><span className="font-bold text-[#34C78A]">{fmt(selected.paid)}</span></div>
                <div className="flex justify-between border-t-2 border-[#1A1D2E] pt-2.5">
                  <span className="text-[14px] font-bold text-[#1A1D2E]">Balance Due</span>
                  <span className="text-[20px] font-bold" style={{color:selected.due>0?'#F0584C':'#34C78A'}}>{selected.due>0?fmt(selected.due):'Paid ✓'}</span>
                </div>
              </div>
              {selected.due > 0 && (
                <div className="border border-[#EAECF2] rounded-[12px] overflow-hidden">
                  <button onClick={() => setPayOpen(!payOpen)} className="w-full flex justify-between items-center px-4 py-3 hover:bg-[#F7F8FC]">
                    <span className="text-[13px] font-bold text-[#1A1D2E]">Record Payment</span>
                    <span className="text-[#A0A8B8]">{payOpen?'▲':'▼'}</span>
                  </button>
                  {payOpen && (
                    <div className="p-4 border-t border-[#EAECF2] bg-[#F9FAFB] space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input className={inp()} placeholder="Amount" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}/>
                        <select className={inp()} ><option>Check</option><option>Bank Transfer</option><option>Cash</option><option>Zelle</option><option>Venmo</option></select>
                      </div>
                      <input className={inp()} placeholder="Notes (check #, reference...)" value={payNotes} onChange={e => setPayNotes(e.target.value)}/>
                      <button onClick={handlePay} disabled={paying || !payAmount} className="w-full h-9 rounded-[9px] bg-[#34C78A] text-white text-[13px] font-bold disabled:opacity-50">
                        {paying ? 'Saving...' : 'Mark as Paid ✓'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2 p-4 border-t border-[#EAECF2] bg-[#F9FAFB]">
              <button onClick={() => setSelected(null)} className="flex-1 h-9 rounded-[9px] border border-[#EAECF2] bg-white text-[13px] font-semibold text-[#6B7280]">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-[16px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_24px_80px_rgba(0,0,0,0.18)] border border-[#EAECF2]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#EAECF2]">
              <h2 className="text-[17px] font-bold text-[#1A1D2E]">New Invoice</h2>
              <button onClick={() => setShowNew(false)} className="w-8 h-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">✕</button>
            </div>
            <div className="p-5 space-y-4">

              {/* Client */}
              <div>
                <label className="block text-[11.5px] font-semibold text-[#6B7280] mb-1.5">Client *</label>
                <ClientAutocomplete
                  value={newClientId}
                  onSelect={(id, c) => { setNewClientId(id); setNewClientName(c ? `${c.firstName} ${c.lastName}` : ''); setNewErrors(p => ({...p, client:''})); }}
                  placeholder="Search or add client..."
                  theme="light"
                />
                {newErrors.client && <p className="text-[11px] text-[#F0584C] mt-1">{newErrors.client}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-[11.5px] font-semibold text-[#6B7280] mb-1.5">Invoice Type</label>
                <div className="flex gap-2">
                  {['deposit','progress','final'].map(t => (
                    <button key={t} onClick={() => setNewType(t)} className="flex-1 h-9 rounded-[9px] border text-[12.5px] font-semibold capitalize transition-all" style={{ background: newType === t ? '#EEF3FF' : 'white', color: newType === t ? '#4F7EF7' : '#6B7280', borderColor: newType === t ? '#4F7EF7' : '#EAECF2' }}>
                      {TYPE_ICON[t]} {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11.5px] font-semibold text-[#6B7280]">Line Items *</label>
                  <button onClick={() => setNewLines(p => [...p, EMPTY_LINE()])} className="text-[11.5px] font-semibold text-[#4F7EF7]">+ Add line</button>
                </div>
                {newErrors.lines && <p className="text-[11px] text-[#F0584C] mb-2">{newErrors.lines}</p>}
                <div className="space-y-2">
                  {newLines.map((line, i) => (
                    <div key={line.id} className="flex gap-2 items-center">
                      <input
                        className="flex-1 h-9 bg-[#F7F8FC] border border-[#EAECF2] rounded-[9px] px-3 text-[13px] text-[#1A1D2E] outline-none"
                        placeholder="Description..."
                        value={line.description}
                        onChange={e => setNewLines(p => p.map(l => l.id === line.id ? {...l, description: e.target.value} : l))}
                      />
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[#9CA3AF]">$</span>
                        <input
                          type="number" className="w-full h-9 bg-[#F7F8FC] border border-[#EAECF2] rounded-[9px] pl-6 pr-2 text-[13px] text-[#1A1D2E] outline-none text-right"
                          value={line.amount}
                          onChange={e => setNewLines(p => p.map(l => l.id === line.id ? {...l, amount: parseFloat(e.target.value)||0} : l))}
                        />
                      </div>
                      {newLines.length > 1 && (
                        <button onClick={() => setNewLines(p => p.filter(l => l.id !== line.id))} className="text-[#F0584C] text-sm w-7 h-7 flex items-center justify-center rounded hover:bg-[#FFF0EF]">✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-[#EAECF2]">
                  <span className="text-[13px] font-semibold text-[#6B7280]">Total</span>
                  <span className="text-[18px] font-bold text-[#1A1D2E]">{fmt(newTotal)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t border-[#EAECF2] bg-[#F9FAFB]">
              <button onClick={() => setShowNew(false)} className="flex-1 h-10 rounded-[9px] border border-[#EAECF2] bg-white text-[13px] font-semibold text-[#6B7280]">Cancel</button>
              <button onClick={handleCreateInvoice} disabled={newSaving} className="flex-2 h-10 px-6 rounded-[9px] bg-[#4F7EF7] text-white text-[13px] font-bold disabled:opacity-50">
                {newSaving ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
