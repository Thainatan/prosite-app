'use client';
import { useState } from 'react';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const CLIENTS = [
  { id: '1', name: 'Linda Davis',     phone: '(941) 555-0438', addr: '321 Cedar Blvd, Sarasota',   props: 2, jobs: 1, rev: 34519, bal: 18000 },
  { id: '2', name: 'Michael Brown',   phone: '(941) 555-0519', addr: '654 Elm Street, North Port', props: 1, jobs: 1, rev: 39450, bal: 10400 },
  { id: '3', name: 'Patricia Wilson', phone: '(941) 555-0247', addr: '567 Maple Ave, Bradenton',   props: 1, jobs: 0, rev: 0,     bal: 5400  },
  { id: '4', name: 'Robert Johnson',  phone: '(941) 555-0391', addr: '890 Pine Road, Venice',      props: 1, jobs: 0, rev: 0,     bal: 0     },
];

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const filtered = CLIENTS.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );
  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <header className="bg-white border-b border-[#EAECF2] h-14 flex items-center justify-between px-6 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-bold text-[#1A1D2E]">Clients</h1>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#EEF3FF] text-[#4F7EF7] rounded-full">{CLIENTS.length} total</span>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." className="flex-1 max-w-sm h-[34px] bg-[#F7F8FC] border border-[#EAECF2] rounded-full px-4 text-[13px] outline-none focus:border-[#4F7EF7] transition-all"/>
        <button className="h-[34px] px-4 bg-[#4F7EF7] text-white text-[13px] font-semibold rounded-[9px]">+ New Client</button>
      </header>
      <div className="bg-white border-b border-[#EAECF2] px-6 py-2.5 flex gap-6">
        <span className="text-[12px] text-[#A0A8B8]">Collected: <b className="text-[#34C78A]">{fmt(CLIENTS.reduce((a, c) => a + c.rev, 0))}</b></span>
        <span className="text-[12px] text-[#A0A8B8]">Outstanding: <b className="text-[#F0584C]">{fmt(CLIENTS.reduce((a, c) => a + c.bal, 0))}</b></span>
      </div>
      <div className="p-5">
        <div className="bg-white rounded-[14px] border border-[#EAECF2] overflow-hidden">
          {filtered.map(c => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F7F8FC] cursor-pointer border-b border-[#EAECF2] last:border-0 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#EEF3FF] flex items-center justify-center flex-shrink-0">
                <span className="text-[13px] font-bold text-[#4F7EF7]">{c.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-[#1A1D2E]">{c.name}</p>
                <p className="text-[12px] text-[#6B7280]">{c.phone} · {c.addr}</p>
              </div>
              <div className="text-center">
                <p className="text-[13px] font-bold text-[#1A1D2E]">{c.props}</p>
                <p className="text-[10px] text-[#A0A8B8]">properties</p>
              </div>
              <div className="text-center">
                <p className="text-[13px] font-bold text-[#1A1D2E]">{c.jobs}</p>
                <p className="text-[10px] text-[#A0A8B8]">jobs</p>
              </div>
              <div className="text-right">
                <p className="text-[13.5px] font-bold text-[#1A1D2E]">{fmt(c.rev)}</p>
                {c.bal > 0 ? <p className="text-[11px] text-[#F0584C] font-medium">{fmt(c.bal)} due</p> : <p className="text-[11px] text-[#A0A8B8]">No balance</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}