'use client';

const METRICS = [
  { value: '40%', label: 'faster lead response' },
  { value: '23%', label: 'higher close rate' },
  { value: '$12K', label: 'avg. monthly impact' },
];

export function ResultsStrip() {
  return (
    <section
      style={{
        padding: '28px 0',
        background: 'var(--emerald-tint)',
        borderTop: '1px solid rgba(16,185,129,0.15)',
        borderBottom: '1px solid rgba(16,185,129,0.15)',
      }}
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {METRICS.map((m) => (
            <div key={m.value}>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--emerald-bright)',
                  lineHeight: 1,
                }}
              >
                {m.value}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {m.label}
              </div>
            </div>
          ))}
        </div>
        <p
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--text-muted)',
            marginTop: 16,
            opacity: 0.6,
          }}
        >
          *Based on pilot customer data, Q1 2026.
        </p>
      </div>
    </section>
  );
}
