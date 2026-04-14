'use client';
import { useState, useEffect } from 'react';
import { Users, X, CheckCircle, Plus } from 'lucide-react';

import { apiFetch } from '../../../lib/api';
import { useTutorial } from '../../../components/tutorial/TutorialContext';
import { shouldShowTutorial } from '../../../lib/tutorials';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const SOURCES = ['Referral','Google','Website','Social Media','Yard Sign','Repeat Client','Other'];
const STATES = ['FL','GA','TX','CA','NY','NC','SC','AL','TN'];

interface Client {
  id: string; firstName: string; lastName: string;
  email: string; phone: string; address: string;
  city: string; state: string; zip: string;
  source: string; notes: string;
  totalRevenue: number; openBalance: number; jobsCount: number;
}

function NewClientModal({ onClose, onSave }: { onClose: () => void; onSave: (c: Client) => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', address:'', city:'', state:'FL', zip:'', source:'Referral', notes:'' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const inp = 'w-full h-10 bg-white border border-[#E8E4DF] rounded-[9px] px-3 text-[13px] text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:border-[#E8834A] transition-all';
  const lbl = 'block text-[11.5px] font-semibold text-[#6B7280] mb-1.5';

  const save = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/clients', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const newClient = await res.json();
      onSave({ ...newClient, totalRevenue: 0, openBalance: 0, jobsCount: 0 });
    } catch (e) {
      alert('Error saving client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[16px] w-full max-w-lg border border-[#E8E4DF] overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#E8E4DF]">
          <div>
            <h2 className="text-[16px] font-bold text-[#1A1A2E]">New Client</h2>
            <p className="text-[12px] text-[#6B7280] mt-0.5">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#E8E4DF] flex items-center justify-center text-[#6B7280]">✕</button>
        </div>
        <div className="h-1 bg-[#E8E4DF]"><div className="h-full bg-[#E8834A]" style={{ width: step === 1 ? '50%' : '100%' }} /></div>
        <div className="flex-1 overflow-y-auto p-5">
          {step === 1 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>First Name *</label><input data-tutorial="client-first-name" className={inp} placeholder="Linda" value={form.firstName} onChange={e => set('firstName', e.target.value)} /></div>
                <div><label className={lbl}>Last Name *</label><input className={inp} placeholder="Davis" value={form.lastName} onChange={e => set('lastName', e.target.value)} /></div>
              </div>
              <div><label className={lbl}>Phone *</label><input className={inp} placeholder="(941) 555-0000" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
              <div><label className={lbl}>Email</label><input className={inp} type="email" placeholder="client@email.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
              <div><label className={lbl}>Lead Source</label>
                <select className={inp} value={form.source} onChange={e => set('source', e.target.value)}>
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label className={lbl}>Notes</label>
                <textarea className={inp + ' h-20 py-2.5 resize-none'} placeholder="Notes about this client..." value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div><label className={lbl}>Street Address</label><input data-tutorial="client-address" className={inp} placeholder="321 Cedar Blvd" value={form.address} onChange={e => set('address', e.target.value)} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1"><label className={lbl}>City</label><input className={inp} placeholder="Sarasota" value={form.city} onChange={e => set('city', e.target.value)} /></div>
                <div><label className={lbl}>State</label>
                  <select className={inp} value={form.state} onChange={e => set('state', e.target.value)}>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>ZIP</label><input className={inp} placeholder="34236" value={form.zip} onChange={e => set('zip', e.target.value)} /></div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 p-4 border-t border-[#E8E4DF]">
          {step === 2 && <button onClick={() => setStep(1)} className="h-9 px-4 rounded-[9px] border border-[#E8E4DF] text-[13px] font-semibold text-[#6B7280]">Back</button>}
          <div className="flex-1" />
          <button onClick={onClose} className="h-9 px-4 rounded-[9px] border border-[#E8E4DF] text-[13px] font-semibold text-[#6B7280]">Cancel</button>
          {step === 1
            ? <button onClick={() => setStep(2)} disabled={!form.firstName || !form.phone} className="h-9 px-5 rounded-[9px] bg-[#E8834A] text-white text-[13px] font-semibold disabled:opacity-40">Next</button>
            : <button data-tutorial="client-save-btn" onClick={save} disabled={loading} className="h-9 px-5 rounded-[9px] bg-[#34C78A] text-white text-[13px] font-semibold disabled:opacity-40">{loading ? 'Saving...' : 'Save Client'}</button>
          }
        </div>
      </div>
    </div>
  );
}

function ClientDetail({ client, onClose }: { client: Client; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[16px] w-full max-w-xl border border-[#E8E4DF] overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-[#E8E4DF] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FEF3EC] flex items-center justify-center">
              <span className="text-[16px] font-bold text-[#E8834A]">{client.firstName[0]}{client.lastName[0]}</span>
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#1A1A2E]">{client.firstName} {client.lastName}</h2>
              <p className="text-[12px] text-[#6B7280]">{client.city}, {client.state}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#E8E4DF] flex items-center justify-center text-[#6B7280]">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[{l:'Phone',v:client.phone},{l:'Email',v:client.email||'—'},{l:'Address',v:client.address||'—'},{l:'Source',v:client.source||'—'}].map(({l,v})=>(
              <div key={l} className="bg-[#FAF9F7] border border-[#E8E4DF] rounded-[9px] p-3">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase mb-1">{l}</p>
                <p className="text-[13px] font-medium text-[#1A1A2E]">{v}</p>
              </div>
            ))}
          </div>
          {client.notes && <div className="bg-[#1A1A00] border border-[#3D3000] rounded-[9px] p-3.5"><p className="text-[13px] text-[#FCD34D]">{client.notes}</p></div>}
        </div>
        <div className="flex gap-2 p-4 border-t border-[#E8E4DF]">
          <button onClick={onClose} className="h-9 px-4 rounded-[9px] border border-[#E8E4DF] text-[13px] font-semibold text-[#6B7280]">Close</button>
          <div className="flex-1" />
          <a href="/quotes/new" style={{display:'flex',alignItems:'center',height:36,padding:'0 16px',background:'#E8834A',color:'white',fontSize:13,fontWeight:700,borderRadius:9,textDecoration:'none'}}>+ New Quote</a>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Client | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const { startTutorial } = useTutorial();

  useEffect(() => {
    apiFetch('/clients')
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setClients(arr);
        setLoading(false);
        // Auto-start tutorial if no clients yet
        if (arr.length === 0) {
          setTimeout(() => {
            if (shouldShowTutorial('create_client')) startTutorial('create_client');
          }, 500);
        }
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = clients.filter(c =>
    !search || `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      <header className="bg-white border-b border-[#E8E4DF] h-14 flex items-center justify-between px-4 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-bold text-[#1A1A2E]">Clients</h1>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#FEF3EC] text-[#E8834A] rounded-full">{clients.length}</span>
        </div>
        {/* Search — hidden on mobile */}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
          className="page-search-input flex-1 max-w-sm h-[34px] bg-[#FAF9F7] border border-[#E8E4DF] rounded-full px-4 text-[13px] text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:border-[#E8834A] transition-all"/>
        {/* Desktop button: text + icon */}
        <button data-tutorial="new-client-btn" onClick={() => setShowNew(true)}
          className="page-btn-text h-[34px] px-4 bg-[#E8834A] text-white text-[13px] font-semibold rounded-[9px] hover:bg-[#D4713A]">
          + New Client
        </button>
        {/* Mobile button: icon only */}
        <button data-tutorial="new-client-btn" onClick={() => setShowNew(true)}
          className="page-btn-icon hidden w-10 h-10 bg-[#E8834A] text-white rounded-[10px] items-center justify-center hover:bg-[#D4713A]">
          <Plus size={20} color="white" strokeWidth={2.5}/>
        </button>
      </header>
      <div className="p-5">
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} className="bg-white rounded-[12px] border border-[#E8E4DF] h-16 animate-pulse"/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#FEF3EC] rounded-full flex items-center justify-center mx-auto mb-4"><Users size={32} color="#E8834A" strokeWidth={1.5}/></div>
            <p className="text-[14px] font-semibold text-[#1A1A2E] mb-2">{search ? 'No clients found' : 'No clients yet'}</p>
            <p className="text-[12px] text-[#6B7280] mb-4">Click New Client to get started</p>
            <button onClick={() => setShowNew(true)} className="inline-flex px-6 py-2.5 bg-[#E8834A] text-white rounded-[9px] text-[14px] font-semibold">+ New Client</button>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] border border-[#E8E4DF] overflow-hidden">
            {filtered.map(c => (
              <div key={c.id} onClick={() => setSelected(c)} className="list-row flex items-center gap-4 px-5 py-4 hover:bg-[#FAF9F7] cursor-pointer border-b border-[#E8E4DF] last:border-0 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#FEF3EC] flex items-center justify-center flex-shrink-0">
                  <span className="text-[13px] font-bold text-[#E8834A]">{c.firstName[0]}{c.lastName[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#1A1A2E]">{c.firstName} {c.lastName}</p>
                  <p className="text-[12px] text-[#6B7280]">{c.phone}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[12px] text-[#9CA3AF]">{c.city}{c.state ? ', ' + c.state : ''}</p>
                  <p className="text-[11px] text-[#9CA3AF]">{c.source || ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selected && <ClientDetail client={selected} onClose={() => setSelected(null)} />}
      {showNew && <NewClientModal onClose={() => setShowNew(false)} onSave={c => { setClients(p => [c, ...p]); setShowNew(false); }} />}
    </div>
  );
}