'use client';

import { AnimatedGroup } from '@/components/ui/AnimatedGroup';

const PILLARS = [
  {
    tag: 'CAPTURE',
    title: 'Never miss a lead. Never lose a first impression.',
    agents: [
      'Inbound Call Qualifier',
      'Speed-to-Lead (web / Angi / LSA / FB)',
      'SMS Concierge',
    ],
    hero: false,
  },
  {
    tag: 'CONVERT',
    title: 'Turn estimates into signed contracts.',
    agents: [
      'Appointment Confirmation',
      'No-Show Rescue',
      'Estimate Follow-Up Sequence',
      'Objection Handler',
    ],
    hero: true,
  },
  {
    tag: 'RECLAIM',
    title: 'Resurrect leads that already slipped away.',
    agents: [
      'Dead Lead Reactivation',
      'Ghosted Bid Reopener',
      'Old Customer Re-engagement',
      { label: 'AI Voice Notes', badge: 'NEW' },
    ],
    hero: false,
  },
];

export function Pillars() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <div
            style={{
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontWeight: 500,
              marginBottom: 16,
            }}
          >
            The 3-pillar funnel
          </div>
          <h2
            className="font-bold tracking-tight mx-auto max-w-3xl"
            style={{ fontSize: 44, color: 'var(--text-bright)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
          >
            Capture. Convert. Reclaim.
          </h2>
          <p className="mt-4 text-base mx-auto max-w-xl" style={{ color: 'var(--text-muted)' }}>
            Ten agents working your funnel 24/7 &mdash; plugged into the three places home-services companies bleed money.
          </p>
        </div>

        <AnimatedGroup preset="blur-slide" className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PILLARS.map((p) => (
            <div
              key={p.tag}
              className={`glow-card ${p.hero ? 'glow-border' : ''}`}
              style={{
                padding: 30,
                minHeight: 340,
                boxShadow: p.hero ? '0 0 60px rgba(52,211,153,0.15)' : undefined,
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 999,
                  background: 'rgba(52,211,153,0.12)',
                  border: '1px solid rgba(52,211,153,0.3)',
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: 'var(--emerald-bright)',
                  marginBottom: 16,
                }}
              >
                {p.tag}
              </div>

              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--text-bright)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  marginBottom: 20,
                }}
              >
                {p.title}
              </h3>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {p.agents.map((a) => {
                  const isObj = typeof a === 'object';
                  const label = isObj ? a.label : a;
                  return (
                    <li
                      key={label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 0',
                        fontSize: 14,
                        color: 'var(--text-bright)',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'var(--emerald-bright)',
                          flexShrink: 0,
                          boxShadow: '0 0 8px var(--emerald-glow)',
                        }}
                      />
                      <span style={{ flex: 1 }}>{label}</span>
                      {isObj && a.badge ? (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: 'rgba(212,255,79,0.12)',
                            border: '1px solid rgba(212,255,79,0.3)',
                            color: '#d4ff4f',
                            fontSize: 9.5,
                            fontWeight: 800,
                            letterSpacing: '0.1em',
                          }}
                        >
                          {a.badge}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  );
}
