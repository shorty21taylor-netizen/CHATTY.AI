'use client';

import { AnimatedGroup } from '@/components/ui/AnimatedGroup';

const QUOTES = [
  {
    text: 'Chatty AI told me to chase two hailstorm leads I was going to skip. Both closed. $18k in one week.',
    name: 'Mike R.',
    trade: 'Roofing',
    city: 'Dallas',
  },
  {
    text: "I used to spend Sunday nights planning my week. Now I get a text at 6am Monday and I'm done.",
    name: 'Sarah P.',
    trade: 'HVAC',
    city: 'Phoenix',
  },
  {
    text: 'The AI caught a dead lead I\u2019d forgotten about for six months. $22k deal.',
    name: 'Tom L.',
    trade: 'Solar',
    city: 'Denver',
  },
];

const CHANNELS = [
  'Web Forms',
  'Inbound SMS',
  'Voice (ElevenLabs)',
  'Meta DMs',
  'Email',
  'Google Ads',
  'Facebook Ads',
  'Weather Signals',
];

export function TrustSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
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
            Why operators trust Chatty
          </div>
          <h2
            className="font-bold max-w-xl mx-auto"
            style={{ fontSize: 44, color: 'var(--text-bright)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
          >
            Real contractors. Real results.
          </h2>
        </div>

        <AnimatedGroup preset="blur-slide" className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {QUOTES.map((q) => (
            <div key={q.name} className="glow-card" style={{ padding: 28 }}>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: 'var(--text-bright)',
                  fontStyle: 'italic',
                  margin: '0 0 20px',
                }}
              >
                &ldquo;{q.text}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--emerald-tint)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--emerald-bright)',
                  }}
                >
                  {q.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)' }}>
                    {q.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {q.trade}, {q.city}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </AnimatedGroup>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginBottom: 32, opacity: 0.7 }}>
          *Representative results from pilot customers
        </p>

        {/* Native capture channels */}
        <div className="text-center">
          <div
            style={{
              fontSize: 12,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontWeight: 500,
              marginBottom: 16,
            }}
          >
            Captures leads from every channel
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {CHANNELS.map((name) => (
              <span
                key={name}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 16px',
                  borderRadius: 999,
                  background: 'var(--dark-surface-2)',
                  border: '1px solid var(--dark-border)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.02em',
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
