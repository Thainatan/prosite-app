'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const ROLES = [
  { value: 'ADMIN',           label: 'Admin',           desc: 'Full access to all features and settings',                color: '#4F7EF7', bg: '#EEF3FF' },
  { value: 'OFFICE_MANAGER',  label: 'Office Manager',  desc: 'Manages clients, quotes, invoices. No settings access.',  color: '#8B5CF6', bg: '#F3EEFF' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager', desc: 'Manages projects and schedule. No financial data.',        color: '#2ECC71', bg: '#EAFAF3' },
  { value: 'FIELD_TECH',      label: 'Field Tech',      desc: 'Views only assigned projects and daily schedule.',         color: '#E8834A', bg: '#FEF3EC' },
  { value: 'SUBCONTRACTOR',   label: 'Subcontractor',   desc: 'Views only assigned projects. No financial data.',         color: '#6B7280', bg: '#F3F4F6' },
];

interface Member {
  id: string; firstName: string; lastName: string;
  email: string; phone: string; role: string; status: string;
  lastLogin: string | null; createdAt: string;
}

function getRoleStyle(role: string) {
  return ROLES.find(r => r.value === role) || { color: '#6B7280', bg: '#F3F4F6', label: role };
}

function getAvatarGradient(role: string) {
  const map: Record<string, string> = {
    ADMIN: 'linear-gradient(135deg,#4F7EF7,#8B5CF6)',
    OFFICE_MANAGER: 'linear-gradient(135deg,#8B5CF6,#C084FC)',
    PROJECT_MANAGER: 'linear-gradient(135deg,#2ECC71,#059669)',
    FIELD_TECH: 'linear-gradient(135deg,#E8834A,#D4713A)',
    SUBCONTRACTOR: 'linear-gradient(135deg,#9CA3AF,#6B7280)',
  };
  return map[role] || 'linear-gradient(135deg,#9CA3AF,#6B7280)';
}

function InviteModal({ onClose, onSave }: { onClose: () => void; onSave: (m: Member) => void }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'FIELD_TECH', status: 'ACTIVE' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const selectedRole = ROLES.find(r => r.value === form.role);

  const save = async () => {
    if (!form.firstName || !form.lastName || !form.email) { setError('First name, last name, and email are required.'); return; }
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('prosite_token');
      const res = await fetch(`${API}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      onSave(data);
    } catch { setError('Failed to save. Please try again.'); }
    finally { setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width: '100%', height: 40, background: '#FAF9F7', border: '1px solid #E8E4DF',
    borderRadius: 9, padding: '0 12px', fontSize: 13, color: '#1A1A2E', outline: 'none', boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 5 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
      onClick={onClose}>
      <div className="modal-content" style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, border: '1px solid #E8E4DF', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #E8E4DF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1A1A2E' }}>Invite Team Member</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>Add someone to your ProSite team</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9CA3AF', lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: '70vh' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={lbl}>First Name *</label><input style={inp} placeholder="John" value={form.firstName} onChange={e => set('firstName', e.target.value)}/></div>
            <div><label style={lbl}>Last Name *</label><input style={inp} placeholder="Smith" value={form.lastName} onChange={e => set('lastName', e.target.value)}/></div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Email *</label>
            <input style={inp} type="email" placeholder="john@company.com" value={form.email} onChange={e => set('email', e.target.value)}/>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Phone</label>
            <input style={inp} placeholder="(941) 555-0000" value={form.phone} onChange={e => set('phone', e.target.value)}/>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Role *</label>
            <select style={{ ...inp }} value={form.role} onChange={e => set('role', e.target.value)}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {selectedRole && (
              <div style={{ marginTop: 6, padding: '8px 12px', background: selectedRole.bg, borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 12, color: selectedRole.color, fontWeight: 500 }}>{selectedRole.desc}</p>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ ...lbl, marginBottom: 0 }}>Active</label>
            <button
              onClick={() => set('status', form.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
              style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: form.status === 'ACTIVE' ? '#2ECC71' : '#E8E4DF', position: 'relative', transition: 'all 0.2s' }}>
              <div style={{ position: 'absolute', top: 3, left: form.status === 'ACTIVE' ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
            </button>
          </div>
          {error && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#FFF0EF', border: '1px solid #F0584C', borderRadius: 9 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#E74C3C' }}>{error}</p>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #E8E4DF', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ height: 38, padding: '0 16px', border: '1px solid #E8E4DF', borderRadius: 9, background: 'white', fontSize: 13, fontWeight: 600, color: '#6B7280', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={save} disabled={loading} className="btn-press" style={{ height: 38, padding: '0 20px', border: 'none', borderRadius: 9, background: loading ? '#F0C4A8' : '#E8834A', color: 'white', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Saving…' : 'Invite Member'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DotsMenu({ onEdit, onDeactivate, onRemove }: { onEdit: () => void; onDeactivate: () => void; onRemove: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, color: '#9CA3AF', fontSize: 18, lineHeight: 1 }}>⋯</button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }}/>
          <div style={{ position: 'absolute', right: 0, top: 32, background: 'white', border: '1px solid #E8E4DF', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: 160, zIndex: 20, overflow: 'hidden' }}>
            {[
              { label: 'Edit Role',   action: onEdit,       color: '#1A1A2E' },
              { label: 'Deactivate',  action: onDeactivate, color: '#F39C12' },
              { label: 'Remove',      action: onRemove,     color: '#E74C3C' },
            ].map(({ label, action, color }) => (
              <button key={label} onClick={() => { action(); setOpen(false); }} style={{ width: '100%', height: 38, background: 'none', border: 'none', textAlign: 'left', padding: '0 14px', fontSize: 13, fontWeight: 500, color, cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EditRoleModal({ member, onClose, onSave }: { member: Member; onClose: () => void; onSave: (m: Member) => void }) {
  const [role, setRole] = useState(member.role);
  const [loading, setLoading] = useState(false);
  const selectedRole = ROLES.find(r => r.value === role);

  const save = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('prosite_token');
      const res = await fetch(`${API}/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      onSave({ ...member, role: data.role || role });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
      onClick={onClose}>
      <div className="modal-content" style={{ background: 'white', borderRadius: 16, width: 400, border: '1px solid #E8E4DF', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #E8E4DF' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A1A2E' }}>Edit Role — {member.firstName} {member.lastName}</h2>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <select style={{ width: '100%', height: 40, background: '#FAF9F7', border: '1px solid #E8E4DF', borderRadius: 9, padding: '0 12px', fontSize: 13, color: '#1A1A2E', outline: 'none' }}
            value={role} onChange={e => setRole(e.target.value)}>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          {selectedRole && (
            <div style={{ marginTop: 10, padding: '10px 12px', background: selectedRole.bg, borderRadius: 8 }}>
              <p style={{ margin: 0, fontSize: 12, color: selectedRole.color }}>{selectedRole.desc}</p>
            </div>
          )}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #E8E4DF', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ height: 36, padding: '0 14px', border: '1px solid #E8E4DF', borderRadius: 9, background: 'white', fontSize: 13, fontWeight: 600, color: '#6B7280', cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} disabled={loading} className="btn-press" style={{ height: 36, padding: '0 16px', border: 'none', borderRadius: 9, background: '#E8834A', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Saving…' : 'Save Role'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('prosite_token');
    fetch(`${API}/team`, { headers: { Authorization: `Bearer ${token || ''}` } })
      .then(r => r.json())
      .then(data => { setMembers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const deactivate = async (id: string) => {
    const token = localStorage.getItem('prosite_token');
    await fetch(`${API}/team/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` }, body: JSON.stringify({ status: 'INACTIVE' }) });
    setMembers(p => p.map(m => m.id === id ? { ...m, status: 'INACTIVE' } : m));
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this team member?')) return;
    const token = localStorage.getItem('prosite_token');
    await fetch(`${API}/team/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token || ''}` } });
    setMembers(p => p.filter(m => m.id !== id));
  };

  const filtered = members.filter(m => !search ||
    `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fadeInUp" style={{ minHeight: '100vh', background: '#F8F6F3' }}>
      <header style={{ background: 'white', borderBottom: '1px solid #E8E4DF', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1A1A2E' }}>Team</h1>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', background: '#FEF3EC', color: '#E8834A', borderRadius: 999 }}>{members.length} members</span>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
          style={{ flex: 1, maxWidth: 300, height: 34, background: '#FAF9F7', border: '1px solid #E8E4DF', borderRadius: 999, padding: '0 14px', fontSize: 13, color: '#1A1A2E', outline: 'none' }}
        />
        <button onClick={() => setShowInvite(true)} className="btn-press"
          style={{ height: 34, padding: '0 16px', background: '#E8834A', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          + Invite Member
        </button>
      </header>

      <div style={{ padding: 20 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 72, background: 'white', borderRadius: 12, border: '1px solid #E8E4DF' }} className="animate-pulse"/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ margin: '0 auto 16px', display: 'block' }}>
              <circle cx="40" cy="40" r="38" fill="#FEF3EC" stroke="#E8834A" strokeWidth="2"/>
              <circle cx="40" cy="30" r="12" fill="#E8834A" opacity="0.8"/>
              <path d="M18 65c0-12.15 9.85-22 22-22s22 9.85 22 22" stroke="#E8834A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <rect x="52" y="18" width="16" height="2.5" rx="1.25" fill="#1C2B3A"/>
              <rect x="52" y="24" width="12" height="2.5" rx="1.25" fill="#1C2B3A"/>
            </svg>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E', margin: '0 0 6px' }}>{search ? 'No members found' : 'No team members yet'}</p>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>Invite your first team member to get started</p>
            <button onClick={() => setShowInvite(true)} className="btn-press"
              style={{ padding: '10px 24px', background: '#E8834A', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              + Invite Member
            </button>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8E4DF', overflow: 'hidden' }}>
            {filtered.map((m, idx) => {
              const rs = getRoleStyle(m.role);
              const gradient = getAvatarGradient(m.role);
              return (
                <div key={m.id} className="card-hover" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: idx < filtered.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{m.firstName[0]}{m.lastName[0]}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E' }}>{m.firstName} {m.lastName}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: rs.bg, color: rs.color }}>{rs.label || m.role}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: m.status === 'ACTIVE' ? '#EAFAF3' : '#F3F4F6', color: m.status === 'ACTIVE' ? '#2ECC71' : '#9CA3AF' }}>
                        {m.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>
                      {m.lastLogin ? `Last login ${new Date(m.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Never logged in'}
                    </p>
                  </div>
                  <DotsMenu onEdit={() => setEditMember(m)} onDeactivate={() => deactivate(m.id)} onRemove={() => remove(m.id)}/>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onSave={m => { setMembers(p => [m, ...p]); setShowInvite(false); }}/>}
      {editMember && <EditRoleModal member={editMember} onClose={() => setEditMember(null)} onSave={updated => { setMembers(p => p.map(m => m.id === updated.id ? updated : m)); setEditMember(null); }}/>}
    </div>
  );
}
