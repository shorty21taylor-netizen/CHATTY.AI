'use client';

const STAGES = [
  { label: 'LEADS', count: 142, conv: null, recovery: '+18 by Speed-to-Lead' },
  { label: 'CONTACTED', count: 112, conv: '79%', recovery: null },
  { label: 'BOOKED', count: 78, conv: '70%', recovery: '+9 by No-Show Rescue' },
  { label: 'ESTIMATED', count: 62, conv: '79%', recovery: '+4 rescued' },
  { label: 'CLOSED', count: 23, conv: '37%', recovery: '+$62K by Follow-Up' },
];

export function RevenueFunnel() {
  return (
    <div className="dark-card" style={{ padding: 30, marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <div className="t-eyebrow">Revenue funnel &middot; last 30 days</div>
          <div className="t-h2" style={{ marginTop: 6 }}>
            Where your leads are right now
          </div>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 999,
            background: 'var(--emerald-tint)',
            border: '1px solid rgba(16,185,129,0.25)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--emerald-bright)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--emerald-bright)',
              boxShadow: '0 0 8px var(--emerald-glow)',
            }}
          />
          LIVE
        </div>
      </div>

      {/* Stages row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 8,
          alignItems: 'stretch',
        }}
      >
        {STAGES.map((s, i) => (
          <div
            key={s.label}
            style={{
              position: 'relative',
              padding: '18px 16px',
              background: 'var(--emerald-tint)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 130,
            }}
          >
            {/* Arrow (not on last) */}
            {i < STAGES.length - 1 ? (
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: -14,
                  transform: 'translateY(-50%)',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'var(--surface-3)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--emerald-bright)',
                  fontSize: 11,
                  zIndex: 2,
                }}
              >
                {'\u2192'}
              </div>
            ) : null}

            <div className="t-eyebrow" style={{ marginBottom: 8 }}>
              {s.label}
            </div>
            <div className="t-kpi" style={{ fontSize: 32 }}>
              {s.count}
            </div>
            {s.conv ? (
              <div className="t-body-sm" style={{ marginTop: 2 }}>
                {s.conv} conversion
              </div>
            ) : (
              <div className="t-body-sm" style={{ marginTop: 2 }}>
                Top of funnel
              </div>
            )}

            {s.recovery ? (
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 9px',
                  borderRadius: 999,
                  background: 'var(--emerald-tint)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  color: 'var(--emerald-bright)',
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  alignSelf: 'flex-start',
                  marginTop: 12,
                }}
              >
                {s.recovery}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Recovered revenue footer */}
      <div
        style={{
          marginTop: 26,
          paddingTop: 22,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div className="t-eyebrow">Recovered revenue &middot; last 30 days</div>
          <div className="t-kpi-lg" style={{ marginTop: 6, color: 'var(--emerald-bright)' }}>
            $184,200
          </div>
          <div className="t-body-sm" style={{ marginTop: 4 }}>
            That Chatty saved from your funnel.
          </div>
        </div>
        <a
          href="/dashboard/analytics"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 18px',
            borderRadius: 10,
            background: 'var(--emerald-bright)',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 0 20px var(--emerald-glow)',
          }}
        >
          See full breakdown {'\u2192'}
        </a>
      </div>
    </div>
  );
}
