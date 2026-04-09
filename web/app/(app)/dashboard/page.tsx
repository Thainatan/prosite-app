export default function DashboardPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F8FC',
      fontFamily: 'Nunito Sans, sans-serif',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, background: '#4F7EF7',
            borderRadius: 10, display: 'flex', alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
              <div style={{ width: 4, height: 8, background: 'white', borderRadius: 2 }} />
              <div style={{ width: 4, height: 12, background: 'white', borderRadius: 2 }} />
              <div style={{ width: 4, height: 16, background: 'white', borderRadius: 2 }} />
            </div>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#1A1D2E' }}>ProSite</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A1D2E', marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ color: '#6B7280', fontSize: 14 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'New Leads',       value: '8',     color: '#4F7EF7', bg: '#EEF3FF' },
          { label: 'Open Estimates',  value: '12',    color: '#F5A623', bg: '#FFF7E9' },
          { label: 'Active Projects', value: '7',     color: '#34C78A', bg: '#EAFAF3' },
          { label: 'Unpaid Invoices', value: '$48k',  color: '#F0584C', bg: '#FFF0EF' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{
            background: bg, borderRadius: 14,
            padding: '16px 18px'
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              {label}
            </p>
            <p style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Today */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #EAECF2', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #EAECF2' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D2E' }}>Today\'s Schedule</h3>
          </div>
          {[
            { time: '9:00 AM',  title: 'Smith Kitchen — Site Visit',   person: 'Mike Torres',  color: '#4F7EF7' },
            { time: '11:30 AM', title: 'Johnson Bath — Phase 2',        person: 'Carlos Ruiz',  color: '#34C78A' },
            { time: '2:00 PM',  title: 'Davis Flooring — Walkthrough',  person: 'Sarah Kim',    color: '#4F7EF7' },
            { time: '4:30 PM',  title: 'Garcia Kitchen — Final Review', person: 'Mike Torres',  color: '#8B5CF6' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#A0A8B8', width: 56, flexShrink: 0 }}>{a.time}</span>
              <div style={{ width: 3, alignSelf: 'stretch', background: a.color, borderRadius: 2, minHeight: 32, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1D2E' }}>{a.title}</p>
                <p style={{ fontSize: 11, color: '#A0A8B8' }}>{a.person}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #EAECF2', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #EAECF2' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D2E' }}>Active Projects</h3>
          </div>
          {[
            { name: 'Smith Kitchen Remodel',  job: 'BF-2024-041', status: 'In Progress',    statusBg: '#EAFAF3', statusColor: '#34C78A', progress: 65  },
            { name: 'Johnson Master Bath',    job: 'BF-2024-039', status: 'Waiting Mat.',   statusBg: '#FFF7E9', statusColor: '#F5A623', progress: 40  },
            { name: 'Garcia Outdoor Kitchen', job: 'BF-2024-037', status: 'Punch List',     statusBg: '#EEF3FF', statusColor: '#4F7EF7', progress: 90  },
            { name: 'Davis Flooring',         job: 'BF-2024-042', status: 'Scheduled',      statusBg: '#F3F4F6', statusColor: '#6B7280', progress: 0   },
          ].map((p, i) => (
            <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1D2E' }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: '#A0A8B8' }}>{p.job}</p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: p.statusBg, color: p.statusColor, flexShrink: 0 }}>
                  {p.status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 4, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.progress}%`, background: p.progress >= 75 ? '#34C78A' : p.progress >= 40 ? '#4F7EF7' : '#F5A623', borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#A0A8B8' }}>{p.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #EAECF2', padding: '14px 16px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D2E', marginBottom: 12 }}>Recent Activity</h3>
        {[
          { text: 'New lead — John Miller, Kitchen Remodel',   time: '14 min ago', color: '#4F7EF7' },
          { text: 'Estimate #BF-E-089 approved by Linda Davis', time: '1 hr ago',  color: '#34C78A' },
          { text: 'Change order signed — Smith Kitchen +$2,400',time: '2 hrs ago', color: '#F5A623' },
          { text: '6 photos uploaded to Davis Flooring',        time: '3 hrs ago', color: '#9CA3AF' },
          { text: 'Invoice #BF-I-031 marked paid — $12,500',    time: 'Yesterday', color: '#34C78A' },
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{a.text}</span>
            <span style={{ fontSize: 11, color: '#A0A8B8' }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}