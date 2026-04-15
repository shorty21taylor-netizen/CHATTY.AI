'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  FileText,
  MessageSquare,
  Star,
  Snowflake,
  Ghost,
  Users,
  Eye,
  AlertCircle,
  List,
  Calendar,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const AGENTS = [
  {
    id: 'quote-fu',
    name: 'Quote Follow-Up',
    icon: FileText,
    color: '#f59e0b',
    count: 12,
    countLabel: 'active sequences',
  },
  {
    id: 'objection',
    name: 'Objection Handler',
    icon: AlertCircle,
    color: '#8b5cf6',
    count: 3,
    countLabel: 'active',
  },
  {
    id: 'review',
    name: 'Review Request',
    icon: Star,
    color: 'var(--emerald-bright)',
    count: 8,
    countLabel: 'sent today',
  },
  {
    id: 'dead-lead',
    name: 'Dead Lead Reactivation',
    icon: Snowflake,
    color: '#3b82f6',
    count: 23,
    countLabel: 'in rotation',
  },
  {
    id: 'ghosted',
    name: 'Ghosted Bid Follow-Up',
    icon: Ghost,
    color: '#ec4899',
    count: 7,
    countLabel: 'active',
  },
  {
    id: 'past-customer',
    name: 'Past Customer Re-engagement',
    icon: Users,
    color: '#14b8a6',
    count: 18,
    countLabel: 'in rotation',
  },
];

const READY_TO_ACT = [
  {
    id: 1,
    name: 'Patricia Williams',
    signal: 'Viewed quote 3x in 24h',
    agent: 'Quote Follow-Up',
    icon: Eye,
  },
  {
    id: 2,
    name: 'Marcus Miller',
    signal: 'Replied to dead-lead SMS after 94 days',
    agent: 'Dead Lead Reactivation',
    icon: MessageSquare,
  },
  {
    id: 3,
    name: 'Thompson Residence',
    signal: 'Opened proposal email 5x, no reply',
    agent: 'Ghosted Bid Follow-Up',
    icon: Eye,
  },
  {
    id: 4,
    name: 'James Rodriguez',
    signal: 'Asked about price in Objection Handler thread',
    agent: 'Objection Handler',
    icon: AlertCircle,
  },
  {
    id: 5,
    name: 'Sarah Chen',
    signal: 'One-year install anniversary — maintenance eligible',
    agent: 'Past Customer Re-engagement',
    icon: Users,
  },
  {
    id: 6,
    name: 'Jennifer Davis',
    signal: 'Google Maps profile view spike (3 this week)',
    agent: 'Review Request',
    icon: Star,
  },
];

const SEQUENCES = [
  { id: 1, contact: 'Patricia Williams', type: 'Quote FU', days: 2, last: 'Apr 14 · Text', next: 'Apr 16 · Call', status: 'active' },
  { id: 2, contact: 'Marcus Miller', type: 'Dead Lead', days: 94, last: 'Apr 14 · SMS', next: 'Apr 18 · SMS', status: 'warm' },
  { id: 3, contact: 'Thompson Residence', type: 'Ghosted Bid', days: 11, last: 'Apr 12 · Email', next: 'Apr 16 · Call', status: 'active' },
  { id: 4, contact: 'James Rodriguez', type: 'Objection', days: 1, last: 'Apr 14 · SMS', next: 'Apr 15 · Call', status: 'warm' },
  { id: 5, contact: 'Sarah Chen', type: 'Past Customer', days: 365, last: 'Mar 22 · Email', next: 'Apr 17 · Email', status: 'active' },
  { id: 6, contact: 'Robert Thompson', type: 'Quote FU', days: 5, last: 'Apr 13 · SMS', next: 'Apr 17 · Call', status: 'active' },
  { id: 7, contact: 'Kevin Park', type: 'Ghosted Bid', days: 18, last: 'Apr 11 · Email', next: 'Apr 16 · SMS', status: 'active' },
  { id: 8, contact: 'Linda Martinez', type: 'Review', days: 4, last: 'Apr 11 · SMS', next: 'Apr 18 · SMS', status: 'active' },
  { id: 9, contact: 'David Kim', type: 'Dead Lead', days: 121, last: 'Apr 10 · SMS', next: 'Apr 20 · Email', status: 'cold' },
  { id: 10, contact: 'Amanda Foster', type: 'Quote FU', days: 3, last: 'Apr 13 · Call', next: 'Apr 17 · Email', status: 'active' },
  { id: 11, contact: 'Jennifer Davis', type: 'Review', days: 2, last: 'Apr 13 · SMS', next: 'Apr 18 · SMS', status: 'active' },
  { id: 12, contact: 'Rodriguez Home', type: 'Past Customer', days: 410, last: 'Apr 09 · Email', next: 'Apr 19 · Email', status: 'active' },
  { id: 13, contact: 'Miller Home', type: 'Ghosted Bid', days: 22, last: 'Apr 10 · SMS', next: 'Apr 16 · Call', status: 'active' },
  { id: 14, contact: 'Chen Residence', type: 'Objection', days: 3, last: 'Apr 12 · SMS', next: 'Apr 16 · SMS', status: 'active' },
  { id: 15, contact: 'Williams Property', type: 'Quote FU', days: 8, last: 'Apr 08 · Email', next: 'Apr 16 · Call', status: 'active' },
];

const TIMELINE_DAYS = [
  { day: 'Wed', date: 'Apr 16', touches: [
    { time: '9:30a', contact: 'Patricia Williams', type: 'Quote FU', channel: 'Call' },
    { time: '10:15a', contact: 'Thompson Residence', type: 'Ghosted Bid', channel: 'Call' },
    { time: '11:00a', contact: 'Williams Property', type: 'Quote FU', channel: 'Call' },
    { time: '2:00p', contact: 'Kevin Park', type: 'Ghosted', channel: 'SMS' },
    { time: '3:30p', contact: 'Miller Home', type: 'Ghosted', channel: 'Call' },
    { time: '4:00p', contact: 'Chen Residence', type: 'Objection', channel: 'SMS' },
  ]},
  { day: 'Thu', date: 'Apr 17', touches: [
    { time: '9:00a', contact: 'Sarah Chen', type: 'Past Customer', channel: 'Email' },
    { time: '11:30a', contact: 'Amanda Foster', type: 'Quote FU', channel: 'Email' },
    { time: '2:00p', contact: 'Robert Thompson', type: 'Quote FU', channel: 'Call' },
  ]},
  { day: 'Fri', date: 'Apr 18', touches: [
    { time: '9:00a', contact: 'Marcus Miller', type: 'Dead Lead', channel: 'SMS' },
    { time: '10:00a', contact: 'Linda Martinez', type: 'Review', channel: 'SMS' },
    { time: '11:00a', contact: 'Jennifer Davis', type: 'Review', channel: 'SMS' },
  ]},
  { day: 'Sat', date: 'Apr 19', touches: [
    { time: '10:00a', contact: 'Rodriguez Home', type: 'Past Customer', channel: 'Email' },
  ]},
  { day: 'Sun', date: 'Apr 20', touches: [
    { time: '10:00a', contact: 'David Kim', type: 'Dead Lead', channel: 'Email' },
  ]},
  { day: 'Mon', date: 'Apr 21', touches: [] },
  { day: 'Tue', date: 'Apr 22', touches: [] },
];

const TYPE_COLORS = {
  'Quote FU': '#f59e0b',
  Objection: '#8b5cf6',
  Review: 'var(--emerald-bright)',
  'Dead Lead': '#3b82f6',
  'Ghosted Bid': '#ec4899',
  Ghosted: '#ec4899',
  'Past Customer': '#14b8a6',
};

const STATUS_COLORS = {
  active: { label: 'ACTIVE', color: '#3b82f6' },
  warm: { label: 'WARM', color: '#f59e0b' },
  cold: { label: 'COLD', color: 'var(--text-muted)' },
};

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
      style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }}
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

function AgentTile({ agent }) {
  const Icon = agent.icon;
  return (
    <div
      className="dark-card"
      style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: `color-mix(in srgb, ${agent.color} 18%, transparent)`,
          color: agent.color,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-bright)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {agent.name}
          </span>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--emerald-bright)',
              boxShadow: '0 0 6px var(--emerald-glow)',
              flexShrink: 0,
            }}
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
          color: 'var(--emerald-bright)',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Configure →
      </Link>
    </div>
  );
}

export default function FollowUpsPage() {
  const [view, setView] = useState('list');

  return (
    <div>
      {/* Header */}
      <div>
        <div
          className="t-eyebrow"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <RefreshCw size={12} style={{ color: 'var(--emerald-bright)' }} />
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
          Active Follow-Ups
        </h1>
        <p
          className="t-body-sm"
          style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-body)' }}
        >
          No lead goes cold. Every quote, every ghost, every past customer —
          chased automatically.
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
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
            <RefreshCw size={26} />
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--emerald-hover)',
                fontWeight: 700,
              }}
            >
              In motion right now
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
              34
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-body)', marginTop: 8 }}>
              active sequences · <b>6</b> ready to act on ·{' '}
              <b>$127K</b> pipeline in motion
            </div>
          </div>
        </div>
        <Pill color="#f59e0b">6 WARM</Pill>
      </div>

      {/* Stat strip */}
      <div
        className="fu-stat-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginTop: 16,
        }}
      >
        <StatCard label="Active Sequences" value="34" hint="across 6 agents" />
        <StatCard label="Messages Today" value="142" hint="SMS · Email · Call" />
        <StatCard label="Reply Rate" value="28%" hint="+4pts vs last week" accent />
        <StatCard label="Warm-Signal Reactivations" value="6" hint="Ready to act on" />
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
          className="fu-agent-grid"
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

      {/* Ready to act on — amber highlighted */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 4,
          }}
        >
          <AlertCircle size={14} style={{ color: '#f59e0b' }} />
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-bright)',
            }}
          >
            Ready to act on
          </div>
          <Pill color="#f59e0b">WARM</Pill>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          Leads showing warm signals right now. Every hour matters.
        </div>
        <div
          className="fu-ready-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {READY_TO_ACT.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                className="dark-card"
                style={{
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  borderColor: 'color-mix(in srgb, #f59e0b 40%, var(--border))',
                  background:
                    'linear-gradient(180deg, transparent 0%, color-mix(in srgb, #f59e0b 5%, transparent) 100%)',
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
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#f59e0b',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    <Icon size={12} />
                    Warm signal
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--text-bright)',
                  }}
                >
                  {r.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: 'var(--text-body)',
                  }}
                >
                  {r.signal}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Detected by <b>{r.agent}</b>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: 'auto' }}
                >
                  Take action
                  <ArrowRight size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* View toggle + active sequences */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-bright)',
              }}
            >
              All active sequences
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {view === 'list'
                ? '15 contacts currently being nurtured'
                : 'Next 7 days of scheduled touches'}
            </div>
          </div>
          <div style={{ display: 'inline-flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => setView('list')}
              className={view === 'list' ? 'filter-pill-active' : 'filter-pill'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <List size={13} />
              List
            </button>
            <button
              type="button"
              onClick={() => setView('timeline')}
              className={view === 'timeline' ? 'filter-pill-active' : 'filter-pill'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Calendar size={13} />
              Timeline
            </button>
          </div>
        </div>

        {view === 'list' ? (
          <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Days in</th>
                    <th>Last Message</th>
                    <th>Next Message</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {SEQUENCES.map((s) => {
                    const typeColor = TYPE_COLORS[s.type] || 'var(--text-muted)';
                    const status = STATUS_COLORS[s.status];
                    return (
                      <tr key={s.id}>
                        <td
                          style={{
                            color: 'var(--text-bright)',
                            fontWeight: 500,
                          }}
                        >
                          {s.contact}
                        </td>
                        <td>
                          <Pill color={typeColor}>{s.type.toUpperCase()}</Pill>
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {s.days}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{s.last}</td>
                        <td style={{ color: 'var(--text-body)' }}>{s.next}</td>
                        <td style={{ textAlign: 'center' }}>
                          <Pill color={status.color}>{status.label}</Pill>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="dark-card" style={{ padding: 20 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 10,
              }}
              className="fu-timeline-grid"
            >
              {TIMELINE_DAYS.map((d) => (
                <div
                  key={d.date}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    minHeight: 240,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {d.day}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--text-bright)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {d.date}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      marginTop: 4,
                    }}
                  >
                    {d.touches.length === 0 ? (
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          fontStyle: 'italic',
                        }}
                      >
                        Quiet day
                      </div>
                    ) : (
                      d.touches.map((t, i) => {
                        const c = TYPE_COLORS[t.type] || 'var(--text-muted)';
                        return (
                          <div
                            key={i}
                            style={{
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: `1px solid color-mix(in srgb, ${c} 30%, transparent)`,
                              background: `color-mix(in srgb, ${c} 8%, transparent)`,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10,
                                color: c,
                                fontWeight: 600,
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {t.time} · {t.channel}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: 'var(--text-bright)',
                                marginTop: 2,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {t.contact}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div
        style={{
          marginTop: 28,
          padding: 20,
          borderRadius: 12,
          border: '1px solid var(--border)',
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--emerald-bright) 6%, transparent), transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
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
              Dial up the pressure on ghosted bids?
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Increase Ghosted Bid Follow-Up cadence from 7 days to 4.
            </div>
          </div>
        </div>
        <Link href="/dashboard/agents" className="btn-primary">
          Tune cadence
          <ArrowRight size={14} />
        </Link>
      </div>

      <style jsx>{`
        @media (max-width: 1200px) {
          :global(.fu-ready-grid),
          :global(.fu-agent-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          :global(.fu-timeline-grid) {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
        @media (max-width: 900px) {
          :global(.fu-stat-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          :global(.fu-timeline-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          :global(.fu-stat-grid),
          :global(.fu-agent-grid),
          :global(.fu-ready-grid),
          :global(.fu-timeline-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
