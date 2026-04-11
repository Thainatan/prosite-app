'use client';
import { MoreHorizontal } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const getH = () => ({ Authorization: 'Bearer ' + (typeof window !== 'undefined' ? localStorage.getItem('prosite_token') || '' : '') });
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
const fmtD = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const STATUS: Record<string, { label: string; bg: string; color: string }> = {
  DRAFT:    { label: 'Draft',    bg: '#F3F4F6', color: '#6B7280' },
  SENT:     { label: 'Sent',     bg: '#FEF3EC', color: '#E8834A' },
  APPROVED: { label: 'Approved', bg: '#EAFAF3', color: '#2ECC71' },
  REJECTED: { label: 'Rejected', bg: '#FFF0EF', color: '#E74C3C' },
};

interface LineItem { section?: string; description: string; qty?: number; unit?: string; price?: number; }
interface Quote {
  id: string; estimateNumber: string; title: string;
  serviceType: string; status: string; total: number; subtotal: number;
  createdAt: string; clientId: string; lineItems: LineItem[];
  client: { firstName: string; lastName: string; phone?: string; address?: string; city?: string } | null;
}
interface CompanySettings {
  companyName: string; phone: string; email: string; address: string; city: string; state: string; zip: string;
  logoBase64: string | null; brandColor: string; headerLayout: string;
  showQty: boolean; showUnitPrice: boolean; showLineTotal: boolean;
  footerDisclaimer: string; useEstimate: boolean;
}

function DotsMenu({ onView, onDuplicate, onArchive, onDelete }: { onView: () => void; onDuplicate: () => void; onArchive: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} className="w-8 h-8 rounded-full flex items-center justify-center text-[#9CA3AF] hover:bg-[#E8E4DF] transition-colors text-[18px] font-bold"><MoreHorizontal size={16}/></button>
      {open && (
        <div className="absolute right-0 top-9 z-50 bg-white border border-[#E8E4DF] rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-40 overflow-hidden" onClick={e => e.stopPropagation()}>
          {[
            { label: 'View / Print', action: () => { onView(); setOpen(false); }, color: '#1A1A2E' },
            { label: 'Duplicate', action: () => { onDuplicate(); setOpen(false); }, color: '#1A1A2E' },
            { label: 'Archive', action: () => { onArchive(); setOpen(false); }, color: '#F5A623' },
            { label: 'Delete', action: () => { onDelete(); setOpen(false); }, color: '#F0584C' },
          ].map(({ label, action, color }) => (
            <button key={label} onClick={action} className="w-full text-left px-4 py-2.5 text-[13px] font-medium hover:bg-[#FAF9F7] border-b border-[#E8E4DF] last:border-0 transition-colors" style={{ color }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PdfPreview({ quote, settings, onClose }: { quote: Quote; settings: CompanySettings | null; onClose: () => void }) {
  const docLabel = settings?.useEstimate ? 'Estimate' : 'Quote';
  const brand = settings?.brandColor || '#E8834A';
  const items = quote.lineItems || [];
  const hasQty = settings?.showQty !== false;
  const hasUP = settings?.showUnitPrice !== false;
  const hasLT = settings?.showLineTotal !== false;

  const handlePrint = () => {
    const content = document.getElementById('pdf-print-area')?.innerHTML || '';
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${docLabel} ${quote.estimateNumber}</title><style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; background: white; padding: 40px; font-size: 13px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid ${brand}; }
      .logo { max-height: 60px; max-width: 180px; object-fit: contain; }
      .doc-title { font-size: 28px; font-weight: 800; color: ${brand}; }
      .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 6px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      th { background: ${brand}15; padding: 8px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #555; }
      td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
      .total-row td { font-weight: 800; font-size: 15px; border-top: 2px solid ${brand}; background: ${brand}08; }
      .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 11px; color: #888; }
      @media print { body { padding: 20px; } }
    </style></head><body>${content}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[16px] w-full max-w-3xl max-h-[92vh] flex flex-col shadow-[0_32px_80px_rgba(0,0,0,0.3)]" onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAECF2]">
          <div className="flex items-center gap-3">
            <h2 className="text-[16px] font-bold text-[#1A1A2E]">{docLabel} Preview</h2>
            <span className="text-[11px] font-mono text-[#A0A8B8]">{quote.estimateNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="h-9 px-4 rounded-[9px] text-[13px] font-semibold text-white" style={{ background: brand }}>🖨 Print / PDF</button>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">✕</button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F3F4F6]">
          {!settings?.companyName && (
            <div className="bg-[#FFF7E9] border border-[#F5A623] rounded-[10px] px-4 py-3 mb-4 text-[12.5px] text-[#92400E]">
              Company info not configured. <a href="/settings" className="font-bold underline">Go to Settings →</a>
            </div>
          )}
          <div id="pdf-print-area" className="bg-white rounded-[12px] shadow-sm p-8" style={{ minHeight: 600 }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, paddingBottom:20, borderBottom:`2px solid ${brand}` }}>
              <div>
                {settings?.logoBase64 && <img src={settings.logoBase64} alt="Logo" style={{ maxHeight:56, maxWidth:160, objectFit:'contain', marginBottom:8 }}/>}
                <div style={{ fontSize:16, fontWeight:800, color:'#1A1A2E' }}>{settings?.companyName || 'Your Company'}</div>
                {settings?.phone && <div style={{ fontSize:12, color:'#6B7280' }}>{settings.phone}</div>}
                {settings?.email && <div style={{ fontSize:12, color:'#6B7280' }}>{settings.email}</div>}
                {settings?.address && <div style={{ fontSize:12, color:'#6B7280' }}>{settings.address}{settings.city ? `, ${settings.city}` : ''}{settings.state ? `, ${settings.state}` : ''}</div>}
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:26, fontWeight:800, color:brand }}>{docLabel}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1A1A2E', marginTop:4 }}>{quote.estimateNumber}</div>
                <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>{fmtD(quote.createdAt)}</div>
                <div style={{ marginTop:8, display:'inline-block', padding:'3px 10px', background:`${brand}20`, color:brand, borderRadius:20, fontSize:11, fontWeight:700 }}>{STATUS[quote.status]?.label || quote.status}</div>
              </div>
            </div>

            {/* Bill to */}
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#888', marginBottom:6 }}>Bill To</div>
              {quote.client ? (
                <>
                  <div style={{ fontSize:14, fontWeight:700, color:'#1A1A2E' }}>{quote.client.firstName} {quote.client.lastName}</div>
                  {quote.client.phone && <div style={{ fontSize:12, color:'#6B7280' }}>{quote.client.phone}</div>}
                  {quote.client.address && <div style={{ fontSize:12, color:'#6B7280' }}>{quote.client.address}{quote.client.city ? `, ${quote.client.city}` : ''}</div>}
                </>
              ) : (
                <div style={{ fontSize:13, color:'#9CA3AF' }}>No client assigned</div>
              )}
            </div>

            {/* Project info */}
            <div style={{ marginBottom:24, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ background:'#F9FAFB', borderRadius:8, padding:'10px 14px' }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#888', marginBottom:4 }}>Project</div>
                <div style={{ fontSize:13, fontWeight:600, color:'#1A1A2E' }}>{quote.title}</div>
                <div style={{ fontSize:12, color:'#6B7280' }}>{quote.serviceType}</div>
              </div>
            </div>

            {/* Line items */}
            {items.length > 0 && (
              <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:20 }}>
                <thead>
                  <tr style={{ background:`${brand}12` }}>
                    <th style={{ padding:'8px 12px', textAlign:'left', fontSize:10, fontWeight:700, textTransform:'uppercase', color:'#555', letterSpacing:'0.05em' }}>Description</th>
                    {hasQty && <th style={{ padding:'8px 12px', textAlign:'center', fontSize:10, fontWeight:700, textTransform:'uppercase', color:'#555', width:60 }}>Qty</th>}
                    {hasUP && <th style={{ padding:'8px 12px', textAlign:'right', fontSize:10, fontWeight:700, textTransform:'uppercase', color:'#555', width:100 }}>Unit Price</th>}
                    {hasLT && <th style={{ padding:'8px 12px', textAlign:'right', fontSize:10, fontWeight:700, textTransform:'uppercase', color:'#555', width:100 }}>Total</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const lineTotal = (item.qty || 1) * (item.price || 0);
                    return (
                      <tr key={i} style={{ borderBottom:'1px solid #F0F0F0' }}>
                        <td style={{ padding:'10px 12px' }}>
                          {item.section && <div style={{ fontSize:10, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', marginBottom:2 }}>{item.section}</div>}
                          <div style={{ fontSize:13, color:'#1A1A2E' }}>{item.description}</div>
                        </td>
                        {hasQty && <td style={{ padding:'10px 12px', textAlign:'center', color:'#6B7280', fontSize:13 }}>{item.qty || 1} {item.unit || ''}</td>}
                        {hasUP && <td style={{ padding:'10px 12px', textAlign:'right', color:'#6B7280', fontSize:13 }}>{item.price ? fmt(item.price) : '—'}</td>}
                        {hasLT && <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:600, color:'#1A1A2E', fontSize:13 }}>{fmt(lineTotal)}</td>}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={(hasQty?1:0)+(hasUP?1:0)+1}/>
                    <td style={{ padding:'12px', borderTop:`2px solid ${brand}`, fontWeight:800, fontSize:15, textAlign:'right', color:brand }}>{fmt(quote.total)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
            {items.length === 0 && (
              <div style={{ textAlign:'center', padding:'24px', background:'#F9FAFB', borderRadius:8, color:'#9CA3AF', fontSize:13, marginBottom:20 }}>
                No line items
              </div>
            )}

            {/* Footer */}
            {settings?.footerDisclaimer && (
              <div style={{ marginTop:24, paddingTop:16, borderTop:'1px solid #EAECF2', fontSize:11, color:'#9CA3AF', lineHeight:1.6 }}>
                {settings.footerDisclaimer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approving, setApproving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [preview, setPreview] = useState<Quote | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Quote | null>(null);

  useEffect(() => {
    fetch(`${API}/quotes`, { headers: getH() }).then(r => r.json()).then(data => { if (Array.isArray(data)) setQuotes(data); setLoading(false); }).catch(() => setLoading(false));
    fetch(`${API}/settings`, { headers: getH() }).then(r => r.json()).then(data => { if (data && !data.error) setSettings(data); }).catch(() => {});
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const approveQuote = async (q: Quote, e: React.MouseEvent) => {
    e.stopPropagation();
    if (q.status === 'APPROVED') return;
    setApproving(q.id);
    try {
      const res = await fetch(`${API}/quotes/${q.id}/approve`, { method: 'PATCH' });
      const data = await res.json();
      if (data.error) { showToast('error', data.error); }
      else { setQuotes(prev => prev.map(x => x.id === q.id ? { ...x, status: 'APPROVED' } : x)); showToast('success', `Quote approved! Project "${data.project.name}" created.`); }
    } catch { showToast('error', 'Failed to approve quote.'); }
    finally { setApproving(null); }
  };

  const duplicateQuote = async (q: Quote) => {
    try {
      const res = await fetch(`${API}/quotes/${q.id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (!data.error) { setQuotes(prev => [data, ...prev]); showToast('success', 'Quote duplicated.'); }
    } catch { showToast('error', 'Failed to duplicate.'); }
  };

  const archiveQuote = async (q: Quote) => {
    try {
      const res = await fetch(`${API}/quotes/${q.id}/archive`, { method: 'PATCH' });
      const data = await res.json();
      if (!data.error) { setQuotes(prev => prev.filter(x => x.id !== q.id)); showToast('success', 'Quote archived.'); }
    } catch { showToast('error', 'Failed to archive.'); }
  };

  const deleteQuote = async (q: Quote) => {
    try {
      await fetch(`${API}/quotes/${q.id}`, { method: 'DELETE', headers: getH() });
      setQuotes(prev => prev.filter(x => x.id !== q.id));
      showToast('success', 'Quote deleted.');
    } catch { showToast('error', 'Failed to delete.'); }
    finally { setConfirmDelete(null); }
  };

  const docLabel = settings?.useEstimate ? 'Estimates' : 'Quotes';
  const filtered = quotes.filter(q => !search || q.title?.toLowerCase().includes(search.toLowerCase()) || q.estimateNumber?.includes(search) || q.serviceType?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm px-4 py-3 rounded-[12px] shadow-lg text-[13px] font-semibold" style={{ background: toast.type === 'success' ? '#0C2A1E' : '#2A0C0C', color: toast.type === 'success' ? '#34C78A' : '#F0584C', border: `1px solid ${toast.type === 'success' ? '#34C78A44' : '#F0584C44'}` }}>
          {toast.type === 'success' ? '✓ ' : '✗ '}{toast.msg}
        </div>
      )}

      <header className="bg-white border-b border-[#E8E4DF] h-14 flex items-center justify-between px-6 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-bold text-white">{docLabel}</h1>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#FEF3EC] text-[#E8834A] rounded-full">{quotes.length} total</span>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${docLabel.toLowerCase()}...`} className="flex-1 max-w-sm h-[34px] bg-[#FAF9F7] border border-[#E8E4DF] rounded-full px-4 text-[13px] text-white placeholder-[#9CA3AF] outline-none focus:border-[#E8834A] transition-all"/>
        <a href="/quotes/new" style={{display:'flex',alignItems:'center',gap:6,height:34,padding:'0 16px',background:'#E8834A',color:'white',fontSize:13,fontWeight:700,borderRadius:9,textDecoration:'none'}}>+ New {settings?.useEstimate ? 'Estimate' : 'Quote'}</a>
      </header>

      <div className="p-5">
        {loading ? (
          <div className="text-center py-12"><p className="text-[#6B7280]">Loading...</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[14px] font-semibold text-white mb-2">{search ? 'No results' : `No ${docLabel.toLowerCase()} yet`}</p>
            <a href="/quotes/new" style={{display:'inline-flex',alignItems:'center',padding:'10px 24px',background:'#E8834A',color:'white',borderRadius:9,fontSize:14,fontWeight:600,textDecoration:'none'}}>+ New {settings?.useEstimate ? 'Estimate' : 'Quote'}</a>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] border border-[#E8E4DF] overflow-hidden">
            {filtered.map(q => {
              const st = STATUS[q.status] || STATUS.DRAFT;
              const clientName = q.client ? `${q.client.firstName} ${q.client.lastName}` : '';
              const isApproving = approving === q.id;
              const canApprove = q.status !== 'APPROVED' && q.status !== 'REJECTED';
              return (
                <div key={q.id} className="flex items-center gap-3 px-5 py-4 hover:bg-[#FAF9F7] border-b border-[#E8E4DF] last:border-0 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[14px] font-bold text-white">{q.title || q.serviceType}</span>
                      <span className="font-mono text-[11px] text-[#9CA3AF]">{q.estimateNumber}</span>
                    </div>
                    <p className="text-[12px] text-[#6B7280]">
                      {clientName && <span>{clientName} · </span>}
                      {q.serviceType} · {fmtD(q.createdAt)}
                    </p>
                  </div>
                  <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  <div className="text-right flex-shrink-0 min-w-[70px]">
                    <p className="text-[14px] font-bold text-white">{fmt(q.total)}</p>
                  </div>
                  {canApprove && (
                    <button onClick={e => approveQuote(q, e)} disabled={isApproving} className="flex-shrink-0 h-8 px-3 rounded-[8px] text-[11.5px] font-bold transition-all disabled:opacity-50" style={{ background: '#0C3020', color: '#34C78A', border: '1px solid #34C78A44' }}>
                      {isApproving ? '...' : '✓ Approve'}
                    </button>
                  )}
                  {q.status === 'APPROVED' && (
                    <a href="/projects" className="flex-shrink-0 h-8 px-3 rounded-[8px] text-[11.5px] font-bold no-underline flex items-center" style={{ background: '#0C1A3A', color: '#E8834A', border: '1px solid #4F7EF744' }}>
                      View Project
                    </a>
                  )}
                  <DotsMenu
                    onView={() => setPreview(q)}
                    onDuplicate={() => duplicateQuote(q)}
                    onArchive={() => archiveQuote(q)}
                    onDelete={() => setConfirmDelete(q)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PDF Preview */}
      {preview && <PdfPreview quote={preview} settings={settings} onClose={() => setPreview(null)}/>}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white border border-[#E8E4DF] rounded-[16px] p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-[16px] font-bold text-white mb-2">Delete Quote?</h3>
            <p className="text-[13px] text-[#6B7280] mb-5">"{confirmDelete.title}" will be permanently deleted. This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 h-10 rounded-[9px] border border-[#E8E4DF] text-[#6B7280] text-[13px] font-semibold">Cancel</button>
              <button onClick={() => deleteQuote(confirmDelete)} className="flex-1 h-10 rounded-[9px] bg-[#F0584C] text-white text-[13px] font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
