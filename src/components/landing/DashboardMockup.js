'use client';

export function DashboardMockup() {
  return (
    <div className="flex" style={{ background: 'var(--dark-surface)', borderRadius: 12, overflow: 'hidden', minHeight: 340 }}>
      {/* Sidebar silhouette */}
      <div
        className="hidden sm:flex flex-col gap-2 p-4"
        style={{ width: 180, borderRight: '1px solid var(--dark-border)', background: '#070b09' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: 'var(--emerald-bright)', boxShadow: '0 0 8px var(--emerald-glow)' }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-bright)' }}>Chatty.AI</span>
        </div>
        {['Overview', 'Inbound', 'Outbound', 'Appointments', 'Analytics'].map((label, i) => (
          <div
            key={label}
            className="rounded-lg px-3 py-2"
            style={{
              fontSize: 11,
              fontWeight: i === 0 ? 600 : 400,
              color: i === 0 ? 'var(--text-bright)' : 'var(--text-muted)',
              background: i === 0 ? 'rgba(16,185,129,0.06)' : 'transparent',
              borderLeft: i === 0 ? '2px solid var(--emerald-bright)' : '2px solid transparent',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Main content area */}
      <div className="flex-1 p-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Inbound Today', value: '14', delta: '+22%' },
            { label: 'Outbound', value: '6', delta: '+3' },
            { label: 'Appointments', value: '9', delta: '+4' },
            { label: 'Closed Deals', value: '7', delta: 'This week' },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl p-3"
              style={{ background: 'rgba(16,185,129,0.03)', border: '1px solid var(--dark-border)' }}
            >
              <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-bright)', lineHeight: 1, marginTop: 6 }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--emerald-bright)', marginTop: 4 }}>
                {kpi.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Mini chart mock */}
        <div
          className="rounded-xl p-4"
          style={{ border: '1px solid var(--dark-border)', background: 'rgba(16,185,129,0.02)' }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 12 }}>
            Calls this week
          </div>
          <div className="flex items-end gap-1.5" style={{ height: 80 }}>
            {[35, 55, 40, 65, 80, 30, 50].map((h, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: `rgba(16,185,129,${0.2 + (h / 100) * 0.6})` }} />
            ))}
          </div>
          <div className="flex justify-between mt-2" style={{ fontSize: 9, color: 'var(--text-muted)' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
