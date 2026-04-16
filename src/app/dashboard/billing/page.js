'use client';

import {
  Rocket,
  CreditCard,
  MessageSquare,
  Mic,
  Bot,
  Download,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

const USAGE = [
  {
    icon: MessageSquare,
    label: 'SMS sent',
    used: 2147,
    limit: 5000,
    color: '#3b82f6',
  },
  {
    icon: Mic,
    label: 'Voice minutes',
    used: 289,
    limit: 500,
    color: '#8b5cf6',
  },
  {
    icon: Bot,
    label: 'Voice agents',
    used: 3,
    limit: 3,
    color: '#f59e0b',
    amber: true,
  },
];

const INVOICES = [
  { id: 'INV-2026-04', date: 'Apr 15, 2026', amount: '$497.00', status: 'Paid' },
  { id: 'INV-2026-03', date: 'Mar 15, 2026', amount: '$497.00', status: 'Paid' },
  { id: 'INV-2026-02', date: 'Feb 15, 2026', amount: '$497.00', status: 'Paid' },
  { id: 'INV-2026-01', date: 'Jan 15, 2026', amount: '$497.00', status: 'Paid' },
  { id: 'INV-2025-12', date: 'Dec 15, 2025', amount: '$497.00', status: 'Paid' },
  { id: 'INV-2025-11', date: 'Nov 15, 2025', amount: '$497.00', status: 'Paid' },
];

const PLAN_TIERS = [
  {
    name: 'Starter',
    price: '$197',
    hint: 'Solo operator',
    features: ['2,000 SMS', '200 voice minutes', '1 voice agent', 'Daily brief'],
  },
  {
    name: 'Growth',
    price: '$497',
    hint: 'Current plan',
    features: [
      '5,000 SMS',
      '500 voice minutes',
      '3 voice agents',
      'All 11 AI agents',
      '5 team seats',
    ],
    current: true,
  },
  {
    name: 'Scale',
    price: '$1,497',
    hint: 'Multi-crew',
    features: [
      '20,000 SMS',
      '2,000 voice minutes',
      '10 voice agents',
      'Priority Decision Engine',
      'Unlimited team seats',
      'Voice Lab cloning',
    ],
  },
];

function Pill({ color, children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.08em',
        borderRadius: 999,
        color,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

function UsageCard({ icon, label, used, limit, color, amber }) {
  const Icon = icon;
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const barColor = amber ? '#f59e0b' : color;
  return (
    <div
      className="dark-card"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        borderColor: amber
          ? 'color-mix(in srgb, #f59e0b 40%, var(--border))'
          : 'var(--border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontWeight: 600,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              borderRadius: 6,
              background: `color-mix(in srgb, ${barColor} 14%, transparent)`,
              color: barColor,
            }}
          >
            <Icon size={13} />
          </span>
          {label}
        </div>
        {amber ? <Pill color="#f59e0b">LIMIT</Pill> : null}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text-bright)',
            letterSpacing: '-0.02em',
          }}
        >
          {used.toLocaleString('en-US')}
        </span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          / {limit.toLocaleString('en-US')}
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: 'color-mix(in srgb, var(--text-muted) 14%, transparent)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            transition: 'width 400ms ease',
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {pct}% used · resets May 15
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <div>
      <div>
        <div className="t-eyebrow">Billing</div>
        <h1 className="t-h1" style={{ margin: '8px 0 6px' }}>
          Plan &amp; billing
        </h1>
        <p className="t-body-sm" style={{ margin: 0 }}>
          Your current plan, usage, and invoice history.
        </p>
      </div>

      {/* Plan hero */}
      <div
        className="dark-card"
        style={{
          padding: 24,
          marginTop: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
          borderColor:
            'color-mix(in srgb, var(--primary) 40%, var(--border))',
          boxShadow: '0 0 24px rgba(16,185,129,0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background:
                'color-mix(in srgb, var(--primary) 18%, transparent)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Rocket size={22} />
          </div>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--primary)',
                fontWeight: 600,
              }}
            >
              Current plan
              <Pill color="var(--primary)">ACTIVE</Pill>
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text-bright)',
                marginTop: 4,
                letterSpacing: '-0.02em',
              }}
            >
              Growth · $497 / month
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginTop: 2,
              }}
            >
              Next invoice: May 15, 2026 · Visa •••• 4242
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="filter-pill">
            Change plan
          </button>
          <button type="button" className="btn-primary">
            <ArrowUpRight size={14} />
            Upgrade to Scale
          </button>
        </div>
      </div>

      {/* Usage */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 12,
          }}
        >
          Usage this cycle
        </div>
        <div
          className="billing-usage-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {USAGE.map((u) => (
            <UsageCard key={u.label} {...u} />
          ))}
        </div>
      </div>

      {/* Payment method */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 12,
          }}
        >
          Payment method
        </div>
        <div
          className="dark-card"
          style={{
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'color-mix(in srgb, #635bff 18%, transparent)',
                color: '#635bff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCard size={18} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-bright)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                Visa ending in 4242
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginTop: 2,
                }}
              >
                Expires 08/2028 · Billing to anthony@taylorroofing.com
              </div>
            </div>
          </div>
          <button
            type="button"
            className="filter-pill"
            disabled
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
            title="Update card from Stripe Customer Portal (coming soon)"
          >
            Update card
          </button>
        </div>
      </div>

      {/* Invoices */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 12,
          }}
        >
          Invoice history
        </div>
        <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right', width: 110 }}></th>
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((inv) => (
                  <tr key={inv.id}>
                    <td
                      style={{
                        color: 'var(--text-bright)',
                        fontWeight: 500,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {inv.id}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{inv.date}</td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--text-bright)',
                      }}
                    >
                      {inv.amount}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Pill color="var(--primary)">
                        {inv.status.toUpperCase()}
                      </Pill>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="filter-pill"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Download size={12} />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Plan comparison teaser */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 4,
          }}
        >
          Compare plans
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          Upgrade anytime — usage carries over within the cycle.
        </div>
        <div
          className="billing-plan-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {PLAN_TIERS.map((p) => (
            <div
              key={p.name}
              className="dark-card"
              style={{
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                borderColor: p.current
                  ? 'color-mix(in srgb, var(--primary) 40%, var(--border))'
                  : 'var(--border)',
                boxShadow: p.current ? '0 0 24px rgba(16,185,129,0.10)' : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-bright)',
                  }}
                >
                  {p.name}
                </div>
                {p.current ? (
                  <Pill color="var(--primary)">CURRENT</Pill>
                ) : null}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: 'var(--text-bright)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {p.price}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  / month
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {p.hint}
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginTop: 4,
                }}
              >
                {p.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      color: 'var(--text-body)',
                    }}
                  >
                    <CheckCircle2
                      size={13}
                      style={{ color: 'var(--primary)', flexShrink: 0 }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={p.current ? 'filter-pill' : 'btn-primary'}
                disabled={p.current}
                style={{
                  marginTop: 'auto',
                  opacity: p.current ? 0.6 : 1,
                  cursor: p.current ? 'not-allowed' : 'pointer',
                }}
              >
                {p.current ? 'Current plan' : `Switch to ${p.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1100px) {
          :global(.billing-usage-grid),
          :global(.billing-plan-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
