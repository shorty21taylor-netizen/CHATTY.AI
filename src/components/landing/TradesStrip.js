'use client';

const TRADES = [
  'General Contractors',
  'Remodelers',
  'Roofers',
  'HVAC',
  'Plumbers',
  'Electricians',
  'Solar',
  'Windows & Doors',
];

export function TradesStrip() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <p
          className="text-center text-xs font-semibold uppercase tracking-widest mb-8"
          style={{ color: 'var(--text-muted)' }}
        >
          Built for the trades
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          {TRADES.map((t, i) => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 20 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  color: 'rgba(245,247,245,0.35)',
                  transition: 'color .2s',
                }}
              >
                {t}
              </span>
              {i < TRADES.length - 1 ? (
                <span
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    background: 'rgba(245,247,245,0.2)',
                    display: 'inline-block',
                  }}
                />
              ) : null}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
