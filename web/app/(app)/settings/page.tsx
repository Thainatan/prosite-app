'use client';
import { useState, useEffect, useRef } from 'react';
import { Building2, FileText, Bell, User, BookOpen, RotateCcw, Play, EyeOff, CheckCircle, Circle } from 'lucide-react';

import { apiFetch } from '../../../lib/api';
import { useTutorial } from '../../../components/tutorial/TutorialContext';
import { TUTORIALS, shouldShowTutorial } from '../../../lib/tutorials';

interface Settings {
  id?: string;
  companyName: string; phone: string; email: string;
  address: string; city: string; state: string; zip: string; website: string;
  logoBase64: string | null; brandColor: string;
  headerLayout: string;
  showQty: boolean; showUnitPrice: boolean; showLineTotal: boolean;
  footerDisclaimer: string; useEstimate: boolean;
  emailNewQuote: boolean; emailApproved: boolean; emailPayment: boolean; emailOverdue: boolean;
}

const DEFAULT: Settings = {
  companyName:'', phone:'', email:'', address:'', city:'', state:'FL', zip:'', website:'',
  logoBase64: null, brandColor:'#E8834A',
  headerLayout:'Classic',
  showQty: true, showUnitPrice: true, showLineTotal: true,
  footerDisclaimer:'', useEstimate: false,
  emailNewQuote: true, emailApproved: true, emailPayment: true, emailOverdue: true,
};

type Tab = 'company' | 'documents' | 'notifications' | 'account';

const TAB_ICONS: Record<Tab, React.FC<{ size: number; color: string }>> = {
  company: Building2, documents: FileText, notifications: Bell, account: User,
};

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#EAECF2] last:border-0">
      <span className="text-[13.5px] text-[#374151]">{label}</span>
      <button onClick={onToggle} className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0" style={{ background: on ? '#E8834A' : '#D1D5DB' }}>
        <div className="w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all" style={{ left: on ? '22px' : '2px' }}/>
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('company');
  const [s, setS] = useState<Settings>({ ...DEFAULT });
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileInitials, setProfileInitials] = useState('');
  const [profileRole, setProfileRole] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const logoRef = useRef<HTMLInputElement>(null);
  const { startTutorial, getTutorialStatus, resetTutorial, resetAll, isDisabled, setDisabled } = useTutorial();
  const [tutorialTick, setTutorialTick] = useState(0);

  // Auto-start settings tutorial on first visit
  useEffect(() => {
    const t = setTimeout(() => {
      if (shouldShowTutorial('settings_setup')) startTutorial('settings_setup');
    }, 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    apiFetch('/settings')
      .then(r => r.json())
      .then(data => { if (data && !data.error) setS(prev => ({ ...prev, ...data })); })
      .catch(() => {});
    try {
      const raw = localStorage.getItem('prosite_user');
      if (raw) {
        const u = JSON.parse(raw);
        setProfileName(`${u.firstName || ''} ${u.lastName || ''}`.trim());
        setProfileEmail(u.email || '');
        setProfileInitials(`${(u.firstName || 'U')[0]}${(u.lastName || '')[0] || ''}`.toUpperCase());
        setProfileRole(u.role || 'ADMIN');
      }
    } catch {}
  }, []);

  const set = (key: keyof Settings, val: any) => setS(p => ({ ...p, [key]: val }));

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch('/settings', {
        method: 'POST',
        body: JSON.stringify(s),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('logoBase64', reader.result as string);
    reader.readAsDataURL(file);
  };

  const inp = 'w-full h-10 bg-white border border-[#EAECF2] rounded-[9px] px-3 text-[13px] text-[#1A1A2E] outline-none focus:border-[#E8834A] transition-all';
  const lbl = 'block text-[11.5px] font-semibold text-[#6B7280] mb-1.5';
  const card = 'bg-white rounded-[14px] border border-[#EAECF2] p-5 mb-4';

  const TABS: { id: Tab; label: string }[] = [
    { id: 'company',       label: 'Company'       },
    { id: 'documents',     label: 'Documents'     },
    { id: 'notifications', label: 'Notifications' },
    { id: 'account',       label: 'Account'       },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <header className="bg-white border-b border-[#EAECF2] h-14 flex items-center justify-between px-6">
        <h1 className="text-[17px] font-bold text-[#1A1A2E]">Settings</h1>
        <button
          onClick={save} disabled={saving}
          data-tutorial="settings-save-btn"
          className="h-9 px-5 rounded-[9px] text-[13px] font-bold text-white transition-all disabled:opacity-60"
          style={{ background: saved ? '#34C78A' : '#E8834A' }}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </header>

      <div className="flex max-w-4xl mx-auto p-5 gap-5">
        {/* Sidebar tabs */}
        <div className="w-44 flex-shrink-0">
          <div className="bg-white rounded-[14px] border border-[#EAECF2] overflow-hidden">
            {TABS.map(t => {
              const IconComp = TAB_ICONS[t.id];
              return (
                <button key={t.id} onClick={() => setTab(t.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[#EAECF2] last:border-0 transition-colors" style={{ background: tab === t.id ? '#EEF3FF' : 'white', color: tab === t.id ? '#E8834A' : '#374151' }}>
                  <IconComp size={15} color={tab === t.id ? '#E8834A' : '#6B7280'} />
                  <span className="text-[13px] font-semibold">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* ── Company ── */}
          {tab === 'company' && (
            <>
              <div className={card}>
                <h2 className="text-[15px] font-bold text-[#1A1A2E] mb-4">Company Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={lbl}>Company Name</label>
                    <input className={inp} data-tutorial="company-name" value={s.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Your Company LLC"/>
                  </div>
                  <div>
                    <label className={lbl}>Phone</label>
                    <input className={inp} value={s.phone} onChange={e => set('phone', e.target.value)} placeholder="(941) 555-0100"/>
                  </div>
                  <div>
                    <label className={lbl}>Email</label>
                    <input className={inp} value={s.email} onChange={e => set('email', e.target.value)} placeholder="info@company.com"/>
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Address</label>
                    <input className={inp} value={s.address} onChange={e => set('address', e.target.value)} placeholder="123 Main Street"/>
                  </div>
                  <div>
                    <label className={lbl}>City</label>
                    <input className={inp} value={s.city} onChange={e => set('city', e.target.value)} placeholder="Sarasota"/>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={lbl}>State</label>
                      <input className={inp} value={s.state} onChange={e => set('state', e.target.value)} placeholder="FL"/>
                    </div>
                    <div>
                      <label className={lbl}>Zip</label>
                      <input className={inp} value={s.zip} onChange={e => set('zip', e.target.value)} placeholder="34201"/>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Website</label>
                    <input className={inp} value={s.website} onChange={e => set('website', e.target.value)} placeholder="https://yourcompany.com"/>
                  </div>
                </div>
              </div>

              <div className={card}>
                <h2 className="text-[15px] font-bold text-[#1A1A2E] mb-4">Branding</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Company Logo</label>
                    <div
                      onClick={() => logoRef.current?.click()}
                      data-tutorial="logo-upload"
                      className="h-24 border-2 border-dashed border-[#EAECF2] rounded-[10px] flex flex-col items-center justify-center cursor-pointer hover:border-[#E8834A] transition-colors"
                    >
                      {s.logoBase64 ? (
                        <img src={s.logoBase64} alt="Logo" className="max-h-20 max-w-full object-contain rounded"/>
                      ) : (
                        <>
                          <div className="text-2xl mb-1">🖼️</div>
                          <p className="text-[12px] text-[#9CA3AF]">Click to upload logo</p>
                          <p className="text-[10px] text-[#D1D5DB]">PNG, JPG — max 2MB</p>
                        </>
                      )}
                    </div>
                    <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo}/>
                    {s.logoBase64 && (
                      <button onClick={() => set('logoBase64', null)} className="mt-1.5 text-[11px] text-[#F0584C] font-medium">Remove logo</button>
                    )}
                  </div>
                  <div>
                    <label className={lbl}>Brand Color</label>
                    <div data-tutorial="brand-color" className="flex items-center gap-3">
                      <input
                        type="color" value={s.brandColor}
                        onChange={e => set('brandColor', e.target.value)}
                        className="w-12 h-12 rounded-[9px] border border-[#EAECF2] cursor-pointer p-0.5"
                      />
                      <div>
                        <input
                          className={inp + ' w-36 font-mono'}
                          value={s.brandColor}
                          onChange={e => set('brandColor', e.target.value)}
                          placeholder="#4F7EF7"
                        />
                        <p className="text-[10.5px] text-[#A0A8B8] mt-1">Used on quotes & invoices</p>
                      </div>
                    </div>
                    <div className="mt-3 h-10 rounded-[9px] flex items-center justify-center text-white text-[13px] font-bold" style={{ background: s.brandColor }}>
                      Preview Button
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Documents ── */}
          {tab === 'documents' && (
            <>
              <div className={card}>
                <h2 className="text-[15px] font-bold text-[#1A1A2E] mb-4">Document Header Layout</h2>
                <div className="grid grid-cols-3 gap-3">
                  {['Classic', 'Modern', 'Minimal'].map(layout => (
                    <button
                      key={layout} onClick={() => set('headerLayout', layout)}
                      className="border-2 rounded-[10px] p-3 text-left transition-all"
                      style={{ borderColor: s.headerLayout === layout ? '#E8834A' : '#EAECF2', background: s.headerLayout === layout ? '#EEF3FF' : 'white' }}
                    >
                      <div className="h-14 bg-[#F3F4F6] rounded-[6px] mb-2 flex items-center p-2 gap-2">
                        {layout === 'Classic' && <><div className="w-6 h-6 bg-[#E8834A] rounded"/><div className="flex-1"><div className="h-2 bg-[#D1D5DB] rounded mb-1 w-3/4"/><div className="h-1.5 bg-[#E5E7EB] rounded w-1/2"/></div></>}
                        {layout === 'Modern' && <div className="w-full h-full flex flex-col justify-center"><div className="h-2 bg-[#E8834A] rounded w-full mb-1"/><div className="h-1.5 bg-[#D1D5DB] rounded w-2/3"/></div>}
                        {layout === 'Minimal' && <div className="w-full"><div className="h-2 bg-[#1A1D2E] rounded w-1/2"/></div>}
                      </div>
                      <p className="text-[12.5px] font-semibold" style={{ color: s.headerLayout === layout ? '#E8834A' : '#374151' }}>{layout}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={card}>
                <h2 className="text-[15px] font-bold text-[#1A1A2E] mb-4">Line Item Columns</h2>
                <div className="space-y-0">
                  <Toggle on={s.showQty} onToggle={() => set('showQty', !s.showQty)} label="Show Quantity column"/>
                  <Toggle on={s.showUnitPrice} onToggle={() => set('showUnitPrice', !s.showUnitPrice)} label="Show Unit Price column"/>
                  <Toggle on={s.showLineTotal} onToggle={() => set('showLineTotal', !s.showLineTotal)} label="Show Line Total column"/>
                  <Toggle on={s.useEstimate} onToggle={() => set('useEstimate', !s.useEstimate)} label='Rename "Quote" to "Estimate" in documents'/>
                </div>
              </div>

              <div className={card}>
                <h2 className="text-[15px] font-bold text-[#1A1A2E] mb-3">Footer Disclaimer</h2>
                <p className="text-[12px] text-[#6B7280] mb-3">Appears at the bottom of all quotes and invoices.</p>
                <textarea
                  value={s.footerDisclaimer}
                  onChange={e => set('footerDisclaimer', e.target.value)}
                  placeholder="e.g. Payment due within 30 days. Late payments subject to 1.5% monthly fee..."
                  rows={4}
                  className="w-full bg-[#F7F8FC] border border-[#EAECF2] rounded-[9px] px-3 py-2.5 text-[13px] text-[#1A1A2E] outline-none focus:border-[#E8834A] resize-none"
                />
              </div>
            </>
          )}

          {/* ── Notifications ── */}
          {tab === 'notifications' && (
            <div className={card}>
              <h2 className="text-[15px] font-bold text-[#1A1A2E] mb-1">Email Notifications</h2>
              <p className="text-[12px] text-[#6B7280] mb-4">Control which events trigger email notifications.</p>
              <Toggle on={s.emailNewQuote} onToggle={() => set('emailNewQuote', !s.emailNewQuote)} label="New quote created"/>
              <Toggle on={s.emailApproved} onToggle={() => set('emailApproved', !s.emailApproved)} label="Quote approved by client"/>
              <Toggle on={s.emailPayment} onToggle={() => set('emailPayment', !s.emailPayment)} label="Payment received"/>
              <Toggle on={s.emailOverdue} onToggle={() => set('emailOverdue', !s.emailOverdue)} label="Invoice overdue reminder"/>
            </div>
          )}

          {/* ── Account ── */}
          {tab === 'account' && (
            <>
              <div className={card}>
                <h2 className="text-[15px] font-bold text-[#1A1A2E] mb-4">Profile</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8834A] to-[#D4713A] flex items-center justify-center text-white text-xl font-bold">{profileInitials || 'U'}</div>
                  <div>
                    <p className="text-[15px] font-bold text-[#1A1A2E]">{profileName || 'User'}</p>
                    <p className="text-[13px] text-[#6B7280]">{profileEmail}{profileRole ? ` · ${profileRole.replace('_',' ')}` : ''}</p>
                  </div>
                </div>
              </div>

              <div className={card}>
                <h2 className="text-[15px] font-bold text-[#1A1A2E] mb-4">Change Password</h2>
                {pwError && <div className="bg-[#FFF0EF] border border-[#F0584C] rounded-[9px] px-3 py-2 mb-3 text-[12.5px] text-[#F0584C]">{pwError}</div>}
                <div className="space-y-3">
                  <div>
                    <label className={lbl}>Current Password</label>
                    <input type="password" className={inp} value={pwForm.current} onChange={e => setPwForm(p => ({...p, current: e.target.value}))} placeholder="••••••••"/>
                  </div>
                  <div>
                    <label className={lbl}>New Password</label>
                    <input type="password" className={inp} value={pwForm.next} onChange={e => setPwForm(p => ({...p, next: e.target.value}))} placeholder="••••••••"/>
                  </div>
                  <div>
                    <label className={lbl}>Confirm New Password</label>
                    <input type="password" className={inp} value={pwForm.confirm} onChange={e => setPwForm(p => ({...p, confirm: e.target.value}))} placeholder="••••••••"/>
                  </div>
                  <button
                    onClick={() => {
                      setPwError('');
                      if (!pwForm.current) { setPwError('Enter your current password'); return; }
                      if (pwForm.next.length < 6) { setPwError('New password must be at least 6 characters'); return; }
                      if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
                      setPwError('Password change coming soon — configure via API.');
                    }}
                    className="h-10 px-5 bg-[#1A1D2E] text-white text-[13px] font-semibold rounded-[9px]"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Tutorials (always visible) ── */}
          <div id="tutorials" className={card} style={{ marginTop: 8 }}>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} color="#E8834A" />
              <h2 className="text-[15px] font-bold text-[#1A1A2E]">Tutorials &amp; Onboarding</h2>
            </div>
            <p className="text-[12px] text-[#6B7280] mb-4">Manage your learning experience</p>

            <div className="space-y-2 mb-5">
              {TUTORIALS.map(t => {
                const status = getTutorialStatus(t.id);
                const isDone = status === 'completed';
                return (
                  <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-[#F3F4F6] last:border-0">
                    <div className="flex items-center gap-2.5">
                      {isDone
                        ? <CheckCircle size={16} color="#22C55E" />
                        : <Circle size={16} color="#D1D5DB" />}
                      <div>
                        <p className="text-[13px] font-semibold text-[#1A1A2E]">{t.name}</p>
                        <p className="text-[11px] text-[#9CA3AF]">{status === 'completed' ? 'Completed' : status === 'skipped' ? 'Skipped' : 'Not started'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        resetTutorial(t.id);
                        startTutorial(t.id);
                        setTutorialTick(n => n + 1);
                      }}
                      className="flex items-center gap-1.5 h-7 px-3 rounded-[7px] text-[11.5px] font-semibold transition-all"
                      style={{ background: isDone ? '#F3F4F6' : '#FEF3EC', color: isDone ? '#6B7280' : '#E8834A', border: `1px solid ${isDone ? '#E8E4DF' : '#E8834A'}` }}
                    >
                      {isDone ? <><RotateCcw size={11} /> Restart</> : <><Play size={11} /> Start</>}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => { resetAll(); setTutorialTick(n => n + 1); }}
                className="text-[12px] font-semibold text-[#6B7280] flex items-center gap-1.5 hover:text-[#E8834A] transition-colors"
              >
                <RotateCcw size={12} /> Reset all tutorials
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#6B7280]">Disable tutorials</span>
                <button
                  onClick={() => { setDisabled(!isDisabled); setTutorialTick(n => n + 1); }}
                  className="w-10 h-5 rounded-full transition-colors relative flex-shrink-0"
                  style={{ background: isDisabled ? '#E8834A' : '#D1D5DB' }}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-all" style={{ left: isDisabled ? '22px' : '2px' }} />
                </button>
              </div>
            </div>
            {isDisabled && (
              <p className="text-[11.5px] text-[#E8834A] mt-2">Tutorials are disabled. Toggle to re-enable them.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
