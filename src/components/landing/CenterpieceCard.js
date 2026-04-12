'use client';

import { AnimatedGroup } from '@/components/ui/AnimatedGroup';

export function CenterpieceCard() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedGroup preset="blur-slide">
          <div className="spotlight-card text-center">
            <h2
              className="font-bold mx-auto max-w-3xl"
              style={{
                fontSize: 56,
                color: 'var(--text-bright)',
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
              }}
            >
              More than just
              <br />a receptionist
            </h2>
            <p
              className="mx-auto mt-6"
              style={{
                color: 'var(--text-muted)',
                fontSize: 16,
                lineHeight: 1.6,
                maxWidth: 500,
              }}
            >
              Chatty isn&apos;t just answering calls &mdash; it&apos;s qualifying leads, booking
              appointments, sending follow-ups, and reporting back to you on Telegram.
              A full sales infrastructure for $97/mo.
            </p>
            <div className="mt-8">
              <button className="lime-pill">
                Talk to Sales {'\u2192'}
              </button>
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
