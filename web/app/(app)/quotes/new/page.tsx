'use client';
import { useState, useEffect, useRef } from 'react';
import {
  FileText, Plus, Trash2, ChevronLeft, Send, Save,
  UserPlus, X, Sparkles, Package,
  Layers, Paintbrush, Hammer, Sofa, Grid3x3
} from 'lucide-react';
import ClientAutocomplete from '../../../../components/ClientAutocomplete';
import { apiFetch } from '../../../../lib/api';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

interface LineItem {
  id: string;
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
  { id: 'REMODELING', label: 'Remodeling',      icon: Hammer,     color: '#E8834A' },
  { id: 'DESIGN',     label: 'Interior Design', icon: Sofa,       color: '#EC4899' },
];

const SECTIONS_BY_NICHE = {
  CABINETS:   ['Base Cabinets','Wall Cabinets','Tall Cabinets','Island','Countertops','Hardware','Crown Molding','Installation','Demo & Removal','Other'],
  TILE:       ['Floor Tile','Wall Tile','Shower/Tub','Backsplash','Grout & Sealer','Waterproofing','Demo & Removal','Installation','Other'],
  FLOORING:   ['Hardwood','LVP / LVT','Tile Floor','Carpet','Subfloor Prep','Transitions','Baseboards','Demo & Removal','Other'],
  PAINTING:   ['Interior Walls','Ceilings','Trim & Doors','Cabinets','Exterior','Pressure Wash','Primer','Other'],
  REMODELING: ['Demo & Prep','Framing & Drywall','Plumbing','Electrical','Tile & Flooring','Cabinetry','Countertops','Paint & Finish','Fixtures & Hardware','Cleanup','Other'],
  DESIGN:     ['Concept & Design','Material Selection','Procurement','Furniture','Lighting','Accessories','Installation Management','Other'],
};

const UNITS_BY_NICHE = {
  CABINETS:   ['linear ft','cabinet','door','drawer','lot','ea','job'],
  TILE:       ['sqft','sqyd','lot','ea','job'],
  FLOORING:   ['sqft','sqyd','lnft','room','lot','job'],
  PAINTING:   ['sqft','room','door','window','lot','job'],
  REMODELING: ['job','sqft','lnft','hr','ea','lot'],
  DESIGN:     ['hr','lot','project','item','job'],
};

const MATERIALS_BY_NICHE = {
  CABINETS:   ['Solid Wood','Plywood','MDF','Thermofoil','Acrylic','Melamine','Other'],
  TILE:       ['Porcelain','Ceramic','Marble','Travertine','Slate','Glass','Quartzite','Other'],
  FLOORING:   ['White Oak','Red Oak','Maple','Walnut','LVP','LVT','Porcelain','Carpet','Other'],
  PAINTING:   ['Sherwin-Williams','Benjamin Moore','Behr','PPG','Other'],
  REMODELING: [],
  DESIGN:     [],
};

const FINISHES_BY_NICHE = {
  CABINETS:   ['Painted','Stained','Natural','Glazed','Distressed','Two-Tone'],
  TILE:       ['Polished','Matte','Satin','Honed','Textured','Brushed'],
  FLOORING:   ['Smooth','Hand-Scraped','Wire-Brushed','Satin','Gloss','Matte'],
  PAINTING:   ['Flat','Eggshell','Satin','Semi-Gloss','Gloss'],
  REMODELING: [],
  DESIGN:     [],
};

const TRADE_COLOR = {
  Electrical:'#F5A623', Plumbing:'#0EA5E9', HVAC:'#E8834A', Framing:'#34C78A',
  Flooring:'#EC4899', Painting:'#10B981', Tile:'#8B5CF6', Cabinets:'#F59E0B', Other:'#6B7280',
};

const AI_QUESTIONS = {
  CABINETS:   ['Style? (Shaker, Flat Front, Raised Panel)','Material? (Solid Wood, Plywood, MDF)','Finish? (Painted, Stained, Natural)','Linear footage of base cabinets?','Any island or special pieces?'],
  TILE:       ['Tile size? (e.g. 12x24, 24x48)','Material? (Porcelain, Marble, Ceramic)','Finish? (Polished, Matte, Honed)','Pattern? (Straight, Herringbone, Offset)','Total sqft?'],
  FLOORING:   ['Type? (Hardwood, LVP, Tile, Carpet)','Species/Product? (White Oak, Maple, etc.)','Finish? (Pre-finished, Site-finished)','Width? (3", 5", 7.5")','Total sqft?'],
  PAINTING:   ['Interior or exterior?','How many rooms/areas?','Include ceilings? Trim? Doors?','Paint brand preference?','Any repairs needed before painting?'],
  REMODELING: ['Scope of work?','Kitchen, bathroom, or full remodel?','Approximate sqft?','Structural changes needed?','Timeline?'],
  DESIGN:     ['Style preference? (Modern, Traditional, Transitional)','Rooms in scope?','Full design or consulting only?','Budget range?','Procurement included?'],
};

function SubPicker({ subs, onSelect, onClose }: { subs: any[]; onSelect: (s: any) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
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
        {filtered.length===0 ? <p style={{ textAlign:'center',padding:12,fontSize:11,color:'#9CA3AF' }}>No subs found</p>
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

function AIPanel({ niche, onClose, onApply }: { niche: string; onClose: () => void; onApply: (items: any[]) => void }) {
  const questions = AI_QUESTIONS[niche] || [];
  const [answers, setAnswers] = useState(questions.map(()=>''));
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<any[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise(r=>setTimeout(r,1600));
    const sections = SECTIONS_BY_NICHE[niche] || [];
    const units = UNITS_BY_NICHE[niche] || ['job'];
    const materials = MATERIALS_BY_NICHE[niche] || [];
    const finishes = FINISHES_BY_NICHE[niche] || [];
    const prices = { CABINETS:[180,380],TILE:[12,28],FLOORING:[8,22],PAINTING:[2.5,5],REMODELING:[1800,4500],DESIGN:[85,150] };
    const [lo,hi] = prices[niche]||[50,200];
    const generated = sections.slice(0,4).map((sec,i)=>({
      id:'ai-'+Date.now()+'-'+i,
      section:sec,
      description:sec+' — '+(materials[i%materials.length]||'')+' '+(finishes[i%finishes.length]||''),
      qty: niche==='TILE'||niche==='FLOORING'?200:niche==='PAINTING'?400:1,
      unit:units[0],
      price:Math.round((lo+Math.random()*(hi-lo))*100)/100,
      material:materials[0]||'',
      finish:finishes[0]||'',
      aiGenerated:true,
    }));
    setGeneratedItems(generated);
    setLoading(false);
    setDone(true);
  };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:16 }} onClick={onClose}>
      <div style={{ background:'white',borderRadius:16,width:'100%',maxWidth:500,border:'1px solid #E8E4DF',overflow:'hidden',maxHeight:'88vh',display:'flex',flexDirection:'column' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'16px 20px',borderBottom:'1px solid #E8E4DF',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#F8F6F3' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <div style={{ width:32,height:32,borderRadius:8,background:'#FEF3EC',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Sparkles size={16} color="#E8834A"/>
            </div>
            <div>
              <div style={{ fontSize:14,fontWeight:700,color:'#1A1A2E' }}>AI Quote Assistant</div>
              <div style={{ fontSize:11,color:'#9CA3AF' }}>{NICHES.find(n=>n.id===niche)?.label} — Answer to generate items</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'#9CA3AF' }}><X size={18}/></button>
        </div>
        <div style={{ padding:20,overflowY:'auto',flex:1 }}>
          {!done ? (
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {questions.map((q,i)=>(
                <div key={i}>
                  <label style={{ display:'block',fontSize:12,fontWeight:600,color:'#374151',marginBottom:5 }}>
                    <span style={{ display:'inline-block',width:20,height:20,borderRadius:'50%',background:answers[i]?'#E8834A':'#E8E4DF',color:answers[i]?'white':'#9CA3AF',fontSize:11,fontWeight:700,textAlign:'center',lineHeight:'20px',marginRight:8 }}>{i+1}</span>
                    {q}
                  </label>
                  <input value={answers[i]} onChange={e=>{const a=[...answers];a[i]=e.target.value;setAnswers(a);}} placeholder="Your answer..."
                    style={{ width:'100%',height:36,background:'#FAF9F7',border:'1px solid #E8E4DF',borderRadius:8,padding:'0 12px',fontSize:13,outline:'none',boxSizing:'border-box' }}
                    onFocus={e=>e.target.style.borderColor='#E8834A'}
                    onBlur={e=>e.target.style.borderColor='#E8E4DF'} />
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14,padding:'8px 12px',background:'#EAFAF3',borderRadius:8 }}>
                <Sparkles size={14} color="#34C78A"/>
                <span style={{ fontSize:13,fontWeight:600,color:'#1A1A2E' }}>{generatedItems.length} items generated</span>
              </div>
              {generatedItems.map((item,i)=>(
                <div key={i} style={{ padding:'10px 12px',background:'#F8F6F3',borderRadius:8,marginBottom:8,border:'1px solid #E8E4DF' }}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:2 }}>
                    <span style={{ fontSize:12,fontWeight:700,color:'#1A1A2E' }}>{item.section}</span>
                    <span style={{ fontSize:13,fontWeight:700,color:'#E8834A' }}>{fmt(item.qty*item.price)}</span>
                  </div>
                  <div style={{ fontSize:11,color:'#6B7280' }}>{item.description.trim()}</div>
                  <div style={{ fontSize:11,color:'#9CA3AF',marginTop:2 }}>{item.qty} {item.unit} x {fmt(item.price)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding:'14px 20px',borderTop:'1px solid #E8E4DF',display:'flex',gap:8,justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ height:36,padding:'0 16px',border:'1px solid #E8E4DF',borderRadius:8,background:'white',fontSize:13,fontWeight:600,color:'#6B7280',cursor:'pointer' }}>Cancel</button>
          {!done ? (
            <button onClick={handleGenerate} disabled={loading||answers.every(a=>!a.trim())}
              style={{ height:36,padding:'0 20px',border:'none',borderRadius:8,background:loading?'#F0C4A8':'#E8834A',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6 }}>
              <Sparkles size={13}/>{loading?'Generating...':'Generate Items'}
            </button>
          ) : (
            <button onClick={()=>{onApply(generatedItems);onClose();}}
              style={{ height:36,padding:'0 20px',border:'none',borderRadius:8,background:'#E8834A',color:'white',fontSize:13,fontWeight:700,cursor:'pointer' }}>
              Apply to Quote →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewQuotePage() {
  const [clientId,setClientId]=useState('');
  const [niche,setNiche]=useState('');
  const [title,setTitle]=useState('');
  const [notes,setNotes]=useState('');
  const [exclusions,setExclusions]=useState('');
  const [loading,setLoading]=useState(false);
  const [saved,setSaved]=useState(false);
  const [showAI,setShowAI]=useState(false);
  const [pickerForItem,setPickerForItem]=useState<string|null>(null);
  const [subs,setSubs]=useState<any[]>([]);
  const [showMaterialCols,setShowMaterialCols]=useState(false);

  const sections  = niche ? SECTIONS_BY_NICHE[niche]  : SECTIONS_BY_NICHE.REMODELING;
  const units     = niche ? UNITS_BY_NICHE[niche]     : UNITS_BY_NICHE.REMODELING;
  const materials = niche ? MATERIALS_BY_NICHE[niche] : [];
  const finishes  = niche ? FINISHES_BY_NICHE[niche]  : [];

  const [items,setItems]=useState<LineItem[]>([
    { id:'1',section:'Demo & Prep',description:'',qty:1,unit:'job',price:0 },
  ]);

  useEffect(()=>{
    if(!niche)return;
    const ns=SECTIONS_BY_NICHE[niche]; const nu=UNITS_BY_NICHE[niche];
    setItems(prev=>prev.map(i=>({...i,section:ns[0],unit:nu[0]})));
    setShowMaterialCols(MATERIALS_BY_NICHE[niche].length>0);
  },[niche]);

  useEffect(()=>{
    apiFetch('/subcontractors').then(r=>r.json()).then(d=>{if(Array.isArray(d))setSubs(d);}).catch(()=>{});
  },[]);

  const addItem=()=>setItems(p=>[...p,{id:Date.now().toString(),section:sections[0]||'Other',description:'',qty:1,unit:units[0]||'job',price:0}]);
  const removeItem=(id)=>setItems(p=>p.filter(i=>i.id!==id));
  const updateItem=(id,key,value)=>setItems(p=>p.map(i=>i.id===id?{...i,[key]:value}:i));
  const assignSub=(itemId,sub)=>setItems(p=>p.map(i=>i.id===itemId?{...i,subcontractorId:sub.id,subcontractorName:sub.firstName+' '+sub.lastName,subcontractorTrade:sub.trade}:i));
  const clearSub=(itemId)=>setItems(p=>p.map(i=>i.id===itemId?{...i,subcontractorId:undefined,subcontractorName:undefined,subcontractorTrade:undefined}:i));
  const applyAIItems=(aiItems)=>setItems(prev=>[...prev.filter(i=>i.description),...aiItems]);
  const subtotal=items.reduce((a,i)=>a+i.qty*i.price,0);

  const handleSave=async(action: string)=>{
    setLoading(true);
    try {
      const res=await apiFetch('/quotes',{method:'POST',body:JSON.stringify({clientId:clientId||null,serviceType:niche||'OTHER',title:title||'New Quote',subtotal,total:subtotal,items:items.map(i=>({section:i.section,description:i.description,qty:i.qty,unit:i.unit,price:i.price,amount:i.qty*i.price,material:i.material||null,finish:i.finish||null,subcontractorId:i.subcontractorId||null,subcontractorName:i.subcontractorName||null}))})});
      const data=await res.json();
      if(data.error){alert('Error: '+data.error);setLoading(false);return;}
      setSaved(true);
      setTimeout(()=>{window.location.href='/quotes';},1000);
    } catch{alert('Error saving.');setLoading(false);}
  };

  const lbl='block text-[11px] font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide';
  const selectedNiche=NICHES.find(n=>n.id===niche);

  if(saved)return(
    <div style={{minHeight:'100vh',background:'#F8F6F3',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(52,199,138,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
          <FileText size={28} color="#34C78A"/>
        </div>
        <h2 style={{fontSize:20,fontWeight:800,color:'#1A1A2E',marginBottom:8}}>Quote Saved!</h2>
        <p style={{color:'#6B7280',fontSize:14}}>Redirecting...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      <header className="bg-white border-b border-[#E8E4DF] h-14 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <a href="/quotes" className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#1A1A2E] transition-colors" style={{textDecoration:'none'}}>
            <ChevronLeft size={16}/><span className="text-[13px] font-medium">Quotes</span>
          </a>
          <span className="text-[#D1D5DB]">/</span>
          <span className="text-[13px] font-semibold text-[#1A1A2E]">New Quote</span>
          {selectedNiche&&<span style={{fontSize:11,fontWeight:700,padding:'2px 10px',borderRadius:20,background:selectedNiche.color+'20',color:selectedNiche.color}}>{selectedNiche.label}</span>}
        </div>
        <div className="flex items-center gap-2">
          {niche&&<button onClick={()=>setShowAI(true)} className="flex items-center gap-1.5 h-9 px-3 rounded-[9px] border border-[#E8E4DF] bg-[#F8F6F3] text-[13px] font-semibold text-[#E8834A] hover:bg-[#FEF3EC] transition-all"><Sparkles size={13}/>AI Assist</button>}
          <button onClick={()=>handleSave('draft')} disabled={loading} className="flex items-center gap-2 h-9 px-4 rounded-[9px] border border-[#E8E4DF] bg-[#FAF9F7] text-[13px] font-semibold text-[#6B7280] hover:text-[#1A1A2E] transition-all"><Save size={14}/>Save Draft</button>
          <button onClick={()=>handleSave('send')} disabled={loading} className="flex items-center gap-2 h-9 px-4 rounded-[9px] bg-[#E8834A] text-white text-[13px] font-semibold hover:bg-[#D4713A] transition-all"><Send size={14}/>{loading?'Saving...':'Save & Send'}</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-5">
        <div className="bg-white rounded-[14px] border border-[#E8E4DF] p-5">
          <h2 className="text-[15px] font-bold text-[#1A1A2E] mb-4 flex items-center gap-2"><FileText size={15} color="#4F7EF7"/>Quote Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Client</label>
              <ClientAutocomplete value={clientId} onChange={(id)=>setClientId(id)} placeholder="Search or add client..."/>
            </div>
            <div>
              <label className={lbl}>Trade / Service</label>
              <div className="grid grid-cols-3 gap-1.5">
                {NICHES.map(n=>(
                  <button key={n.id} type="button" onClick={()=>setNiche(n.id)}
                    style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'8px 4px',borderRadius:9,border:'1px solid',borderColor:niche===n.id?n.color:'#E8E4DF',background:niche===n.id?n.color+'15':'white',cursor:'pointer',transition:'all 0.15s'}}>
                    <n.icon size={14} color={niche===n.id?n.color:'#9CA3AF'}/>
                    <span style={{fontSize:10,fontWeight:600,color:niche===n.id?n.color:'#6B7280',textAlign:'center',lineHeight:1.2}}>{n.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className={lbl}>Quote Title</label>
              <input className="w-full h-10 bg-[#FAF9F7] border border-[#E8E4DF] rounded-[9px] px-3 text-[13px] text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:border-[#E8834A] transition-all" placeholder="e.g. Kitchen Cabinet Replacement — Smith Residence" value={title} onChange={e=>setTitle(e.target.value)}/>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[14px] border border-[#E8E4DF] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E4DF]">
            <div className="flex items-center gap-3">
              <h2 className="text-[15px] font-bold text-[#1A1A2E]">Line Items</h2>
              {materials.length>0&&<button onClick={()=>setShowMaterialCols(!showMaterialCols)} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600,color:showMaterialCols?'#E8834A':'#9CA3AF',background:'#F8F6F3',border:'none',cursor:'pointer',padding:'3px 8px',borderRadius:6}}><Package size={11}/>{showMaterialCols?'Hide Material':'Show Material'}</button>}
            </div>
            <div className="flex items-center gap-2">
              {niche&&<button onClick={()=>setShowAI(true)} style={{display:'flex',alignItems:'center',gap:5,height:32,padding:'0 12px',borderRadius:8,border:'1px solid #E8E4DF',background:'#F8F6F3',fontSize:12,fontWeight:600,color:'#E8834A',cursor:'pointer'}}><Sparkles size={12}/>AI Generate</button>}
              <button onClick={addItem} style={{display:'flex',alignItems:'center',gap:5,height:32,padding:'0 12px',borderRadius:8,background:'#FEF3EC',border:'none',fontSize:12,fontWeight:600,color:'#E8834A',cursor:'pointer'}}><Plus size={13}/>Add Item</button>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:showMaterialCols?'155px 1fr 115px 58px 58px 88px 78px 36px':'155px 1fr 58px 58px 88px 78px 36px',gap:6,padding:'10px 20px',background:'#FAF9F7',borderBottom:'1px solid #E8E4DF'}}>
            {['Section','Description',...(showMaterialCols?['Material / Finish']:[]),'Qty','Unit','Unit Price','Total',''].map((h,i)=>(
              <div key={i} style={{fontSize:10,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:0.5}}>{h}</div>
            ))}
          </div>

          {items.map(item=>(
            <div key={item.id} style={{borderBottom:'1px solid #F3F4F6'}}
              onMouseEnter={e=>e.currentTarget.style.background='#FAFAFA'}
              onMouseLeave={e=>e.currentTarget.style.background='white'}>
              <div style={{display:'grid',gridTemplateColumns:showMaterialCols?'155px 1fr 115px 58px 58px 88px 78px 36px':'155px 1fr 58px 58px 88px 78px 36px',gap:6,padding:'8px 20px',alignItems:'center'}}>
                <select value={item.section} onChange={e=>updateItem(item.id,'section',e.target.value)}
                  style={{width:'100%',height:32,background:'#F8F6F3',border:'1px solid #E8E4DF',borderRadius:7,padding:'0 6px',fontSize:11.5,color:'#374151',outline:'none'}}>
                  {sections.map(s=><option key={s}>{s}</option>)}
                </select>
                <div style={{display:'flex',alignItems:'center',gap:4}}>
                  <input value={item.description} onChange={e=>updateItem(item.id,'description',e.target.value)} placeholder="Describe item..."
                    style={{width:'100%',height:32,background:'#F8F6F3',border:'1px solid #E8E4DF',borderRadius:7,padding:'0 10px',fontSize:12.5,color:'#1A1A2E',outline:'none',boxSizing:'border-box'}}/>
                  {item.aiGenerated&&<Sparkles size={11} color="#E8834A" style={{flexShrink:0}}/>}
                </div>
                {showMaterialCols&&(
                  <div style={{display:'flex',flexDirection:'column',gap:2}}>
                    <select value={item.material||''} onChange={e=>updateItem(item.id,'material',e.target.value)}
                      style={{width:'100%',height:15,background:'#F8F6F3',border:'1px solid #E8E4DF',borderRadius:4,padding:'0 4px',fontSize:10,color:'#374151',outline:'none'}}>
                      <option value="">Material...</option>
                      {materials.map(m=><option key={m}>{m}</option>)}
                    </select>
                    <select value={item.finish||''} onChange={e=>updateItem(item.id,'finish',e.target.value)}
                      style={{width:'100%',height:15,background:'#F8F6F3',border:'1px solid #E8E4DF',borderRadius:4,padding:'0 4px',fontSize:10,color:'#374151',outline:'none'}}>
                      <option value="">Finish...</option>
                      {finishes.map(f=><option key={f}>{f}</option>)}
                    </select>
                  </div>
                )}
                <input type="number" value={item.qty} onChange={e=>updateItem(item.id,'qty',parseFloat(e.target.value)||0)}
                  style={{width:'100%',height:32,background:'#F8F6F3',border:'1px solid #E8E4DF',borderRadius:7,padding:'0 6px',fontSize:12.5,textAlign:'center',outline:'none'}}/>
                <select value={item.unit} onChange={e=>updateItem(item.id,'unit',e.target.value)}
                  style={{width:'100%',height:32,background:'#F8F6F3',border:'1px solid #E8E4DF',borderRadius:7,padding:'0 4px',fontSize:11,color:'#374151',outline:'none'}}>
                  {units.map(u=><option key={u}>{u}</option>)}
                </select>
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',fontSize:11,color:'#9CA3AF'}}>$</span>
                  <input type="number" value={item.price} onChange={e=>updateItem(item.id,'price',parseFloat(e.target.value)||0)}
                    style={{width:'100%',height:32,background:'#F8F6F3',border:'1px solid #E8E4DF',borderRadius:7,paddingLeft:18,paddingRight:6,fontSize:12.5,textAlign:'right',outline:'none',boxSizing:'border-box'}}/>
                </div>
                <div style={{fontSize:13,fontWeight:600,color:'#1A1A2E',textAlign:'right'}}>{fmt(item.qty*item.price)}</div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:2,position:'relative'}}>
                  <button type="button" onClick={()=>setPickerForItem(pickerForItem===item.id?null:item.id)}
                    style={{width:28,height:28,borderRadius:6,border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:item.subcontractorId?'#FEF3EC':'#F8F6F3',color:item.subcontractorId?'#E8834A':'#9CA3AF'}}>
                    <UserPlus size={12}/>
                  </button>
                  {pickerForItem===item.id&&<SubPicker subs={subs} onSelect={sub=>{assignSub(item.id,sub);setPickerForItem(null);}} onClose={()=>setPickerForItem(null)}/>}
                  {items.length>1&&<button onClick={()=>removeItem(item.id)} style={{width:28,height:28,borderRadius:6,border:'none',background:'#F8F6F3',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Trash2 size={12} color="#F0584C"/></button>}
                </div>
              </div>
              {item.subcontractorId&&(
                <div style={{padding:'0 20px 8px',display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:10,color:'#9CA3AF',fontWeight:600}}>Sub:</span>
                  <span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:10.5,fontWeight:600,padding:'2px 8px',borderRadius:20,background:(TRADE_COLOR[item.subcontractorTrade]||'#6B7280')+'22',color:TRADE_COLOR[item.subcontractorTrade]||'#6B7280'}}>{item.subcontractorName} · {item.subcontractorTrade}</span>
                  <button onClick={()=>clearSub(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#9CA3AF',display:'flex',padding:0}}><X size={11}/></button>
                </div>
              )}
            </div>
          ))}

          <div style={{display:'flex',justifyContent:'flex-end',padding:'16px 20px'}}>
            <div style={{width:260}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:13,color:'#6B7280'}}>Subtotal</span>
                <span style={{fontSize:13,fontWeight:600,color:'#1A1A2E'}}>{fmt(subtotal)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',borderTop:'2px solid #E8E4DF',paddingTop:10}}>
                <span style={{fontSize:15,fontWeight:700,color:'#1A1A2E'}}>Total</span>
                <span style={{fontSize:22,fontWeight:800,color:'#E8834A'}}>{fmt(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[14px] border border-[#E8E4DF] p-5">
          <h2 className="text-[15px] font-bold text-[#1A1A2E] mb-4">Notes & Exclusions</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Scope Notes</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Additional details, allowances, lead times..."
                style={{width:'100%',height:88,background:'#FAF9F7',border:'1px solid #E8E4DF',borderRadius:9,padding:'10px 12px',fontSize:13,color:'#1A1A2E',resize:'none',outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div>
              <label className={lbl}>Exclusions</label>
              <textarea value={exclusions} onChange={e=>setExclusions(e.target.value)} placeholder="What is NOT included..."
                style={{width:'100%',height:88,background:'#FAF9F7',border:'1px solid #E8E4DF',borderRadius:9,padding:'10px 12px',fontSize:13,color:'#1A1A2E',resize:'none',outline:'none',boxSizing:'border-box'}}/>
            </div>
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'flex-end',gap:10,paddingBottom:32}}>
          <a href="/quotes" style={{display:'flex',alignItems:'center',height:40,padding:'0 20px',borderRadius:9,border:'1px solid #E8E4DF',fontSize:13,fontWeight:600,color:'#6B7280',textDecoration:'none'}}>Cancel</a>
          <button onClick={()=>handleSave('draft')} disabled={loading} style={{display:'flex',alignItems:'center',gap:6,height:40,padding:'0 20px',borderRadius:9,border:'1px solid #E8E4DF',background:'#FAF9F7',fontSize:13,fontWeight:600,color:'#6B7280',cursor:'pointer'}}><Save size={14}/>Save Draft</button>
          <button onClick={()=>handleSave('send')} disabled={loading} style={{display:'flex',alignItems:'center',gap:6,height:40,padding:'0 20px',borderRadius:9,border:'none',background:'#E8834A',color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}><Send size={14}/>{loading?'Saving...':'Save & Send'}</button>
        </div>
      </div>

      {showAI&&niche&&<AIPanel niche={niche} onClose={()=>setShowAI(false)} onApply={applyAIItems}/>}
    </div>
  );
}
