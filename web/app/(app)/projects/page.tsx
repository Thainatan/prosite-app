'use client';
import { useState } from 'react';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

type Status = 'in_progress' | 'waiting_materials' | 'punch_list' | 'scheduled' | 'completed' | 'on_hold';
const ST: Record<Status, { label: string; bg: string; color: string }> = {
  in_progress:       { label: 'In Progress',       bg: '#EAFAF3', color: '#34C78A' },
  waiting_materials: { label: 'Waiting Materials', bg: '#FFF7E9', color: '#F5A623' },
  punch_list:        { label: 'Punch List',        bg: '#E0F2FE', color: '#0EA5E9' },
  scheduled:         { label: 'Scheduled',         bg: '#F3F4F6', color: '#6B7280' },
  completed:         { label: 'Completed',         bg: '#EAFAF3', color: '#059669' },
  on_hold:           { label: 'On Hold',           bg: '#FFF0EF', color: '#F0584C' },
};

interface CheckItem { label: string; done: boolean; }
interface Project {
  id: string; jobNumber: string; name: string;
  client: string; address: string; city: string;
  service: string; status: Status;
  start: string; completion: string;
  manager: string; crew: string[];
  value: number; progress: number;
  checklist: CheckItem[];
  notes: string;
  photos: number;
  changeOrders: number;
}

const PROJECTS: Project[] = [
  {
    id:'1', jobNumber:'BF-2024-041', name:'Smith Kitchen Remodel',
    client:'Linda Davis', address:'321 Cedar Blvd', city:'Sarasota',
    service:'Kitchen Remodel', status:'in_progress',
    start:'2026-03-15', completion:'2026-04-25',
    manager:'Mike Torres', crew:['Carlos Ruiz','Tony Reyes'],
    value:55064, progress:65, photos:24, changeOrders:1,
    notes:'Cabinets installed. Countertop template Apr 10. Electrical rough-in complete.',
    checklist:[
      {label:'Demo & site prep',done:true},{label:'Rough framing',done:true},
      {label:'Rough plumbing',done:true},{label:'Rough electrical',done:true},
      {label:'Drywall & texture',done:true},{label:'Prime & paint',done:true},
      {label:'Cabinet installation',done:true},{label:'Countertop template',done:false},
      {label:'Countertop installation',done:false},{label:'Tile backsplash',done:false},
      {label:'Plumbing fixtures',done:false},{label:'Appliances',done:false},
      {label:'Trim & finish',done:false},{label:'Final clean',done:false},
      {label:'Client walkthrough',done:false},{label:'Final invoice',done:false},
    ],
  },
  {
    id:'2', jobNumber:'BF-2024-039', name:'Johnson Master Bath',
    client:'Patricia Wilson', address:'567 Maple Ave', city:'Bradenton',
    service:'Bathroom Remodel', status:'waiting_materials',
    start:'2026-03-28', completion:'2026-04-30',
    manager:'Sarah Kim', crew:['James Wilson'],
    value:18000, progress:40, photos:11, changeOrders:0,
    notes:'Demo complete. Tile delayed — arrival Apr 12.',
    checklist:[
      {label:'Demo & tile removal',done:true},{label:'Waterproofing',done:true},
      {label:'Shower pan',done:true},{label:'Floor tile',done:false},
      {label:'Wall tile',done:false},{label:'Vanity install',done:false},
      {label:'Plumbing fixtures',done:false},{label:'Paint',done:false},
      {label:'Final clean',done:false},{label:'Client walkthrough',done:false},
    ],
  },
  {
    id:'3', jobNumber:'BF-2024-037', name:'Garcia Outdoor Kitchen',
    client:'Michael Brown', address:'654 Elm Street', city:'North Port',
    service:'Outdoor Kitchen', status:'punch_list',
    start:'2026-02-20', completion:'2026-04-10',
    manager:'Mike Torres', crew:['Carlos Ruiz','Tony Reyes','James Wilson'],
    value:63500, progress:92, photos:38, changeOrders:2,
    notes:'Final items: caulking around sink, touch-up paint on stucco, clean grout.',
    checklist:[
      {label:'Foundation',done:true},{label:'Framing',done:true},
      {label:'Electrical rough-in',done:true},{label:'Gas line',done:true},
      {label:'Cabinetry',done:true},{label:'Countertop',done:true},
      {label:'Tile work',done:true},{label:'Appliance connections',done:true},
      {label:'Caulking & sealant',done:false},{label:'Touch-up paint',done:false},
      {label:'Final clean',done:false},{label:'Client walkthrough',done:false},
    ],
  },
  {
    id:'4', jobNumber:'BF-2024-042', name:'Davis Flooring — 2nd Floor',
    client:'Robert Johnson', address:'890 Pine Road', city:'Venice',
    service:'Flooring', status:'scheduled',
    start:'2026-04-15', completion:'2026-04-22',
    manager:'Sarah Kim', crew:['Tony Reyes'],
    value:12000, progress:0, photos:0, changeOrders:0,
    notes:'Materials ordered. Start date confirmed with client.',
    checklist:[
      {label:'Remove existing carpet',done:false},{label:'Prep subfloor',done:false},
      {label:'Install LVP flooring',done:false},{label:'Install baseboards',done:false},
      {label:'Final clean',done:false},{label:'Client walkthrough',done:false},
    ],
  },
];

const progressColor = (p: number) => p >= 80 ? '#34C78A' : p >= 40 ? '#4F7EF7' : '#F5A623';
const fmtD = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function ProjectDetail({ p, onClose }: { p: Project; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'checklist' | 'notes'>('overview');
  const st = ST[p.status];
  const done = p.checklist.filter(c => c.done).length;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[16px] w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.18)] border border-[#EAECF2]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 border-b border-[#EAECF2]">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-[18px] font-bold text-[#1A1D2E]">{p.name}</h2>
                <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
              </div>
              <p className="text-[12.5px] text-[#6B7280]">{p.jobNumber} · {p.client} · {p.address}, {p.city}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">✕</button>
          </div>

          {/* Stats row */}
          <div className="flex border border-[#EAECF2] rounded-[10px] overflow-hidden divide-x divide-[#EAECF2]">
            {[
              { l: 'Value',      v: fmt(p.value) },
              { l: 'Start',      v: fmtD(p.start) },
              { l: 'Est. Done',  v: fmtD(p.completion) },
              { l: 'Checklist',  v: `${done}/${p.checklist.length}` },
              { l: 'Photos',     v: String(p.photos) },
            ].map(({ l, v }) => (
              <div key={l} className="flex-1 px-3 py-2.5 text-center">
                <p className="text-[10px] font-bold text-[#A0A8B8] uppercase mb-1">{l}</p>
                <p className="text-[13px] font-bold text-[#1A1D2E]">{v}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between mb-1.5">
              <span className="text-[11.5px] font-medium text-[#A0A8B8]">Progress</span>
              <span className="text-[12px] font-bold" style={{ color: progressColor(p.progress) }}>{p.progress}%</span>
            </div>
            <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: progressColor(p.progress) }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#EAECF2] px-5">
          {(['overview', 'checklist', 'notes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`h-10 px-4 text-[13px] font-semibold capitalize border-b-2 transition-all ${tab === t ? 'text-[#4F7EF7] border-[#4F7EF7]' : 'text-[#9CA3AF] border-transparent'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'overview' && (
            <div className="space-y-4">
              <div>
                <p className="text-[10.5px] font-bold text-[#A0A8B8] uppercase mb-2">Crew</p>
                <div className="flex flex-wrap gap-2">
                  {[p.manager, ...p.crew].map((name, i) => (
                    <div key={name} className="flex items-center gap-2 bg-[#F7F8FC] border border-[#EAECF2] rounded-full px-3 py-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#EEF3FF] flex items-center justify-center text-[9px] font-bold text-[#4F7EF7]">
                        {name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-[12.5px] font-medium text-[#374151]">{name}</span>
                      {i === 0 && <span className="text-[10px] font-bold text-[#4F7EF7]">PM</span>}
                    </div>
                  ))}
                </div>
              </div>
              {p.notes && (
                <div>
                  <p className="text-[10.5px] font-bold text-[#A0A8B8] uppercase mb-2">Latest Notes</p>
                  <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[10px] p-3.5 text-[13px] text-[#78350F] leading-relaxed">{p.notes}</div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Change Orders', value: p.changeOrders, color: '#F5A623', bg: '#FFF7E9' },
                  { label: 'Photos',        value: p.photos,       color: '#8B5CF6', bg: '#F3F0FF' },
                  { label: 'Checklist',     value: `${done}/${p.checklist.length}`, color: '#34C78A', bg: '#EAFAF3' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className="rounded-[10px] p-3 text-center" style={{ background: bg }}>
                    <p className="text-[18px] font-bold mb-0.5" style={{ color }}>{value}</p>
                    <p className="text-[11px] font-semibold" style={{ color }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'checklist' && (
            <div className="space-y-1.5">
              {p.checklist.map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-[9px] border ${item.done ? 'bg-[#EAFAF3] border-[#A7F3D0]' : 'bg-white border-[#EAECF2]'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-[#34C78A] border-[#34C78A]' : 'border-[#D1D5DB]'}`}>
                    {item.done && <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span className={`text-[13px] font-medium ${item.done ? 'line-through text-[#6EE7B7]' : 'text-[#374151]'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'notes' && (
            <div className="space-y-3">
              <textarea className="w-full h-24 bg-[#F7F8FC] border border-[#EAECF2] rounded-[10px] p-3 text-[13px] outline-none focus:border-[#4F7EF7] resize-none" placeholder="Add a note…"/>
              <button className="h-8 px-4 rounded-[8px] bg-[#4F7EF7] text-white text-[12.5px] font-semibold">Save Note</button>
              {p.notes && (
                <div className="bg-[#F7F8FC] border border-[#EAECF2] rounded-[10px] p-3.5">
                  <p className="text-[11px] font-bold text-[#A0A8B8] mb-1.5">{p.manager} · Latest</p>
                  <p className="text-[13px] text-[#374151]">{p.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-[#EAECF2] bg-[#F9FAFB]">
          <button onClick={onClose} className="h-9 px-4 rounded-[9px] border border-[#EAECF2] bg-white text-[13px] font-semibold text-[#6B7280]">Close</button>
          <div className="flex-1"/>
          <button className="h-9 px-4 rounded-[9px] border border-[#EAECF2] bg-white text-[13px] font-semibold text-[#F5A623]">+ Change Order</button>
          <button className="h-9 px-4 rounded-[9px] bg-[#4F7EF7] text-white text-[13px] font-semibold">+ Invoice</button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const filtered = PROJECTS.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase())
  );
  const active = PROJECTS.filter(p => p.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <header className="bg-white border-b border-[#EAECF2] h-14 flex items-center justify-between px-6 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-bold text-[#1A1D2E]">Projects</h1>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#EAFAF3] text-[#34C78A] rounded-full">{active} active</span>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="flex-1 max-w-sm h-[34px] bg-[#F7F8FC] border border-[#EAECF2] rounded-full px-4 text-[13px] outline-none focus:border-[#4F7EF7] transition-all"/>
        <button className="h-[34px] px-4 bg-[#4F7EF7] text-white text-[13px] font-semibold rounded-[9px]">+ New Project</button>
      </header>

      <div className="bg-white border-b border-[#EAECF2] px-6 py-2.5 flex gap-4">
        {(['in_progress','waiting_materials','punch_list','scheduled'] as const).map(s => {
          const count = PROJECTS.filter(p => p.status === s).length;
          if (!count) return null;
          return <span key={s} className="text-[10.5px] font-bold px-2.5 py-1 rounded-full" style={{ background: ST[s].bg, color: ST[s].color }}>{ST[s].label} · {count}</span>;
        })}
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => {
          const st = ST[p.status];
          const done = p.checklist.filter(c => c.done).length;
          return (
            <div key={p.id} onClick={() => setSelected(p)} className="bg-white rounded-[14px] border border-[#EAECF2] p-4 cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-[14px] font-bold text-[#1A1D2E] mb-0.5">{p.name}</p>
                  <p className="text-[11.5px] text-[#6B7280]">{p.jobNumber} · {p.client} · {p.city}</p>
                </div>
                <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: st.bg, color: st.color }}>{st.label}</span>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[11px] text-[#A0A8B8]">Progress</span>
                  <span className="text-[12px] font-bold" style={{ color: progressColor(p.progress) }}>{p.progress}%</span>
                </div>
                <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: progressColor(p.progress) }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11.5px]">
                <div className="flex gap-3 text-[#A0A8B8]">
                  <span>👤 {p.manager.split(' ')[0]}</span>
                  <span>📷 {p.photos}</span>
                  <span>✓ {done}/{p.checklist.length}</span>
                  {p.changeOrders > 0 && <span className="text-[#F5A623] font-semibold">↺ {p.changeOrders} CO</span>}
                </div>
                <span className="font-bold text-[#1A1D2E]">{fmt(p.value)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {selected && <ProjectDetail p={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}