export default function HomePage() {
  return (
    <div style={{fontFamily:'sans-serif',margin:0,padding:0,background:'#fff'}}>
      {/* NAV */}
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',height:64,borderBottom:'1px solid #EAECF2',background:'#fff',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,background:'#4F7EF7',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{display:'flex',alignItems:'flex-end',gap:2}}>
              {[7,11,15].map(h=><div key={h} style={{width:3,height:h,background:'white',borderRadius:2}}/>)}
            </div>
          </div>
          <span style={{fontSize:18,fontWeight:800,color:'#1A1D2E'}}>ProSite</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <a href="/login" style={{padding:'8px 16px',fontSize:14,fontWeight:600,color:'#6B7280',textDecoration:'none'}}>Sign In</a>
          <a href="/register" style={{padding:'8px 20px',background:'#4F7EF7',color:'white',borderRadius:9,fontSize:14,fontWeight:700,textDecoration:'none'}}>Start Free Trial</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{background:'linear-gradient(135deg,#1A1D2E 0%,#2D3148 100%)',padding:'80px 40px',textAlign:'center'}}>
        <div style={{display:'inline-block',background:'#4F7EF7',color:'white',fontSize:12,fontWeight:700,padding:'4px 14px',borderRadius:999,marginBottom:20}}>BUILT FOR HOME REMODELING COMPANIES</div>
        <h1 style={{fontSize:52,fontWeight:800,color:'white',margin:'0 0 16px',lineHeight:1.15}}>Run Your Entire<br/><span style={{color:'#4F7EF7'}}>Remodeling Business</span><br/>From One Place</h1>
        <p style={{fontSize:18,color:'#9BA3C4',maxWidth:560,margin:'0 auto 36px',lineHeight:1.6}}>Leads, quotes, projects, change orders, and invoices — all connected. Built specifically for remodeling contractors.</p>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <a href="/register" style={{padding:'14px 32px',background:'#4F7EF7',color:'white',borderRadius:12,fontSize:16,fontWeight:700,textDecoration:'none'}}>Start Free — 14 Days Trial</a>
          <a href="#pricing" style={{padding:'14px 32px',background:'rgba(255,255,255,0.08)',color:'white',borderRadius:12,fontSize:16,fontWeight:700,textDecoration:'none',border:'1px solid rgba(255,255,255,0.15)'}}>See Pricing →</a>
        </div>
        <p style={{color:'#6B7280',fontSize:13,marginTop:16}}>No credit card required · Cancel anytime</p>
      </section>

      {/* STATS */}
      <section style={{background:'#F7F8FC',padding:'40px',borderBottom:'1px solid #EAECF2'}}>
        <div style={{display:'flex',justifyContent:'center',gap:60,flexWrap:'wrap'}}>
          {[{v:'500+',l:'Contractors using ProSite'},{v:'$2.4M',l:'Invoices processed monthly'},{v:'4.9★',l:'Average rating'},{v:'2 min',l:'Average quote time'}].map(({v,l})=>(
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontSize:32,fontWeight:800,color:'#4F7EF7',marginBottom:4}}>{v}</div>
              <div style={{fontSize:13,color:'#6B7280'}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{padding:'80px 40px',maxWidth:1100,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <h2 style={{fontSize:36,fontWeight:800,color:'#1A1D2E',marginBottom:12}}>Everything you need to run your business</h2>
          <p style={{fontSize:16,color:'#6B7280'}}>Stop using spreadsheets. ProSite keeps everything organized and connected.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
          {[
            {icon:'🎯',t:'Lead Pipeline',d:'Track every lead from first call to signed contract. Never lose a job.'},
            {icon:'📋',t:'Professional Quotes',d:'Create itemized quotes in minutes. Send for digital approval. Convert to project with one click.'},
            {icon:'🏗️',t:'Project Management',d:'Checklists, photo uploads, notes, and crew assignments. Keep every job on track.'},
            {icon:'↺',t:'Change Orders',d:'Document scope changes instantly. Get client signature digitally before starting extra work.'},
            {icon:'💰',t:'Invoicing',d:'Deposit, progress, and final invoices. Track payments manually. Know who owes what.'},
            {icon:'📱',t:'Mobile App',d:'Your field crew uploads photos and fills forms from the job site. No more paper.'},
          ].map(({icon,t,d})=>(
            <div key={t} style={{background:'#F7F8FC',borderRadius:16,padding:'28px 24px',border:'1px solid #EAECF2'}}>
              <div style={{fontSize:32,marginBottom:14}}>{icon}</div>
              <h3 style={{fontSize:17,fontWeight:700,color:'#1A1D2E',marginBottom:8}}>{t}</h3>
              <p style={{fontSize:14,color:'#6B7280',lineHeight:1.6,margin:0}}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{background:'#F7F8FC',padding:'80px 40px',borderTop:'1px solid #EAECF2'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <h2 style={{fontSize:36,fontWeight:800,color:'#1A1D2E',marginBottom:12}}>Simple, transparent pricing</h2>
          <p style={{fontSize:16,color:'#6B7280'}}>Start free. Upgrade when you grow.</p>
        </div>
        <div style={{display:'flex',gap:20,justifyContent:'center',flexWrap:'wrap',maxWidth:900,margin:'0 auto'}}>
          {[
            {name:'Solo',price:'$29',desc:'Perfect for solo contractors',bg:'#fff',featured:false,features:['1 user','Unlimited clients','Quotes & invoices','Project management','Mobile app','Email support']},
            {name:'Company',price:'$79',desc:'For growing teams up to 5',bg:'#1A1D2E',featured:true,features:['Up to 5 users','Everything in Solo','Team roles & permissions','Change orders','Priority support','Custom branding']},
            {name:'Enterprise',price:'$149',desc:'For large operations',bg:'#fff',featured:false,features:['Up to 20 users','Everything in Company','Advanced reporting','API access','Dedicated onboarding','Phone support']},
          ].map(({name,price,desc,bg,featured,features})=>(
            <div key={name} style={{background:bg,borderRadius:20,padding:'32px 28px',border:featured?'none':'1px solid #EAECF2',flex:1,minWidth:240,maxWidth:280,boxShadow:featured?'0 20px 60px rgba(79,126,247,0.25)':'none',position:'relative'}}>
              {featured&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'#4F7EF7',color:'white',fontSize:11,fontWeight:700,padding:'4px 14px',borderRadius:999,whiteSpace:'nowrap'}}>MOST POPULAR</div>}
              <h3 style={{fontSize:20,fontWeight:800,color:featured?'white':'#1A1D2E',marginBottom:4}}>{name}</h3>
              <p style={{fontSize:13,color:featured?'#9BA3C4':'#6B7280',marginBottom:16}}>{desc}</p>
              <div style={{marginBottom:24}}><span style={{fontSize:40,fontWeight:800,color:featured?'white':'#1A1D2E'}}>{price}</span><span style={{fontSize:14,color:featured?'#9BA3C4':'#6B7280'}}>/month</span></div>
              <ul style={{listStyle:'none',padding:0,margin:'0 0 28px',display:'flex',flexDirection:'column',gap:10}}>
                {features.map(f=><li key={f} style={{display:'flex',alignItems:'center',gap:8,fontSize:14,color:featured?'#E5E7EB':'#374151'}}><span style={{color:featured?'#34C78A':'#4F7EF7',fontWeight:700}}>✓</span>{f}</li>)}
              </ul>
              <a href="/register" style={{display:'block',textAlign:'center',padding:'12px',background:featured?'#4F7EF7':'#F7F8FC',color:featured?'white':'#1A1D2E',borderRadius:10,fontSize:14,fontWeight:700,textDecoration:'none',border:featured?'none':'1px solid #EAECF2'}}>Start Free Trial</a>
            </div>
          ))}
        </div>
        <p style={{textAlign:'center',color:'#A0A8B8',fontSize:13,marginTop:24}}>All plans include 14-day free trial · No credit card required · Cancel anytime</p>
      </section>

      {/* PARTNER */}
      <section style={{padding:'60px 40px',background:'#fff',borderTop:'1px solid #EAECF2'}}>
        <div style={{maxWidth:600,margin:'0 auto',textAlign:'center',background:'#F7F8FC',borderRadius:20,padding:'40px',border:'1px solid #EAECF2'}}>
          <div style={{fontSize:36,marginBottom:14}}>🤝</div>
          <h3 style={{fontSize:22,fontWeight:800,color:'#1A1D2E',marginBottom:10}}>Partner Program</h3>
          <p style={{fontSize:15,color:'#6B7280',lineHeight:1.6,marginBottom:20}}>Are you a supplier, trade association, or industry partner? Apply for a free partner code and give your network access to ProSite.</p>
          <a href="/partner" style={{display:'inline-block',padding:'12px 28px',background:'#1A1D2E',color:'white',borderRadius:10,fontSize:14,fontWeight:700,textDecoration:'none'}}>Apply for Partner Code →</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#1A1D2E',padding:'40px',textAlign:'center'}}>
        <span style={{fontSize:16,fontWeight:800,color:'white'}}>ProSite</span>
        <p style={{color:'#6B7280',fontSize:13,margin:'8px 0 0'}}>© 2026 ProSite · Built for remodeling contractors.</p>
      </footer>
    </div>
  );
}