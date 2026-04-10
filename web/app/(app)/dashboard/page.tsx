'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  IN_PROGRESS:       { label: 'In Progress',     bg: '#EAFAF3', color: '#34C78A' },
  WAITING_MATERIALS: { label: 'Waiting Mat.',    bg: '#FFF7E9', color: '#F5A623' },
  PUNCH_LIST:        { label: 'Punch List',      bg: '#EEF3FF', color: '#4F7EF7' },
  APPROVED:          { label: 'Scheduled',       bg: '#F3F4F6', color: '#6B7280' },
  SCHEDULED:         { label: 'Scheduled',       bg: '#F3F4F6', color: '#6B7280' },
  COMPLETED:         { label: 'Completed',       bg: '#EAFAF3', color: '#059669' },
  ON_HOLD:           { label: 'On Hold',         bg: '#FFF0EF', color: '#F0584C' },
};
const TYPE_COLOR: Record<string, string> = {
  'Site Visit': '#4F7EF7', 'Meeting': '#8B5CF6', 'Follow-up': '#F5A623',
  'Installation': '#34C78A', 'Inspection': '#0EA5E9', 'Other': '#9CA3AF',
};

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-[#EAECF2] animate-pulse rounded ${className}`}/>;
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    Promise.all([
      fetch(`${API}/clients`).then(r => r.json()).catch(() => []),
      fetch(`${API}/quotes`).then(r => r.json()).catch(() => []),
      fetch(`${API}/projects`).then(r => r.json()).catch(() => []),
      fetch(`${API}/invoices`).then(r => r.json()).catch(() => []),
      fetch(`${API}/tasks`).then(r => r.json()).catch(() => []),
    ]).then(([clients, quotes, projects, invoices, tasks]) => {
      const clientsArr = Array.isArray(clients) ? clients : [];
      const quotesArr  = Array.isArray(quotes)  ? quotes  : [];
      const projectsArr= Array.isArray(projects) ? projects: [];
      const invoicesArr= Array.isArray(invoices) ? invoices: [];
      const tasksArr   = Array.isArray(tasks)    ? tasks   : [];

      const newLeads = clientsArr.filter((c: any) => new Date(c.createdAt) >= monthStart).length;
      const openQuotes = quotesArr.filter((q: any) => ['DRAFT','SENT'].includes(q.status)).length;
      const activeProjects = projectsArr.filter((p: any) => p.status === 'IN_PROGRESS').length;
      const unpaidBalance = invoicesArr
        .filter((i: any) => i.status !== 'PAID' && i.status !== 'ARCHIVED')
        .reduce((sum: number, i: any) => sum + (Number(i.amountDue) || 0), 0);

      const todayTasks = tasksArr
        .filter((t: any) => sameDay(new Date(t.startDateTime), today))
        .sort((a: any, b: any) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

      const activeList = projectsArr
        .filter((p: any) => !['COMPLETED','ARCHIVED'].includes(p.status))
        .slice(0, 4);

      // Recent activity: combine clients, quotes, invoices sorted by createdAt
      const activity = [
        ...clientsArr.map((c: any) => ({ text: `New client — ${c.firstName} ${c.lastName}`, time: c.createdAt, color: '#4F7EF7' })),
        ...quotesArr.map((q: any) => ({ text: `Quote ${q.estimateNumber || ''} — ${q.title || 'New quote'}`, time: q.createdAt, color: '#F5A623' })),
        ...invoicesArr.map((i: any) => ({ text: `Invoice ${i.invoiceNumber} — ${i.status}`, time: i.createdAt, color: i.status === 'PAID' ? '#34C78A' : '#9CA3AF' })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setData({ newLeads, openQuotes, activeProjects, unpaidBalance, todayTasks, activeList, activity });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const stats = data ? [
    { label: 'New Leads',       value: String(data.newLeads),        color: '#4F7EF7', bg: '#EEF3FF' },
    { label: 'Open Quotes',     value: String(data.openQuotes),      color: '#F5A623', bg: '#FFF7E9' },
    { label: 'Active Projects', value: String(data.activeProjects),  color: '#34C78A', bg: '#EAFAF3' },
    { label: 'Unpaid Balance',  value: fmt(data.unpaidBalance),      color: '#F0584C', bg: '#FFF0EF' },
  ] : [];

  return (
    <div className="min-h-screen bg-[#F7F8FC]" style={{ fontFamily: 'Nunito Sans, sans-serif', padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, background: '#4F7EF7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
              <div style={{ width: 4, height: 8, background: 'white', borderRadius: 2 }} />
              <div style={{ width: 4, height: 12, background: 'white', borderRadius: 2 }} />
              <div style={{ width: 4, height: 16, background: 'white', borderRadius: 2 }} />
            </div>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#1A1D2E' }}>ProSite</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A1D2E', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: '#6B7280', fontSize: 14 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {loading ? (
          [1,2,3,4].map(i => <div key={i} style={{ background: '#F3F4F6', borderRadius: 14, padding: '16px 18px', height: 80 }} className="animate-pulse"/>)
        ) : stats.map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: bg, borderRadius: 14, padding: '16px 18px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Today's Schedule */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #EAECF2', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #EAECF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D2E' }}>Today&apos;s Schedule</h3>
            <a href="/schedule" style={{ fontSize: 12, color: '#4F7EF7', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
          </div>
          {loading ? (
            <div style={{ padding: 16 }}>{[1,2,3].map(i => <div key={i} className="animate-pulse bg-[#F3F4F6] h-12 rounded mb-2"/>)}</div>
          ) : data?.todayTasks.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <p style={{ color: '#A0A8B8', fontSize: 13 }}>No tasks scheduled today</p>
              <a href="/tasks" style={{ color: '#4F7EF7', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>+ Add Task</a>
            </div>
          ) : data?.todayTasks.map((t: any) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#A0A8B8', width: 64, flexShrink: 0 }}>{fmtTime(t.startDateTime)}</span>
              <div style={{ width: 3, alignSelf: 'stretch', background: TYPE_COLOR[t.type] || '#9CA3AF', borderRadius: 2, minHeight: 32, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1D2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                <p style={{ fontSize: 11, color: '#A0A8B8' }}>{t.type}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Active Projects */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #EAECF2', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #EAECF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D2E' }}>Active Projects</h3>
            <a href="/projects" style={{ fontSize: 12, color: '#4F7EF7', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
          </div>
          {loading ? (
            <div style={{ padding: 16 }}>{[1,2,3].map(i => <div key={i} className="animate-pulse bg-[#F3F4F6] h-14 rounded mb-2"/>)}</div>
          ) : data?.activeList.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <p style={{ color: '#A0A8B8', fontSize: 13 }}>No active projects</p>
              <a href="/quotes" style={{ color: '#4F7EF7', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Create from a quote →</a>
            </div>
          ) : data?.activeList.map((p: any) => {
            const st = STATUS_MAP[p.status] || STATUS_MAP.APPROVED;
            return (
              <div key={p.id} style={{ padding: '10px 16px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1D2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: '#A0A8B8' }}>{p.jobNumber}</p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: st.bg, color: st.color, flexShrink: 0, marginLeft: 8 }}>{st.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #EAECF2', padding: '14px 16px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D2E', marginBottom: 12 }}>Recent Activity</h3>
        {loading ? (
          [1,2,3,4,5].map(i => <div key={i} className="animate-pulse bg-[#F3F4F6] h-8 rounded mb-2"/>)
        ) : data?.activity.length === 0 ? (
          <p style={{ color: '#A0A8B8', fontSize: 13 }}>No recent activity</p>
        ) : data?.activity.map((a: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{a.text}</span>
            <span style={{ fontSize: 11, color: '#A0A8B8' }}>{timeAgo(a.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
