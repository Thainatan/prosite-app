'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const TASK_TYPES = ['Site Visit', 'Meeting', 'Follow-up', 'Installation', 'Inspection', 'Other'] as const;
type TaskType = typeof TASK_TYPES[number];

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  'Site Visit':   { bg: '#4F7EF7', color: 'white' },
  'Meeting':      { bg: '#8B5CF6', color: 'white' },
  'Follow-up':    { bg: '#F5A623', color: 'white' },
  'Installation': { bg: '#34C78A', color: 'white' },
  'Inspection':   { bg: '#0EA5E9', color: 'white' },
  'Other':        { bg: '#6B7280', color: 'white' },
};

interface Task {
  id: string; title: string; type: string;
  startDateTime: string; endDateTime: string;
  address: string; notes: string;
  clientId: string | null; clientName: string;
  client: { firstName: string; lastName: string } | null;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', hour12:true });
}

export default function SchedulePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [current, setCurrent] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0,0,0,0);

  useEffect(() => {
    fetch(`${API}/tasks`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTasks(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ─── Month View Helpers ───────────────────────────────────────────
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calDays: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(new Date(year, month, d));
  while (calDays.length % 7 !== 0) calDays.push(null);

  const tasksOnDay = (d: Date) => tasks.filter(t => sameDay(new Date(t.startDateTime), d));

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));
  const goToday = () => { setCurrent(new Date(today)); setSelectedDay(today); };

  // ─── Week View Helpers ────────────────────────────────────────────
  const getWeekDays = (ref: Date) => {
    const d = new Date(ref);
    const day = d.getDay();
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(sunday);
      dd.setDate(sunday.getDate() + i);
      return dd;
    });
  };
  const weekDays = getWeekDays(current);
  const prevWeek = () => setCurrent(d => { const n = new Date(d); n.setDate(n.getDate()-7); return n; });
  const nextWeek = () => setCurrent(d => { const n = new Date(d); n.setDate(n.getDate()+7); return n; });

  const selectedTasks = selectedDay ? tasksOnDay(selectedDay) : [];

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#EAECF2] h-14 flex items-center justify-between px-6 gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-bold text-[#1A1D2E]">Schedule</h1>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#EEF3FF] text-[#4F7EF7] rounded-full">{tasks.length} tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="h-8 px-3 rounded-[8px] border border-[#EAECF2] text-[12.5px] font-semibold text-[#6B7280] hover:bg-[#F3F4F6]">Today</button>
          <div className="flex items-center bg-[#F3F4F6] rounded-[9px] p-1 gap-1">
            {(['month','week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`h-7 px-3 rounded-[7px] text-[11.5px] font-semibold capitalize transition-all ${view === v ? 'bg-white text-[#1A1D2E] shadow-sm' : 'text-[#9CA3AF]'}`}>{v}</button>
            ))}
          </div>
          <a href="/tasks" className="h-[34px] px-4 bg-[#4F7EF7] text-white text-[13px] font-semibold rounded-[9px] flex items-center no-underline" style={{ textDecoration:'none' }}>+ New Task</a>
        </div>
      </header>

      {/* Legend */}
      <div className="bg-white border-b border-[#EAECF2] px-6 py-2 flex gap-4 flex-wrap">
        {TASK_TYPES.map(t => (
          <div key={t} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_STYLE[t].bg }}/>
            <span className="text-[11px] font-medium text-[#6B7280]">{t}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Calendar */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Nav */}
          <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#EAECF2]">
            <button onClick={view === 'month' ? prevMonth : prevWeek} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] text-[#6B7280] font-bold text-lg">‹</button>
            <h2 className="text-[15px] font-bold text-[#1A1D2E]">
              {view === 'month'
                ? `${MONTHS[month]} ${year}`
                : `${weekDays[0].toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${weekDays[6].toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`
              }
            </h2>
            <button onClick={view === 'month' ? nextMonth : nextWeek} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] text-[#6B7280] font-bold text-lg">›</button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-[#EAECF2] bg-white">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-[11px] font-bold text-[#A0A8B8] uppercase">{d}</div>
            ))}
          </div>

          {/* Month Grid */}
          {view === 'month' && (
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-7 h-full" style={{ gridAutoRows: 'minmax(100px, 1fr)' }}>
                {calDays.map((day, i) => {
                  if (!day) return <div key={`e-${i}`} className="border-r border-b border-[#EAECF2] bg-[#F9FAFB]"/>;
                  const isToday = sameDay(day, today);
                  const isSel = selectedDay && sameDay(day, selectedDay);
                  const dayTasks = tasksOnDay(day);
                  return (
                    <div
                      key={day.toISOString()} onClick={() => setSelectedDay(isSel ? null : day)}
                      className="border-r border-b border-[#EAECF2] p-2 cursor-pointer hover:bg-[#F7F8FC] transition-colors"
                      style={{ background: isSel ? '#EEF3FF' : undefined }}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold mb-1 ${isToday ? 'bg-[#4F7EF7] text-white' : 'text-[#1A1D2E]'} ${isSel && !isToday ? 'ring-2 ring-[#4F7EF7]' : ''}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {dayTasks.slice(0, 3).map(t => {
                          const s = TYPE_STYLE[t.type] || TYPE_STYLE.Other;
                          return (
                            <div key={t.id} className="truncate text-[10.5px] font-semibold px-1.5 py-0.5 rounded" style={{ background: s.bg, color: s.color }}>
                              {t.title}
                            </div>
                          );
                        })}
                        {dayTasks.length > 3 && <div className="text-[10px] text-[#A0A8B8] pl-1">+{dayTasks.length-3} more</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Week Grid */}
          {view === 'week' && (
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-7">
                {weekDays.map(day => {
                  const isToday = sameDay(day, today);
                  const isSel = selectedDay && sameDay(day, selectedDay);
                  const dayTasks = tasksOnDay(day);
                  return (
                    <div
                      key={day.toISOString()} onClick={() => setSelectedDay(isSel ? null : day)}
                      className="border-r border-b border-[#EAECF2] p-3 cursor-pointer hover:bg-[#F7F8FC] min-h-[200px]"
                      style={{ background: isSel ? '#EEF3FF' : undefined }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold mb-2 ${isToday ? 'bg-[#4F7EF7] text-white' : 'text-[#1A1D2E]'}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.map(t => {
                          const s = TYPE_STYLE[t.type] || TYPE_STYLE.Other;
                          return (
                            <div key={t.id} className="rounded-[6px] px-2 py-1.5" style={{ background: s.bg }}>
                              <p className="text-[11px] font-bold truncate" style={{ color: s.color }}>{t.title}</p>
                              <p className="text-[10px]" style={{ color: s.color + 'CC' }}>{fmtTime(t.startDateTime)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="w-72 border-l border-[#EAECF2] bg-white flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-[#EAECF2]">
            <h3 className="text-[13px] font-bold text-[#1A1D2E]">
              {selectedDay
                ? selectedDay.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })
                : 'Select a day'}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {!selectedDay && (
              <p className="text-[12px] text-[#A0A8B8] text-center mt-8">Click a day on the calendar to see tasks</p>
            )}
            {selectedDay && selectedTasks.length === 0 && (
              <div className="text-center mt-8">
                <p className="text-[13px] text-[#6B7280] mb-3">No tasks this day</p>
                <a href="/tasks" className="text-[12px] text-[#4F7EF7] font-semibold" style={{ textDecoration:'none' }}>+ Add Task</a>
              </div>
            )}
            {selectedTasks.map(t => {
              const s = TYPE_STYLE[t.type] || TYPE_STYLE.Other;
              const clientDisplay = t.client ? `${t.client.firstName} ${t.client.lastName}` : t.clientName || '';
              return (
                <div key={t.id} className="mb-3 rounded-[10px] border border-[#EAECF2] overflow-hidden">
                  <div className="px-3 py-2" style={{ background: s.bg }}>
                    <p className="text-[12px] font-bold" style={{ color: s.color }}>{t.type}</p>
                    <p className="text-[13px] font-bold text-[#1A1D2E] mt-0.5">{t.title}</p>
                  </div>
                  <div className="px-3 py-2 space-y-1">
                    <p className="text-[11.5px] text-[#6B7280]">🕐 {fmtTime(t.startDateTime)} – {fmtTime(t.endDateTime)}</p>
                    {clientDisplay && <p className="text-[11.5px] text-[#6B7280]">👤 {clientDisplay}</p>}
                    {t.address && <p className="text-[11.5px] text-[#6B7280]">📍 {t.address}</p>}
                    {t.notes && <p className="text-[11.5px] text-[#A0A8B8] italic">{t.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
          <p className="text-[#6B7280]">Loading...</p>
        </div>
      )}
    </div>
  );
}
