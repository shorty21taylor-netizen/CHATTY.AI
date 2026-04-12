'use client';

import { Button } from '@/components/ui/Button';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';

const TIERS = [
  {
    name: 'Inbound',
    price: '97',
    tagline: 'The always-on receptionist.',
    features: [
      'Unlimited inbound calls',
      'Lead qualification',
      'Calendar booking',
      'Call recordings & transcripts',
      'Telegram EA included',
    ],
    cta: 'Start with Inbound',
    plan: 'inbound',
    popular: false,
  },
  {
    name: 'Inbound + Outbound',
    price: '157',
    tagline: 'The complete voice operation.',
    features: [
      'Everything in Inbound',
      'Outbound dialing',
      'AI cold outreach',
      'Multi-line scaling',
      'Priority support',
    ],
    cta: 'Start with Both',
    plan: 'both',
    popular: true,
  },
];

export function Pricing({ onGetStarted }) {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-16">
          <div className="dark-pill mx-auto mb-5" style={{ width: 'fit-content' }}>
            Simple pricing
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight"
            style={{ color: 'var(--text-bright)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
          >
            Flat-rate. No per-minute games.
          </h2>
          <p className="mt-4 text-base mx-auto max-w-md" style={{ color: 'var(--text-muted)' }}>
            Pick a tier. Unlimited usage. Cancel anytime.
          </p>
        </div>

        <AnimatedGroup preset="blur-slide" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`dark-card relative ${tier.popular ? 'glow-border' : ''}`}
              style={{ padding: 40 }}
            >
              {tier.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: -14,
                    right: 28,
                    background: '#c9a961',
                    color: '#1a1f1a',
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: '6px 14px',
                    borderRadius: 999,
                    letterSpacing: '0.1em',
                    border: '1px solid rgba(201,169,97,0.5)',
                    boxShadow: '0 8px 24px rgba(201,169,97,0.25)',
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {tier.name}
              </div>

              <div style={{ marginTop: 16, lineHeight: 1 }}>
                <span style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-muted)' }}>$</span>
                <span style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-bright)' }}>
                  {tier.price}
                </span>
                <span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 500 }}> / mo</span>
              </div>

              <div style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: 14.5 }}>
                {tier.tagline}
              </div>

              <div style={{ margin: '28px 0', borderTop: '1px solid var(--dark-border)' }} />

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
                {tier.features.map((f) => (
                  <li key={f} className="pricing-row">
                    <span className="check">{'\u2713'}</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.popular ? 'default' : 'outline'}
                size="lg"
                className="w-full justify-center"
                onClick={() => onGetStarted(tier.plan)}
              >
                {tier.cta} {'\u2192'}
              </Button>
            </div>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  );
}
