'use client';
import { useState, useEffect, useRef } from 'react';
import {
  FileText, Plus, Trash2, ChevronLeft, Send, Save,
  UserPlus, X, Sparkles, Package,
  Layers, Paintbrush, Hammer, Sofa, Grid3x3,
  ChevronDown, ChevronRight, Check
} from 'lucide-react';
import ClientAutocomplete from '../../../../components/ClientAutocomplete';
import { apiFetch } from '../../../../lib/api';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

interface LineItem {
  id: string;
  niche: string;
  section: string;
  description: string;
  qty: number;
  unit: string;
  price: number;
  material?: string;
  finish?: string;
  brand?: string;
  aiGenerated?: boolean;
  subcontractorId?: string;
  subcontractorName?: string;
  subcontractorTrade?: string;
}

const NICHES = [
  { id: 'CABINETS',   label: 'Custom Cabinets', icon: Package,    color: '#8B5CF6' },
  { id: 'TILE',       label: 'Tile & Stone',    icon: Grid3x3,    color: '#0EA5E9' },
  { id: 'FLOORING',   label: 'Flooring',        icon: Layers,     color: '#F59E0B' },
  { id: 'PAINTING',   label: 'Painting',        icon: Paintbrush, color: '#10B981' },
  { id: 'REMODELING', label: 'Remodeling',      icon: Hammer,     color: '#C4685A' },
  { id: 'DESIGN',     label: 'Interior Design', icon: Sofa,       color: '#EC4899' },
];

const SECTIONS_BY_NICHE: Record<string, string[]> = {
  CABINETS:   ['Base Cabinets','Wall Cabinets','Tall Cabinets','Island','Countertops','Hardware','Crown Molding','Installation','Demo & Removal','Other'],
  TILE:       ['Floor Tile','Wall Tile','Shower/Tub','Backsplash','Grout & Sealer','Waterproofing','Demo & Removal','Installation','Other'],
  FLOORING:   ['Hardwood','LVP / LVT','Tile Floor','Carpet','Subfloor Prep','Transitions','Baseboards','Demo & Removal','Other'],
  PAINTING:   ['Interior Walls','Ceilings','Trim & Doors','Cabinets','Exterior','Pressure Wash','Primer','Other'],
  REMODELING: ['Demo & Prep','Framing & Drywall','Plumbing','Electrical','Tile & Flooring','Cabinetry','Countertops','Paint & Finish','Fixtures & Hardware','Cleanup','Other'],
  DESIGN:     ['Concept & Design','Material Selection','Procurement','Furniture','Lighting','Accessories','Installation Management','Other'],
};

const UNITS_BY_NICHE: Record<string, string[]> = {
  CABINETS:   ['linear ft','cabinet','door','drawer','lot','ea','job'],
  TILE:       ['sqft','sqyd','lot','ea','job'],
  FLOORING:   ['sqft','sqyd','lnft','room','lot','job'],
  PAINTING:   ['sqft','room','door','window','lot','job'],
  REMODELING: ['job','sqft','lnft','hr','ea','lot'],
  DESIGN:     ['hr','lot','project','item','job'],
};

const MATERIALS_BY_NICHE: Record<string, string[]> = {
  CABINETS:   ['Solid Wood','Plywood','MDF','Thermofoil','Acrylic','Melamine','Other'],
  TILE:       ['Porcelain','Ceramic','Marble','Travertine','Slate','Glass','Quartzite','Other'],
  FLOORING:   ['White Oak','Red Oak','Maple','Walnut','LVP','LVT','Porcelain','Carpet','Other'],
  PAINTING:   ['Sherwin-Williams','Benjamin Moore','Behr','PPG','Other'],
  REMODELING: [],
  DESIGN:     [],
};

const FINISHES_BY_NICHE: Record<string, string[]> = {
  CABINETS:   ['Painted','Stained','Natural','Glazed','Distressed','Two-Tone'],
  TILE:       ['Polished','Matte','Satin','Honed','Textured','Brushed'],
  FLOORING:   ['Smooth','Hand-Scraped','Wire-Brushed','Satin','Gloss','Matte'],
  PAINTING:   ['Flat','Eggshell','Satin','Semi-Gloss','Gloss'],
  REMODELING: [],
  DESIGN:     [],
};

const TRADE_COLOR: Record<string, string> = {
  Electrical:'#F5A623', Plumbing:'#0EA5E9', HVAC:'#C4685A', Framing:'#34C78A',
  Flooring:'#EC4899', Painting:'#10B981', Tile:'#8B5CF6', Cabinets:'#F59E0B', Other:'#6B7280',
};

const AI_QUESTIONS: Record<string, string[]> = {
  CABINETS:   [
    'Cabinet style? (Shaker, Flat Front, Raised Panel)',
    'Material? (Solid Wood, Plywood, MDF)',
    'Finish or color? (Painted White, Stained Oak, Natural)',
    'Linear feet of cabinets needed?',
    'Any special pieces? (Island, pantry, built-ins)',
  ],
  TILE:       [
    'Tile size? (e.g. 12×24, 24×48, 3×6 subway)',
    'Material? (Porcelain, Marble, Ceramic, Glass)',
    'Finish? (Polished, Matte, Honed, Textured)',
    'Layout pattern? (Straight, Herringbone, Offset)',
    'Total square footage to cover?',
  ],
  FLOORING:   [
    'Flooring type? (Hardwood, LVP, Tile, Carpet)',
    'Species or product line? (White Oak, Maple, Shaw LVP)',
    'Pre-finished or site-finished?',
    'Plank width? (3", 5", 7.5", wide-plank)',
    'Total square footage?',
  ],
  PAINTING:   [
    'Scope: interior, exterior, or both?',
    'Areas to paint? (Walls, ceilings, trim, doors, cabinets)',
    'Paint brand? (Sherwin-Williams, Benjamin Moore, Behr)',
    'Sheen level? (Flat, Eggshell, Satin, Semi-Gloss)',
    'Prep work needed? (patching, sanding, priming, caulk)',
  ],
  REMODELING: [
    'What is the scope? (Kitchen, bath, full home, addition)',
    'Approximate square footage?',
    'Trades included? (Plumbing, electrical, tile, cabinets)',
    'Any structural work? (wall removal, new openings, beam)',
    'Target timeline or completion date?',
  ],
  DESIGN:     [
    'Style direction? (Modern, Traditional, Transitional, Coastal)',
    'Which rooms are in scope?',
    'Service level? (Full design, consulting only, procurement)',
    'Approximate budget range?',
    'Existing pieces or constraints to design around?',
  ],
};

const parseNum = (s: string): number => {
  const m = s.replace(/,/g, '').match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
};

function buildAIItem(niche: string, answers: string[]): Omit<LineItem, 'id' | 'niche'> {
  const sections = SECTIONS_BY_NICHE[niche] || ['Other'];
  const units    = UNITS_BY_NICHE[niche]    || ['job'];
  const materials = MATERIALS_BY_NICHE[niche] || [];
  const finishes  = FINISHES_BY_NICHE[niche]  || [];
  const priceRanges: Record<string, [number, number]> = {
    CABINETS: [195, 380], TILE: [11, 26], FLOORING: [8, 22],
    PAINTING: [2.5, 5],  REMODELING: [2200, 5500], DESIGN: [85, 150],
  };
  const [lo, hi] = priceRanges[niche] || [50, 200];
  const price = Math.round((lo + Math.random() * (hi - lo)) * 100) / 100;
  const a = answers.map(s => s.trim());

  switch (niche) {
    case 'CABINETS': {
      const qty = parseNum(a[3]) || 1;
      const parts = [
        a[0] && `${a[0]}-style`,
        a[1] || materials[0] || 'custom',
        'cabinetry',
        a[2] && `in ${a[2]} finish`,
        a[3] && `— ${a[3]} LF`,
        a[4] && `incl. ${a[4]}`,
      ].filter(Boolean);
      return { section: 'Base Cabinets', description: parts.join(' '), qty, unit: 'linear ft', price, aiGenerated: true };
    }
    case 'TILE': {
      const qty = parseNum(a[4]) || 100;
      const parts = [
        a[1] || materials[0] || 'porcelain',
        a[0] && `${a[0]} tile`,
        a[3] && `— ${a[3]} pattern`,
        a[2] && `(${a[2]} finish)`,
        a[4] && `| ${a[4]} sqft`,
      ].filter(Boolean);
      return { section: 'Floor Tile', description: parts.join(' '), qty, unit: 'sqft', price, aiGenerated: true };
    }
    case 'FLOORING': {
      const qty = parseNum(a[4]) || 200;
      const parts = [
        a[0] || 'Hardwood',
        'flooring —',
        a[1] || materials[0] || '',
        a[2] && `(${a[2]})`,
        a[3] && `${a[3]} plank`,
        a[4] && `| ${a[4]} sqft`,
      ].filter(Boolean);
      return { section: sections[0], description: parts.join(' '), qty, unit: 'sqft', price, aiGenerated: true };
    }
    case 'PAINTING': {
      const parts = [
        a[0] || 'Interior',
        'painting —',
        a[1] || 'walls & ceilings',
        a[2] && `| ${a[2]}`,
        a[3] && `${a[3]} sheen`,
        a[4] && `| Prep: ${a[4]}`,
      ].filter(Boolean);
      return { section: 'Interior Walls', description: parts.join(' '), qty: 400, unit: 'sqft', price, aiGenerated: true };
    }
    case 'REMODELING': {
      const parts = [
        a[0] || 'Full remodel',
        a[1] && `— ${a[1]} sqft`,
        a[2] && `| ${a[2]}`,
        a[3] && `| ${a[3]}`,
        a[4] && `| Due: ${a[4]}`,
      ].filter(Boolean);
      return { section: 'Demo & Prep', description: parts.join(' '), qty: 1, unit: 'job', price, aiGenerated: true };
    }
    case 'DESIGN': {
      const parts = [
        a[0] || 'Custom',
        'interior design —',
        a[1] || 'full scope',
        a[2] && `(${a[2]})`,
        a[3] && `| Budget: ${a[3]}`,
        a[4] && `| Note: ${a[4]}`,
      ].filter(Boolean);
      return { section: 'Concept & Design', description: parts.join(' '), qty: 1, unit: 'lot', price, aiGenerated: true };
    }
    default: {
      return { section: sections[0], description: a.filter(Boolean).join(' — '), qty: 1, unit: units[0], price, aiGenerated: true };
    }
  }
}

function SubPicker({ subs, onSelect, onClose }: { subs: any[]; onSelect: (s: any) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);
  const filtered = subs.filter(s => s.status === 'ACTIVE' && (!q || (s.firstName+' '+s.lastName+' '+s.company+' '+s.trade).toLowerCase().includes(q.toLowerCase())));
  return (
    <div ref={ref} style={{ position:'absolute',right:0,top:36,zIndex:50,width:224,background:'white',border:'1px solid #E8E4DF',borderRadius:10,boxShadow:'0 8px 32px rgba(0,0,0,0.12)',overflow:'hidden' }}>
      <div style={{ padding:8,borderBottom:'1px solid #E8E4DF' }}>
        <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search subs..."
          style={{ width:'100%',height:28,background:'#F8F6F3',border:'1px solid #E8E4DF',borderRadius:7,padding:'0 8px',fontSize:12,outline:'none',boxSizing:'border-box' }} />
      </div>
      <div style={{ maxHeight:192,overflowY:'auto' }}>
        {filtered.length===0
          ? <p style={{ textAlign:'center',padding:12,fontSize:11,color:'#9CA3AF' }}>No subs found</p>
          : filtered.map(s=>(
            <button key={s.id} onClick={()=>{onSelect(s);onClose();}}
              style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'8px 12px',background:'none',border:'none',borderBottom:'1px solid #F8F6F3',cursor:'pointer',textAlign:'left' }}
              onMouseEnter={e=>e.currentTarget.style.background='#F8F6F3'}
              onMouseLeave={e=>e.currentTarget.style.background='none'}>
              <span style={{ fontSize:12,fontWeight:600,color:'#1A1A2E',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{s.firstName} {s.lastName}</span>
              <span style={{ fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:20,flexShrink:0,background:(TRADE_COLOR[s.trade]||'#6B7280')+'33',color:TRADE_COLOR[s.trade]||'#6B7280' }}>{s.trade}</span>
            </button>
          ))}
      </div>
    </div>
  );
}

function AIItemPanel({ niche, onClose, onApply }: {
  niche: string;
  onClose: () => void;
  onApply: (item: Omit<LineItem, 'id' | 'niche'>) => void;
}) {
  const questions = AI_QUESTIONS[niche] || [];
  const [answers, setAnswers] = useState<string[]>(questions.map(() => ''));
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Omit<LineItem, 'id' | 'niche'> | null>(null);
  const nicheInfo = NICHES.find(n => n.id === niche);
  const color = nicheInfo?.color || '#C4685A';
  const allEmpty = answers.every(a => !a.trim());

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setPreview(buildAIItem(niche, answers));
    setLoading(false);
  };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:16 }} onClick={onClose}>
      <div style={{ background:'white',borderRadius:16,width:'100%',maxWidth:520,border:'1px solid #E8E4DF',overflow:'hidden',maxHeight:'90vh',display:'flex',flexDirection:'column' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'16px 20px',borderBottom:'1px solid #E8E4DF',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#F8F6F3' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:34,height:34,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',background:color+'20' }}>
              {nicheInfo && <nicheInfo.icon size={16} color={color}/>}
            </div>
            <div>
              <div style={{ fontSize:14,fontWeight:700,color:'#1A1A2E' }}>AI Item Builder</div>
              <div style={{ fontSize:11,color:'#9CA3AF' }}>{nicheInfo?.label} · Answer 5 questions to generate a description</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'#9CA3AF',padding:4 }}><X size={18}/></button>
        </div>

        <div style={{ padding:20,overflowY:'auto',flex:1 }}>
          {!preview ? (
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              {questions.map((q, i) => (
                <div key={i}>
                  <label style={{ display:'block',fontSize:12,fontWeight:600,color:'#374151',marginBottom:5 }}>
                    <span style={{ display:'inline-block',width:20,height:20,borderRadius:'50%',background:answers[i].trim()?color:'#E8E4DF',color:answers[i].trim()?'white':'#9CA3AF',fontSize:11,fontWeight:700,textAlign:'center',lineHeight:'20px',marginRight:8 }}>{i+1}</span>
                    {q}
                  </label>
                  <input
                    value={answers[i]}
                    onChange={e => { const a=[...answers]; a[i]=e.target.value; setAnswers(a); }}
                    placeholder="Your answer..."
                    style={{ width:'100%',height:36,background:'#FAF9F7',border:'1px solid #E8E4DF',borderRadius:8,padding:'0 12px',fontSize:13,outline:'none',boxSizing:'border-box' }}
                    onFocus={e => e.target.style.borderColor=color}
                    onBlur={e => e.target.style.borderColor='#E8E4DF'}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:16,padding:'10px 14px',background:'#EAFAF3',borderRadius:8,border:'1px solid #C6F0DE' }}>
                <Sparkles size={14} color="#34C78A"/>
                <span style={{ fontSize:13,fontWeight:600,color:'#1A1A2E' }}>Item description generated</span>
              </div>
              <div style={{ padding:'14px 16px',background:'#F8F6F3',borderRadius:10,border:'1px solid #E8E4DF' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:8 }}>
                  <span style={{ fontSize:11,fontWeight:700,color,textTransform:'uppercase',letterSpacing:0.5 }}>{preview.section}</span>
                  <span style={{ fontSize:14,fontWeight:700,color:'#C4685A' }}>{fmt(preview.qty*preview.price)}</span>
                </div>
                <p style={{ fontSize:13,color:'#1A1A2E',lineHeight:1.5,margin:'0 0 8px' }}>{preview.description}</p>
                <div style={{ fontSize:11,color:'#9CA3AF' }}>{preview.qty} {preview.unit} × {fmt(preview.price)}</div>
              </div>
              <button onClick={()=>setPreview(null)}
                style={{ marginTop:12,background:'none',border:'none',cursor:'pointer',fontSize:12,color:'#9CA3AF',textDecoration:'underline',padding:0 }}>
                ← Revise answers
              </button>
            </div>
          )}
        </div>

        <div style={{ padding:'14px 20px',borderTop:'1px solid #E8E4DF',display:'flex',gap:8,justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ height:36,padding:'0 16px',border:'1px solid #E8E4DF',borderRadius:8,background:'white',fontSize:13,fontWeight:600,color:'#6B7280',cursor:'pointer' }}>Cancel</button>
          {!preview ? (
            <button onClick={handleGenerate} disabled={loading||allEmpty}
              style={{ height:36,padding:'0 20px',border:'none',borderRadius:8,background:loading||allEmpty?'#E8E4DF':color,color:loading||allEmpty?'#9CA3AF':'white',fontSize:13,fontWeight:700,cursor:loading||allEmpty?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:6 }}>
              <Sparkles size={13}/>{loading?'Generating...':'Generate Description'}
            </button>
          ) : (
            <button onClick={()=>{onApply(preview);onClose();}}
              style={{ height:36,padding:'0 20px',border:'none',borderRadius:8,background:'#C4685A',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6 }}>
              <Plus size={13}/>Add to Quote
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewQuotePage() {
  const [clientId,  setClientId]  = useState('');
  const [niches,    setNiches]    = useState<string[]>([]);
  const [title,     setTitle]     = useState('');
  const [notes,     setNotes]     = useState('');
  const [exclusions,setExclusions]= useState('');
  const [loading,   setLoading]   = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [aiForNiche,setAiForNiche]= useState<string|null>(null);
  const [pickerForItem,setPickerForItem] = useState<string|null>(null);
  const [subs,      setSubs]      = useState<any[]>([]);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [matCols,   setMatCols]   = useState<Set<string>>(new Set());
  const [items,     setItems]     = useState<LineItem[]>([]);

  useEffect(() => {
    apiFetch('/subcontractors').then(r=>r.json()).then(d=>{if(Array.isArray(d))setSubs(d);}).catch(()=>{});
  }, []);

  const toggleNiche = (nicheId: string) => {
    const active = niches.includes(nicheId);
    if (active) {
      setNiches(prev => prev.filter(n => n !== nicheId));
    } else {
      setNiches(prev => [...prev, nicheId]);
      const hasItems = items.some(i => i.niche === nicheId);
      if (!hasItems) {
        setItems(p => [...p, {
          id: Date.now().toString(),
          niche: nicheId,
          section: SECTIONS_BY_NICHE[nicheId]?.[0] || 'Other',
          description: '',
          qty: 1,
          unit: UNITS_BY_NICHE[nicheId]?.[0] || 'job',
          price: 0,
        }]);
      }
    }
  };

  const toggleCollapse = (id: string) =>
    setCollapsed(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);

  const toggleMatCols = (id: string) =>
    setMatCols(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const addItem = (nicheId: string) =>
    setItems(p => [...p, {
      id: Date.now().toString(),
      niche: nicheId,
      section: SECTIONS_BY_NICHE[nicheId]?.[0] || 'Other',
      description: '',
      qty: 1,
      unit: UNITS_BY_NICHE[nicheId]?.[0] || 'job',
      price: 0,
    }]);

  const removeItem  = (id: string) => setItems(p => p.filter(i => i.id !== id));
  const updateItem  = (id: string, key: string, value: any) => setItems(p => p.map(i => i.id===id ? {...i,[key]:value} : i));
  const assignSub   = (itemId: string, sub: any) => setItems(p => p.map(i => i.id===itemId ? {...i,subcontractorId:sub.id,subcontractorName:sub.firstName+' '+sub.lastName,subcontractorTrade:sub.trade} : i));
  const clearSub    = (itemId: string) => setItems(p => p.map(i => i.id===itemId ? {...i,subcontractorId:undefined,subcontractorName:undefined,subcontractorTrade:undefined} : i));
  const applyAIItem = (nicheId: string, data: Omit<LineItem,'id'|'niche'>) =>
    setItems(p => [...p, { id: Date.now().toString(), niche: nicheId, ...data }]);

  const subtotal = items.reduce((a,i) => a+i.qty*i.price, 0);

  const handleSave = async (action: string) => {
    setLoading(true);
    try {
      const res = await apiFetch('/quotes', {
        method: 'POST',
        body: JSON.stringify({
          clientId: clientId||null,
          serviceType: niches[0]||'OTHER',
          title: title||'New Quote',
          subtotal, total: subtotal,
          items: items.map(i => ({
            section: i.section, description: i.description,
            qty: i.qty, unit: i.unit, price: i.price,
            amount: i.qty*i.price,
            material: i.material||null, finish: i.finish||null,
            subcontractorId: i.subcontractorId||null,
            subcontractorName: i.subcontractorName||null,
          })),
        }),
      });
      const data = await res.json();
      if (data.error) { alert('Error: '+data.error); setLoading(false); return; }
      setSaved(true);
      setTimeout(() => { window.location.href='/quotes'; }, 1000);
    } catch { alert('Error saving.'); setLoading(false); }
  };

  const lbl = 'block text-[11px] font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide';

  if (saved) return (
    <div style={{ minHeight:'100vh',background:'#F8F6F3',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:64,height:64,borderRadius:'50%',background:'rgba(52,199,138,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
          <FileText size={28} color="#34C78A"/>
        </div>
        <h2 style={{ fontSize:20,fontWeight:800,color:'#1A1A2E',marginBottom:8 }}>Quote Saved!</h2>
        <p style={{ color:'#6B7280',fontSize:14 }}>Redirecting...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      <header className="bg-white border-b border-[#E8E4DF] h-14 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0 overflow-hidden">
          <a href="/quotes" className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#1A1A2E] transition-colors flex-shrink-0" style={{ textDecoration:'none' }}>
            <ChevronLeft size={16}/><span className="text-[13px] font-medium">Quotes</span>
          </a>
          <span className="text-[#D1D5DB] flex-shrink-0">/</span>
          <span className="text-[13px] font-semibold text-[#1A1A2E] flex-shrink-0">New Quote</span>
          <div className="flex items-center gap-1 flex-wrap">
            {niches.map(id => {
              const n = NICHES.find(n => n.id===id);
              return n ? <span key={id} style={{ fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:n.color+'20',color:n.color,whiteSpace:'nowrap' }}>{n.label}</span> : null;
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={()=>handleSave('draft')} disabled={loading} className="flex items-center gap-2 h-9 px-4 rounded-[9px] border border-[#E8E4DF] bg-[#FAF9F7] text-[13px] font-semibold text-[#6B7280] hover:text-[#1A1A2E] transition-all"><Save size={14}/>Save Draft</button>
          <button onClick={()=>handleSave('send')}  disabled={loading} className="flex items-center gap-2 h-9 px-4 rounded-[9px] bg-[#C4685A] text-white text-[13px] font-semibold hover:bg-[#B5564A] transition-all"><Send size={14}/>{loading?'Saving...':'Save & Send'}</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-5">
        {/* Quote Details */}
        <div className="bg-white rounded-[14px] border border-[#E8E4DF] p-5">
          <h2 className="text-[15px] font-bold text-[#1A1A2E] mb-4 flex items-center gap-2"><FileText size={15} color="#4F7EF7"/>Quote Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Client</label>
              <ClientAutocomplete value={clientId} onChange={id=>setClientId(id)} placeholder="Search or add client..."/>
            </div>
            <div>
              <label className={lbl}>
                Trade / Service{' '}
                <span style={{ color:'#9CA3AF',fontWeight:400,textTransform:'none',fontSize:10 }}>(select all that apply)</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {NICHES.map(n => {
                  const active = niches.includes(n.id);
                  return (
                    <button key={n.id} type="button" onClick={()=>toggleNiche(n.id)}
                      style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'8px 4px',borderRadius:9,border:'1px solid',borderColor:active?n.color:'#E8E4DF',background:active?n.color+'15':'white',cursor:'pointer',transition:'all 0.15s',position:'relative' }}>
                      {active && (
                        <span style={{ position:'absolute',top:4,right:4,width:14,height:14,borderRadius:'50%',background:n.color,display:'flex',alignItems:'center',justifyContent:'center' }}>
                          <Check size={9} color="white" strokeWidth={3}/>
                        </span>
                      )}
                      <n.icon size={14} color={active?n.color:'#9CA3AF'}/>
                      <span style={{ fontSize:10,fontWeight:600,color:active?n.color:'#6B7280',textAlign:'center',lineHeight:1.2 }}>{n.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="col-span-2">
              <label className={lbl}>Quote Title</label>
              <input className="w-full h-10 bg-[#FAF9F7] border border-[#E8E4DF] rounded-[9px] px-3 text-[13px] text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:border-[#C4685A] transition-all"
                placeholder="e.g. Kitchen & Flooring Remodel — Smith Residence" value={title} onChange={e=>setTitle(e.target.value)}/>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-[14px] border border-[#E8E4DF] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E4DF]">
            <h2 className="text-[15px] font-bold text-[#1A1A2E]">Line Items</h2>
            <span style={{ fontSize:12,color:'#9CA3AF' }}>{items.length} item{items.length!==1?'s':''}</span>
          </div>

          {niches.length===0 ? (
            <div style={{ padding:'40px 20px',textAlign:'center' }}>
              <div style={{ width:44,height:44,borderRadius:12,background:'#F3F4F6',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px' }}>
                <Hammer size={20} color="#9CA3AF"/>
              </div>
              <p style={{ fontSize:13,color:'#9CA3AF',margin:0 }}>Select a trade above to start adding line items</p>
            </div>
          ) : (
            niches.map((nicheId, ni) => {
              const nicheInfo = NICHES.find(n => n.id===nicheId)!;
              const nicheItems = items.filter(i => i.niche===nicheId);
              const isCollapsed = collapsed.includes(nicheId);
              const sections  = SECTIONS_BY_NICHE[nicheId]  || [];
              const units     = UNITS_BY_NICHE[nicheId]     || ['job'];
              const materials = MATERIALS_BY_NICHE[nicheId] || [];
              const finishes  = FINISHES_BY_NICHE[nicheId]  || [];
              const showMats  = matCols.has(nicheId);
              const nSubtotal = nicheItems.reduce((a,i)=>a+i.qty*i.price,0);
              const gridCols  = showMats
                ? '155px 1fr 115px 58px 58px 88px 78px 36px'
                : '155px 1fr 58px 58px 88px 78px 36px';

              return (
                <div key={nicheId} style={{ borderBottom: ni<niches.length-1 ? '2px solid #E8E4DF' : 'none' }}>
                  {/* Niche header */}
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 20px',background:nicheInfo.color+'08',borderBottom:isCollapsed?'none':'1px solid #E8E4DF' }}>
                    <button onClick={()=>toggleCollapse(nicheId)}
                      style={{ display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer',padding:0 }}>
                      {isCollapsed
                        ? <ChevronRight size={14} color="#9CA3AF"/>
                        : <ChevronDown  size={14} color="#9CA3AF"/>}
                      <div style={{ width:24,height:24,borderRadius:6,background:nicheInfo.color+'20',display:'flex',alignItems:'center',justifyContent:'center' }}>
                        <nicheInfo.icon size={12} color={nicheInfo.color}/>
                      </div>
                      <span style={{ fontSize:13,fontWeight:700,color:'#1A1A2E' }}>{nicheInfo.label}</span>
                      <span style={{ fontSize:11,color:'#9CA3AF' }}>{nicheItems.length} item{nicheItems.length!==1?'s':''}</span>
                      {nSubtotal>0 && <span style={{ fontSize:12,fontWeight:700,color:nicheInfo.color }}>{fmt(nSubtotal)}</span>}
                    </button>
                    <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                      {materials.length>0 && (
                        <button onClick={()=>toggleMatCols(nicheId)}
                          style={{ display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600,color:showMats?nicheInfo.color:'#9CA3AF',background:'#F8F6F3',border:'none',cursor:'pointer',padding:'3px 8px',borderRadius:6 }}>
                          <Package size={11}/>{showMats?'Hide Material':'Material'}
                        </button>
                      )}
                      <button onClick={()=>setAiForNiche(nicheId)}
                        style={{ display:'flex',alignItems:'center',gap:5,height:28,padding:'0 10px',borderRadius:7,border:'1px solid '+nicheInfo.color+'40',background:nicheInfo.color+'10',fontSize:11,fontWeight:600,color:nicheInfo.color,cursor:'pointer' }}>
                        <Sparkles size={11}/>AI Generate
                      </button>
                      <button onClick={()=>addItem(nicheId)}
                        style={{ display:'flex',alignItems:'center',gap:5,height:28,padding:'0 10px',borderRadius:7,background:'#FEF3EC',border:'none',fontSize:11,fontWeight:600,color:'#C4685A',cursor:'pointer' }}>
                        <Plus size={12}/>Add Item
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <>
                      {/* Column headers */}
                      <div style={{ display:'grid',gridTemplateColumns:gridCols,gap:6,padding:'8px 20px',background:'#FAFAF9',borderBottom:'1px solid #F3F4F6' }}>
                        {['Section','Description',...(showMats?['Material / Finish']:[]),'Qty','Unit','Unit Price','Total',''].map((h,i)=>(
                          <div key={i} style={{ fontSize:10,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:0.5 }}>{h}</div>
                        ))}
                      </div>

                      {nicheItems.length===0 && (
                        <div style={{ padding:'24px 20px',textAlign:'center' }}>
                          <button onClick={()=>addItem(nicheId)}
                            style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'10px 24px',borderRadius:9,border:'2px dashed '+nicheInfo.color+'50',background:nicheInfo.color+'08',color:nicheInfo.color,fontSize:13,fontWeight:600,cursor:'pointer' }}>
                            <Plus size={16}/>Add first item
                          </button>
                          <p style={{ fontSize:11,color:'#9CA3AF',margin:'8px 0 0' }}>or use AI Generate to build items from a description</p>
                        </div>
                      )}

                      {nicheItems.length > 0 && nicheItems.map(item => (
                        <div key={item.id} style={{ borderBottom:'1px solid #F3F4F6' }}
                          onMouseEnter={e=>e.currentTarget.style.background='#FAFAFA'}
                          onMouseLeave={e=>e.currentTarget.style.background='white'}>
                          <div style={{ display:'grid',gridTemplateColumns:gridCols,gap:6,padding:'8px 20px',alignItems:'center' }}>
                            <select value={item.section} onChange={e=>updateItem(item.id,'section',e.target.value)}
                              style={{ width:'100%',height:32,background:'#F8F6F3',border:'1px solid #E8E4DF',borderRadius:7,padding:'0 6px',fontSize:11.5,color:'#374151',outline:'none' }}>
                              {sections.map(s=><option key={s}>{s}</option>)}
                            </select>
                            <div style={{ display:'flex',alignItems:'center',gap:4 }}>
                              <input value={item.description} onChange={e=>updateItem(item.id,'description',e.target.value)} placeholder="Describe item..."
                                style={{ width:'100%',height:32,background:'#F8F6F3',border:'1px solid #E8E4DF',borderRadius:7,padding:'0 10px',fontSize:12.5,color:'#1A1A2E',outline:'none',boxSizing:'border-box' }}/>
                              {item.aiGenerated && <Sparkles size={11} color="#C4685A" style={{ flexShrink:0 }}/>}
                            </div>
                            {showMats && (
                              <div style={{ display:'flex',flexDirection:'column',gap:2 }}>
                                <select value={item.material||''} onChange={e=>updateItem(item.id,'material',e.target.value)}
                                  style={{ width:'100%',height:15,background:'#F8F6F3',border:'1px solid #E8E4DF',borderRadius:4,padding:'0 4px',fontSize:10,color:'#374151',outline:'none' }}>
                                  <option value="">Material...</option>
                                  {materials.map(m=><option key={m}>{m}</option>)}
                                </select>
                                <select value={item.finish||''} onChange={e=>updateItem(item.id,'finish',e.target.value)}
                                  style={{ width:'100%',height:15,background:'#F8F6F3',border:'1px solid #E8E4DF',borderRadius:4,padding:'0 4px',fontSize:10,color:'#374151',outline:'none' }}>
                                  <option value="">Finish...</option>
                                  {finishes.map(f=><option key={f}>{f}</option>)}
                                </select>
                              </div>
                            )}
                            <input type="number" value={item.qty} onChange={e=>updateItem(item.id,'qty',parseFloat(e.target.value)||0)}
                              style={{ width:'100%',height:32,background:'#F8F6F3',border:'1px solid #E8E4DF',borderRadius:7,padding:'0 6px',fontSize:12.5,textAlign:'center',outline:'none' }}/>
                            <select value={item.unit} onChange={e=>updateItem(item.id,'unit',e.target.value)}
                              style={{ width:'100%',height:32,background:'#F8F6F3',border:'1px solid #E8E4DF',borderRadius:7,padding:'0 4px',fontSize:11,color:'#374151',outline:'none' }}>
                              {units.map(u=><option key={u}>{u}</option>)}
                            </select>
                            <div style={{ position:'relative' }}>
                              <span style={{ position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',fontSize:11,color:'#9CA3AF' }}>$</span>
                              <input type="number" value={item.price} onChange={e=>updateItem(item.id,'price',parseFloat(e.target.value)||0)}
                                style={{ width:'100%',height:32,background:'#F8F6F3',border:'1px solid #E8E4DF',borderRadius:7,paddingLeft:18,paddingRight:6,fontSize:12.5,textAlign:'right',outline:'none',boxSizing:'border-box' }}/>
                            </div>
                            <div style={{ fontSize:13,fontWeight:600,color:'#1A1A2E',textAlign:'right' }}>{fmt(item.qty*item.price)}</div>
                            <div style={{ display:'flex',alignItems:'center',justifyContent:'flex-end',gap:2,position:'relative' }}>
                              <button type="button" onClick={()=>setPickerForItem(pickerForItem===item.id?null:item.id)}
                                style={{ width:28,height:28,borderRadius:6,border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:item.subcontractorId?'#FEF3EC':'#F8F6F3',color:item.subcontractorId?'#C4685A':'#9CA3AF' }}>
                                <UserPlus size={12}/>
                              </button>
                              {pickerForItem===item.id && (
                                <SubPicker subs={subs} onSelect={sub=>{assignSub(item.id,sub);setPickerForItem(null);}} onClose={()=>setPickerForItem(null)}/>
                              )}
                              <button onClick={()=>removeItem(item.id)}
                                style={{ width:28,height:28,borderRadius:6,border:'none',background:'#F8F6F3',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                                <Trash2 size={12} color="#F0584C"/>
                              </button>
                            </div>
                          </div>
                          {item.subcontractorId && (
                            <div style={{ padding:'0 20px 8px',display:'flex',alignItems:'center',gap:6 }}>
                              <span style={{ fontSize:10,color:'#9CA3AF',fontWeight:600 }}>Sub:</span>
                              <span style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:10.5,fontWeight:600,padding:'2px 8px',borderRadius:20,background:(TRADE_COLOR[item.subcontractorTrade||'']||'#6B7280')+'22',color:TRADE_COLOR[item.subcontractorTrade||'']||'#6B7280' }}>{item.subcontractorName} · {item.subcontractorTrade}</span>
                              <button onClick={()=>clearSub(item.id)} style={{ background:'none',border:'none',cursor:'pointer',color:'#9CA3AF',display:'flex',padding:0 }}><X size={11}/></button>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Bottom add-item bar — always visible when section is open */}
                      <div style={{ padding:'8px 20px',borderTop:'1px solid #F3F4F6' }}>
                        <button onClick={()=>addItem(nicheId)}
                          style={{ display:'flex',alignItems:'center',gap:6,width:'100%',padding:'8px 12px',borderRadius:8,border:'1px dashed #E8E4DF',background:'transparent',color:'#9CA3AF',fontSize:12,fontWeight:600,cursor:'pointer',justifyContent:'center',transition:'all 0.15s' }}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=nicheInfo.color+'80';e.currentTarget.style.color=nicheInfo.color;e.currentTarget.style.background=nicheInfo.color+'08';}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor='#E8E4DF';e.currentTarget.style.color='#9CA3AF';e.currentTarget.style.background='transparent';}}>
                          <Plus size={13}/>+ Add Line Item
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}

          {niches.length>0 && (
            <div style={{ display:'flex',justifyContent:'flex-end',padding:'16px 20px',borderTop:'1px solid #E8E4DF' }}>
              <div style={{ width:260 }}>
                {niches.length>1 && niches.map(nicheId => {
                  const n = NICHES.find(n=>n.id===nicheId)!;
                  const t = items.filter(i=>i.niche===nicheId).reduce((a,i)=>a+i.qty*i.price,0);
                  return t>0 ? (
                    <div key={nicheId} style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                      <span style={{ fontSize:11,color:n.color,fontWeight:600 }}>{n.label}</span>
                      <span style={{ fontSize:11,color:'#6B7280' }}>{fmt(t)}</span>
                    </div>
                  ) : null;
                })}
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6,paddingTop:niches.length>1?8:0,borderTop:niches.length>1?'1px dashed #E8E4DF':'none' }}>
                  <span style={{ fontSize:13,color:'#6B7280' }}>Subtotal</span>
                  <span style={{ fontSize:13,fontWeight:600,color:'#1A1A2E' }}>{fmt(subtotal)}</span>
                </div>
                <div style={{ display:'flex',justifyContent:'space-between',borderTop:'2px solid #E8E4DF',paddingTop:10 }}>
                  <span style={{ fontSize:15,fontWeight:700,color:'#1A1A2E' }}>Total</span>
                  <span style={{ fontSize:22,fontWeight:800,color:'#C4685A' }}>{fmt(subtotal)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes & Exclusions */}
        <div className="bg-white rounded-[14px] border border-[#E8E4DF] p-5">
          <h2 className="text-[15px] font-bold text-[#1A1A2E] mb-4">Notes & Exclusions</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Scope Notes</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Additional details, allowances, lead times..."
                style={{ width:'100%',height:88,background:'#FAF9F7',border:'1px solid #E8E4DF',borderRadius:9,padding:'10px 12px',fontSize:13,color:'#1A1A2E',resize:'none',outline:'none',boxSizing:'border-box' }}/>
            </div>
            <div>
              <label className={lbl}>Exclusions</label>
              <textarea value={exclusions} onChange={e=>setExclusions(e.target.value)} placeholder="What is NOT included..."
                style={{ width:'100%',height:88,background:'#FAF9F7',border:'1px solid #E8E4DF',borderRadius:9,padding:'10px 12px',fontSize:13,color:'#1A1A2E',resize:'none',outline:'none',boxSizing:'border-box' }}/>
            </div>
          </div>
        </div>

        <div style={{ display:'flex',justifyContent:'flex-end',gap:10,paddingBottom:32 }}>
          <a href="/quotes" style={{ display:'flex',alignItems:'center',height:40,padding:'0 20px',borderRadius:9,border:'1px solid #E8E4DF',fontSize:13,fontWeight:600,color:'#6B7280',textDecoration:'none' }}>Cancel</a>
          <button onClick={()=>handleSave('draft')} disabled={loading} style={{ display:'flex',alignItems:'center',gap:6,height:40,padding:'0 20px',borderRadius:9,border:'1px solid #E8E4DF',background:'#FAF9F7',fontSize:13,fontWeight:600,color:'#6B7280',cursor:'pointer' }}><Save size={14}/>Save Draft</button>
          <button onClick={()=>handleSave('send')}  disabled={loading} style={{ display:'flex',alignItems:'center',gap:6,height:40,padding:'0 20px',borderRadius:9,border:'none',background:'#C4685A',color:'white',fontSize:13,fontWeight:700,cursor:'pointer' }}><Send size={14}/>{loading?'Saving...':'Save & Send'}</button>
        </div>
      </div>

      {aiForNiche && (
        <AIItemPanel
          niche={aiForNiche}
          onClose={()=>setAiForNiche(null)}
          onApply={data=>applyAIItem(aiForNiche, data)}
        />
      )}
    </div>
  );
}
