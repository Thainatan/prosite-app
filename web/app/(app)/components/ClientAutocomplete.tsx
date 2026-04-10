'use client';
import { useState, useEffect, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface Client {
  id: string; firstName: string; lastName: string;
  phone: string; address: string; city?: string; state?: string;
}

interface Props {
  value: string;
  onSelect: (clientId: string, client: Client | null) => void;
  placeholder?: string;
  theme?: 'dark' | 'light';
  allClients?: Client[];
  onClientsUpdate?: (clients: Client[]) => void;
}

export default function ClientAutocomplete({
  value, onSelect, placeholder = 'Search client...', theme = 'dark', allClients, onClientsUpdate,
}: Props) {
  const [clients, setClients] = useState<Client[]>(allClients || []);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', address: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!allClients) {
      fetch(`${API}/clients`)
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) { setClients(data); onClientsUpdate?.(data); } })
        .catch(() => {});
    }
  }, []);

  useEffect(() => { if (allClients) setClients(allClients); }, [allClients]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedClient = clients.find(c => c.id === value);
  const filtered = clients.filter(c =>
    !query || `${c.firstName} ${c.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
    c.phone?.includes(query)
  );

  const handleSelect = (c: Client) => { onSelect(c.id, c); setQuery(''); setOpen(false); };
  const handleClear = () => { onSelect('', null); setQuery(''); };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.phone.trim()) errs.phone = 'Required';
    if (!form.address.trim()) errs.address = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateClient = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const newClient = await res.json();
      if (newClient.error) { alert('Error: ' + newClient.error); return; }
      const updated = [newClient, ...clients];
      setClients(updated);
      onClientsUpdate?.(updated);
      onSelect(newClient.id, newClient);
      setShowModal(false);
      setForm({ firstName: '', lastName: '', phone: '', address: '' });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const isDark = theme === 'dark';
  const bg = isDark ? '#0F1117' : 'white';
  const bdr = isDark ? '#1E2130' : '#EAECF2';
  const txt = isDark ? 'white' : '#1A1D2E';
  const muted = isDark ? '#3D4466' : '#9CA3AF';
  const cardBg = isDark ? '#161924' : 'white';

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 40, background: bg, border: `1px solid ${open ? '#4F7EF7' : bdr}`,
    borderRadius: 9, padding: '0 12px', fontSize: 13, color: txt, outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {selectedClient && !query ? (
        <div style={{ display: 'flex', alignItems: 'center', height: 40, background: bg, border: `1px solid ${bdr}`, borderRadius: 9, padding: '0 12px', gap: 8 }}>
          <span style={{ flex: 1, fontSize: 13, color: txt, fontWeight: 500 }}>
            {selectedClient.firstName} {selectedClient.lastName}
          </span>
          <button onClick={handleClear} style={{ color: muted, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
      ) : (
        <input
          type="text" value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}

      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: bg, border: `1px solid ${bdr}`, borderRadius: 10, marginTop: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', maxHeight: 260, overflowY: 'auto' }}>
          {filtered.slice(0, 8).map(c => (
            <button key={c.id} onClick={() => handleSelect(c)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', borderBottom: `1px solid ${bdr}`, cursor: 'pointer' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: txt }}>{c.firstName} {c.lastName}</div>
              <div style={{ fontSize: 11, color: muted }}>{c.phone}{c.address ? ` · ${c.address}` : ''}</div>
            </button>
          ))}
          {filtered.length === 0 && query && (
            <div style={{ padding: '10px 14px', fontSize: 13, color: muted }}>No clients found for &ldquo;{query}&rdquo;</div>
          )}
          <button
            onClick={() => { setShowModal(true); setOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', color: '#4F7EF7', fontSize: 13, fontWeight: 600 }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add New Client
          </button>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowModal(false)}>
          <div style={{ background: cardBg, border: `1px solid ${bdr}`, borderRadius: 16, padding: 24, width: '100%', maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: txt, margin: 0 }}>New Client</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: 18 }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { key: 'firstName', label: 'First Name *', span: 1 },
                { key: 'lastName',  label: 'Last Name *',  span: 1 },
                { key: 'phone',     label: 'Phone *',      span: 2 },
                { key: 'address',   label: 'Address *',    span: 2 },
              ].map(({ key, label, span }) => (
                <div key={key} style={{ gridColumn: span === 2 ? '1 / -1' : undefined }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: muted, marginBottom: 5 }}>{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: '' })); }}
                    style={{ width: '100%', height: 38, background: isDark ? '#0A0D14' : '#F7F8FC', border: `1px solid ${errors[key] ? '#F0584C' : bdr}`, borderRadius: 9, padding: '0 12px', fontSize: 13, color: txt, outline: 'none', boxSizing: 'border-box' }}
                  />
                  {errors[key] && <p style={{ fontSize: 11, color: '#F0584C', marginTop: 3, margin: '3px 0 0' }}>{errors[key]}</p>}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, height: 40, borderRadius: 9, border: `1px solid ${bdr}`, background: 'none', color: muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreateClient} disabled={saving} style={{ flex: 2, height: 40, borderRadius: 9, background: saving ? '#2D3A6B' : '#4F7EF7', color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Creating...' : 'Create Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
