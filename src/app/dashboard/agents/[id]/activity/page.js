'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import { getAgentById } from '@/lib/agents/registry';
import { loadAgentConfig, agentConfigStatus } from '@/lib/agents/storage';
import { StatusBadge, ProgressRing } from '@/components/agent/FormPrimitives';
import { AgentTabs } from '@/components/agent/AgentTabs';

// 30-row mock audit log
const ACTIONS = [
  'Sent SMS',
  'Draft queued',
  'Escalated',
  'Booked appointment',
  'Tagged contact',
  'Updated status',
  'Logged call',
  'Sent email',
];
const TARGETS = [
  'Patricia Williams',
  'Marcus Miller',
  'James Rodriguez',
  'Sarah Chen',
  'Kevin Park',
  'Jennifer Davis',
  'Robert Thompson',
  'Linda Martinez',
  'Daniel Kim',
  'Emily Nguyen',
  'Carlos Ramirez',
  'Angela Foster',
];
const OUTCOMES = [
  { text: 'Delivered', color: 'var(--primary)' },
  { text: 'Replied', color: 'var(--primary)' },
  { text: 'Awaiting approval', color: '#f59e0b' },
  { text: 'Notified Telegram EA', color: '#3b82f6' },
  { text: 'Tag: price-sensitive', color: 'var(--text-muted)' },
  { text: 'Status: qualified', color: 'var(--text-muted)' },
  { text: 'Thu 2pm', color: 'var(--primary)' },
  { text: 'No reply', color: 'var(--text-muted)' },
  { text: 'Failed to deliver', color: 'var(--negative)' },
];

function buildMockLog() {
  const now = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    // stagger ~12–55 min apart
    const minsAgo = i * 17 + (i % 3) * 8;
    const d = new Date(now.getTime() - minsAgo * 60 * 1000);
    const action = ACTIONS[i % ACTIONS.length];
    const target = TARGETS[(i * 3) % TARGETS.length];
    const outcome = OUTCOMES[(i * 5) % OUTCOMES.length];
    return {
      id: i + 1,
      at: d,
      action,
      target,
      outcome: outcome.text,
      outcomeColor: outcome.color,
    };
  });
}

function formatTs(d) {
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const time = d.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  if (sameDay) return `Today · ${time}`;
  return `${d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  })} · ${time}`;
}

export default function ActivityAgentPage({ params }) {
  const { id } = use(params);
  const agent = getAgentById(id);
  if (!agent) return notFound();

  const [hydrated, setHydrated] = useState(false);
  const [config, setConfig] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const log = useMemo(() => buildMockLog(), []);

  useEffect(() => {
    setConfig(loadAgentConfig(id));
    setHydrated(true);
  }, [id]);

  const status = useMemo(() => agentConfigStatus(config), [config]);
  const Icon = agent.icon;

  const filtered = useMemo(() => {
    return log.filter((row) => {
      if (filter !== 'all' && row.action !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          row.action.toLowerCase().includes(q) ||
          row.target.toLowerCase().includes(q) ||
          row.outcome.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [log, query, filter]);

  const uniqueActions = Array.from(new Set(log.map((r) => r.action)));

  return (
    <div>
      <Link
        href={`/dashboard/agents/${id}`}
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
        <ArrowLeft size={14} /> Back to {agent.name}
      </Link>

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
              Activity log
            </div>
            <h1
              className="t-h1"
              style={{
                margin: '4px 0 6px',
                letterSpacing: '-0.02em',
                letterSpacing: '-0.01em',
              }}
            >
              {agent.name}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Every action this agent has taken, newest first.
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

      <AgentTabs agentId={id} active="activity" />

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            position: 'relative',
            flex: 1,
            minWidth: 220,
            maxWidth: 360,
          }}
        >
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search target, action, outcome…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 10px 9px 30px',
              fontSize: 13,
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-bright)',
              outline: 'none',
            }}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '9px 10px',
            fontSize: 13,
            background: 'var(--input-bg)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text-bright)',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">All actions</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            fontWeight: 500,
            marginLeft: 'auto',
          }}
        >
          Showing {filtered.length} of {log.length}
        </div>
      </div>

      {/* Table */}
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
            {filtered.map((row) => (
              <tr key={row.id}>
                <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {formatTs(row.at)}
                </td>
                <td style={{ fontWeight: 500, color: 'var(--text-bright)' }}>
                  {row.action}
                </td>
                <td>{row.target}</td>
                <td style={{ color: row.outcomeColor, fontWeight: 500 }}>
                  {row.outcome}
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: 13,
                    textAlign: 'center',
                    padding: 24,
                  }}
                >
                  No activity matches that filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
