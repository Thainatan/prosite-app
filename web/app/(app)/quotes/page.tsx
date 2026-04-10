'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtD = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const STATUS: Record<string, { label: string; bg: string; color: string }> = {
  DRAFT:    { label: 'Draft',    bg: '#1E2130', color: '#8892B0' },
  SENT:     { label: 'Sent',     bg: '#0C2A4A', color: '#4F7EF7' },
  APPROVED: { label: 'Approved', bg: '#0C2A1E', color: '#34C78A' },
  REJECTED: { label: 'Rejected', bg: '#2A0C0C', color: '#F0584C' },
};

interface Quote {
  id: string; estimateNumber: string; title: string;
  serviceType: string; status: string; total: number;
  createdAt: string; clientId: string;
  client: { firstName: string; lastName: string } | null;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approving, setApproving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetch(`${API}/quotes`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setQuotes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const approveQuote = async (q: Quote, e: React.MouseEvent) => {
    e.stopPropagation();
    if (q.status === 'APPROVED') return;
    setApproving(q.id);
    try {
      const res = await fetch(`${API}/quotes/${q.id}/approve`, { method: 'PATCH' });
      const data = await res.json();
      if (data.error) {
        showToast('error', data.error);
      } else {
        setQuotes(prev => prev.map(x => x.id === q.id ? { ...x, status: 'APPROVED' } : x));
        showToast('success', `Quote approved! Project "${data.project.name}" and deposit invoice created.`);
      }
    } catch {
      showToast('error', 'Failed to approve quote. Please try again.');
    } finally {
      setApproving(null);
    }
  };

  const filtered = quotes.filter(q =>
    !search || q.title?.toLowerCase().includes(search.toLowerCase()) ||
    q.estimateNumber?.includes(search) || q.serviceType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0D14]">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 max-w-sm px-4 py-3 rounded-[12px] shadow-lg text-[13px] font-semibold"
          style={{ background: toast.type === 'success' ? '#0C2A1E' : '#2A0C0C', color: toast.type === 'success' ? '#34C78A' : '#F0584C', border: `1px solid ${toast.type === 'success' ? '#34C78A44' : '#F0584C44'}` }}
        >
          {toast.type === 'success' ? '✓ ' : '✗ '}{toast.msg}
        </div>
      )}

      <header className="bg-[#0F1117] border-b border-[#1E2130] h-14 flex items-center justify-between px-6 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-bold text-white">Quotes</h1>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#1E2A4A] text-[#4F7EF7] rounded-full">{quotes.length} total</span>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quotes..." className="flex-1 max-w-sm h-[34px] bg-[#161924] border border-[#1E2130] rounded-full px-4 text-[13px] text-white placeholder-[#3D4466] outline-none focus:border-[#4F7EF7] transition-all"/>
        <a href="/quotes/new" style={{display:'flex',alignItems:'center',gap:6,height:34,padding:'0 16px',background:'#4F7EF7',color:'white',fontSize:13,fontWeight:700,borderRadius:9,textDecoration:'none'}}>+ New Quote</a>
      </header>

      <div className="p-5">
        {loading ? (
          <div className="text-center py-12"><p className="text-[#8892B0]">Loading quotes...</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[14px] font-semibold text-white mb-2">{search ? 'No quotes found' : 'No quotes yet'}</p>
            <p className="text-[12px] text-[#8892B0] mb-4">Click New Quote to create your first quote</p>
            <a href="/quotes/new" style={{display:'inline-flex',alignItems:'center',padding:'10px 24px',background:'#4F7EF7',color:'white',borderRadius:9,fontSize:14,fontWeight:600,textDecoration:'none'}}>+ New Quote</a>
          </div>
        ) : (
          <div className="bg-[#0F1117] rounded-[14px] border border-[#1E2130] overflow-hidden">
            {filtered.map(q => {
              const st = STATUS[q.status] || STATUS.DRAFT;
              const clientName = q.client ? `${q.client.firstName} ${q.client.lastName}` : '';
              const isApproving = approving === q.id;
              const canApprove = q.status !== 'APPROVED' && q.status !== 'REJECTED';
              return (
                <div key={q.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#161924] border-b border-[#1E2130] last:border-0 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[14px] font-bold text-white">{q.title || q.serviceType}</span>
                      <span className="font-mono text-[11px] text-[#3D4466]">{q.estimateNumber}</span>
                    </div>
                    <p className="text-[12px] text-[#8892B0]">
                      {clientName && <span>{clientName} · </span>}
                      {q.serviceType} · {fmtD(q.createdAt)}
                    </p>
                  </div>
                  <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[14px] font-bold text-white">{fmt(q.total)}</p>
                  </div>
                  {canApprove && (
                    <button
                      onClick={e => approveQuote(q, e)}
                      disabled={isApproving}
                      className="flex-shrink-0 h-8 px-3 rounded-[8px] text-[11.5px] font-bold transition-all disabled:opacity-50"
                      style={{ background: isApproving ? '#1E2A1E' : '#0C3020', color: '#34C78A', border: '1px solid #34C78A44' }}
                    >
                      {isApproving ? '...' : '✓ Approve'}
                    </button>
                  )}
                  {q.status === 'APPROVED' && (
                    <a href="/projects" className="flex-shrink-0 h-8 px-3 rounded-[8px] text-[11.5px] font-bold no-underline" style={{ background: '#0C1A3A', color: '#4F7EF7', border: '1px solid #4F7EF744', display:'flex', alignItems:'center' }}>
                      View Project
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
