'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  FileText,
  MessageSquare,
  Snowflake,
  Eye,
  AlertCircle,
  List,
  Calendar,
  ArrowRight,
  Sparkles,
  Inbox,
  Handshake,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Lead status → agent/pipeline-stage presentation
// ---------------------------------------------------------------------------

// The six tiles the contractor sees: each one maps 1:1 to a lead status
// the Follow-Up agents work on. Counts are computed from real leads so
// the tiles reflect the actual tenant pipeline.
const AGENT_STAGES = [
  { id: 'new',             name: 'Inbound New Leads',  icon: Inbox,       color: '#3b82f6',          statuses: ['new'],            label: 'need first touch' },
  { id: 'contacted',       name: 'Contacted',          icon: MessageSquare, color: '#8b5cf6',        statuses: ['contacted'],      label: 'awaiting reply'    },
  { id: 'appointment_set', name: 'Appointments Set',   icon: Calendar,    color: 'var(--primary)',   statuses: ['appointment_set'], label: 'confirmed'         },
  { id: 'quoted',          name: 'Quote Follow-Up',    icon: FileText,    color: '#f59e0b',          statuses: ['quoted'],         label: 'active sequences'  },
  { id: 'negotiating',     name: 'Objection Handler',  icon: Handshake,   color: '#ec4899',          statuses: ['negotiating'],    label: 'in negotiation'    },
  { id: 'on_hold',         name: 'Dead Lead Rescue',   icon: Snowflake,   color: 'var(--text-muted)', statuses: ['on_hold','lost'], label: 'in rotation'      },
];

const STATUS_COLORS = {
  new:             { label: 'NEW',            color: '#3b82f6' },
  contacted:       { label: 'CONTACTED',      color: '#8b5cf6' },
  appointment_set: { label: 'APPT SET',       color: 'var(--primary)' },
  inspected:       { label: 'INSPECTED',      color: 'var(--primary)' },
  quoted:          { label: 'QUOTED',         color: '#f59e0b' },
  negotiating:     { label: 'NEGOTIATING',    color: '#ec4899' },
  on_hold:         { label: 'ON HOLD',        color: 'var(--text-muted)' },
  won:             { label: 'WON',            color: 'var(--primary)' },
  lost:            { label: 'LOST',           color: '#ef4444' },
};

const PRIORITY_COLORS = {
  hot:    { label: 'HOT',    color: '#ef4444' },
  high:   { label: 'HIGH',   color: '#f59e0b' },
  medium: { label: 'MEDIUM', color: 'var(--text-muted)' },
  low:    { label: 'LOW',    color: 'var(--text-muted)' },
};

const ACTIVE_STATUSES = new Set([
  'new', 'contacted', 'appointment_set', 'inspected', 'quoted', 'negotiating', 'on_hold',
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtContactName(lead) {
  const company = lead.contact_company;
  const first = lead.contact_first_name;
  const last = lead.contact_last_name;
  if (company && company.trim()) return company;
  const name = [first, last].filter(Boolean).join(' ').trim();
  if (name) return name;
  return lead.title || 'Unnamed lead';
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysBetween(a, b) {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / (24 * 60 * 60 * 1000));
}

function daysSinceCreated(lead) {
  if (!lead.created_at) return 0;
  const created = new Date(lead.created_at);
  if (Number.isNaN(created.getTime())) return 0;
  return Math.max(0, daysBetween(new Date(), created));
}

function fmtFollowUp(iso) {
  if (!iso) return { label: 'Unscheduled', color: 'var(--text-muted)', overdue: false };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { label: 'Unscheduled', color: 'var(--text-muted)', overdue: false };
  const diff = daysBetween(d, new Date());
  const short = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  if (diff < 0) return { label: `${short} · overdue ${Math.abs(diff)}d`, color: '#ef4444', overdue: true };
  if (diff === 0) return { label: `${short} · today`, color: '#f59e0b', overdue: false };
  if (diff === 1) return { label: `${short} · tomorrow`, color: '#f59e0b', overdue: false };
  return { label: short, color: 'var(--text-body)', overdue: false };
}

function fmtMoney(n) {
  const v = Number(n ?? 0);
  if (Number.isNaN(v) || v === 0) return '—';
  if (v >= 1000) return `$${Math.round(v / 1000)}K`;
  return `$${v.toLocaleString()}`;
}

function warmth(lead) {
  if (lead.priority === 'hot') return 'warm';
  if (lead.priority === 'high') return 'warm';
  if (lead.status === 'on_hold' || lead.status === 'lost') return 'cold';
  return 'active';
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FollowUpsPage() {
  const [view, setView] = useState('list');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    fetch('/api/crm/leads?limit=200', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (cancel) return;
        setLeads(Array.isArray(json?.leads) ? json.leads : []);
      })
      .catch((err) => {
        if (cancel) return;
        setError(err?.message || 'Failed to load leads');
      })
      .finally(() => {
        if (cancel) return;
        setLoading(false);
      });
    return () => { cancel = true; };
  }, []);

  // Active sequences = leads actively being nurtured (not won, not still-new dead lost)
  const activeLeads = useMemo(
    () => leads.filter((l) => ACTIVE_STATUSES.has(l.status)),
    [leads],
  );

  // Ready to act = overdue follow-ups + hot-priority active leads
  const readyToAct = useMemo(() => {
    const today = startOfDay(new Date());
    return leads
      .filter((l) => {
        if (!ACTIVE_STATUSES.has(l.status)) return false;
        if (l.priority === 'hot') return true;
        if (!l.follow_up_date) return false;
        const d = new Date(l.follow_up_date);
        return !Number.isNaN(d.getTime()) && d.getTime() <= today.getTime();
      })
      .slice(0, 6);
  }, [leads]);

  // Stat strip values
  const pipelineValue = useMemo(
    () => activeLeads.reduce((sum, l) => sum + Number(l.estimated_value ?? 0), 0),
    [activeLeads],
  );
  const warmCount = useMemo(
    () => activeLeads.filter((l) => l.priority === 'hot' || l.priority === 'high').length,
    [activeLeads],
  );
  const newThisWeek = useMemo(() => {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return leads.filter((l) => {
      if (!l.created_at) return false;
      const d = new Date(l.created_at);
      return !Number.isNaN(d.getTime()) && d >= weekAgo;
    }).length;
  }, [leads]);

  // Per-agent tile counts
  const stageCounts = useMemo(() => {
    const map = {};
    for (const stage of AGENT_STAGES) {
      map[stage.id] = leads.filter((l) => stage.statuses.includes(l.status)).length;
    }
    return map;
  }, [leads]);

  // Timeline = leads grouped by follow_up_date for next 7 days
  const timelineDays = useMemo(() => {
    const today = startOfDay(new Date());
    const days = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      const dayKey = d.toISOString().slice(0, 10);
      const dayLeads = leads.filter((l) => {
        if (!l.follow_up_date || !ACTIVE_STATUSES.has(l.status)) return false;
        return String(l.follow_up_date).slice(0, 10) === dayKey;
      });
      days.push({
        day: d.toLocaleDateString(undefined, { weekday: 'short' }),
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        leads: dayLeads,
      });
    }
    return days;
  }, [leads]);

  return (
    <div>
      {/* Header */}
      <div>
        <div
          className="t-eyebrow"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <RefreshCw size={12} style={{ color: 'var(--primary)' }} />
          Deliverable
        </div>
        <h1
          className="t-h1"
          style={{
            margin: '6px 0 6px',
            letterSpacing: '-0.02em',
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
          borderColor: 'color-mix(in srgb, var(--primary) 40%, var(--border))',
          boxShadow: '0 0 28px rgba(16,185,129,0.14)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: 'color-mix(in srgb, var(--primary) 18%, transparent)',
              color: 'var(--primary)',
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
                color: 'var(--primary-dark)',
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
                color: 'var(--primary)',
                marginTop: 6,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
              }}
            >
              {loading ? '—' : activeLeads.length}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-body)', marginTop: 8 }}>
              active sequences · <b>{readyToAct.length}</b> ready to act on ·{' '}
              <b>{fmtMoney(pipelineValue)}</b> pipeline in motion
            </div>
          </div>
        </div>
        <Pill color="#f59e0b">{warmCount} WARM</Pill>
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
        <StatCard
          label="Active Sequences"
          value={loading ? '—' : String(activeLeads.length)}
          hint="across 6 pipeline stages"
        />
        <StatCard
          label="Pipeline Value"
          value={loading ? '—' : fmtMoney(pipelineValue)}
          hint="estimated across active"
        />
        <StatCard
          label="Warm Signals"
          value={loading ? '—' : String(warmCount)}
          hint="hot + high priority"
          accent
        />
        <StatCard
          label="New This Week"
          value={loading ? '—' : String(newThisWeek)}
          hint="last 7 days"
        />
      </div>

      {/* Error or loading banners */}
      {error ? (
        <div
          className="dark-card"
          style={{
            padding: 16,
            marginTop: 20,
            borderColor: 'color-mix(in srgb, #ef4444 30%, var(--border))',
            color: '#ef4444',
            fontSize: 13,
          }}
        >
          Couldn&apos;t load leads: {error}
        </div>
      ) : null}

      {/* Agents / stages working */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 12,
          }}
        >
          Stages the Follow-Up agents are working
        </div>
        <div
          className="fu-agent-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {AGENT_STAGES.map((a) => (
            <AgentTile key={a.id} agent={a} count={loading ? '—' : stageCounts[a.id]} />
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
          Leads with overdue follow-ups or hot priority. Every hour matters.
        </div>
        {loading ? (
          <EmptyInline text="Loading leads…" />
        ) : readyToAct.length === 0 ? (
          <EmptyInline text="Nothing urgent right now. Keep shipping." />
        ) : (
          <div
            className="fu-ready-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}
          >
            {readyToAct.map((lead) => {
              const fu = fmtFollowUp(lead.follow_up_date);
              const pri = PRIORITY_COLORS[lead.priority] || PRIORITY_COLORS.medium;
              const Icon = lead.priority === 'hot' ? AlertCircle : Eye;
              const signal = lead.priority === 'hot'
                ? 'Marked hot priority'
                : fu.overdue
                  ? `Follow-up ${fu.label}`
                  : 'Follow-up due today';
              return (
                <div
                  key={lead.id}
                  className="dark-card"
                  style={{
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    borderColor: 'color-mix(in srgb, #f59e0b 40%, var(--border))',
                    background: 'linear-gradient(180deg, transparent 0%, color-mix(in srgb, #f59e0b 5%, transparent) 100%)',
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
                      {lead.priority === 'hot' ? 'Hot lead' : 'Warm signal'}
                    </span>
                    <Pill color={pri.color}>{pri.label}</Pill>
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--text-bright)',
                    }}
                  >
                    {fmtContactName(lead)}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: 'var(--text-body)',
                    }}
                  >
                    {signal}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {lead.title} · <b>{fmtMoney(lead.estimated_value)}</b>
                  </div>
                  <Link
                    href={`/dashboard/crm/leads`}
                    className="btn-primary"
                    style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    Take action
                    <ArrowRight size={13} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
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
                ? `${activeLeads.length} leads currently being nurtured`
                : 'Next 7 days of scheduled follow-ups'}
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
            {loading ? (
              <EmptyBig icon={<RefreshCw size={24} />} title="Loading sequences…" body="Pulling leads from your CRM." />
            ) : activeLeads.length === 0 ? (
              <EmptyBig
                icon={<Sparkles size={24} />}
                title="No active follow-ups"
                body="Once you have contacted, quoted, or negotiating leads, they'll show up here."
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Contact</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Days in</th>
                      <th>Value</th>
                      <th>Next Follow-Up</th>
                      <th style={{ textAlign: 'center' }}>Warmth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeLeads.map((l) => {
                      const statusCfg = STATUS_COLORS[l.status] || { label: String(l.status || '').toUpperCase(), color: 'var(--text-muted)' };
                      const fu = fmtFollowUp(l.follow_up_date);
                      const w = warmth(l);
                      const warmthCfg = w === 'warm'
                        ? { label: 'WARM',   color: '#f59e0b' }
                        : w === 'cold'
                          ? { label: 'COLD',   color: 'var(--text-muted)' }
                          : { label: 'ACTIVE', color: '#3b82f6' };
                      return (
                        <tr key={l.id}>
                          <td style={{ color: 'var(--text-bright)', fontWeight: 500 }}>
                            {fmtContactName(l)}
                            {l.title ? (
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
                                {l.title}
                              </div>
                            ) : null}
                          </td>
                          <td>
                            <Pill color={statusCfg.color}>{statusCfg.label}</Pill>
                          </td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>
                            {daysSinceCreated(l)}
                          </td>
                          <td style={{ color: 'var(--text-body)', fontVariantNumeric: 'tabular-nums' }}>
                            {fmtMoney(l.estimated_value)}
                          </td>
                          <td style={{ color: fu.color, fontVariantNumeric: 'tabular-nums' }}>
                            {fu.label}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Pill color={warmthCfg.color}>{warmthCfg.label}</Pill>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="dark-card" style={{ padding: 20 }}>
            {loading ? (
              <EmptyBig icon={<RefreshCw size={24} />} title="Loading timeline…" body="Pulling follow-up schedule from your CRM." />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 10,
                }}
                className="fu-timeline-grid"
              >
                {timelineDays.map((d) => (
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
                      {d.leads.length === 0 ? (
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
                        d.leads.map((lead) => {
                          const statusCfg = STATUS_COLORS[lead.status] || { label: String(lead.status || '').toUpperCase(), color: 'var(--text-muted)' };
                          return (
                            <div
                              key={lead.id}
                              style={{
                                padding: '6px 8px',
                                borderRadius: 6,
                                border: `1px solid color-mix(in srgb, ${statusCfg.color} 30%, transparent)`,
                                background: `color-mix(in srgb, ${statusCfg.color} 8%, transparent)`,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 10,
                                  color: statusCfg.color,
                                  fontWeight: 600,
                                  letterSpacing: '0.08em',
                                }}
                              >
                                {statusCfg.label}
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
                                {fmtContactName(lead)}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 6%, transparent), transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={16} style={{ color: 'var(--primary)' }} />
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-bright)',
              }}
            >
              Fine-tune the follow-up cadence?
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Increase how aggressively your agents nurture quoted and ghosted leads.
            </div>
          </div>
        </div>
        <Link
          href="/dashboard/agents"
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
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

// ---------------------------------------------------------------------------
// Small shared components
// ---------------------------------------------------------------------------

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

function AgentTile({ agent, count }) {
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
              background: 'var(--primary)',
              boxShadow: '0 0 6px rgba(15, 138, 79, 0.2)',
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
          {count} {agent.label}
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

function EmptyInline({ text }) {
  return (
    <div
      className="dark-card"
      style={{
        padding: '28px 20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 13,
      }}
    >
      {text}
    </div>
  );
}

function EmptyBig({ icon, title, body }) {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
      }}
    >
      <div style={{ color: 'var(--text-muted)', marginBottom: 12, display: 'inline-flex' }}>{icon}</div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-bright)',
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 13, maxWidth: 420, margin: '0 auto' }}>{body}</div>
    </div>
  );
}
