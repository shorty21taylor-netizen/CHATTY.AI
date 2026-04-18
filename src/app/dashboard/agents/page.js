'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MessageCircle,
  Plus,
  Settings,
  Sparkles,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { AGENT_TYPES } from '@/lib/agents/registry';
import { loadAgentConfig, agentConfigStatus } from '@/lib/agents/storage';
import { StatusBadge, ProgressRing } from '@/components/agent/FormPrimitives';

const PILLARS = [
  {
    id: 'capture',
    label: 'Capture',
    eyebrow: 'CAPTURE',
    color: 'var(--primary)',
    description: 'Catch every inbound lead the moment it arrives.',
  },
  {
    id: 'convert',
    label: 'Convert',
    eyebrow: 'CONVERT',
    color: '#8b5cf6',
    description: 'Move qualified leads through to booked, quoted, and closed.',
  },
  {
    id: 'reclaim',
    label: 'Reclaim',
    eyebrow: 'RECLAIM',
    color: '#f59e0b',
    description: 'Win back lost, dormant, and past customers.',
  },
];

function formatSweepAge(isoStr) {
  if (!isoStr) return null;
  const diff = Date.now() - new Date(isoStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AgentsPage() {
  const [hydrated, setHydrated] = useState(false);
  const [configs, setConfigs] = useState({});
  const [lastSweepAt, setLastSweepAt] = useState(null);

  useEffect(() => {
    const all = {};
    for (const a of AGENT_TYPES) {
      all[a.id] = loadAgentConfig(a.id);
    }
    setConfigs(all);
    setHydrated(true);
  }, []);

  useEffect(() => {
    fetch('/api/reclaim/state')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.lastSweepAt) setLastSweepAt(data.lastSweepAt);
      })
      .catch(() => {});
  }, []);

  const telegramEa = AGENT_TYPES.find((a) => a.id === 'telegram-ea');
  const telegramStatus = hydrated
    ? agentConfigStatus(configs[telegramEa?.id])
    : null;

  const grouped = useMemo(() => {
    return PILLARS.map((pillar) => ({
      ...pillar,
      agents: AGENT_TYPES.filter((a) => a.pillar === pillar.id),
    }));
  }, []);

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div className="t-eyebrow" style={{ color: 'var(--text-muted)' }}>
          AI Workforce
        </div>
        <h1
          className="t-h1"
          style={{
            margin: '4px 0 6px',
            letterSpacing: '-0.02em',
            letterSpacing: '-0.01em',
          }}
        >
          Agents
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          Your autonomous workforce — 10 specialist agents across 3 pillars, plus
          your Telegram executive assistant.
        </p>
      </div>

      {/* Telegram EA hero */}
      {telegramEa ? (
        <TelegramHero
          agent={telegramEa}
          status={telegramStatus}
          hydrated={hydrated}
        />
      ) : null}

      {/* Pillars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 24 }}>
        {grouped.map((pillar) => (
          <PillarSection
            key={pillar.id}
            pillar={pillar}
            configs={configs}
            hydrated={hydrated}
            lastSweepAt={pillar.id === 'reclaim' ? lastSweepAt : null}
          />
        ))}
      </div>

      {/* Create Custom Agent */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 28,
        }}
      >
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 18px',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-muted)',
            background: 'transparent',
            border: '1px dashed var(--border-strong)',
            borderRadius: 10,
            cursor: 'pointer',
          }}
        >
          <Plus size={14} />
          Create Custom Agent
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Telegram EA hero
// ---------------------------------------------------------------------------

function TelegramHero({ agent, status, hydrated }) {
  const Icon = agent.icon;
  return (
    <div
      className="dark-card"
      style={{
        padding: 22,
        background:
          'var(--bg)',
        borderColor:
          'color-mix(in srgb, var(--primary) 30%, var(--border))',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background:
                'var(--primary)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow:
                '0 6px 20px color-mix(in srgb, var(--primary) 30%, transparent)',
            }}
          >
            <Icon size={24} />
          </div>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: 'var(--primary)',
                }}
              >
                Premium
              </span>
              <Sparkles size={12} style={{ color: 'var(--primary)' }} />
            </div>
            <h2
              className="t-h2"
              style={{
                margin: '0 0 4px',
                letterSpacing: '-0.02em',
                letterSpacing: '-0.01em',
              }}
            >
              Your Executive Assistant
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Message on Telegram anytime — ask anything about your business today.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <HeroStat label="Messages Today" value="12" />
          <HeroStat label="Avg Response" value="<2s" />
          <HeroStat label="Uptime" value="99.9%" />
          <Link
            href={`/dashboard/agents/${agent.id}`}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Open EA
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {hydrated && status ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid var(--border)',
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          <StatusBadge status={status.status} />
          <span>·</span>
          <span>
            {status.steps} of {status.total} steps configured
          </span>
        </div>
      ) : null}
    </div>
  );
}

function HeroStat({ label, value }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        borderRadius: 999,
        border: '1px solid var(--border)',
        background: 'var(--surface-2)',
      }}
    >
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
        {label}:
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--text-bright)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pillar
// ---------------------------------------------------------------------------

function PillarSection({ pillar, configs, hydrated, lastSweepAt }) {
  return (
    <section>
      {/* Pillar header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingLeft: 12,
          borderLeft: `3px solid ${pillar.color}`,
          marginBottom: 14,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: pillar.color,
              marginBottom: 2,
            }}
          >
            {pillar.eyebrow}
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            {pillar.description}
            {lastSweepAt ? (
              <span style={{ marginLeft: 10, fontSize: 11, color: 'var(--text-muted)', opacity: 0.7 }}>
                Last swept: {formatSweepAge(lastSweepAt)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Agent cards */}
      <div
        className="ag-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}
      >
        {pillar.agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            status={hydrated ? agentConfigStatus(configs[agent.id]) : null}
            hydrated={hydrated}
          />
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 780px) {
          :global(.ag-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Agent card
// ---------------------------------------------------------------------------

function AgentSparkline({ agentId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`/api/agents/metrics?agent_id=${agentId}&days=7`)
      .then((r) => r.json())
      .then((d) => {
        if (d.metrics?.length) {
          setData(d.metrics.map((m) => ({
            date: m.metricDate,
            runs: m.runs,
            rate: m.runs > 0 ? Math.round((m.successes / m.runs) * 100) : 0,
          })));
        }
      })
      .catch(() => {});
  }, [agentId]);

  if (!data || data.length === 0) return null;

  const totalRuns = data.reduce((s, d) => s + d.runs, 0);
  const avgRate = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.rate, 0) / data.length) : 0;

  return (
    <div style={{ paddingTop: 4 }}>
      <div style={{ height: 32, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <Area
              type="monotone"
              dataKey="runs"
              stroke="var(--primary)"
              fill="color-mix(in srgb, var(--primary) 14%, transparent)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
        <span>{totalRuns} runs · 7d</span>
        <span>{avgRate}% success</span>
      </div>
    </div>
  );
}

function AgentCard({ agent, status, hydrated }) {
  const Icon = agent.icon;
  const isConfigured = hydrated && status && status.steps > 0;

  return (
    <div
      className="dark-card"
      style={{
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Top row: icon + name + status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
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
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-bright)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {agent.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              {agent.description}
            </div>
          </div>
        </div>
        {hydrated ? <StatusBadge status={status.status} /> : null}
      </div>

      {/* Middle row: progress */}
      {hydrated ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingTop: 4,
          }}
        >
          <ProgressRing
            value={status.completeness}
            size={34}
            stroke={3}
            label={`${status.completeness}%`}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                fontWeight: 700,
                marginBottom: 2,
              }}
            >
              Configuration
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-body)',
                fontWeight: 500,
              }}
            >
              {status.steps} of {status.total} steps
              {status.completeness === 100 ? ' · ready' : ''}
            </div>
          </div>
        </div>
      ) : null}

      <AgentSparkline agentId={agent.id} />

      {/* Bottom row: actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          paddingTop: 6,
          borderTop: '1px solid var(--border)',
          marginTop: 'auto',
        }}
      >
        <Link
          href={`/dashboard/agents/${agent.id}`}
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
        >
          Overview
        </Link>
        <span style={{ color: 'var(--border)' }}>·</span>
        <Link
          href={`/dashboard/agents/${agent.id}/configure`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--primary)',
            textDecoration: 'none',
            marginLeft: 'auto',
          }}
        >
          <Settings size={12} />
          {isConfigured ? 'Edit config' : 'Configure'}
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
