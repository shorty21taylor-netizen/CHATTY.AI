'use client';

const BADGES = ['ServiceTitan', 'JobNimbus', 'HubSpot', 'Salesforce'];

export function StackCompatibility() {
  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-4xl px-6">
        <div
          style={{
            padding: '28px 32px',
            borderRadius: 16,
            background: 'var(--dark-surface-2)',
            border: '1px solid rgba(16,185,129,0.25)',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:gap-8 gap-5">
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--text-bright)',
                  letterSpacing: '-0.01em',
                  marginBottom: 8,
                }}
              >
                Not a CRM replacement.
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                  margin: 0,
                }}
              >
                Chatty AI runs on top of your ServiceTitan, JobNimbus, HubSpot, or Salesforce &mdash; we don&rsquo;t
                replace it, we make it think. Connect in 5 minutes, get your first Daily Brief tomorrow at 6am.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 flex-shrink-0">
              {BADGES.map((name) => (
                <span
                  key={name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 14px',
                    borderRadius: 999,
                    background: 'var(--emerald-tint)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--emerald-bright)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
