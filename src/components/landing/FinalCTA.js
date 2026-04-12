'use client';

import { Button } from '@/components/ui/Button';

export function FinalCTA({ onGetStarted }) {
  return (
    <section className="px-6 py-16">
      <div
        className="mx-auto max-w-6xl rounded-3xl border text-center relative overflow-hidden"
        style={{
          padding: '72px 48px',
          background: 'linear-gradient(135deg, var(--emerald) 0%, var(--emerald-mid) 60%, #0a2d20 100%)',
          borderColor: 'rgba(52,211,153,0.3)',
          boxShadow: '0 0 0 1px rgba(52,211,153,0.15), 0 40px 120px rgba(15,61,46,0.5)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 0%, rgba(52,211,153,0.25), transparent 60%)' }}
        />
        <h2
          className="relative text-4xl md:text-5xl font-bold tracking-tight mx-auto max-w-3xl"
          style={{ color: 'var(--text-bright)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
        >
          Stop missing calls.
          <br />
          Start booking appointments.
        </h2>
        <div className="relative mt-10">
          <Button size="lg" onClick={onGetStarted}>
            Get Chatty.AI {'\u2192'}
          </Button>
        </div>
      </div>
    </section>
  );
}
