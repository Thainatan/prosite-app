'use client';
import { useState, useEffect, useRef } from 'react';
import { HardHat, Wrench, MoreHorizontal, Calendar } from 'lucide-react';

import { apiFetch } from '../../../lib/api';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtD = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

type Status = 'in_progress' | 'waiting_materials' | 'punch_list' | 'scheduled' | 'completed' | 'on_hold';
const ST: Record<Status, { label: string; bg: string; color: string }> = {
  in_progress:       { label: 'In Progress',       bg: '#EAFAF3', color: '#34C78A' },
  waiting_materials: { label: 'Waiting Materials', bg: '#FFF7E9', color: '#F5A623' },
  punch_list:        { label: 'Punch List',        bg: '#E0F2FE', color: '#0EA5E9' },
  scheduled:         { label: 'Scheduled',         bg: '#F3F4F6', color: '#6B7280' },
  completed:         { label: 'Completed',         bg: '#EAFAF3', color: '#059669' },
  on_hold:           { label: 'On Hold',           bg: '#FFF0EF', color: '#F0584C' },
};
const TRADE_COLOR: Record<string, string> = {
  Electrical:'#F5A623', Plumbing:'#0EA5E9', HVAC:'#E8834A', Framing:'#34C78A',
  Drywall:'#6B7280', Flooring:'#EC4899', Painting:'#F0584C', Roofing:'#374151',
  Tile:'#8B5CF6', Concrete:'#9CA3AF', Landscaping:'#059669', Other:'#6B7280',
};

function mapStatus(dbStatus: string): Status {
  const map: Record<string, Status> = {
    IN_PROGRESS:'in_progress', WAITING_MATERIALS:'waiting_materials', PUNCH_LIST:'punch_list',
    APPROVED:'scheduled', SCHEDULED:'scheduled', COMPLETED:'completed', ON_HOLD:'on_hold', CANCELLED:'on_hold',
  };
  return map[dbStatus] || 'scheduled';
}

interface DbProject {
  id: string; jobNumber: string; name: string; clientId: string; serviceType: string; status: string;
  address: string; city: string; estimatedValue: number | null; startDate: string | null;
  estimatedCompletion: string | null; notes: string | null; createdAt: string;
  client: { firstName: string; lastName: string } | null;
  subcontractorCount?: number;
}
interface Project {
  id: string; jobNumber: string; name: string; client: string; address: string; city: string;
  service: string; status: Status; start: string; completion: string; value: number; notes: string;
  subcontractorCount: number;
}
interface Assignment {
  id: string; subcontractorId: string; trade: string; scope: string; status: string;
  subcontractor: { id: string; firstName: string; lastName: string; trade: string } | null;
}
interface SubOption { id: string; firstName: string; lastName: string; company: string; trade: string; }

function initials(firstName: string, lastName: string) {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}

function DotsMenu({ onArchive, onDelete }: { onArchive: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position:'relative' }} onClick={e => e.stopPropagation()}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} className="w-8 h-8 rounded-full flex items-center justify-center text-[#A0A8B8] hover:bg-[#F3F4F6] text-[18px] font-bold"><MoreHorizontal size={16}/></button>
      {open && (
        <div className="absolute right-0 top-9 z-50 bg-white border border-[#EAECF2] rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-36 overflow-hidden" onClick={e => e.stopPropagation()}>
          <button onClick={() => { onArchive(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#F5A623] hover:bg-[#FFF7E9] border-b border-[#EAECF2]">Archive</button>
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#F0584C] hover:bg-[#FFF0EF]">Delete</button>
        </div>
      )}
    </div>
  );
}

// Quick Assign Sub modal
function QuickAssignModal({ project, allSubs, onAssigned, onClose }: {
  project: Project;
  allSubs: SubOption[];
  onAssigned: (projectId: string, assignment: Assignment) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = allSubs.filter(s =>
    !search || `${s.firstName} ${s.lastName} ${s.company} ${s.trade}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async (sub: SubOption) => {
    setSaving(true);
    try {
      const res = await apiFetch(`/projects/${project.id}/subcontractors`, {
        method: 'POST',
        body: JSON.stringify({ subcontractorId: sub.id, trade: sub.trade, scope }),
      });
      const data = await res.json();
      if (!data.error) {
        onAssigned(project.id, { ...data, subcontractor: sub as any });
        onClose();
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[16px] w-full max-w-sm shadow-[0_24px_80px_rgba(0,0,0,0.18)] border border-[#EAECF2]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[#EAECF2]">
          <div>
            <h3 className="text-[15px] font-bold text-[#1A1A2E]">Assign Subcontractor</h3>
            <p className="text-[11.5px] text-[#6B7280]">{project.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">✕</button>
        </div>
        <div className="p-4 space-y-3">
          <input
            autoFocus
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search subcontractors..."
            className="w-full h-9 bg-[#F7F8FC] border border-[#EAECF2] rounded-[9px] px-3 text-[13px] outline-none"
          />
          <input
            value={scope} onChange={e => setScope(e.target.value)}
            placeholder="Scope of work (optional)"
            className="w-full h-9 bg-[#F7F8FC] border border-[#EAECF2] rounded-[9px] px-3 text-[13px] outline-none"
          />
          <div className="border border-[#EAECF2] rounded-[9px] max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-[12px] text-[#A0A8B8] text-center py-4">No subcontractors found</p>
            ) : filtered.map(s => {
              const tc = TRADE_COLOR[s.trade] || '#6B7280';
              return (
                <button key={s.id} onClick={() => handleAssign(s)} disabled={saving}
                  className="w-full text-left px-3 py-3 hover:bg-[#F7F8FC] border-b border-[#EAECF2] last:border-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${tc}, ${tc}88)` }}>
                      {initials(s.firstName, s.lastName)}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1A1A2E]">{s.firstName} {s.lastName}</p>
                      {s.company && <p className="text-[11px] text-[#A0A8B8]">{s.company}</p>}
                    </div>
                  </div>
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: tc + '18', color: tc }}>{s.trade}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Project detail modal with tabs
function ProjectDetail({ p, projectSubs, allSubs, onSubAssigned, onSubRemoved, onClose }: {
  p: Project;
  projectSubs: Assignment[];
  allSubs: SubOption[];
  onSubAssigned: (projectId: string, a: Assignment) => void;
  onSubRemoved: (projectId: string, assignmentId: string) => void;
  onClose: () => void;
}) {
  const st = ST[p.status];
  const [tab, setTab] = useState<'info' | 'subs'>('info');
  const [subsLoaded, setSubsLoaded] = useState(projectSubs.length > 0);
  const [assignments, setAssignments] = useState<Assignment[]>(projectSubs);
  const [assignSearch, setAssignSearch] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [scope, setScope] = useState('');

  useEffect(() => {
    if (tab === 'subs' && !subsLoaded) {
      apiFetch(`/projects/${p.id}/subcontractors`).then(r => r.json()).then(data => {
        if (Array.isArray(data)) setAssignments(data);
        setSubsLoaded(true);
      });
    }
  }, [tab, p.id, subsLoaded]);

  const assignedIds = new Set(assignments.map(a => a.subcontractorId));
  const availableSubs = allSubs.filter(s =>
    !assignedIds.has(s.id) &&
    (!assignSearch || `${s.firstName} ${s.lastName} ${s.company}`.toLowerCase().includes(assignSearch.toLowerCase()))
  );

  const handleAssign = async (sub: SubOption) => {
    setAssigning(true);
    try {
      const res = await apiFetch(`/projects/${p.id}/subcontractors`, {
        method: 'POST',
        body: JSON.stringify({ subcontractorId: sub.id, trade: sub.trade, scope }),
      });
      const data = await res.json();
      if (!data.error) {
        const a: Assignment = { ...data, subcontractor: sub as any };
        setAssignments(prev => [...prev, a]);
        onSubAssigned(p.id, a);
        setAssignSearch(''); setScope('');
      }
    } finally { setAssigning(false); }
  };

  const handleRemove = async (aId: string) => {
    await apiFetch(`/projects/${p.id}/subcontractors/${aId}`, { method: 'DELETE' });
    setAssignments(prev => prev.filter(a => a.id !== aId));
    onSubRemoved(p.id, aId);
  };

  const handleStatusChange = async (aId: string, status: string) => {
    const res = await apiFetch(`/projects/${p.id}/subcontractors/${aId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!data.error) setAssignments(prev => prev.map(a => a.id === aId ? { ...a, status } : a));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[16px] w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.18)] border border-[#EAECF2]" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-[#EAECF2]">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-[18px] font-bold text-[#1A1A2E]">{p.name}</h2>
                <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
              </div>
              <p className="text-[12.5px] text-[#6B7280]">{p.jobNumber} · {p.client} · {p.address}{p.city ? `, ${p.city}` : ''}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">✕</button>
          </div>
          <div className="flex border border-[#EAECF2] rounded-[10px] overflow-hidden divide-x divide-[#EAECF2] mb-3">
            {[{ l:'Value', v: p.value ? fmt(p.value) : '—' }, { l:'Service', v: p.service }, { l:'Start', v: p.start ? fmtD(p.start) : '—' }, { l:'Est. Done', v: p.completion ? fmtD(p.completion) : '—' }].map(({ l, v }) => (
              <div key={l} className="flex-1 px-3 py-2.5 text-center">
                <p className="text-[10px] font-bold text-[#A0A8B8] uppercase mb-1">{l}</p>
                <p className="text-[13px] font-bold text-[#1A1A2E] truncate">{v}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-1 bg-[#F3F4F6] rounded-[9px] p-1">
            {(['info','subs'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 h-7 rounded-[7px] text-[12px] font-semibold transition-all ${tab === t ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#9CA3AF]'}`}>
                {t === 'info' ? 'Info' : `Subcontractors (${assignments.length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'info' && p.notes && (
            <div>
              <p className="text-[10.5px] font-bold text-[#A0A8B8] uppercase mb-2">Notes</p>
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[10px] p-3.5 text-[13px] text-[#78350F] leading-relaxed">{p.notes}</div>
            </div>
          )}

          {tab === 'subs' && (
            <div className="space-y-3">
              {assignments.length === 0 ? (
                <p className="text-[13px] text-[#A0A8B8] text-center py-4">No subs assigned yet</p>
              ) : (
                <div className="space-y-2">
                  {assignments.map(a => {
                    const tc = TRADE_COLOR[a.trade] || '#6B7280';
                    const statColors: Record<string,string> = { SCHEDULED:'#6B7280', IN_PROGRESS:'#34C78A', COMPLETED:'#E8834A', ON_HOLD:'#F0584C' };
                    return (
                      <div key={a.id} className="bg-[#F9FAFB] border border-[#EAECF2] rounded-[10px] p-3 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${tc}, ${tc}88)` }}>
                          {a.subcontractor ? initials(a.subcontractor.firstName, a.subcontractor.lastName) : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[13px] font-bold text-[#1A1A2E]">
                              {a.subcontractor ? `${a.subcontractor.firstName} ${a.subcontractor.lastName}` : 'Unknown'}
                            </span>
                            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: tc + '18', color: tc }}>{a.trade}</span>
                          </div>
                          {a.scope && <p className="text-[12px] text-[#6B7280]">{a.scope}</p>}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <select value={a.status} onChange={e => handleStatusChange(a.id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            className="h-7 text-[11px] bg-white border border-[#EAECF2] rounded-[7px] px-2 outline-none"
                            style={{ color: statColors[a.status] || '#6B7280' }}>
                            {['SCHEDULED','IN_PROGRESS','COMPLETED','ON_HOLD'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button onClick={() => handleRemove(a.id)} className="w-7 h-7 flex items-center justify-center text-[#F0584C] hover:bg-[#FFF0EF] rounded-[7px] text-sm">✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border border-[#EAECF2] rounded-[10px] p-3">
                <p className="text-[11.5px] font-bold text-[#6B7280] mb-2">Assign Subcontractor</p>
                <input value={assignSearch} onChange={e => setAssignSearch(e.target.value)}
                  placeholder="Search by name or trade..." className="w-full h-9 bg-[#F7F8FC] border border-[#EAECF2] rounded-[9px] px-3 text-[13px] outline-none mb-2"/>
                <input value={scope} onChange={e => setScope(e.target.value)}
                  placeholder="Scope of work (optional)" className="w-full h-9 bg-[#F7F8FC] border border-[#EAECF2] rounded-[9px] px-3 text-[13px] outline-none mb-2"/>
                {assignSearch && (
                  <div className="border border-[#EAECF2] rounded-[9px] max-h-40 overflow-y-auto">
                    {availableSubs.length === 0 ? (
                      <p className="text-[12px] text-[#A0A8B8] text-center py-3">No matches</p>
                    ) : availableSubs.map(s => (
                      <button key={s.id} onClick={() => handleAssign(s)} disabled={assigning}
                        className="w-full text-left px-3 py-2 hover:bg-[#F7F8FC] border-b border-[#EAECF2] last:border-0 flex justify-between items-center">
                        <span className="text-[13px] font-semibold text-[#1A1A2E]">{s.firstName} {s.lastName}</span>
                        <span className="text-[11px] text-[#6B7280]">{s.trade}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-[#EAECF2] bg-[#F9FAFB]">
          <button onClick={onClose} className="h-9 px-4 rounded-[9px] border border-[#EAECF2] bg-white text-[13px] font-semibold text-[#6B7280]">Close</button>
          <div className="flex-1"/>
          <a href="/invoices" className="h-9 px-4 rounded-[9px] bg-[#E8834A] text-white text-[13px] font-semibold flex items-center no-underline" style={{ textDecoration:'none' }}>View Invoices</a>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Subs state
  const [subMap, setSubMap] = useState<Record<string, Assignment[]>>({});
  const [allSubs, setAllSubs] = useState<SubOption[]>([]);
  const [quickAssignProject, setQuickAssignProject] = useState<Project | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    Promise.all([
      apiFetch('/projects').then(r => r.json()),
      apiFetch('/subcontractors').then(r => r.json()).catch(() => []),
    ]).then(([data, subs]) => {
      if (Array.isArray(data)) {
        const mapped = data.map((p: DbProject) => ({
          id: p.id, jobNumber: p.jobNumber, name: p.name,
          client: p.client ? `${p.client.firstName} ${p.client.lastName}` : 'Unknown Client',
          address: p.address || '', city: p.city || '', service: p.serviceType,
          status: mapStatus(p.status),
          start: p.startDate || '', completion: p.estimatedCompletion || '',
          value: p.estimatedValue || 0, notes: p.notes || '',
          subcontractorCount: p.subcontractorCount || 0,
        }));
        setProjects(mapped);

        // Fetch subs for all projects in parallel
        const ids = mapped.map((p: Project) => p.id);
        Promise.allSettled(
          ids.map((id: string) =>
            apiFetch(`/projects/${id}/subcontractors`).then(r => r.json())
          )
        ).then(results => {
          const map: Record<string, Assignment[]> = {};
          results.forEach((r, i) => {
            if (r.status === 'fulfilled' && Array.isArray(r.value)) {
              map[ids[i]] = r.value;
            } else {
              map[ids[i]] = [];
            }
          });
          setSubMap(map);
        });
      }
      if (Array.isArray(subs)) setAllSubs(subs.filter((s: SubOption & { status?: string }) => s.status !== 'INACTIVE'));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const archiveProject = async (id: string) => {
    await apiFetch(`/projects/${id}/archive`, { method: 'PATCH' });
    setProjects(prev => prev.filter(p => p.id !== id));
    showToast('Project archived.');
  };

  const deleteProject = async (id: string) => {
    await apiFetch(`/projects/${id}`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p.id !== id));
    setConfirmDelete(null);
    showToast('Project deleted.');
  };

  const handleSubAssigned = (projectId: string, a: Assignment) => {
    setSubMap(prev => ({ ...prev, [projectId]: [...(prev[projectId] || []), a] }));
  };
  const handleSubRemoved = (projectId: string, assignmentId: string) => {
    setSubMap(prev => ({ ...prev, [projectId]: (prev[projectId] || []).filter(a => a.id !== assignmentId) }));
  };

  const filtered = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase())
  );
  const active = projects.filter(p => p.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      {toast && <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-[12px] text-[13px] font-semibold bg-[#EAFAF3] text-[#059669] border border-[#A7F3D0] shadow">{toast}</div>}

      <header className="bg-white border-b border-[#EAECF2] h-14 flex items-center justify-between px-6 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-bold text-[#1A1A2E]">Projects</h1>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#EAFAF3] text-[#34C78A] rounded-full">{active} active</span>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
          className="flex-1 max-w-sm h-[34px] bg-[#F7F8FC] border border-[#EAECF2] rounded-full px-4 text-[13px] outline-none focus:border-[#E8834A] transition-all"/>
        <a href="/quotes/new" className="h-[34px] px-4 bg-[#E8834A] text-white text-[13px] font-semibold rounded-[9px] flex items-center" style={{ textDecoration:'none' }}>+ New Quote</a>
      </header>

      {loading ? (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-[14px] border border-[#EAECF2] h-36 animate-pulse"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-[#EAFAF3] rounded-full flex items-center justify-center mx-auto mb-4"><HardHat size={32} color="#2ECC71" strokeWidth={1.5}/></div>
          <p className="text-[14px] font-semibold text-[#1A1A2E] mb-2">{search ? 'No projects found' : 'No projects yet'}</p>
          <p className="text-[12px] text-[#6B7280] mb-4">Approve a quote to create your first project</p>
          <a href="/quotes" className="inline-flex items-center px-6 py-2.5 bg-[#E8834A] text-white rounded-[9px] text-[14px] font-semibold no-underline" style={{ textDecoration:'none' }}>Go to Quotes</a>
        </div>
      ) : (
        <>
          <div className="bg-white border-b border-[#EAECF2] px-6 py-2.5 flex gap-4 flex-wrap">
            {(['in_progress','waiting_materials','punch_list','scheduled'] as const).map(s => {
              const count = projects.filter(p => p.status === s).length;
              if (!count) return null;
              return <span key={s} className="text-[10.5px] font-bold px-2.5 py-1 rounded-full" style={{ background: ST[s].bg, color: ST[s].color }}>{ST[s].label} · {count}</span>;
            })}
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(p => {
              const st = ST[p.status];
              const subs = subMap[p.id] || [];

              return (
                <div key={p.id} onClick={() => setSelected(p)}
                  className="bg-white rounded-[14px] border border-[#EAECF2] p-4 cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all">

                  {/* Row 1: name + status + dots */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-[#1A1A2E] mb-0.5 truncate">{p.name}</p>
                      <p className="text-[11.5px] text-[#6B7280]">{p.jobNumber} · {p.client}{p.city ? ` · ${p.city}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      <DotsMenu
                        onArchive={() => archiveProject(p.id)}
                        onDelete={() => setConfirmDelete({ id: p.id, name: p.name })}
                      />
                    </div>
                  </div>

                  {/* Row 2: service + value */}
                  <div className="flex items-center justify-between text-[11.5px] mb-3">
                    <div className="flex gap-3 text-[#A0A8B8]">
                      <span className="flex items-center gap-1"><Wrench size={11}/> {p.service}</span>
                      {p.start && <span className="flex items-center gap-1"><Calendar size={11}/> {fmtD(p.start)}</span>}
                    </div>
                    <span className="font-bold text-[#1A1A2E]">{p.value ? fmt(p.value) : '—'}</span>
                  </div>

                  {/* Row 3: Subcontractors inline */}
                  <div className="border-t border-[#F3F4F6] pt-2.5 flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                    {subs.length === 0 ? (
                      <span className="text-[11px] text-[#C4C9D4] italic">No subs assigned</span>
                    ) : (
                      subs.map(a => {
                        if (!a.subcontractor) return null;
                        const tc = TRADE_COLOR[a.trade] || '#6B7280';
                        return (
                          <div key={a.id} className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                              style={{ background: `linear-gradient(135deg, ${tc}, ${tc}88)` }}>
                              {initials(a.subcontractor.firstName, a.subcontractor.lastName)}
                            </div>
                            <span className="text-[10.5px] font-semibold text-[#374151]">
                              {a.subcontractor.firstName} {a.subcontractor.lastName[0]}.
                            </span>
                            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: tc + '18', color: tc }}>{a.trade}</span>
                          </div>
                        );
                      })
                    )}
                    {/* Quick assign button */}
                    <button
                      onClick={e => { e.stopPropagation(); setQuickAssignProject(p); }}
                      className="ml-auto text-[10.5px] font-semibold px-2.5 py-1 rounded-full border border-[#EAECF2] text-[#6B7280] hover:border-[#E8834A] hover:text-[#E8834A] transition-colors flex-shrink-0">
                      + Assign Sub
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selected && (
        <ProjectDetail
          p={selected}
          projectSubs={subMap[selected.id] || []}
          allSubs={allSubs}
          onSubAssigned={handleSubAssigned}
          onSubRemoved={handleSubRemoved}
          onClose={() => setSelected(null)}
        />
      )}

      {quickAssignProject && (
        <QuickAssignModal
          project={quickAssignProject}
          allSubs={allSubs}
          onAssigned={(projectId, a) => {
            handleSubAssigned(projectId, a);
            showToast('Subcontractor assigned.');
          }}
          onClose={() => setQuickAssignProject(null)}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white border border-[#EAECF2] rounded-[16px] p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-[16px] font-bold text-[#1A1A2E] mb-2">Delete Project?</h3>
            <p className="text-[13px] text-[#6B7280] mb-5">"{confirmDelete.name}" will be permanently deleted.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 h-10 rounded-[9px] border border-[#EAECF2] text-[#6B7280] text-[13px] font-semibold">Cancel</button>
              <button onClick={() => deleteProject(confirmDelete.id)} className="flex-1 h-10 rounded-[9px] bg-[#F0584C] text-white text-[13px] font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
