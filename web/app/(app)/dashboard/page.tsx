'use client';
import { useState, useEffect } from 'react';
import { Users, ClipboardList, HardHat, DollarSign, Home, Clock, MapPin } from 'lucide-react';
import { apiFetch } from '../../../lib/api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  IN_PROGRESS:       { label: 'In Progress',  bg: '#EAFAF3', color: '#2ECC71' },
  WAITING_MATERIALS: { label: 'Waiting Mat.', bg: '#FFF7E9', color: '#F39C12' },
  PUNCH_LIST:        { label: 'Punch List',   bg: '#EEF3FF', color: '#4F7EF7' },
  APPROVED:          { label: 'Scheduled',    bg: '#F3F4F6', color: '#6B7280' },
  SCHEDULED:         { label: 'Scheduled',    bg: '#F3F4F6', color: '#6B7280' },
  COMPLETED:         { label: 'Completed',    bg: '#EAFAF3', color: '#059669' },
  ON_HOLD:           { label: 'On Hold',      bg: '#FFF0EF', color: '#E74C3C' },
};
const TYPE_COLOR: Record<string, string> = {
  'Site Visit': '#E8834A', 'Meeting': '#8B5CF6', 'Follow-up': '#F39C12',
  'Installation': '#2ECC71', 'Inspection': '#0EA5E9', 'Other': '#9CA3AF',
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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('prosite_user');
      if (raw) { const u = JSON.parse(raw); setUserName(u.firstName || ''); }
    } catch {}
  }, []);

  useEffect(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    Promise.all([
      apiFetch('/clients').then(r => r.json()).catch(() => []),
      apiFetch('/quotes').then(r => r.json()).catch(() => []),
      apiFetch('/projects').then(r => r.json()).catch(() => []),
      apiFetch('/invoices').then(r => r.json()).catch(() => []),
      apiFetch('/tasks').then(r => r.json()).catch(() => []),
    ]).then(([clients, quotes, projects, invoices, tasks]) => {
      const clientsArr  = Array.isArray(clients)  ? clients  : [];
      const quotesArr   = Array.isArray(quotes)   ? quotes   : [];
      const projectsArr = Array.isArray(projects) ? projects : [];
      const invoicesArr = Array.isArray(invoices) ? invoices : [];
      const tasksArr    = Array.isArray(tasks)    ? tasks    : [];

      const newLeads       = clientsArr.filter((c: any) => new Date(c.createdAt) >= monthStart).length;
      const openQuotes     = quotesArr.filter((q: any) => ['DRAFT','SENT'].includes(q.status)).length;
      const activeProjects = projectsArr.filter((p: any) => p.status === 'IN_PROGRESS').length;
      const unpaidBalance  = invoicesArr.filter((i: any) => i.status !== 'PAID' && i.status !== 'ARCHIVED').reduce((s: number, i: any) => s + (Number(i.amountDue) || 0), 0);

      const todayTasks = tasksArr
        .filter((t: any) => sameDay(new Date(t.startDateTime), today))
        .sort((a: any, b: any) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

      const activeList = projectsArr.filter((p: any) => !['COMPLETED','ARCHIVED'].includes(p.status)).slice(0, 4);

      const activity = [
        ...clientsArr.map((c: any) => ({ text: `New client — ${c.firstName} ${c.lastName}`, time: c.createdAt, color: '#4F7EF7' })),
        ...quotesArr.map((q: any) => ({ text: `Quote ${q.estimateNumber || ''} — ${q.title || 'New quote'}`, time: q.createdAt, color: '#E8834A' })),
        ...invoicesArr.map((i: any) => ({ text: `Invoice ${i.invoiceNumber} — ${i.status}`, time: i.createdAt, color: i.status === 'PAID' ? '#2ECC71' : '#9CA3AF' })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setData({ newLeads, openQuotes, activeProjects, unpaidBalance, todayTasks, activeList, activity });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const stats = data ? [
    { label: 'New Leads',       value: String(data.newLeads),       Icon: Users,         color: '#4F7EF7', bg: '#EEF3FF' },
    { label: 'Open Quotes',     value: String(data.openQuotes),     Icon: ClipboardList, color: '#E8834A', bg: '#FEF3EC' },
    { label: 'Active Projects', value: String(data.activeProjects), Icon: HardHat,       color: '#2ECC71', bg: '#EAFAF3' },
    { label: 'Unpaid Balance',  value: fmt(data.unpaidBalance),     Icon: DollarSign,    color: '#E74C3C', bg: '#FFF0EF' },
  ] : [];

  return (
    <div className="animate-fadeInUp" style={{ minHeight: '100vh', background: '#F8F6F3', padding: 24 }}>
      {/* Welcome header with subtle pattern */}
      <div style={{
        background: 'linear-gradient(135deg, #1C2B3A 0%, #2D4A6B 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, position: 'relative', overflow: 'hidden',
      }}>
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.05, width: '100%', height: '100%' }}>
          <defs><pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#E8834A" strokeWidth="0.8"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#g)"/>
        </svg>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(232,131,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Home size={24} color="#E8834A" strokeWidth={2}/>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'white' }}>
              {getGreeting()}{userName ? `, ${userName}` : ''}!
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              Here&apos;s what&apos;s happening with your projects today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {loading ? (
          [1,2,3,4].map(i => <div key={i} style={{ background: '#F3F4F6', borderRadius: 14, padding: '20px 18px', height: 90 }} className="animate-pulse"/>)
        ) : stats.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="animate-fadeInUp card-hover" style={{ background: bg, borderRadius: 14, padding: '18px 20px', border: `1px solid ${color}22` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icon size={16} color={color} strokeWidth={2.5}/>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            </div>
            <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Today's Schedule */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8E4DF', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #E8E4DF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1A1A2E' }}>Today&apos;s Schedule</h3>
            <a href="/schedule" style={{ fontSize: 12, color: '#E8834A', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
          </div>
          {loading ? (
            <div style={{ padding: 16 }}>{[1,2,3].map(i => <div key={i} style={{ height: 48, background: '#F8F6F3', borderRadius: 8, marginBottom: 8 }} className="animate-pulse"/>)}</div>
          ) : data?.todayTasks.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <p style={{ color: '#9CA3AF', fontSize: 13, margin: '0 0 8px' }}>No tasks scheduled today</p>
              <a href="/tasks" style={{ color: '#E8834A', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>+ Add Task</a>
            </div>
          ) : data?.todayTasks.map((t: any) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid #F8F6F3' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', width: 64, flexShrink: 0 }}>{fmtTime(t.startDateTime)}</span>
              <div style={{ width: 3, alignSelf: 'stretch', background: TYPE_COLOR[t.type] || '#9CA3AF', borderRadius: 2, minHeight: 32, flexShrink: 0 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1A1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>{t.type}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Active Projects */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8E4DF', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #E8E4DF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1A1A2E' }}>Active Projects</h3>
            <a href="/projects" style={{ fontSize: 12, color: '#E8834A', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
          </div>
          {loading ? (
            <div style={{ padding: 16 }}>{[1,2,3].map(i => <div key={i} style={{ height: 56, background: '#F8F6F3', borderRadius: 8, marginBottom: 8 }} className="animate-pulse"/>)}</div>
          ) : data?.activeList.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <p style={{ color: '#9CA3AF', fontSize: 13, margin: '0 0 8px' }}>No active projects</p>
              <a href="/quotes" style={{ color: '#E8834A', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Create from a quote →</a>
            </div>
          ) : data?.activeList.map((p: any) => {
            const st = STATUS_MAP[p.status] || STATUS_MAP.APPROVED;
            return (
              <div key={p.id} style={{ padding: '10px 18px', borderBottom: '1px solid #F8F6F3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1A1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>{p.jobNumber}</p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: st.bg, color: st.color, flexShrink: 0, marginLeft: 8 }}>{st.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8E4DF', padding: '14px 18px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#1A1A2E' }}>Recent Activity</h3>
        {loading ? (
          [1,2,3,4,5].map(i => <div key={i} style={{ height: 32, background: '#F8F6F3', borderRadius: 8, marginBottom: 8 }} className="animate-pulse"/>)
        ) : data?.activity.length === 0 ? (
          <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0 }}>No recent activity</p>
        ) : data?.activity.map((a: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, flexShrink: 0 }}/>
            <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{a.text}</span>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{timeAgo(a.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
