'use client';
import { useState, useEffect, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
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
}
interface Project { id: string; jobNumber: string; name: string; client: string; address: string; city: string; service: string; status: Status; start: string; completion: string; value: number; notes: string; }

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
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} className="w-8 h-8 rounded-full flex items-center justify-center text-[#A0A8B8] hover:bg-[#F3F4F6] transition-colors text-[18px] font-bold">⋯</button>
      {open && (
        <div className="absolute right-0 top-9 z-50 bg-white border border-[#EAECF2] rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-36 overflow-hidden" onClick={e => e.stopPropagation()}>
          <button onClick={() => { onArchive(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#F5A623] hover:bg-[#FFF7E9] border-b border-[#EAECF2]">Archive</button>
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#F0584C] hover:bg-[#FFF0EF]">Delete</button>
        </div>
      )}
    </div>
  );
}

function ProjectDetail({ p, onClose }: { p: Project; onClose: () => void }) {
  const st = ST[p.status];
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[16px] w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.18)] border border-[#EAECF2]" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-[#EAECF2]">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-[18px] font-bold text-[#1A1D2E]">{p.name}</h2>
                <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
              </div>
              <p className="text-[12.5px] text-[#6B7280]">{p.jobNumber} · {p.client} · {p.address}{p.city ? `, ${p.city}` : ''}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">✕</button>
          </div>
          <div className="flex border border-[#EAECF2] rounded-[10px] overflow-hidden divide-x divide-[#EAECF2]">
            {[{ l:'Value', v: p.value ? fmt(p.value) : '—' }, { l:'Service', v: p.service }, { l:'Start', v: p.start ? fmtD(p.start) : '—' }, { l:'Est. Done', v: p.completion ? fmtD(p.completion) : '—' }].map(({ l, v }) => (
              <div key={l} className="flex-1 px-3 py-2.5 text-center">
                <p className="text-[10px] font-bold text-[#A0A8B8] uppercase mb-1">{l}</p>
                <p className="text-[13px] font-bold text-[#1A1D2E] truncate">{v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {p.notes && (
            <div>
              <p className="text-[10.5px] font-bold text-[#A0A8B8] uppercase mb-2">Notes</p>
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[10px] p-3.5 text-[13px] text-[#78350F] leading-relaxed">{p.notes}</div>
            </div>
          )}
        </div>
        <div className="flex gap-2 p-4 border-t border-[#EAECF2] bg-[#F9FAFB]">
          <button onClick={onClose} className="h-9 px-4 rounded-[9px] border border-[#EAECF2] bg-white text-[13px] font-semibold text-[#6B7280]">Close</button>
          <div className="flex-1"/>
          <a href="/invoices" className="h-9 px-4 rounded-[9px] bg-[#4F7EF7] text-white text-[13px] font-semibold flex items-center no-underline" style={{ textDecoration:'none' }}>View Invoices</a>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [rawProjects, setRawProjects] = useState<DbProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    fetch(`${API}/projects`)
      .then(r => r.json())
      .then((data: DbProject[]) => {
        if (Array.isArray(data)) {
          setRawProjects(data);
          setProjects(data.map(p => ({
            id: p.id, jobNumber: p.jobNumber, name: p.name,
            client: p.client ? `${p.client.firstName} ${p.client.lastName}` : 'Unknown Client',
            address: p.address || '', city: p.city || '', service: p.serviceType,
            status: mapStatus(p.status),
            start: p.startDate || '', completion: p.estimatedCompletion || '',
            value: p.estimatedValue || 0, notes: p.notes || '',
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const archiveProject = async (id: string) => {
    await fetch(`${API}/projects/${id}/archive`, { method: 'PATCH' });
    setProjects(prev => prev.filter(p => p.id !== id));
    showToast('Project archived.');
  };

  const deleteProject = async (id: string) => {
    await fetch(`${API}/projects/${id}`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p.id !== id));
    setConfirmDelete(null);
    showToast('Project deleted.');
  };

  const filtered = projects.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase()));
  const active = projects.filter(p => p.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      {toast && <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-[12px] text-[13px] font-semibold bg-[#EAFAF3] text-[#059669] border border-[#A7F3D0] shadow">{toast}</div>}

      <header className="bg-white border-b border-[#EAECF2] h-14 flex items-center justify-between px-6 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-bold text-[#1A1D2E]">Projects</h1>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#EAFAF3] text-[#34C78A] rounded-full">{active} active</span>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="flex-1 max-w-sm h-[34px] bg-[#F7F8FC] border border-[#EAECF2] rounded-full px-4 text-[13px] outline-none focus:border-[#4F7EF7] transition-all"/>
        <a href="/quotes/new" className="h-[34px] px-4 bg-[#4F7EF7] text-white text-[13px] font-semibold rounded-[9px] flex items-center" style={{ textDecoration:'none' }}>+ New Quote</a>
      </header>

      {loading ? (
        <div className="text-center py-12"><p className="text-[#6B7280]">Loading projects...</p></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[14px] font-semibold text-[#1A1D2E] mb-2">{search ? 'No projects found' : 'No projects yet'}</p>
          <p className="text-[12px] text-[#6B7280] mb-4">Approve a quote to create your first project</p>
          <a href="/quotes" className="inline-flex items-center px-6 py-2.5 bg-[#4F7EF7] text-white rounded-[9px] text-[14px] font-semibold no-underline" style={{ textDecoration:'none' }}>Go to Quotes</a>
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
              return (
                <div key={p.id} onClick={() => setSelected(p)} className="bg-white rounded-[14px] border border-[#EAECF2] p-4 cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-[14px] font-bold text-[#1A1D2E] mb-0.5">{p.name}</p>
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
                  <div className="flex items-center justify-between text-[11.5px]">
                    <div className="flex gap-3 text-[#A0A8B8]">
                      <span>🔧 {p.service}</span>
                      {p.start && <span>📅 {fmtD(p.start)}</span>}
                    </div>
                    <span className="font-bold text-[#1A1D2E]">{p.value ? fmt(p.value) : '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selected && <ProjectDetail p={selected} onClose={() => setSelected(null)}/>}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white border border-[#EAECF2] rounded-[16px] p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-[16px] font-bold text-[#1A1D2E] mb-2">Delete Project?</h3>
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
