'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Settings,
  Play,
  BookOpen,
  Activity,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { getAgentById } from '@/lib/agents/registry';
import {
  loadAgentConfig,
  agentConfigStatus,
} from '@/lib/agents/storage';
import { StatusBadge, ProgressRing } from '@/components/agent/FormPrimitives';
import { AgentTabs } from '@/components/agent/AgentTabs';

const PERF_SERIES = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  messages: 12 + Math.round(Math.sin(i / 3) * 6 + Math.random() * 6),
  replies: 4 + Math.round(Math.sin(i / 2.5) * 3 + Math.random() * 3),
}));

const ACTIVITY = [
  { id: 1, at: '10:42 AM', action: 'Sent SMS', target: 'Patricia Williams', outcome: 'Delivered', color: 'var(--emerald-bright)' },
  { id: 2, at: '10:38 AM', action: 'Draft queued', target: 'Marcus Miller', outcome: 'Awaiting approval', color: '#f59e0b' },
  { id: 3, at: '10:31 AM', action: 'Escalated', target: 'James Rodriguez', outcome: 'Notified Telegram EA', color: '#3b82f6' },
  { id: 4, at: '10:12 AM', action: 'Sent SMS', target: 'Sarah Chen', outcome: 'Replied', color: 'var(--emerald-bright)' },
  { id: 5, at: '9:47 AM', action: 'Booked appointment', target: 'Kevin Park', outcome: 'Thu 2pm', color: 'var(--emerald-bright)' },
  { id: 6, at: '9:33 AM', action: 'Tagged contact', target: 'Jennifer Davis', outcome: 'Tag: price-sensitive', color: 'var(--text-muted)' },
  { id: 7, at: '9:17 AM', action: 'Sent SMS', target: 'Robert Thompson', outcome: 'Replied', color: 'var(--emerald-bright)' },
  { id: 8, at: '9:02 AM', action: 'Updated status', target: 'Linda Martinez', outcome: 'Status: qualified', color: 'var(--text-muted)' },
];

export default function AgentDetailPage({ params }) {
  const { id } = use(params);
  const agent = getAgentById(id);
  if (!agent) return notFound();

  const [hydrated, setHydrated] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    setConfig(loadAgentConfig(id));
    setHydrated(true);
  }, [id]);

  const status = useMemo(() => agentConfigStatus(config), [config]);
  const Icon = agent.icon;

  const isConfigured = hydrated && status.steps > 0;

  return (
    <div>
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
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: `color-mix(in srgb, ${agent.color} 18%, transparent)`,
              color: agent.color,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={22} />
          </div>
          <div>
            <div className="t-eyebrow" style={{ color: 'var(--text-muted)' }}>
              Agent
            </div>
            <h1
              className="t-h1"
              style={{
                margin: '4px 0 6px',
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: '-0.01em',
              }}
            >
              {agent.name}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              {agent.description}
            </p>
          </div>
        </div>
        {hydrated ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
            <StatusBadge status={status.status} />
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              <ProgressRing
                value={status.completeness}
                size={30}
                stroke={3}
                label={`${status.completeness}%`}
              />
              <span>
                {status.steps} of {status.total} steps
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <AgentTabs agentId={id} active="overview" />

      {hydrated && !isConfigured ? (
        // Not configured — big CTA
        <div
          className="dark-card"
          style={{
            padding: 36,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            borderColor:
              'color-mix(in srgb, var(--emerald-bright) 30%, var(--border))',
            background:
              'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--emerald-bright) 5%, transparent) 100%)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background:
                'color-mix(in srgb, var(--emerald-bright) 18%, transparent)',
              color: 'var(--emerald-bright)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={24} />
          </div>
          <div
            style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-bright)' }}
          >
            Let's configure {agent.name}
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              maxWidth: 480,
              lineHeight: 1.6,
            }}
          >
            11 quick steps: mission, triggers, context, tone, templates,
            knowledge, tools, guardrails, escalation, simulation, activation.
            You can save drafts along the way.
          </div>
          <Link
            href={`/dashboard/agents/${id}/configure`}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 6,
            }}
          >
            Start Configuration
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : null}

      {hydrated && isConfigured ? (
        <>
          {/* Quick stats */}
          <div
            className="ad-stat-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <QuickStat label="Messages today" value="42" />
            <QuickStat label="Replies" value="28" hint="67% reply rate" accent />
            <QuickStat label="Outcomes" value="11" hint="booked / resolved" />
          </div>

          {/* Action row */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 20,
            }}
          >
            <ActionButton
              href={`/dashboard/agents/${id}/configure`}
              icon={Settings}
              label="Edit Configuration"
              primary
            />
            <ActionButton
              href={`/dashboard/agents/${id}/simulate`}
              icon={Play}
              label="Run Simulation"
            />
            <ActionButton
              href={`/dashboard/agents/${id}/knowledge`}
              icon={BookOpen}
              label="View Knowledge Base"
            />
            <ActionButton
              href={`/dashboard/agents/${id}/activity`}
              icon={Activity}
              label="Activity Log"
            />
          </div>

          {/* 30-day performance chart */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-bright)',
                marginBottom: 4,
              }}
            >
              30-day performance
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Messages sent and replies received per day.
            </div>
            <div className="dark-card" style={{ padding: 16 }}>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={PERF_SERIES}>
                    <CartesianGrid stroke="var(--grid-line)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      stroke="var(--border)"
                    />
                    <YAxis
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      stroke="var(--border)"
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface-1)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="messages"
                      stroke="var(--emerald-bright)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="replies"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
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
                  Recent activity
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Last 8 actions taken by this agent.
                </div>
              </div>
              <Link
                href={`/dashboard/agents/${id}/activity`}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--emerald-bright)',
                  textDecoration: 'none',
                }}
              >
                View full log →
              </Link>
            </div>
            <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {ACTIVITY.map((a) => (
                    <tr key={a.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{a.at}</td>
                      <td style={{ fontWeight: 500, color: 'var(--text-bright)' }}>
                        {a.action}
                      </td>
                      <td>{a.target}</td>
                      <td style={{ color: a.color }}>{a.outcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      <style jsx>{`
        @media (max-width: 760px) {
          :global(.ad-stat-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function QuickStat({ label, value, hint, accent }) {
  return (
    <div className="dark-card" style={{ padding: 16 }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          fontWeight: 600,
          marginBottom: 4,
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
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </div>
      {hint ? (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function ActionButton({ href, icon: Icon, label, primary }) {
  return (
    <Link
      href={href}
      className={primary ? 'btn-primary' : undefined}
      style={
        primary
          ? { display: 'inline-flex', alignItems: 'center', gap: 8 }
          : {
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-body)',
              textDecoration: 'none',
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              transition: 'all 120ms ease',
            }
      }
    >
      <Icon size={14} />
      {label}
    </Link>
  );
}
