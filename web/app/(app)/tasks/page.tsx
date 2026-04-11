'use client';
import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import ClientAutocomplete from '../../../components/ClientAutocomplete';
import { apiFetch } from '../../../lib/api';

const TASK_TYPES = ['Site Visit', 'Meeting', 'Follow-up', 'Installation', 'Inspection', 'Other'] as const;
type TaskType = typeof TASK_TYPES[number];

const TYPE_STYLE: Record<TaskType, { bg: string; color: string; dot: string }> = {
  'Site Visit':   { bg: '#EEF3FF', color: '#E8834A', dot: '#E8834A' },
  'Meeting':      { bg: '#F3F0FF', color: '#8B5CF6', dot: '#8B5CF6' },
  'Follow-up':    { bg: '#FFF7E9', color: '#F5A623', dot: '#F5A623' },
  'Installation': { bg: '#EAFAF3', color: '#34C78A', dot: '#34C78A' },
  'Inspection':   { bg: '#E0F2FE', color: '#0EA5E9', dot: '#0EA5E9' },
  'Other':        { bg: '#F3F4F6', color: '#6B7280', dot: '#6B7280' },
};

interface ClientRef { id: string; firstName: string; lastName: string; }
interface Task {
  id: string; title: string; type: string;
  address: string; notes: string;
  startDateTime: string; endDateTime: string;
  clientId: string | null; clientName: string;
  client: ClientRef | null;
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', hour12:true });

const EMPTY_FORM = { title:'', clientId:'', clientName:'', address:'', date:'', startTime:'09:00', endTime:'10:00', type:'Site Visit' as TaskType, notes:'' };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<TaskType | 'all'>('all');

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = () => {
    apiFetch('/tasks')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTasks(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Required';
    if (!form.date) errs.date = 'Required';
    if (!form.startTime) errs.startTime = 'Required';
    if (!form.endTime) errs.endTime = 'Required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const startDateTime = new Date(`${form.date}T${form.startTime}`).toISOString();
      const endDateTime = new Date(`${form.date}T${form.endTime}`).toISOString();
      const res = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          clientId: form.clientId || null,
          clientName: form.clientName,
          address: form.address,
          startDateTime,
          endDateTime,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (data.error) { alert('Error: ' + data.error); return; }
      setTasks(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
      setFormErrors({});
    } finally {
      setSaving(false);
    }
  };

  const filtered = tasks.filter(t => filter === 'all' || t.type === filter);
  const inp = (err?: string) => ({ width:'100%', height:38, background:'#F7F8FC', border:`1px solid ${err ? '#F0584C' : '#EAECF2'}`, borderRadius:9, padding:'0 12px', fontSize:13, color:'#1A1A2E', outline:'none', boxSizing:'border-box' as const });
  const lbl = { display:'block', fontSize:11.5, fontWeight:600, color:'#6B7280', marginBottom:5 } as const;

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <header className="bg-white border-b border-[#EAECF2] h-14 flex items-center justify-between px-6 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-bold text-[#1A1A2E]">Tasks</h1>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#EEF3FF] text-[#E8834A] rounded-full">{tasks.length} total</span>
        </div>
        <div className="flex items-center bg-[#F3F4F6] rounded-[9px] p-1 gap-1">
          <button onClick={() => setFilter('all')} className={`h-7 px-3 rounded-[7px] text-[11.5px] font-semibold transition-all ${filter === 'all' ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#9CA3AF]'}`}>All</button>
          {TASK_TYPES.map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`h-7 px-3 rounded-[7px] text-[11.5px] font-semibold transition-all ${filter === t ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#9CA3AF]'}`}>{t}</button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)} className="h-[34px] px-4 bg-[#E8834A] text-white text-[13px] font-semibold rounded-[9px]">+ New Task</button>
      </header>

      <div className="p-5">
        {loading ? (
          <div className="text-center py-12"><p className="text-[#6B7280]">Loading tasks...</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-[#FEF3EC] rounded-full flex items-center justify-center mx-auto mb-4"><ClipboardList size={28} color="#E8834A" strokeWidth={1.5}/></div>
            <p className="text-[14px] font-semibold text-[#1A1A2E] mb-2">{filter !== 'all' ? `No ${filter} tasks` : 'No tasks yet'}</p>
            <p className="text-[12px] text-[#6B7280] mb-4">Click + New Task to schedule your first task</p>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center px-6 py-2.5 bg-[#E8834A] text-white rounded-[9px] text-[14px] font-semibold">+ New Task</button>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] border border-[#EAECF2] overflow-hidden">
            {filtered.map(task => {
              const st = TYPE_STYLE[task.type as TaskType] || TYPE_STYLE.Other;
              const clientDisplay = task.client ? `${task.client.firstName} ${task.client.lastName}` : task.clientName || '';
              return (
                <div key={task.id} className="flex items-start gap-4 px-5 py-4 border-b border-[#EAECF2] last:border-0 hover:bg-[#F7F8FC] transition-colors">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: st.bg }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: st.dot }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13.5px] font-bold text-[#1A1A2E]">{task.title}</span>
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{task.type}</span>
                    </div>
                    <p className="text-[12px] text-[#6B7280]">
                      {fmtDate(task.startDateTime)} · {fmtTime(task.startDateTime)} – {fmtTime(task.endDateTime)}
                      {clientDisplay && ` · ${clientDisplay}`}
                      {task.address && ` · ${task.address}`}
                    </p>
                    {task.notes && <p className="text-[12px] text-[#A0A8B8] mt-1 truncate">{task.notes}</p>}
                  </div>
                  <a href="/schedule" className="flex-shrink-0 text-[11px] text-[#E8834A] font-semibold hover:underline" style={{ textDecoration:'none' }}>View Calendar</a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-[16px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_24px_80px_rgba(0,0,0,0.18)] border border-[#EAECF2]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#EAECF2]">
              <h2 className="text-[17px] font-bold text-[#1A1A2E]">New Task</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label style={lbl}>Title *</label>
                <input value={form.title} onChange={e => { setForm(p => ({...p, title: e.target.value})); setFormErrors(p => ({...p, title:''})); }} placeholder="Task title..." style={inp(formErrors.title)}/>
                {formErrors.title && <p className="text-[11px] text-[#F0584C] mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <label style={lbl}>Type</label>
                <div className="flex flex-wrap gap-2">
                  {TASK_TYPES.map(t => {
                    const s = TYPE_STYLE[t];
                    const sel = form.type === t;
                    return (
                      <button key={t} onClick={() => setForm(p => ({...p, type: t}))} className="h-8 px-3 rounded-full text-[12px] font-semibold border transition-all" style={{ background: sel ? s.bg : 'white', color: sel ? s.color : '#6B7280', borderColor: sel ? s.color + '66' : '#EAECF2' }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={lbl}>Client</label>
                <ClientAutocomplete value={form.clientId} onChange={(id, name) => setForm(p => ({ ...p, clientId: id, clientName: name }))} placeholder="Search or add client..."/>
              </div>

              <div>
                <label style={lbl}>Address</label>
                <input value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} placeholder="Job site address..." style={inp()}/>
              </div>

              <div>
                <label style={lbl}>Date *</label>
                <input type="date" value={form.date} onChange={e => { setForm(p => ({...p, date: e.target.value})); setFormErrors(p => ({...p, date:''})); }} style={inp(formErrors.date)}/>
                {formErrors.date && <p className="text-[11px] text-[#F0584C] mt-1">{formErrors.date}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={lbl}>Start Time *</label>
                  <input type="time" value={form.startTime} onChange={e => { setForm(p => ({...p, startTime: e.target.value})); setFormErrors(p => ({...p, startTime:''})); }} style={inp(formErrors.startTime)}/>
                  {formErrors.startTime && <p className="text-[11px] text-[#F0584C] mt-1">{formErrors.startTime}</p>}
                </div>
                <div>
                  <label style={lbl}>End Time *</label>
                  <input type="time" value={form.endTime} onChange={e => { setForm(p => ({...p, endTime: e.target.value})); setFormErrors(p => ({...p, endTime:''})); }} style={inp(formErrors.endTime)}/>
                  {formErrors.endTime && <p className="text-[11px] text-[#F0584C] mt-1">{formErrors.endTime}</p>}
                </div>
              </div>

              <div>
                <label style={lbl}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder="Additional notes..." rows={3} style={{ width:'100%', background:'#F7F8FC', border:'1px solid #EAECF2', borderRadius:9, padding:'10px 12px', fontSize:13, color:'#1A1A2E', outline:'none', resize:'none', boxSizing:'border-box' }}/>
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t border-[#EAECF2] bg-[#F9FAFB]">
              <button onClick={() => setShowForm(false)} className="flex-1 h-10 rounded-[9px] border border-[#EAECF2] bg-white text-[13px] font-semibold text-[#6B7280]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-2 h-10 px-6 rounded-[9px] bg-[#E8834A] text-white text-[13px] font-bold disabled:opacity-50">
                {saving ? 'Saving...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
