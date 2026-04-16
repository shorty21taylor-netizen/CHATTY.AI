'use client';

import Link from 'next/link';
import {
  Zap,
  Clock,
  MessageSquare,
  Globe,
  MessageCircle,
  Camera,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const AGENTS = [
  {
    id: 'instant-lead',
    name: 'Instant Lead Response',
    icon: Zap,
    color: 'var(--primary)',
    status: 'active',
    count: 42,
    countLabel: 'leads today',
  },
  {
    id: 'form-bot',
    name: 'Form Bot',
    icon: Globe,
    color: '#3b82f6',
    status: 'active',
    count: 3,
    countLabel: 'forms',
  },
  {
    id: 'social-dm',
    name: 'Social DM Agent',
    icon: MessageSquare,
    color: '#8b5cf6',
    status: 'active',
    count: 2,
    countLabel: 'DMs',
  },
];

const DISTRIBUTION = [
  { bucket: '<30s', count: 34, color: 'var(--primary)' },
  { bucket: '30-60s', count: 11, color: '#3b82f6' },
  { bucket: '1-2m', count: 2, color: '#8b5cf6' },
  { bucket: '2-5m', count: 0, color: '#f59e0b' },
  { bucket: '>5m', count: 0, color: 'var(--text-muted)' },
];

const LEADS_TODAY = [
  {
    id: 1,
    received: '10:42 AM',
    name: 'Patricia Williams',
    source: 'Google Ads',
    sourceIcon: Globe,
    responseTime: '8s',
    responseColor: 'var(--primary)',
    agent: 'Instant Lead Response',
    status: 'Booked',
    statusColor: 'var(--primary)',
  },
  {
    id: 2,
    received: '10:28 AM',
    name: 'Marcus Miller',
    source: 'Facebook',
    sourceIcon: MessageCircle,
    responseTime: '14s',
    responseColor: 'var(--primary)',
    agent: 'Instant Lead Response',
    status: 'Replied',
    statusColor: '#3b82f6',
  },
  {
    id: 3,
    received: '10:04 AM',
    name: 'Sarah Chen',
    source: 'Website Form',
    sourceIcon: Globe,
    responseTime: '22s',
    responseColor: 'var(--primary)',
    agent: 'Form Bot',
    status: 'Booked',
    statusColor: 'var(--primary)',
  },
  {
    id: 4,
    received: '9:51 AM',
    name: 'James Rodriguez',
    source: 'Instagram DM',
    sourceIcon: Camera,
    responseTime: '31s',
    responseColor: 'var(--primary)',
    agent: 'Social DM Agent',
    status: 'Replied',
    statusColor: '#3b82f6',
  },
  {
    id: 5,
    received: '9:33 AM',
    name: 'Jennifer Davis',
    source: 'Google Ads',
    sourceIcon: Globe,
    responseTime: '18s',
    responseColor: 'var(--primary)',
    agent: 'Instant Lead Response',
    status: 'No Response',
    statusColor: 'var(--text-muted)',
  },
  {
    id: 6,
    received: '9:17 AM',
    name: 'Robert Thompson',
    source: 'Facebook',
    sourceIcon: MessageCircle,
    responseTime: '42s',
    responseColor: '#3b82f6',
    agent: 'Instant Lead Response',
    status: 'Replied',
    statusColor: '#3b82f6',
  },
  {
    id: 7,
    received: '9:02 AM',
    name: 'Kevin Park',
    source: 'Website Form',
    sourceIcon: Globe,
    responseTime: '12s',
    responseColor: 'var(--primary)',
    agent: 'Form Bot',
    status: 'Booked',
    statusColor: 'var(--primary)',
  },
  {
    id: 8,
    received: '8:48 AM',
    name: 'Linda Martinez',
    source: 'Google Ads',
    sourceIcon: Globe,
    responseTime: '26s',
    responseColor: 'var(--primary)',
    agent: 'Instant Lead Response',
    status: 'Replied',
    statusColor: '#3b82f6',
  },
  {
    id: 9,
    received: '8:31 AM',
    name: 'David Kim',
    source: 'Facebook',
    sourceIcon: MessageCircle,
    responseTime: '1m 18s',
    responseColor: '#8b5cf6',
    agent: 'Instant Lead Response',
    status: 'No Response',
    statusColor: 'var(--text-muted)',
  },
  {
    id: 10,
    received: '8:12 AM',
    name: 'Amanda Foster',
    source: 'Website Form',
    sourceIcon: Globe,
    responseTime: '9s',
    responseColor: 'var(--primary)',
    agent: 'Form Bot',
    status: 'Booked',
    statusColor: 'var(--primary)',
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
          color: accent ? 'var(--primary)' : 'var(--text-bright)',
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

function AgentTile({ agent }) {
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
              background: 'var(--primary)',
              boxShadow: '0 0 6px rgba(15, 138, 79, 0.2)',
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
          {agent.count} {agent.countLabel}
        </div>
      </div>
      <Link
        href="/dashboard/agents"
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--primary)',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Configure →
      </Link>
    </div>
  );
}

export default function SpeedToLeadPage() {
  return (
    <div>
      {/* Header */}
      <div>
        <div
          className="t-eyebrow"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Zap size={12} style={{ color: 'var(--primary)' }} />
          Deliverable
        </div>
        <h1
          className="t-h1"
          style={{
            margin: '6px 0 6px',
            letterSpacing: '-0.02em',
          }}
        >
          Speed to Lead
        </h1>
        <p
          className="t-body-sm"
          style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-body)' }}
        >
          Every new lead contacted in under 60 seconds — guaranteed.
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
            'color-mix(in srgb, var(--primary) 40%, var(--border))',
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
                'color-mix(in srgb, var(--primary) 18%, transparent)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Zap size={26} />
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
                color: 'var(--primary-dark)',
                fontWeight: 700,
              }}
            >
              Delivered today
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                lineHeight: 1,
                color: 'var(--primary)',
                marginTop: 6,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
              }}
            >
              47
            </div>
            <div
              style={{
                fontSize: 14,
                color: 'var(--text-body)',
                marginTop: 8,
              }}
            >
              leads contacted today · <b>38s</b> average response ·{' '}
              <b>0</b> currently waiting
            </div>
          </div>
        </div>
        <Pill color="var(--primary)">AVG 38s</Pill>
      </div>

      {/* Stat strip */}
      <div
        className="stl-stat-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginTop: 16,
        }}
      >
        <StatCard label="Under 60s Rate" value="96%" hint="Industry avg: 21%" accent />
        <StatCard label="Fastest Today" value="8s" hint="Patricia Williams · Google Ads" />
        <StatCard label="Slowest Today" value="2m 14s" hint="Facebook DM · after hours" />
        <StatCard label="Biz Hour Coverage" value="100%" hint="7am - 8pm CT" />
      </div>

      {/* Agents working */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 12,
          }}
        >
          Agents working this deliverable
        </div>
        <div
          className="stl-agent-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {AGENTS.map((a) => (
            <AgentTile key={a.id} agent={a} />
          ))}
        </div>
      </div>

      {/* Distribution chart */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 4,
          }}
        >
          Response time distribution
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          47 leads contacted today, bucketed by time-to-first-touch.
        </div>
        <div className="dark-card" style={{ padding: 20 }}>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={DISTRIBUTION}
                margin={{ top: 4, right: 18, left: 10, bottom: 4 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  stroke="var(--border)"
                />
                <YAxis
                  type="category"
                  dataKey="bucket"
                  width={80}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  stroke="var(--border)"
                />
                <Tooltip
                  cursor={{
                    fill: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
                  }}
                  contentStyle={{
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {DISTRIBUTION.map((row, i) => (
                    <Cell key={i} fill={row.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leads contacted today */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 12,
          }}
        >
          Leads contacted today
        </div>
        <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Lead</th>
                  <th>Source</th>
                  <th style={{ textAlign: 'right' }}>Response</th>
                  <th>Agent</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {LEADS_TODAY.map((l) => {
                  const SourceIcon = l.sourceIcon;
                  return (
                    <tr key={l.id}>
                      <td
                        style={{
                          color: 'var(--text-muted)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {l.received}
                      </td>
                      <td
                        style={{
                          color: 'var(--text-bright)',
                          fontWeight: 500,
                        }}
                      >
                        {l.name}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: 'var(--text-body)',
                          }}
                        >
                          <SourceIcon size={12} />
                          {l.source}
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontVariantNumeric: 'tabular-nums',
                          color: l.responseColor,
                          fontWeight: 600,
                        }}
                      >
                        {l.responseTime}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{l.agent}</td>
                      <td style={{ textAlign: 'center' }}>
                        <Pill color={l.statusColor}>
                          {l.status.toUpperCase()}
                        </Pill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Currently waiting */}
      <div style={{ marginTop: 24 }}>
        <div
          className="dark-card"
          style={{
            padding: 28,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            borderColor:
              'color-mix(in srgb, var(--primary) 30%, var(--border))',
            background:
              'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--primary) 5%, transparent) 100%)',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background:
                'color-mix(in srgb, var(--primary) 18%, transparent)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text-bright)',
            }}
          >
            All leads contacted. AI is caught up.
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 420 }}>
            The queue is empty. The next lead will be contacted in under 60 seconds
            the moment it arrives.
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
            'linear-gradient(135deg, color-mix(in srgb, var(--primary) 6%, transparent), transparent)',
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
          <Sparkles size={16} style={{ color: 'var(--primary)' }} />
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-bright)',
              }}
            >
              Want faster response on after-hours Facebook DMs?
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Route them to the Social DM Agent in Agent Config.
            </div>
          </div>
        </div>
        <Link href="/dashboard/agents" className="btn-primary">
          Tune agents
          <ArrowRight size={14} />
        </Link>
      </div>

      <style jsx>{`
        @media (max-width: 1100px) {
          :global(.stl-stat-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          :global(.stl-agent-grid) {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          :global(.stl-stat-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
