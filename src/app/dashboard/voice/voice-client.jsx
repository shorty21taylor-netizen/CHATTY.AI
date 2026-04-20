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

// VOICE_LIBRARY is legitimate ElevenLabs voice metadata — keep hardcoded. It
// describes the bundled voices customers can pick from, not per-tenant state.
const VOICE_LIBRARY = [
  { name: 'Rachel', gender: 'Female', tone: 'Warm · Upbeat', color: '#ec4899' },
  { name: 'Marcus', gender: 'Male', tone: 'Confident · Clear', color: '#3b82f6' },
  { name: 'Sarah', gender: 'Female', tone: 'Calm · Reassuring', color: '#8b5cf6' },
  { name: 'James', gender: 'Male', tone: 'Friendly · Casual', color: '#0F8A4F' },
  { name: 'Emily', gender: 'Female', tone: 'Professional', color: '#f59e0b' },
  {
    name: 'Custom Clone',
    gender: 'Your voice',
    tone: 'ElevenLabs Voice Lab',
    color: 'var(--primary)',
    custom: true,
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
          ? 'color-mix(in srgb, var(--primary) 40%, var(--border))'
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
              ? 'color-mix(in srgb, var(--primary) 14%, transparent)'
              : 'color-mix(in srgb, var(--text-muted) 14%, transparent)',
            color: accent ? 'var(--primary)' : 'var(--text-muted)',
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
          color: accent ? 'var(--primary)' : 'var(--text-bright)',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</div>
    </div>
  );
}

function EmptyCard({ title, body, cta }) {
  return (
    <div
      className="dark-card"
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'color-mix(in srgb, var(--text-muted) 14%, transparent)',
          color: 'var(--text-muted)',
          marginBottom: 4,
        }}
      >
        <Mic size={16} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        {body}
      </div>
      {cta ? (
        <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 4 }}>
          {cta}
        </div>
      ) : null}
    </div>
  );
}

export default function VoiceClient({ stats, recentCalls }) {
  const [playing, setPlaying] = useState(null);

  const hasCalls = (stats?.total ?? 0) > 0;
  const hasRecentCalls = Array.isArray(recentCalls) && recentCalls.length > 0;

  const statCards = [
    {
      icon: Phone,
      label: 'Calls This Week',
      value: hasCalls ? String(stats.total) : '0',
      hint: hasCalls
        ? `${stats.inbound} inbound · ${stats.outbound} outbound`
        : 'No calls recorded yet',
      accent: true,
    },
    {
      icon: Clock,
      label: 'Avg Call Duration',
      value: hasCalls ? stats.avgDurationLabel : '—',
      hint: hasCalls ? 'Across the last 7 days' : 'Waiting for first call',
    },
    {
      icon: CheckCircle2,
      label: 'Qualification Rate',
      value: hasCalls ? `${stats.qualifiedPct}%` : '—',
      hint: hasCalls
        ? `${stats.qualifiedCount} of ${stats.total} calls qualified`
        : 'Will populate once calls are logged',
    },
    {
      icon: Mic,
      label: 'Active Voice Agents',
      value: '0',
      hint: 'Connect ElevenLabs to go live',
    },
  ];

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
              background: 'color-mix(in srgb, var(--primary) 14%, transparent)',
              color: 'var(--primary)',
              border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
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
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Active voice agents — empty state until ElevenLabs is wired */}
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
        <EmptyCard
          title="No voice agents running yet"
          body="Once you connect ElevenLabs and assign a voice to an agent, live call stats will appear here."
          cta="Go to Integrations to connect ElevenLabs →"
        />
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
                    ? 'color-mix(in srgb, var(--primary) 40%, var(--border))'
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
                  <Pill color="var(--primary)">NEW</Pill>
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
        {hasRecentCalls ? (
          <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}></th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Duration</th>
                    <th style={{ textAlign: 'center' }}>Outcome</th>
                    <th style={{ textAlign: 'right' }}>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCalls.map((c) => {
                    const Icon = c.direction === 'inbound' ? PhoneIncoming : PhoneOutgoing;
                    const iconColor =
                      c.direction === 'inbound' ? '#3b82f6' : 'var(--primary)';
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
                        <td style={{ color: 'var(--text-muted)' }}>
                          {c.status}
                        </td>
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
                          <Pill color={c.outcomeColor}>{c.outcome}</Pill>
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
        ) : (
          <EmptyCard
            title="No calls in the log yet"
            body="As soon as your Twilio number routes inbound or outbound traffic to an ElevenLabs agent, calls will stream into this table in real time."
          />
        )}
      </div>

      <style jsx>{`
        @media (max-width: 1100px) {
          :global(.voice-stat-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          :global(.voice-library-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          :global(.voice-stat-grid),
          :global(.voice-library-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
