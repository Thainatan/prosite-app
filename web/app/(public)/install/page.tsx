import { Smartphone, Share, PlusSquare, Home, ArrowDown, Check } from 'lucide-react';

export default function InstallPage() {
  return (
    <div style={{ fontFamily: 'sans-serif', background: '#F7F8FC', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 60, background: '#1C2B3A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="ProSite" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain' }} />
          <span style={{ fontSize: 17, fontWeight: 800, color: 'white' }}>ProSite</span>
        </div>
        <a href="/login" style={{ fontSize: 13, fontWeight: 600, color: '#E8834A', textDecoration: 'none' }}>Sign In →</a>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '56px 24px 40px' }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: '#E8834A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Smartphone size={36} color="white" strokeWidth={1.8} />
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: '#1C2B3A', margin: '0 0 12px' }}>Install ProSite on Your Phone</h1>
        <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 480, margin: '0 auto' }}>
          Add ProSite to your home screen for fast access — works like a native app, even offline.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', padding: '0 24px 60px', flexWrap: 'wrap', maxWidth: 860, margin: '0 auto' }}>

        {/* iPhone */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E8E4DF', padding: '32px 28px', flex: 1, minWidth: 280, maxWidth: 380 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 22 }}>🍎</span>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1C2B3A' }}>iPhone / iPad</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>Safari browser required</div>
            </div>
          </div>

          {[
            { icon: <Share size={18} color="#E8834A" strokeWidth={2} />, step: '1', text: 'Open prosite-app-you9.vercel.app in Safari, then tap the Share button at the bottom of the screen.' },
            { icon: <PlusSquare size={18} color="#E8834A" strokeWidth={2} />, step: '2', text: 'Scroll down in the share sheet and tap "Add to Home Screen".' },
            { icon: <Home size={18} color="#E8834A" strokeWidth={2} />, step: '3', text: 'Tap "Add" in the top right. ProSite will appear on your home screen like a native app.' },
          ].map(({ icon, step, text }) => (
            <div key={step} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF3EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#E8834A', letterSpacing: '0.06em', marginBottom: 4 }}>STEP {step}</div>
                <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.5 }}>{text}</div>
              </div>
            </div>
          ))}

          <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 8 }}>
            <Check size={14} color="#22C55E" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 13, color: '#15803D' }}>Works on iOS 14+ · Safari only · No App Store needed</span>
          </div>
        </div>

        {/* Android */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E8E4DF', padding: '32px 28px', flex: 1, minWidth: 280, maxWidth: 380 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#3DDC84', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 22 }}>🤖</span>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1C2B3A' }}>Android</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>Chrome browser required</div>
            </div>
          </div>

          {[
            { icon: <ArrowDown size={18} color="#E8834A" strokeWidth={2} />, step: '1', text: 'Open prosite-app-you9.vercel.app in Chrome. Look for the "Install App" banner or tap the 3-dot menu.' },
            { icon: <PlusSquare size={18} color="#E8834A" strokeWidth={2} />, step: '2', text: 'Tap "Add to Home Screen" or "Install App" from the menu.' },
            { icon: <Home size={18} color="#E8834A" strokeWidth={2} />, step: '3', text: 'Tap "Install" or "Add". ProSite appears on your home screen ready to launch.' },
          ].map(({ icon, step, text }) => (
            <div key={step} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF3EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#E8834A', letterSpacing: '0.06em', marginBottom: 4 }}>STEP {step}</div>
                <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.5 }}>{text}</div>
              </div>
            </div>
          ))}

          <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 8 }}>
            <Check size={14} color="#22C55E" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 13, color: '#15803D' }}>Works on Android 8+ · Chrome recommended · No Play Store needed</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '0 24px 60px' }}>
        <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 16 }}>Don't have an account yet?</p>
        <a href="/register" style={{ display: 'inline-block', padding: '14px 36px', background: '#E8834A', color: 'white', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          Start Your Free Trial →
        </a>
      </div>
    </div>
  );
}
