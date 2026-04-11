'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Check, Plus, Loader2, User } from 'lucide-react';
import { apiFetch } from '../lib/api';
import AddressAutocomplete from './AddressAutocomplete';
import type { AddressResult } from './AddressAutocomplete';

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  source?: string;
}

const SOURCES = ['Referral','Google','Website','Social Media','Yard Sign','Repeat Client','Other'];
const STATES = ['FL','GA','TX','CA','NY','NC','SC','AL','TN','CO','AZ','WA','OR'];

interface Props {
  value: string;           // clientId
  onChange: (clientId: string, clientName: string) => void;
  placeholder?: string;
  required?: boolean;
}

function NewClientModal({ onClose, onSave, initialName }: {
  onClose: () => void;
  onSave: (c: Client) => void;
  initialName?: string;
}) {
  const [form, setForm] = useState({
    firstName: initialName?.split(' ')[0] || '',
    lastName: initialName?.split(' ').slice(1).join(' ') || '',
    phone: '', email: '', address: '', city: '', state: 'FL', zip: '', source: 'Referral',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleAddressSelect = (result: AddressResult) => {
    setForm(f => ({ ...f, address: result.street, city: result.city, state: result.state || f.state, zip: result.zip }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await apiFetch('/clients', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) { setErrors({ general: data.error }); return; }
      onSave(data);
    } catch {
      setErrors({ general: 'Failed to save client. Please try again.' });
    } finally { setSaving(false); }
  };

  const inp = (err?: string): React.CSSProperties => ({
    width: '100%', height: 40, background: '#FAF9F7',
    border: `1px solid ${err ? '#E74C3C' : '#E8E4DF'}`,
    borderRadius: 9, padding: '0 12px', fontSize: 13, color: '#1A1A2E',
    outline: 'none', boxSizing: 'border-box',
  });
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 5 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}
      onClick={onClose}>
      <div className="modal-content" style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 480, border: '1px solid #E8E4DF', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #E8E4DF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A1A2E' }}>New Client</h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>Add a new client to your account</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}>
            <X size={18}/>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={lbl}>First Name *</label>
              <input style={inp(errors.firstName)} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Linda"/>
              {errors.firstName && <p style={{ margin: '3px 0 0', fontSize: 11, color: '#E74C3C' }}>{errors.firstName}</p>}
            </div>
            <div>
              <label style={lbl}>Last Name *</label>
              <input style={inp(errors.lastName)} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Davis"/>
              {errors.lastName && <p style={{ margin: '3px 0 0', fontSize: 11, color: '#E74C3C' }}>{errors.lastName}</p>}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Phone *</label>
            <input style={inp(errors.phone)} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(941) 555-0000"/>
            {errors.phone && <p style={{ margin: '3px 0 0', fontSize: 11, color: '#E74C3C' }}>{errors.phone}</p>}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Email</label>
            <input style={inp()} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="client@email.com"/>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Street Address</label>
            <AddressAutocomplete
              value={form.address}
              onChange={v => set('address', v)}
              onSelect={handleAddressSelect}
              placeholder="321 Cedar Blvd"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div>
              <label style={lbl}>City</label>
              <input style={inp()} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Sarasota"/>
            </div>
            <div>
              <label style={lbl}>State</label>
              <select style={{ ...inp(), height: 40 }} value={form.state} onChange={e => set('state', e.target.value)}>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>ZIP</label>
              <input style={inp()} value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="34236"/>
            </div>
          </div>

          <div style={{ marginBottom: 4 }}>
            <label style={lbl}>Lead Source</label>
            <select style={{ ...inp(), height: 40 }} value={form.source} onChange={e => set('source', e.target.value)}>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {errors.general && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#FFF0EF', border: '1px solid #FCA5A5', borderRadius: 9 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#E74C3C' }}>{errors.general}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid #E8E4DF', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ height: 38, padding: '0 16px', border: '1px solid #E8E4DF', borderRadius: 9, background: 'white', fontSize: 13, fontWeight: 600, color: '#6B7280', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="btn-press" style={{ height: 38, padding: '0 20px', border: 'none', borderRadius: 9, background: saving ? '#F0C4A8' : '#E8834A', color: 'white', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving…' : 'Save Client'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientAutocomplete({ value, onChange, placeholder = 'Search or create client…', required }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load clients on mount
  useEffect(() => {
    apiFetch('/clients').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setClients(data);
    }).catch(() => {});
  }, []);

  // Resolve selected name
  useEffect(() => {
    if (value && clients.length > 0) {
      const c = clients.find(c => c.id === value);
      if (c) setSelectedName(`${c.firstName} ${c.lastName}`);
    }
  }, [value, clients]);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query
    ? clients.filter(c =>
        `${c.firstName} ${c.lastName} ${c.phone} ${c.city || ''}`.toLowerCase().includes(query.toLowerCase())
      )
    : clients.slice(0, 8);

  const handleSelect = (c: Client) => {
    setSelectedName(`${c.firstName} ${c.lastName}`);
    setQuery('');
    setOpen(false);
    onChange(c.id, `${c.firstName} ${c.lastName}`);
  };

  const handleClear = () => {
    setSelectedName('');
    setQuery('');
    onChange('', '');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'Enter' && filtered.length === 1) { handleSelect(filtered[0]); e.preventDefault(); }
  };

  const handleNewClient = (c: Client) => {
    setClients(prev => [c, ...prev]);
    handleSelect(c);
    setShowModal(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {value && selectedName ? (
          // Selected state
          <div style={{
            width: '100%', height: 40, background: '#EAFAF3', border: '1px solid #2ECC71',
            borderRadius: 9, padding: '0 36px 0 12px', fontSize: 13, color: '#1A1A2E',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Check size={14} color="#2ECC71" strokeWidth={2.5}/>
            <span style={{ fontWeight: 600, flex: 1 }}>{selectedName}</span>
            <button type="button" onClick={handleClear} style={{ position: 'absolute', right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 0 }}>
              <X size={14}/>
            </button>
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              required={required && !value}
              style={{
                width: '100%', height: 40, background: '#FAF9F7', border: '1px solid #E8E4DF',
                borderRadius: 9, padding: '0 36px 0 12px', fontSize: 13, color: '#1A1A2E',
                outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocusCapture={e => { e.target.style.borderColor = '#E8834A'; e.target.style.boxShadow = '0 0 0 3px rgba(232,131,74,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = '#E8E4DF'; e.target.style.boxShadow = 'none'; }}
            />
            <div style={{ position: 'absolute', right: 10, pointerEvents: 'none' }}>
              {loading ? <Loader2 size={14} color="#9CA3AF" className="animate-spin"/> : <Search size={14} color="#9CA3AF"/>}
            </div>
          </>
        )}
      </div>

      {/* Dropdown */}
      {open && !value && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
          background: 'white', border: '1px solid #E8E4DF', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden', maxHeight: 280, overflowY: 'auto',
        }}>
          {filtered.length === 0 && !query && (
            <div style={{ padding: '12px 14px', fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
              Start typing to search clients…
            </div>
          )}
          {filtered.map(c => (
            <button key={c.id} type="button" onMouseDown={() => handleSelect(c)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              borderBottom: '1px solid #F8F6F3',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FAF9F7')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FEF3EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={14} color="#E8834A"/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{c.firstName} {c.lastName}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.phone}{c.city ? ` · ${c.city}` : ''}</div>
              </div>
            </button>
          ))}

          {/* Create new option */}
          <button type="button" onMouseDown={() => { setOpen(false); setShowModal(true); }} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            background: '#FEF3EC', border: 'none', cursor: 'pointer', textAlign: 'left',
            borderTop: filtered.length > 0 ? '1px solid #E8E4DF' : 'none',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FDE9D5')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FEF3EC')}
          >
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E8834A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Plus size={14} color="white"/>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#E8834A' }}>
                {query ? `Create "${query}"` : 'Create new client'}
              </div>
              <div style={{ fontSize: 11, color: '#F0C4A8' }}>Add a new client to ProSite</div>
            </div>
          </button>
        </div>
      )}

      {showModal && (
        <NewClientModal
          initialName={query}
          onClose={() => setShowModal(false)}
          onSave={handleNewClient}
        />
      )}
    </div>
  );
}
