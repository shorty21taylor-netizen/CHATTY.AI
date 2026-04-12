'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';

const TIERS = [
  {
    name: 'Capture',
    priceMonthly: 297,
    tagline: 'Never miss a lead.',
    features: [
      'Inbound Call Qualifier',
      'Speed-to-Lead (web / Angi / LSA / FB)',
      'SMS Concierge',
      'Telegram EA included',
    ],
    cta: 'Start with Capture',
    plan: 'capture',
    popular: false,
  },
  {
    name: 'Convert',
    priceMonthly: 597,
    tagline: 'Turn estimates into contracts.',
    features: [
      'Everything in Capture',
      'Appointment Confirmation',
      'No-Show Rescue',
      'Estimate Follow-Up',
      'Objection Handler',
    ],
    cta: 'Start with Convert',
    plan: 'convert',
    popular: true,
  },
  {
    name: 'Full Funnel',
    priceMonthly: 997,
    tagline: 'Capture, convert, reclaim.',
    features: [
      'Everything in Convert',
      'Dead Lead Reactivation',
      'Ghosted Bid Reopener',
      'Old Customer Re-engagement',
      'AI Voice Notes',
      'Custom industry playbooks',
    ],
    cta: 'Go Full Funnel',
    plan: 'full',
    popular: false,
  },
];

export function Pricing({ onGetStarted }) {
  const [annual, setAnnual] = useState(false);

  const priceFor = (m) => (annual ? Math.round((m * 10) / 12) : m);
  const period = annual ? '/ mo, billed annually' : '/ mo';

  return (
    <section id="pricing" className="py-20 md:py-28">
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
            Simple pricing
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight"
            style={{ color: 'var(--text-bright)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
          >
            Pick the pillars you need.
          </h2>
          <p className="mt-4 text-base mx-auto max-w-md" style={{ color: 'var(--text-muted)' }}>
            Flat-rate. No per-minute games. Cancel anytime.
          </p>

          {/* Annual toggle */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 28,
              padding: 4,
              borderRadius: 999,
              background: 'var(--dark-surface-2)',
              border: '1px solid var(--dark-border)',
            }}
          >
            <button
              onClick={() => setAnnual(false)}
              className={`tab-pill ${!annual ? 'active' : ''}`}
              style={{ fontSize: 12.5 }}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`tab-pill ${annual ? 'active' : ''}`}
              style={{ fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              Annual
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 7px',
                  borderRadius: 999,
                  background: 'var(--emerald-bright)',
                  color: '#ffffff',
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                }}
              >
                2 MONTHS FREE
              </span>
            </button>
          </div>
        </div>

        <AnimatedGroup preset="blur-slide" className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`glow-card relative ${tier.popular ? 'glow-border' : ''}`}
              style={{
                padding: 32,
                boxShadow: tier.popular ? '0 0 60px rgba(16,185,129,0.15)' : undefined,
              }}
            >
              {tier.popular && (
                <div
                  className="lime-pill"
                  style={{
                    position: 'absolute',
                    top: -16,
                    right: 24,
                    padding: '5px 14px',
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
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

              <div style={{ marginTop: 14, lineHeight: 1 }}>
                <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-muted)' }}>$</span>
                <span
                  style={{
                    fontSize: 52,
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'var(--text-bright)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {priceFor(tier.priceMonthly)}
                </span>
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>{period}</div>

              <div style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: 14.5 }}>
                {tier.tagline}
              </div>

              <div style={{ margin: '24px 0', borderTop: '1px solid var(--dark-border)' }} />

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                {tier.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 0',
                      fontSize: 14,
                      color: 'var(--text-bright)',
                    }}
                  >
                    <Check size={16} style={{ color: 'var(--emerald-bright)', flexShrink: 0 }} />
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
