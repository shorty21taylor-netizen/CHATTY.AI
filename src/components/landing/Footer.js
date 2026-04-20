'use client';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Telegram EA', href: '#telegram' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'DPA', href: '/dpa' },
    ],
  },
];

export function Footer() {
  return (
    <footer
      style={{ borderTop: '1px solid var(--dark-border)', marginTop: 40, padding: '60px 24px 40px' }}
    >
      <div
        className="mx-auto max-w-7xl grid gap-12"
        style={{ gridTemplateColumns: '1.4fr 1fr 1fr 1fr' }}
      >
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ background: 'var(--emerald-bright)', boxShadow: '0 0 12px var(--emerald-glow)' }}
            />
            <span className="font-bold text-lg" style={{ color: 'var(--text-bright)' }}>
              Chatty.AI
            </span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs m-0" style={{ color: 'var(--text-muted)' }}>
            The always-on AI receptionist for operators who refuse to miss another call.
          </p>
        </div>

        {/* Link columns */}
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text-bright)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 14,
              }}
            >
              {col.title}
            </div>
            {col.links.map((l) => (
              <a key={l.label} href={l.href} className="footer-link">
                {l.label}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div
        className="mx-auto max-w-7xl mt-10 pt-6"
        style={{ borderTop: '1px solid var(--dark-border)', fontSize: 12, color: 'var(--text-muted)' }}
      >
        &copy; 2026 Chatty.AI &mdash; Built for operators who hate missed calls.
      </div>
    </footer>
  );
}
