'use client';

import { use, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import { getAgentById } from '@/lib/agents/registry';
import { loadAgentConfig, agentConfigStatus } from '@/lib/agents/storage';
import { StatusBadge, ProgressRing } from '@/components/agent/FormPrimitives';
import { AgentTabs } from '@/components/agent/AgentTabs';

const ACTION_LABELS = {
  send_sms: 'Sent SMS',
  send_email: 'Sent email',
  book_appointment: 'Booked appointment',
  update_contact_status: 'Updated status',
  tag_contact: 'Tagged contact',
  escalate_to_human: 'Escalated',
  query_database: 'Queried DB',
  create_proposal_draft: 'Draft proposal',
  send_existing_proposal: 'Sent proposal',
  outbound_voice_call: 'Voice call',
};

const STATUS_COLORS = {
  sent: 'var(--primary)',
  shadow_skipped: '#8b5cf6',
  send_skipped_no_twilio: '#f59e0b',
  skipped_no_phone: '#f59e0b',
  pending: 'var(--text-muted)',
  failed: 'var(--negative)',
  success: 'var(--primary)',
};

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

function normalizeRows(data) {
  if (!data?.activities?.length && !data?.runs?.length) return [];

  if (data.activities?.length) {
    return data.activities.map((row) => {
      const a = row.activity ?? row;
      const r = row.run ?? {};
      const result = a.result ?? {};
      const payload = a.actionPayload ?? {};
      return {
        id: a.id,
        at: new Date(a.createdAt),
        action: ACTION_LABELS[a.actionType] || a.actionType,
        actionType: a.actionType,
        target: payload.to || r.contactId || '—',
        outcome: result.status || 'unknown',
        outcomeColor: STATUS_COLORS[result.status] || 'var(--text-muted)',
        body: payload.body || null,
        runStatus: r.status || null,
      };
    });
  }

  return data.runs.map((r) => {
    const trace = r.reasoningTrace ?? {};
    return {
      id: r.id,
      at: new Date(r.createdAt),
      action: trace.eventType || 'Run',
      actionType: 'run',
      target: trace.entityId || r.contactId || '—',
      outcome: trace.sendStatus || r.status,
      outcomeColor: STATUS_COLORS[r.status] || 'var(--text-muted)',
      body: trace.smsBody || null,
      runStatus: r.status,
    };
  });
}

export default function ActivityAgentPage({ params }) {
  const { id } = use(params);
  const agent = getAgentById(id);
  if (!agent) return notFound();

  const [hydrated, setHydrated] = useState(false);
  const [config, setConfig] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setConfig(loadAgentConfig(id));
    setHydrated(true);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/agents/${id}/activity`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setRows(normalizeRows(data));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const status = useMemo(() => agentConfigStatus(config), [config]);
  const Icon = agent.icon;

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (filter !== 'all' && row.actionType !== filter) return false;
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
  }, [rows, query, filter]);

  const uniqueActions = Array.from(new Set(rows.map((r) => r.actionType)));

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
              {ACTION_LABELS[a] || a}
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
          {loading ? 'Loading…' : `Showing ${filtered.length} of ${rows.length}`}
        </div>
      </div>

      {/* Table */}
      <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: 40,
              color: 'var(--text-muted)',
              fontSize: 13,
            }}
          >
            <Loader2 size={16} className="animate-spin" /> Loading activity…
          </div>
        ) : (
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
                    No activity yet. Agent runs will appear here once triggered.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
