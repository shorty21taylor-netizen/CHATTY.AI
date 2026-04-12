'use client';

import { Check } from 'lucide-react';
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
          <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 16 }}>
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
              className={`glow-card relative ${tier.popular ? 'glow-border' : ''}`}
              style={{
                padding: 40,
                boxShadow: tier.popular ? '0 0 60px rgba(52,211,153,0.15)' : undefined,
              }}
            >
              {tier.popular && (
                <div
                  className="lime-pill"
                  style={{
                    position: 'absolute',
                    top: -16,
                    right: 28,
                    padding: '5px 14px',
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
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
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 14, color: 'var(--text-bright)' }}>
                    <Check size={16} style={{ color: 'var(--emerald-bright)', flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant="default"
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
