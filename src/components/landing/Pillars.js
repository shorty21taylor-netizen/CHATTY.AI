'use client';

import { CloudRain, Smartphone, DollarSign } from 'lucide-react';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';

const STEPS = [
  {
    tag: 'SIGNAL',
    icon: CloudRain,
    headline: 'Wednesday, 7am',
    body: 'Hailstorm hits your region. Chatty sees the weather signal + 23 new inbound leads across your forms, Google Ads, and missed calls.',
  },
  {
    tag: 'BRIEF',
    icon: Smartphone,
    headline: 'Thursday, 6am',
    body: "Your daily brief text arrives: 'High-intent leads detected. Your crew can close 4 jobs this week. Here\u2019s who to call first, in priority order.'",
    hero: true,
  },
  {
    tag: 'BOOKED',
    icon: DollarSign,
    headline: 'By Friday',
    body: '3 jobs booked, 2 estimates out. The AI learned which leads you closed and updated your playbook for next week.',
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
            How it works
          </div>
          <h2
            className="font-bold tracking-tight mx-auto max-w-3xl"
            style={{ fontSize: 44, color: 'var(--text-bright)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
          >
            From signal to sale in 48 hours.
          </h2>
          <p className="mt-4 text-base mx-auto max-w-xl" style={{ color: 'var(--text-muted)' }}>
            Real story, real timeline &mdash; what happens when Chatty AI runs your funnel.
          </p>
        </div>

        <AnimatedGroup preset="blur-slide" className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.tag}
                className={`glow-card ${s.hero ? 'glow-border' : ''}`}
                style={{
                  padding: 30,
                  minHeight: 300,
                  boxShadow: s.hero ? '0 0 60px rgba(16,185,129,0.15)' : undefined,
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: 'var(--emerald-tint)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: 'var(--emerald-bright)',
                    marginBottom: 16,
                  }}
                >
                  {s.tag}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'var(--emerald-tint)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} style={{ color: 'var(--emerald-bright)' }} />
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--text-bright)',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    marginBottom: 12,
                  }}
                >
                  {s.headline}
                </h3>

                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: 'var(--text-muted)',
                    margin: 0,
                  }}
                >
                  {s.body}
                </p>
              </div>
            );
          })}
        </AnimatedGroup>
      </div>
    </section>
  );
}
