'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const getH = () => ({ Authorization: 'Bearer ' + (typeof window !== 'undefined' ? localStorage.getItem('prosite_token') || '' : '') });
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function StatCard({ label, value, sub, color, bg }: { label: string; value: string; sub?: string; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-[14px] border border-[#EAECF2] p-5">
      <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: color + '99' }}>{label}</p>
      <p className="text-[28px] font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-[12px] text-[#A0A8B8] mt-1">{sub}</p>}
    </div>
  );
}

function PieChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <div className="text-center text-[#A0A8B8] text-[13px] py-4">No data</div>;

  let offset = 0;
  const radius = 60;
  const cx = 80;
  const cy = 80;
  const paths: { path: string; color: string; label: string; value: number }[] = [];

  for (const s of slices) {
    if (s.value === 0) continue;
    const pct = s.value / total;
    const angle = pct * 2 * Math.PI;
    const x1 = cx + radius * Math.sin(offset);
    const y1 = cy - radius * Math.cos(offset);
    offset += angle;
    const x2 = cx + radius * Math.sin(offset);
    const y2 = cy - radius * Math.cos(offset);
    const large = angle > Math.PI ? 1 : 0;
    paths.push({
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`,
      color: s.color, label: s.label, value: s.value,
    });
  }

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {paths.map((p, i) => <path key={i} d={p.path} fill={p.color} stroke="white" strokeWidth="2"/>)}
      </svg>
      <div className="space-y-2 flex-1">
        {slices.filter(s => s.value > 0).map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }}/>
              <span className="text-[12px] text-[#6B7280]">{s.label}</span>
            </div>
            <span className="text-[12px] font-bold text-[#1A1A2E]">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart  = new Date(now.getFullYear(), 0, 1);

    Promise.all([
      fetch(`${API}/invoices`, { headers: getH() }).then(r => r.json()).catch(() => []),
      fetch(`${API}/quotes`, { headers: getH() }).then(r => r.json()).catch(() => []),
      fetch(`${API}/projects`, { headers: getH() }).then(r => r.json()).catch(() => []),
      fetch(`${API}/clients`, { headers: getH() }).then(r => r.json()).catch(() => []),
    ]).then(([invoices, quotes, projects, clients]) => {
      const invArr  = Array.isArray(invoices) ? invoices  : [];
      const qArr    = Array.isArray(quotes)   ? quotes    : [];
      const projArr = Array.isArray(projects) ? projects  : [];
      const clArr   = Array.isArray(clients)  ? clients   : [];

      const paidInvoices = invArr.filter((i: any) => i.status === 'PAID');
      const revenueMonth = paidInvoices
        .filter((i: any) => new Date(i.createdAt) >= monthStart)
        .reduce((s: number, i: any) => s + Number(i.total), 0);
      const revenueYear = paidInvoices
        .filter((i: any) => new Date(i.createdAt) >= yearStart)
        .reduce((s: number, i: any) => s + Number(i.total), 0);

      const outstanding = invArr
        .filter((i: any) => i.status !== 'PAID' && i.status !== 'ARCHIVED')
        .reduce((s: number, i: any) => s + Number(i.amountDue), 0);

      // Top 5 clients by revenue
      const clientRevMap: Record<string, { name: string; total: number }> = {};
      for (const inv of paidInvoices) {
        const cid = inv.clientId || 'unknown';
        if (!clientRevMap[cid]) {
          const cl = clArr.find((c: any) => c.id === cid);
          clientRevMap[cid] = { name: cl ? `${cl.firstName} ${cl.lastName}` : 'Unknown', total: 0 };
        }
        clientRevMap[cid].total += Number(inv.total);
      }
      const topClients = Object.values(clientRevMap)
        .sort((a, b) => b.total - a.total).slice(0, 5);

      // Quotes win rate
      const totalQuotes = qArr.length;
      const approvedQuotes = qArr.filter((q: any) => ['APPROVED','CONVERTED'].includes(q.status)).length;
      const winRate = totalQuotes > 0 ? Math.round((approvedQuotes / totalQuotes) * 100) : 0;

      // Projects by status
      const statusCounts: Record<string, number> = {};
      for (const p of projArr) {
        statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
      }
      const projectSlices = [
        { label: 'In Progress', value: statusCounts['IN_PROGRESS'] || 0, color: '#34C78A' },
        { label: 'Scheduled',   value: (statusCounts['APPROVED'] || 0) + (statusCounts['SCHEDULED'] || 0), color: '#6B7280' },
        { label: 'Punch List',  value: statusCounts['PUNCH_LIST'] || 0, color: '#0EA5E9' },
        { label: 'Waiting Mat.', value: statusCounts['WAITING_MATERIALS'] || 0, color: '#F5A623' },
        { label: 'On Hold',     value: statusCounts['ON_HOLD'] || 0, color: '#F0584C' },
        { label: 'Completed',   value: statusCounts['COMPLETED'] || 0, color: '#E8834A' },
      ];

      setData({ revenueMonth, revenueYear, outstanding, topClients, winRate, approvedQuotes, totalQuotes, projectSlices });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <header className="bg-white border-b border-[#EAECF2] h-14 flex items-center px-6">
        <h1 className="text-[17px] font-bold text-[#1A1A2E]">Reports</h1>
      </header>

      <div className="p-5 space-y-5">
        {/* Revenue stats */}
        <div>
          <h2 className="text-[13px] font-bold text-[#A0A8B8] uppercase tracking-wide mb-3">Revenue</h2>
          {loading ? (
            <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-[14px] border border-[#EAECF2] h-24 animate-pulse"/>)}</div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="This Month" value={fmt(data?.revenueMonth ?? 0)} color="#34C78A" bg="#EAFAF3"/>
              <StatCard label="This Year" value={fmt(data?.revenueYear ?? 0)} color="#4F7EF7" bg="#EEF3FF"/>
              <StatCard label="Outstanding Balance" value={fmt(data?.outstanding ?? 0)} sub="Unpaid invoices" color="#F0584C" bg="#FFF0EF"/>
            </div>
          )}
        </div>

        {/* Quotes win rate */}
        {!loading && data && (
          <div>
            <h2 className="text-[13px] font-bold text-[#A0A8B8] uppercase tracking-wide mb-3">Quotes Performance</h2>
            <div className="bg-white rounded-[14px] border border-[#EAECF2] p-5">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[11px] font-bold text-[#A0A8B8] uppercase mb-1">Win Rate</p>
                  <p className="text-[36px] font-bold text-[#E8834A]">{data.winRate}%</p>
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-[#F3F4F6] rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-[#E8834A] rounded-full transition-all" style={{ width: `${data.winRate}%` }}/>
                  </div>
                  <p className="text-[12px] text-[#6B7280]">{data.approvedQuotes} approved out of {data.totalQuotes} total quotes</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Two columns */}
        {!loading && data && (
          <div className="grid grid-cols-2 gap-5">
            {/* Top Clients */}
            <div>
              <h2 className="text-[13px] font-bold text-[#A0A8B8] uppercase tracking-wide mb-3">Top 5 Clients by Revenue</h2>
              <div className="bg-white rounded-[14px] border border-[#EAECF2] overflow-hidden">
                {data.topClients.length === 0 ? (
                  <div className="p-5 text-center text-[#A0A8B8] text-[13px]">No paid invoices yet</div>
                ) : data.topClients.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-[#EAECF2] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#EEF3FF] flex items-center justify-center text-[11px] font-bold text-[#E8834A]">{i + 1}</div>
                      <span className="text-[13px] font-semibold text-[#1A1A2E]">{c.name}</span>
                    </div>
                    <span className="text-[13px] font-bold text-[#34C78A]">{fmt(c.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects by status */}
            <div>
              <h2 className="text-[13px] font-bold text-[#A0A8B8] uppercase tracking-wide mb-3">Projects by Status</h2>
              <div className="bg-white rounded-[14px] border border-[#EAECF2] p-5">
                <PieChart slices={data.projectSlices}/>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
