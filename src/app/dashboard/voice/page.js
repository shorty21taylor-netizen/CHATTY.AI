'use client';

import { useState } from 'react';
import {
  Mic,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const STAT_CARDS = [
  {
    icon: Phone,
    label: 'Calls This Week',
    value: '289',
    hint: '184 inbound · 105 outbound',
    accent: true,
  },
  {
    icon: Clock,
    label: 'Avg Call Duration',
    value: '2m 41s',
    hint: 'Down from 3m 12s',
  },
  {
    icon: CheckCircle2,
    label: 'Qualification Rate',
    value: '67%',
    hint: '+4pts vs last week',
  },
  {
    icon: Mic,
    label: 'Active Voice Agents',
    value: '3 / 3',
    hint: 'All plan slots used',
  },
];

const ACTIVE_AGENTS = [
  {
    id: 1,
    name: 'Instant Lead Response',
    voice: 'Rachel',
    voiceColor: '#ec4899',
    status: 'active',
    calls: 112,
    avgDuration: '2m 18s',
    lastCall: '3m ago',
  },
  {
    id: 2,
    name: 'Appointment Setter',
    voice: 'Marcus',
    voiceColor: '#3b82f6',
    status: 'active',
    calls: 84,
    avgDuration: '3m 02s',
    lastCall: '12m ago',
  },
  {
    id: 3,
    name: 'Objection Handler',
    voice: 'Sarah',
    voiceColor: '#8b5cf6',
    status: 'active',
    calls: 42,
    avgDuration: '2m 44s',
    lastCall: '1h ago',
  },
];

const VOICE_LIBRARY = [
  { name: 'Rachel', gender: 'Female', tone: 'Warm · Upbeat', color: '#ec4899' },
  { name: 'Marcus', gender: 'Male', tone: 'Confident · Clear', color: '#3b82f6' },
  { name: 'Sarah', gender: 'Female', tone: 'Calm · Reassuring', color: '#8b5cf6' },
  { name: 'James', gender: 'Male', tone: 'Friendly · Casual', color: '#10b981' },
  { name: 'Emily', gender: 'Female', tone: 'Professional', color: '#f59e0b' },
  {
    name: 'Custom Clone',
    gender: 'Your voice',
    tone: 'ElevenLabs Voice Lab',
    color: 'var(--emerald-bright)',
    custom: true,
  },
];

const RECENT_CALLS = [
  {
    id: 1,
    contact: 'Patricia Williams',
    direction: 'outbound',
    agent: 'Instant Lead Response',
    voice: 'Rachel',
    duration: '4m 12s',
    outcome: 'Booked',
    when: '3m ago',
    outcomeColor: 'var(--emerald-bright)',
  },
  {
    id: 2,
    contact: 'James Rodriguez',
    direction: 'inbound',
    agent: 'Appointment Setter',
    voice: 'Marcus',
    duration: '2m 38s',
    outcome: 'Qualified',
    when: '12m ago',
    outcomeColor: '#3b82f6',
  },
  {
    id: 3,
    contact: 'Marcus Miller',
    direction: 'outbound',
    agent: 'Instant Lead Response',
    voice: 'Rachel',
    duration: '1m 44s',
    outcome: 'Voicemail',
    when: '27m ago',
    outcomeColor: 'var(--text-muted)',
  },
  {
    id: 4,
    contact: 'Sarah Chen',
    direction: 'inbound',
    agent: 'Objection Handler',
    voice: 'Sarah',
    duration: '5m 21s',
    outcome: 'Won',
    when: '42m ago',
    outcomeColor: 'var(--emerald-bright)',
  },
  {
    id: 5,
    contact: 'Robert Thompson',
    direction: 'outbound',
    agent: 'Appointment Setter',
    voice: 'Marcus',
    duration: '3m 08s',
    outcome: 'Rescheduled',
    when: '1h ago',
    outcomeColor: '#f59e0b',
  },
  {
    id: 6,
    contact: 'Jennifer Davis',
    direction: 'inbound',
    agent: 'Instant Lead Response',
    voice: 'Rachel',
    duration: '2m 12s',
    outcome: 'Qualified',
    when: '1h ago',
    outcomeColor: '#3b82f6',
  },
  {
    id: 7,
    contact: 'Kevin Park',
    direction: 'outbound',
    agent: 'Objection Handler',
    voice: 'Sarah',
    duration: '6m 02s',
    outcome: 'Proposal Sent',
    when: '2h ago',
    outcomeColor: '#8b5cf6',
  },
  {
    id: 8,
    contact: 'Linda Martinez',
    direction: 'inbound',
    agent: 'Appointment Setter',
    voice: 'Marcus',
    duration: '2m 51s',
    outcome: 'Booked',
    when: '3h ago',
    outcomeColor: 'var(--emerald-bright)',
  },
  {
    id: 9,
    contact: 'David Kim',
    direction: 'outbound',
    agent: 'Instant Lead Response',
    voice: 'Rachel',
    duration: '0m 48s',
    outcome: 'No Answer',
    when: '4h ago',
    outcomeColor: 'var(--text-muted)',
  },
  {
    id: 10,
    contact: 'Amanda Foster',
    direction: 'inbound',
    agent: 'Appointment Setter',
    voice: 'Marcus',
    duration: '3m 34s',
    outcome: 'Qualified',
    when: '5h ago',
    outcomeColor: '#3b82f6',
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

function StatCard({ icon, label, value, hint, accent }) {
  const Icon = icon;
  return (
    <div
      className="dark-card"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: accent ? '0 0 24px rgba(16,185,129,0.12)' : 'none',
        borderColor: accent
          ? 'color-mix(in srgb, var(--emerald-bright) 40%, var(--border))'
          : 'var(--border)',
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
            background: accent
              ? 'color-mix(in srgb, var(--emerald-bright) 14%, transparent)'
              : 'color-mix(in srgb, var(--text-muted) 14%, transparent)',
            color: accent ? 'var(--emerald-bright)' : 'var(--text-muted)',
          }}
        >
          <Icon size={13} />
        </span>
        {label}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: accent ? 'var(--emerald-bright)' : 'var(--text-bright)',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</div>
    </div>
  );
}

export default function VoicePage() {
  const [playing, setPlaying] = useState(null);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'color-mix(in srgb, var(--emerald-bright) 14%, transparent)',
              color: 'var(--emerald-bright)',
              border: '1px solid color-mix(in srgb, var(--emerald-bright) 30%, transparent)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            <Sparkles size={12} />
            Powered by ElevenLabs
          </div>
          <h1 className="t-h1" style={{ margin: '4px 0 6px' }}>
            Voice agents
          </h1>
          <p className="t-body-sm" style={{ margin: 0 }}>
            Live inbound and outbound calls handled by AI voice agents.
          </p>
        </div>
        <button type="button" className="btn-primary">
          <Mic size={14} />
          New voice agent
        </button>
      </div>

      {/* Stats */}
      <div
        className="voice-stat-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginTop: 28,
        }}
      >
        {STAT_CARDS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Active voice agents */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 12,
          }}
        >
          Active voice agents
        </div>
        <div
          className="voice-agent-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {ACTIVE_AGENTS.map((a) => (
            <div
              key={a.id}
              className="dark-card"
              style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: `color-mix(in srgb, ${a.voiceColor} 18%, transparent)`,
                      color: a.voiceColor,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Mic size={18} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--text-bright)',
                      }}
                    >
                      {a.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        marginTop: 2,
                      }}
                    >
                      Voice · {a.voice}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: 'var(--emerald-bright)',
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: 'var(--emerald-bright)',
                      boxShadow: '0 0 0 4px color-mix(in srgb, var(--emerald-bright) 20%, transparent)',
                    }}
                  />
                  LIVE
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                  padding: '12px 0',
                  borderTop: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>
                    CALLS
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--text-bright)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {a.calls}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>
                    AVG DUR
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--text-bright)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {a.avgDuration}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>
                    LAST
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--text-bright)',
                      marginTop: 4,
                    }}
                  >
                    {a.lastCall}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="filter-pill" style={{ flex: 1 }}>
                  Preview voice
                </button>
                <button type="button" className="filter-pill" style={{ flex: 1 }}>
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice library */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 4,
          }}
        >
          Voice library
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          Pick a voice or clone your own via ElevenLabs Voice Lab.
        </div>
        <div
          className="voice-library-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {VOICE_LIBRARY.map((v) => {
            const active = playing === v.name;
            return (
              <div
                key={v.name}
                className="dark-card"
                style={{
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  borderColor: v.custom
                    ? 'color-mix(in srgb, var(--emerald-bright) 40%, var(--border))'
                    : 'var(--border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setPlaying(active ? null : v.name)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: `1px solid color-mix(in srgb, ${v.color} 40%, transparent)`,
                    background: `color-mix(in srgb, ${v.color} 18%, transparent)`,
                    color: v.color,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  title={active ? 'Pause preview' : 'Play preview'}
                >
                  {active ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text-bright)',
                    }}
                  >
                    {v.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      marginTop: 2,
                    }}
                  >
                    {v.gender} · {v.tone}
                  </div>
                </div>
                {v.custom ? (
                  <Pill color="var(--emerald-bright)">NEW</Pill>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent calls */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 12,
          }}
        >
          Recent calls
        </div>
        <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Contact</th>
                  <th>Agent</th>
                  <th>Voice</th>
                  <th style={{ textAlign: 'right' }}>Duration</th>
                  <th style={{ textAlign: 'center' }}>Outcome</th>
                  <th style={{ textAlign: 'right' }}>When</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_CALLS.map((c) => {
                  const Icon = c.direction === 'inbound' ? PhoneIncoming : PhoneOutgoing;
                  const iconColor =
                    c.direction === 'inbound' ? '#3b82f6' : 'var(--emerald-bright)';
                  return (
                    <tr key={c.id}>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: `color-mix(in srgb, ${iconColor} 14%, transparent)`,
                            color: iconColor,
                          }}
                        >
                          <Icon size={13} />
                        </span>
                      </td>
                      <td
                        style={{
                          color: 'var(--text-bright)',
                          fontWeight: 500,
                        }}
                      >
                        {c.contact}
                      </td>
                      <td>{c.agent}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{c.voice}</td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontVariantNumeric: 'tabular-nums',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {c.duration}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Pill color={c.outcomeColor}>{c.outcome.toUpperCase()}</Pill>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          color: 'var(--text-muted)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {c.when}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1100px) {
          :global(.voice-stat-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          :global(.voice-agent-grid),
          :global(.voice-library-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          :global(.voice-stat-grid),
          :global(.voice-agent-grid),
          :global(.voice-library-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
