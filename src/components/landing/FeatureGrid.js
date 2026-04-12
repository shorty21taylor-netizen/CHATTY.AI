'use client';

import { Phone, ArrowRight, MessageCircle } from 'lucide-react';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';

const FEATURES = [
  {
    Icon: Phone,
    title: 'Inbound Qualification',
    body: 'Every call answered in under 1 second. Leads scored, qualified, and routed straight into your calendar.',
  },
  {
    Icon: ArrowRight,
    title: 'Outbound Outreach',
    body: 'Wake up to a calendar full of appointments. Your AI dialed all night — follow-ups, cold lists, re-engagement.',
  },
  {
    Icon: MessageCircle,
    title: 'Telegram EA',
    body: 'Text your assistant. Get instant answers on calls, closes, and what\u2019s next — from anywhere, 24/7.',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <div className="dark-pill mx-auto mb-5" style={{ width: 'fit-content' }}>
            Built for operators
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight mx-auto max-w-2xl"
            style={{ color: 'var(--text-bright)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
          >
            Three agents working
            <br />
            while you sleep.
          </h2>
        </div>

        <AnimatedGroup preset="blur-slide" className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map(({ Icon, title, body }) => (
            <div key={title} className="dark-card p-8">
              <div className="feature-icon mb-5">
                <Icon size={22} />
              </div>
              <div
                className="text-xl font-bold mb-3"
                style={{ color: 'var(--text-bright)', letterSpacing: '-0.01em' }}
              >
                {title}
              </div>
              <p className="text-sm leading-relaxed m-0" style={{ color: 'var(--text-muted)' }}>
                {body}
              </p>
            </div>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  );
}
