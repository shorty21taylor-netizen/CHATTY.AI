'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';

const TIERS = [
  {
    name: 'Starter',
    priceMonthly: 199,
    tagline: 'Get your first Daily Brief tomorrow.',
    features: [
      'Up to 500 leads/mo',
      '3 agents included',
      'Daily Brief via SMS',
      'Built-in CRM',
      'Telegram EA',
    ],
    cta: 'Start with Starter',
    plan: 'starter',
    popular: false,
  },
  {
    name: 'Pro',
    priceMonthly: 499,
    tagline: 'The full AI sales team.',
    features: [
      'Unlimited leads',
      'All 11 agents',
      'Voice agent (ElevenLabs)',
      'Per-vertical playbooks',
      'Priority support',
      'Advanced analytics',
    ],
    cta: 'Go Pro',
    plan: 'pro',
    popular: true,
  },
  {
    name: 'Scale',
    priceMonthly: null,
    tagline: 'Multi-location, white-glove.',
    features: [
      'Everything in Pro',
      'Multi-location support',
      'Sub-accounts',
      'Dedicated CS manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Talk to Sales',
    plan: 'scale',
    popular: false,
  },
];

export function Pricing({ onGetStarted }) {
  const [annual, setAnnual] = useState(false);
  const [roiLeads, setRoiLeads] = useState(200);
  const [roiCloseRate, setRoiCloseRate] = useState(15);
  const [roiDealSize, setRoiDealSize] = useState(8000);

  const priceFor = (m) => {
    if (m === null) return null;
    return annual ? Math.round((m * 10) / 12) : m;
  };
  const period = annual ? '/ mo, billed annually' : '/ mo';

  const dailyRevenue = (roiLeads * (roiCloseRate / 100) * roiDealSize * 0.15) / 30;
  const paybackRaw = dailyRevenue > 0 ? Math.round(499 / dailyRevenue) : 999;
  const paybackDays = Math.max(1, Math.min(60, paybackRaw));

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
                borderLeft: tier.popular ? '4px solid var(--emerald-bright)' : undefined,
              }}
            >
              {tier.popular && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: 'var(--emerald-bright)',
                      borderRadius: '12px 12px 0 0',
                    }}
                  />
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
                </>
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
                {tier.priceMonthly !== null ? (
                  <>
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
                  </>
                ) : (
                  <span
                    style={{
                      fontSize: 40,
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      color: 'var(--text-bright)',
                    }}
                  >
                    Custom
                  </span>
                )}
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                {tier.priceMonthly !== null ? period : 'Contact us'}
              </div>

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

        {/* ROI Calculator */}
        <div
          className="glow-card mt-12 mx-auto max-w-2xl"
          style={{ padding: '28px 32px' }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text-bright)',
              marginBottom: 4,
            }}
          >
            ROI Calculator
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>
            Plug in your numbers — see how fast Chatty AI pays for itself.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Leads / mo
              </label>
              <input
                type="number"
                value={roiLeads}
                onChange={(e) => setRoiLeads(Number(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--dark-border)',
                  background: 'var(--dark-surface-2)',
                  color: 'var(--text-bright)',
                  fontSize: 14,
                  fontVariantNumeric: 'tabular-nums',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Close rate %
              </label>
              <input
                type="number"
                value={roiCloseRate}
                onChange={(e) => setRoiCloseRate(Number(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--dark-border)',
                  background: 'var(--dark-surface-2)',
                  color: 'var(--text-bright)',
                  fontSize: 14,
                  fontVariantNumeric: 'tabular-nums',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Avg deal size $
              </label>
              <input
                type="number"
                value={roiDealSize}
                onChange={(e) => setRoiDealSize(Number(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--dark-border)',
                  background: 'var(--dark-surface-2)',
                  color: 'var(--text-bright)',
                  fontSize: 14,
                  fontVariantNumeric: 'tabular-nums',
                }}
              />
            </div>
          </div>

          <div
            style={{
              padding: '14px 18px',
              borderRadius: 10,
              background: 'var(--emerald-tint)',
              border: '1px solid rgba(16,185,129,0.25)',
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--emerald-bright)',
              textAlign: 'center',
            }}
          >
            At your numbers, Chatty AI pays for itself in ~{paybackDays} day{paybackDays !== 1 ? 's' : ''}.
          </div>
        </div>
      </div>
    </section>
  );
}
