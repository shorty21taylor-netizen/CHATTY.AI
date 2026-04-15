'use client';

import Link from 'next/link';
import {
  DollarSign,
  Trophy,
  Zap,
  FileText,
  CalendarCheck,
  Shield,
  Ghost,
  Star,
  Users,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const AGENT_CONTRIBUTIONS = [
  {
    id: 'quote-follow-up',
    name: 'Quote Follow-Up',
    icon: FileText,
    color: 'var(--emerald-bright)',
    attributed: 38400,
    attributedLabel: '$38.4K',
    deals: 6,
  },
  {
    id: 'instant-lead',
    name: 'Instant Lead Response',
    icon: Zap,
    color: '#3b82f6',
    attributed: 32100,
    attributedLabel: '$32.1K',
    deals: 4,
  },
  {
    id: 'appointment-setter',
    name: 'Appointment Setter',
    icon: CalendarCheck,
    color: '#8b5cf6',
    attributed: 24800,
    attributedLabel: '$24.8K',
    deals: 3,
  },
  {
    id: 'objection-handler',
    name: 'Objection Handler',
    icon: Shield,
    color: '#f59e0b',
    attributed: 18200,
    attributedLabel: '$18.2K',
    deals: 2,
  },
  {
    id: 'ghosted-bid',
    name: 'Ghosted Bid Follow-Up',
    icon: Ghost,
    color: '#ec4899',
    attributed: 11300,
    attributedLabel: '$11.3K',
    deals: 1,
  },
];

const REASON_COLORS = {
  Speed: 'var(--emerald-bright)',
  Persistence: '#3b82f6',
  Price: '#f59e0b',
  Relationship: '#8b5cf6',
  Referral: '#ec4899',
};

const WON_DEALS = [
  {
    id: 1,
    contact: 'Patricia Williams',
    service: 'Full Roof Replacement',
    amount: 14800,
    amountLabel: '$14,800',
    wonDate: 'Apr 14',
    reason: 'Speed',
    agents: ['Instant Lead Response', 'Quote Follow-Up'],
  },
  {
    id: 2,
    contact: 'Marcus Miller',
    service: 'HVAC System Upgrade',
    amount: 11200,
    amountLabel: '$11,200',
    wonDate: 'Apr 12',
    reason: 'Persistence',
    agents: ['Quote Follow-Up', 'Objection Handler'],
  },
  {
    id: 3,
    contact: 'Sarah Chen',
    service: 'Solar Install — 8.4kW',
    amount: 28400,
    amountLabel: '$28,400',
    wonDate: 'Apr 11',
    reason: 'Relationship',
    agents: ['Appointment Setter', 'Quote Follow-Up'],
  },
  {
    id: 4,
    contact: 'James Rodriguez',
    service: 'Gutter Replacement',
    amount: 4200,
    amountLabel: '$4,200',
    wonDate: 'Apr 09',
    reason: 'Speed',
    agents: ['Instant Lead Response'],
  },
  {
    id: 5,
    contact: 'Jennifer Davis',
    service: 'Roof Repair + Leak Fix',
    amount: 6800,
    amountLabel: '$6,800',
    wonDate: 'Apr 08',
    reason: 'Persistence',
    agents: ['Ghosted Bid Follow-Up'],
  },
  {
    id: 6,
    contact: 'Robert Thompson',
    service: 'Siding + Window Package',
    amount: 19400,
    amountLabel: '$19,400',
    wonDate: 'Apr 06',
    reason: 'Price',
    agents: ['Quote Follow-Up', 'Objection Handler'],
  },
];

const WIN_REASONS = [
  { name: 'Speed', value: 33, color: 'var(--emerald-bright)' },
  { name: 'Persistence', value: 27, color: '#3b82f6' },
  { name: 'Price', value: 20, color: '#f59e0b' },
  { name: 'Relationship', value: 13, color: '#8b5cf6' },
  { name: 'Referral', value: 7, color: '#ec4899' },
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

function StatCard({ label, value, hint, accent }) {
  return (
    <div
      className="dark-card"
      style={{
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: accent ? 'var(--emerald-bright)' : 'var(--text-bright)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      {hint ? (
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</div>
      ) : null}
    </div>
  );
}

function AgentContributionTile({ agent }) {
  const Icon = agent.icon;
  return (
    <div
      className="dark-card"
      style={{
        padding: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: `color-mix(in srgb, ${agent.color} 18%, transparent)`,
          color: agent.color,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-bright)',
            }}
          >
            {agent.name}
          </span>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--emerald-bright)',
              boxShadow: '0 0 6px var(--emerald-glow)',
            }}
            title="Active"
          />
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            marginTop: 2,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {agent.deals} {agent.deals === 1 ? 'deal' : 'deals'} influenced
        </div>
      </div>
      <div
        style={{
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--emerald-bright)',
            letterSpacing: '-0.01em',
          }}
        >
          {agent.attributedLabel}
        </div>
        <div
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          attributed
        </div>
      </div>
    </div>
  );
}

function WonDealCard({ deal }) {
  const reasonColor = REASON_COLORS[deal.reason] || 'var(--text-muted)';
  return (
    <div
      className="dark-card"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-bright)',
            }}
          >
            {deal.contact}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {deal.service}
          </div>
        </div>
        <Pill color={reasonColor}>{deal.reason.toUpperCase()}</Pill>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--emerald-bright)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.01em',
          }}
        >
          {deal.amountLabel}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          Won {deal.wonDate}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          paddingTop: 10,
          borderTop: '1px solid var(--border)',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}
      >
        <Sparkles size={11} style={{ color: 'var(--emerald-bright)' }} />
        <span>
          AI assisted by{' '}
          <span style={{ color: 'var(--text-body)' }}>
            {deal.agents.join(' + ')}
          </span>
        </span>
      </div>
    </div>
  );
}

export default function ClosedRevenuePage() {
  return (
    <div>
      {/* Header */}
      <div>
        <div
          className="t-eyebrow"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Trophy size={12} style={{ color: 'var(--emerald-bright)' }} />
          Deliverable
        </div>
        <h1
          className="t-h1"
          style={{
            margin: '6px 0 6px',
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: '-0.01em',
          }}
        >
          Closed Revenue
        </h1>
        <p
          className="t-body-sm"
          style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-body)' }}
        >
          Deals won, and exactly how the AI contributed to each.
        </p>
      </div>

      {/* Hero */}
      <div
        className="dark-card"
        style={{
          padding: 28,
          marginTop: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
          borderColor:
            'color-mix(in srgb, var(--emerald-bright) 40%, var(--border))',
          boxShadow: '0 0 28px rgba(16,185,129,0.14)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background:
                'color-mix(in srgb, var(--emerald-bright) 18%, transparent)',
              color: 'var(--emerald-bright)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <DollarSign size={26} />
          </div>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--emerald-hover)',
                fontWeight: 700,
              }}
            >
              Closed this month
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                lineHeight: 1,
                color: 'var(--emerald-bright)',
                marginTop: 6,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
              }}
            >
              $124,800
            </div>
            <div
              style={{
                fontSize: 14,
                color: 'var(--text-body)',
                marginTop: 8,
              }}
            >
              <b>15</b> deals won · AI influenced <b>13</b> of them
            </div>
          </div>
        </div>
        <Pill color="var(--emerald-bright)">AI INFLUENCE 87%</Pill>
      </div>

      {/* Stat strip */}
      <div
        className="cr-stat-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginTop: 16,
        }}
      >
        <StatCard label="Deals Won" value="15" hint="This month" />
        <StatCard label="AI-Influenced" value="13" hint="87% of deals" accent />
        <StatCard label="Avg Deal Size" value="$8,320" hint="Up 12% MoM" />
        <StatCard label="Win Rate" value="44%" hint="Industry avg: 27%" />
      </div>

      {/* Agents that contributed */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 4,
          }}
        >
          Agents that contributed
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          Revenue attribution by agent, sorted by $ influenced.
        </div>
        <div
          className="cr-agent-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}
        >
          {AGENT_CONTRIBUTIONS.map((a) => (
            <AgentContributionTile key={a.id} agent={a} />
          ))}
        </div>
      </div>

      {/* Recently Won + Win Reasons */}
      <div
        className="cr-main-grid"
        style={{
          marginTop: 28,
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 20,
        }}
      >
        {/* Recently Won */}
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-bright)',
              marginBottom: 12,
            }}
          >
            Recently won
          </div>
          <div
            className="cr-won-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
            }}
          >
            {WON_DEALS.map((d) => (
              <WonDealCard key={d.id} deal={d} />
            ))}
          </div>
        </div>

        {/* Win Reasons */}
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-bright)',
              marginBottom: 12,
            }}
          >
            Win reasons
          </div>
          <div className="dark-card" style={{ padding: 20 }}>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={WIN_REASONS}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke="var(--surface-1)"
                    strokeWidth={2}
                  >
                    {WIN_REASONS.map((r, i) => (
                      <Cell key={i} fill={r.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v) => `${v}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid var(--border)',
              }}
            >
              {WIN_REASONS.map((r) => (
                <div
                  key={r.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    fontSize: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: r.color,
                      }}
                    />
                    <span style={{ color: 'var(--text-body)' }}>{r.name}</span>
                  </div>
                  <span
                    style={{
                      color: 'var(--text-muted)',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 600,
                    }}
                  >
                    {r.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div
        className="dark-card"
        style={{
          marginTop: 28,
          padding: 24,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
          borderColor:
            'color-mix(in srgb, var(--emerald-bright) 30%, var(--border))',
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--emerald-bright) 6%, transparent), transparent)',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background:
              'color-mix(in srgb, var(--emerald-bright) 18%, transparent)',
            color: 'var(--emerald-bright)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <TrendingUp size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text-bright)',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            What happens next
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontSize: 13,
              color: 'var(--text-body)',
              lineHeight: 1.55,
            }}
          >
            <div
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
            >
              <Star size={14} style={{ color: 'var(--emerald-bright)', flexShrink: 0 }} />
              <span>
                <b style={{ color: 'var(--text-bright)' }}>Review Request</b> will
                ask these <b>15</b> happy customers for Google reviews in{' '}
                <b>3–5 days</b>.
              </span>
            </div>
            <div
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
            >
              <Users size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
              <span>
                <b style={{ color: 'var(--text-bright)' }}>
                  Past Customer Re-engagement
                </b>{' '}
                will re-touch them in <b>90 days</b> for referrals and repeat
                work.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div
        style={{
          marginTop: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          padding: 20,
          borderRadius: 12,
          border: '1px solid var(--border)',
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--emerald-bright) 6%, transparent), transparent)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            minWidth: 0,
          }}
        >
          <Sparkles size={16} style={{ color: 'var(--emerald-bright)' }} />
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-bright)',
              }}
            >
              Want to see which ad source drove the most revenue?
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Open Analytics for source-level ROI breakdowns.
            </div>
          </div>
        </div>
        <Link href="/dashboard/analytics" className="btn-primary">
          View analytics
          <ArrowRight size={14} />
        </Link>
      </div>

      <style jsx>{`
        @media (max-width: 1200px) {
          :global(.cr-main-grid) {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 1100px) {
          :global(.cr-stat-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          :global(.cr-agent-grid) {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          :global(.cr-stat-grid) {
            grid-template-columns: 1fr !important;
          }
          :global(.cr-won-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
