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
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API}/quotes`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setQuotes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = quotes.filter(q =>
    !search || q.title?.toLowerCase().includes(search.toLowerCase()) ||
    q.estimateNumber?.includes(search) || q.serviceType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0D14]">
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
              return (
                <div key={q.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#161924] cursor-pointer border-b border-[#1E2130] last:border-0 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[14px] font-bold text-white">{q.title || q.serviceType}</span>
                      <span className="font-mono text-[11px] text-[#3D4466]">{q.estimateNumber}</span>
                    </div>
                    <p className="text-[12px] text-[#8892B0]">{q.serviceType} · {fmtD(q.createdAt)}</p>
                  </div>
                  <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[14px] font-bold text-white">{fmt(q.total)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}