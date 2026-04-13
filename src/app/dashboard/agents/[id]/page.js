'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Phone,
  MessageSquare,
  Mail,
  ArrowLeft,
  PhoneCall,
  Clock,
  Smile,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  getVoiceAgentById,
  getAgentPerformanceSeries,
  getRecentCallLog,
  VOICE_AGENT_STATUS,
} from '@/lib/voiceAgents';
import { VoiceConfigPanel } from '@/components/agent/VoiceConfigPanel';

const TYPE_ICON = {
  voice: Phone,
  sms: MessageSquare,
  email: Mail,
};

const OUTCOME_PALETTE = {
  emerald: {
    bg: 'var(--emerald-tint)',
    color: 'var(--emerald-bright)',
    border: 'rgba(16,185,129,0.3)',
  },
  indigo: {
    bg: 'rgba(99,102,241,0.12)',
    color: '#818cf8',
    border: 'rgba(99,102,241,0.3)',
  },
  amber: {
    bg: 'rgba(245,158,11,0.12)',
    color: '#fbbf24',
    border: 'rgba(245,158,11,0.3)',
  },
  muted: {
    bg: 'var(--surface-2)',
    color: 'var(--text-muted)',
    border: 'var(--border)',
  },
};

export default function AgentDetailPage({ params }) {
  const { id } = use(params);
  const agent = getVoiceAgentById(id);
  if (!agent) return notFound();

  const Icon = TYPE_ICON[agent.type] || Phone;
  const [status, setStatus] = useState(agent.status);
  const statusMeta = VOICE_AGENT_STATUS[status] || VOICE_AGENT_STATUS.draft;
  const perfSeries = getAgentPerformanceSeries();
  const callLog = getRecentCallLog();

  function toggleStatus() {
    setStatus((s) => (s === 'active' ? 'paused' : 'active'));
  }

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard/agents"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-muted)',
          textDecoration: 'none',
          marginBottom: 18,
        }}
      >
        <ArrowLeft size={14} /> All agents
      </Link>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 18,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'var(--emerald-tint)',
            border: '1px solid rgba(16,185,129,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={24} style={{ color: 'var(--emerald-bright)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="t-eyebrow"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <span>{agent.type === 'voice' ? 'Voice agent' : agent.type}</span>
            <span
              style={{
                display: 'inline-block',
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: 'var(--text-subtle)',
              }}
            />
            <span>Powered by ElevenLabs</span>
          </div>
          <h1 className="t-h1" style={{ margin: '6px 0 6px' }}>
            {agent.name}
          </h1>
          <p
            className="t-body"
            style={{ color: 'var(--text-muted)', margin: 0, maxWidth: 620 }}
          >
            {agent.description}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            alignItems: 'flex-end',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: statusMeta.bg,
              color: statusMeta.color,
              border: `1px solid ${statusMeta.border}`,
            }}
          >
            {statusMeta.dot ? (
              <motion.span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: statusMeta.color,
                  display: 'inline-block',
                }}
                animate={{ opacity: [1, 0.35, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
            ) : null}
            {statusMeta.label}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={status === 'active'}
            onClick={toggleStatus}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              background: status === 'active' ? 'var(--emerald-bright)' : 'var(--surface-2)',
              color: status === 'active' ? '#ffffff' : 'var(--text-muted)',
              border:
                '1px solid ' +
                (status === 'active' ? 'var(--emerald-bright)' : 'var(--border)'),
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            {status === 'active' ? 'Pause agent' : 'Activate agent'}
          </button>
        </div>
      </div>

      {/* Voice config */}
      <div style={{ marginBottom: 26 }}>
        <VoiceConfigPanel defaultOpen agentName={agent.name} />
      </div>

      {/* Performance mini-charts */}
      <div style={{ marginBottom: 26 }}>
        <div className="t-eyebrow" style={{ marginBottom: 4 }}>
          Performance
        </div>
        <h2 className="t-h2" style={{ margin: '0 0 14px' }}>
          Last 7 days
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
          }}
        >
          <PerfCard
            label="Calls handled"
            value={perfSeries.reduce((sum, d) => sum + d.calls, 0)}
            suffix=""
            icon={PhoneCall}
            color="#10b981"
          >
            <ResponsiveContainer width="100%" height={90}>
              <LineChart
                data={perfSeries}
                margin={{ top: 6, right: 4, left: 4, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--grid-line)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: 'var(--text-subtle)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip content={<MiniTooltip unit="calls" />} />
                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke="var(--emerald-bright)"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: 'var(--emerald-bright)' }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </PerfCard>

          <PerfCard
            label="Satisfaction"
            value={Math.round(
              perfSeries.reduce((s, d) => s + d.satisfaction, 0) /
                perfSeries.length
            )}
            suffix="%"
            icon={Smile}
            color="#818cf8"
          >
            <ResponsiveContainer width="100%" height={90}>
              <BarChart
                data={perfSeries}
                margin={{ top: 6, right: 4, left: 4, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--grid-line)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: 'var(--text-subtle)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide domain={[80, 100]} />
                <Tooltip content={<MiniTooltip unit="%" />} />
                <Bar
                  dataKey="satisfaction"
                  fill="#818cf8"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </PerfCard>

          <PerfCard
            label="Avg duration"
            value={(
              perfSeries.reduce((s, d) => s + d.avgDuration, 0) /
              perfSeries.length
            ).toFixed(1)}
            suffix="m"
            icon={Clock}
            color="#fbbf24"
          >
            <ResponsiveContainer width="100%" height={90}>
              <AreaChart
                data={perfSeries}
                margin={{ top: 6, right: 4, left: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="dur-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--grid-line)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: 'var(--text-subtle)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip content={<MiniTooltip unit="min" />} />
                <Area
                  type="monotone"
                  dataKey="avgDuration"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  fill="url(#dur-gradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </PerfCard>
        </div>
      </div>

      {/* Recent Call Log */}
      <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div className="t-h3">Recent call log</div>
            <div className="t-body-sm" style={{ color: 'var(--text-muted)' }}>
              Last 5 calls handled by this agent
            </div>
          </div>
          <div
            className="t-body-sm"
            style={{
              color: 'var(--emerald-bright)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 600,
            }}
          >
            <TrendingUp size={12} />
            +18% vs last week
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
            }}
          >
            <thead>
              <tr
                style={{
                  textAlign: 'left',
                  color: 'var(--text-subtle)',
                  fontSize: 10.5,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: 'var(--surface-2)',
                }}
              >
                <th style={{ padding: '10px 20px', fontWeight: 700 }}>Caller</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Phone</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Duration</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Outcome</th>
                <th
                  style={{
                    padding: '10px 20px',
                    fontWeight: 700,
                    textAlign: 'right',
                  }}
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {callLog.map((row) => {
                const palette =
                  OUTCOME_PALETTE[row.outcomeColor] || OUTCOME_PALETTE.muted;
                return (
                  <tr
                    key={row.id}
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <td
                      style={{
                        padding: '14px 20px',
                        fontWeight: 600,
                        color: 'var(--text-bright)',
                      }}
                    >
                      {row.caller}
                    </td>
                    <td
                      style={{
                        padding: '14px 12px',
                        color: 'var(--text-muted)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {row.phone}
                    </td>
                    <td
                      style={{
                        padding: '14px 12px',
                        color: 'var(--text-muted)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {row.duration}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          background: palette.bg,
                          color: palette.color,
                          border: `1px solid ${palette.border}`,
                        }}
                      >
                        {row.outcome}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '14px 20px',
                        textAlign: 'right',
                        color: 'var(--text-subtle)',
                      }}
                    >
                      {row.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PerfCard({ label, value, suffix, icon: Icon, color, children }) {
  return (
    <div className="dark-card" style={{ padding: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <div
          className="t-eyebrow"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Icon size={11} style={{ color }} />
          {label}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 4,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--text-bright)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </div>
        {suffix ? (
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            {suffix}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function MiniTooltip({ active, payload, unit }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  return (
    <div
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '6px 10px',
        fontSize: 11,
        color: 'var(--text-bright)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ color: 'var(--text-subtle)', marginBottom: 2 }}>
        {p.payload.day}
      </div>
      <div style={{ fontWeight: 700 }}>
        {p.value} {unit}
      </div>
    </div>
  );
}
