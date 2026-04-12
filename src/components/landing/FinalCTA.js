'use client';

import { Button } from '@/components/ui/Button';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';

export function FinalCTA({ onGetStarted }) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <AnimatedGroup preset="blur-slide">
          <div className="spotlight-card text-center" style={{ padding: '56px 48px' }}>
            <h2
              className="font-bold tracking-tight mx-auto max-w-3xl"
              style={{ fontSize: 48, color: 'var(--text-bright)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
            >
              Stop leaking leads.
              <br />
              Start closing bids.
            </h2>
            <div className="mt-10">
              <Button size="lg" onClick={onGetStarted}>
                See Your Funnel {'\u2192'}
              </Button>
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
