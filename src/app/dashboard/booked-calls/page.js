'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  Edit2,
  RefreshCw,
  Sparkles,
  Phone,
  PhoneOff,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Mic,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Status + goal config (theme-agnostic indicator colors via color-mix)
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  queued:       { label: 'QUEUED',       color: '#f59e0b' },
  in_progress:  { label: 'ON CALL',      color: 'var(--primary)' },
  completed:    { label: 'COMPLETED',    color: 'var(--primary)' },
  voicemail:    { label: 'VOICEMAIL',    color: '#8b5cf6' },
  no_answer:    { label: 'NO ANSWER',    color: 'var(--text-muted)' },
  failed:       { label: 'FAILED',       color: '#ef4444' },
};

const OUTCOME_CONFIG = {
  booked:              { label: 'BOOKED',              color: 'var(--primary)' },
  interested:          { label: 'INTERESTED',          color: '#3b82f6' },
  callback_requested:  { label: 'CALLBACK',            color: '#f59e0b' },
  not_interested:      { label: 'NOT INTERESTED',      color: 'var(--text-muted)' },
  voicemail:           { label: 'LEFT VOICEMAIL',      color: '#8b5cf6' },
  no_answer:           { label: 'NO ANSWER',           color: 'var(--text-muted)' },
  error:               { label: 'ERROR',               color: '#ef4444' },
};

const GOAL_CONFIG = {
  reengage_lead:        { label: 'Re-engage Lead',      icon: Sparkles },
  confirm_appointment:  { label: 'Confirm Appointment', icon: Calendar },
  followup_quote:       { label: 'Follow-up on Quote',  icon: PhoneCall },
  custom:               { label: 'Custom Call',         icon: Mic },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function bucketFor(dateIso) {
  if (!dateIso) return 'later';
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return 'later';
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
  if (sameDay(d, today)) return 'today';
  if (sameDay(d, tomorrow)) return 'tomorrow';
  if (d >= today && d < weekEnd) return 'week';
  if (d < today) return 'past';
  return 'later';
}

function fmtTime(dateIso) {
  if (!dateIso) return '—';
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function fmtDayShort(dateIso) {
  if (!dateIso) return '';
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
}

function fmtPhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D+/g, '');
  if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  }
  return raw;
}

function normalize(row) {
  const goal = GOAL_CONFIG[row.call_goal] || GOAL_CONFIG.custom;
  const status = STATUS_CONFIG[row.status] || { label: String(row.status || 'UNKNOWN').toUpperCase(), color: 'var(--text-muted)' };
  const outcome = row.outcome ? (OUTCOME_CONFIG[row.outcome] || null) : null;
  return {
    id: row.id,
    name: row.contact_name || 'Unknown contact',
    phone: fmtPhone(row.contact_phone),
    goalKey: row.call_goal || 'custom',
    goalLabel: goal.label,
    GoalIcon: goal.icon,
    time: fmtTime(row.scheduled_for),
    day: fmtDayShort(row.scheduled_for),
    status,
    outcome,
    bucket: bucketFor(row.scheduled_for),
    outcomeNotes: row.outcome_notes || null,
    scheduledFor: row.scheduled_for,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BookedCallsPage() {
  const [filter, setFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    fetch('/api/calls', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (cancel) return;
        const calls = Array.isArray(json?.calls) ? json.calls : [];
        setRows(calls.map(normalize));
      })
      .catch((err) => {
        if (cancel) return;
        setError(err?.message || 'Failed to load calls');
      })
      .finally(() => {
        if (cancel) return;
        setLoading(false);
      });
    return () => { cancel = true; };
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return rows;
    if (filter === 'today') return rows.filter((r) => r.bucket === 'today');
    if (filter === 'tomorrow') return rows.filter((r) => r.bucket === 'tomorrow');
    if (filter === 'week') return rows.filter((r) => r.bucket === 'today' || r.bucket === 'tomorrow' || r.bucket === 'week');
    if (filter === 'booked') return rows.filter((r) => r.outcome && r.outcome.label === 'BOOKED');
    if (filter === 'queued') return rows.filter((r) => r.status.label === 'QUEUED');
    return rows;
  }, [filter, rows]);

  const today = filtered.filter((a) => a.bucket === 'today');
  const tomorrow = filtered.filter((a) => a.bucket === 'tomorrow');
  const week = filtered.filter((a) => a.bucket === 'week');
  const past = filtered.filter((a) => a.bucket === 'past');

  // KPIs computed against the full (unfiltered) result set so they remain stable
  const kpis = useMemo(() => {
    const todayAll = rows.filter((r) => r.bucket === 'today').length;
    const weekAll = rows.filter((r) => r.bucket === 'today' || r.bucket === 'tomorrow' || r.bucket === 'week').length;
    const bookedAll = rows.filter((r) => r.outcome && r.outcome.label === 'BOOKED').length;
    const completedAll = rows.filter((r) => r.status.label === 'COMPLETED' || r.status.label === 'VOICEMAIL' || r.status.label === 'NO ANSWER').length;
    const connectRate = completedAll > 0
      ? Math.round((rows.filter((r) => r.status.label === 'COMPLETED').length / completedAll) * 100)
      : null;
    return { todayAll, weekAll, bookedAll, connectRate };
  }, [rows]);

  // Weekly calendar widget (next 7 days)
  const calendarDays = useMemo(() => {
    const now = new Date();
    const today0 = startOfDay(now);
    const days = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(today0);
      d.setDate(today0.getDate() + i);
      const count = rows.filter((r) => {
        if (!r.scheduledFor) return false;
        return sameDay(new Date(r.scheduledFor), d);
      }).length;
      days.push({
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        count,
        isToday: i === 0,
      });
    }
    return days;
  }, [rows]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <div
            className="t-eyebrow"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Phone size={12} style={{ color: 'var(--primary)' }} />
            Deliverable
          </div>
          <h1
            className="t-h1"
            style={{
              margin: '6px 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            Booked Calls
          </h1>
          <p
            className="t-body-sm"
            style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-body)' }}
          >
            Outbound calls your AI agent is making — and what they turned into.
          </p>
        </div>
        <button type="button" className="btn-primary">
          <Plus size={16} />
          Queue Call
        </button>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginTop: 28,
        }}
        className="appts-stats-grid"
      >
        <StatCard icon={<Clock size={13} />} label="Today" value={loading ? '—' : String(kpis.todayAll)} />
        <StatCard icon={<Calendar size={13} />} label="This Week" value={loading ? '—' : String(kpis.weekAll)} />
        <StatCard
          icon={<Sparkles size={13} />}
          label="Booked by AI"
          value={loading ? '—' : String(kpis.bookedAll)}
          accent
        />
        <StatCard
          icon={<CheckCircle2 size={13} />}
          label="Connect Rate"
          value={loading ? '—' : kpis.connectRate === null ? '—' : `${kpis.connectRate}%`}
        />
      </div>

      {/* Filter pills */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginTop: 28,
          marginBottom: 20,
        }}
      >
        {[
          { k: 'all', l: 'All' },
          { k: 'today', l: 'Today' },
          { k: 'tomorrow', l: 'Tomorrow' },
          { k: 'week', l: 'This Week' },
          { k: 'queued', l: 'Queued' },
          { k: 'booked', l: 'Booked' },
        ].map((f) => (
          <button
            key={f.k}
            type="button"
            onClick={() => setFilter(f.k)}
            className={filter === f.k ? 'filter-pill-active' : 'filter-pill'}
          >
            {f.l}
          </button>
        ))}
      </div>

      {/* Two-pane layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 20,
        }}
        className="appts-split"
      >
        {/* LEFT: grouped list */}
        <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <EmptyState icon={<RefreshCw size={24} />} title="Loading calls…" body="Pulling your AI agent's queue." />
          ) : error ? (
            <EmptyState icon={<AlertCircle size={24} />} title="Couldn't load calls" body={error} />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={<PhoneOff size={24} />}
              title="No calls yet"
              body="Once you queue an outbound call, it'll show up here. Click 'Queue Call' to send your first one."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<PhoneOff size={24} />}
              title="No calls match this filter"
              body="Try 'All' to see everything the AI has on deck."
            />
          ) : (
            <>
              {today.length > 0 ? <CallGroup label="Today" items={today} /> : null}
              {tomorrow.length > 0 ? <CallGroup label="Tomorrow" items={tomorrow} /> : null}
              {week.length > 0 ? <CallGroup label="This Week" items={week} /> : null}
              {past.length > 0 ? <CallGroup label="Past 30 Days" items={past} last /> : null}
            </>
          )}
        </div>

        {/* RIGHT: calendar + Booked by AI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CalendarWidget days={calendarDays} />
          <BookedByAiCard rows={rows} />
        </div>
      </div>

      {/* Responsive */}
      <style jsx>{`
        @media (max-width: 1000px) {
          :global(.appts-split) {
            grid-template-columns: 1fr !important;
          }
          :global(.appts-stats-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({ icon, label, value, accent }) {
  return (
    <div
      className="dark-card"
      style={{
        padding: 20,
        borderLeft: accent ? '3px solid var(--primary)' : undefined,
      }}
    >
      <div
        className="t-eyebrow"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: accent ? 'var(--primary)' : 'var(--text-muted)',
        }}
      >
        {icon}
        {label}
      </div>
      <div
        className="t-kpi"
        style={{
          marginTop: 8,
          color: accent ? 'var(--primary)' : 'var(--text-bright)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Call group + row
// ---------------------------------------------------------------------------

function CallGroup({ label, items, last }) {
  return (
    <div style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <div
        style={{
          padding: '14px 20px',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-bright)',
          }}
        >
          {label}
          <span
            style={{
              marginLeft: 8,
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            {items.length}
          </span>
        </span>
      </div>
      {items.map((a, i) => (
        <CallRow key={a.id} a={a} last={i === items.length - 1} />
      ))}
    </div>
  );
}

function CallRow({ a, last }) {
  const GoalIcon = a.GoalIcon || Phone;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '96px 1fr auto',
        alignItems: 'center',
        gap: 16,
        padding: '16px 20px',
        borderBottom: last ? 'none' : '1px solid var(--border)',
      }}
    >
      {/* Time */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text-bright)',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.1,
          }}
        >
          {a.time}
        </div>
        {a.day ? (
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              marginTop: 2,
              textTransform: 'uppercase',
            }}
          >
            {a.day}
          </div>
        ) : null}
      </div>

      {/* Body */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 2,
          }}
        >
          <GoalIcon size={14} style={{ color: 'var(--text-muted)' }} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-bright)',
            }}
          >
            {a.name}
          </span>
        </div>
        <div className="t-body-sm" style={{ marginBottom: 6 }}>
          {a.goalLabel}
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          <Phone size={12} />
          {a.phone || '—'}
        </div>
        {a.outcomeNotes ? (
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              lineHeight: 1.4,
            }}
          >
            “{a.outcomeNotes}”
          </div>
        ) : null}
      </div>

      {/* Badges + actions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
        }}
      >
        <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Pill color={a.status.color}>{a.status.label}</Pill>
          {a.outcome ? <Pill color={a.outcome.color}>{a.outcome.label}</Pill> : null}
        </div>
        <div style={{ display: 'inline-flex', gap: 6 }}>
          <IconButton title="Edit">
            <Edit2 size={13} />
          </IconButton>
          <IconButton title="Re-queue">
            <RefreshCw size={13} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function Pill({ color, children }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.1em',
        padding: '3px 10px',
        borderRadius: 999,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

function IconButton({ children, title }) {
  return (
    <button
      type="button"
      title={title}
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Empty / loading state
// ---------------------------------------------------------------------------

function EmptyState({ icon, title, body }) {
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

// ---------------------------------------------------------------------------
// Calendar widget
// ---------------------------------------------------------------------------

function CalendarWidget({ days }) {
  const max = Math.max(...days.map((d) => d.count), 1);
  return (
    <div className="dark-card" style={{ padding: 20 }}>
      <div
        className="t-eyebrow"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        <Calendar size={11} style={{ color: 'var(--primary)' }} />
        Next 7 Days
      </div>
      <h3
        className="t-h3"
        style={{ margin: '4px 0 16px', color: 'var(--text-bright)' }}
      >
        At a glance
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 6,
        }}
      >
        {days.map((d, idx) => {
          const isToday = d.isToday;
          return (
            <div
              key={`${d.label}-${idx}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '10px 4px',
                borderRadius: 8,
                background: isToday ? 'var(--primary-tint)' : 'transparent',
                border: isToday
                  ? '1px solid rgba(16,185,129,0.3)'
                  : '1px solid transparent',
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: isToday ? 'var(--primary)' : 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                {d.label}
              </span>
              <div
                style={{
                  display: 'flex',
                  gap: 2,
                  minHeight: 6,
                  alignItems: 'center',
                }}
              >
                {Array.from({ length: Math.min(d.count, 4) }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      opacity: 0.5 + (d.count / max) * 0.5,
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isToday ? 'var(--primary)' : 'var(--text-bright)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {d.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Booked by AI summary — breakdown of goals for outcome=booked
// ---------------------------------------------------------------------------

function BookedByAiCard({ rows }) {
  const booked = rows.filter((r) => r.outcome && r.outcome.label === 'BOOKED');
  const total = booked.length;

  if (total === 0) {
    return (
      <div className="dark-card" style={{ padding: 20 }}>
        <div
          className="t-eyebrow"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--primary)',
          }}
        >
          <Sparkles size={11} />
          Booked by AI
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
          No bookings yet in the last 30 days. Bookings will appear here as your
          outbound calls convert.
        </div>
      </div>
    );
  }

  // Group by call goal
  const groups = booked.reduce((acc, r) => {
    const key = r.goalKey;
    if (!acc[key]) acc[key] = { key, label: r.goalLabel, Icon: r.GoalIcon, count: 0 };
    acc[key].count += 1;
    return acc;
  }, {});
  const list = Object.values(groups).sort((a, b) => b.count - a.count);

  return (
    <div className="dark-card" style={{ padding: 20 }}>
      <div
        className="t-eyebrow"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--primary)',
        }}
      >
        <Sparkles size={11} />
        Booked by AI
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          marginTop: 6,
        }}
      >
        <span
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--primary)',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {total}
        </span>
        <span className="t-body-sm">bookings in the last 30 days</span>
      </div>

      <div
        style={{
          marginTop: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {list.map((a) => {
          const Icon = a.Icon || Phone;
          const pct = Math.round((a.count / total) * 100);
          return (
            <div
              key={a.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 10,
                borderRadius: 8,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background:
                    'color-mix(in srgb, var(--primary) 14%, transparent)',
                  color: 'var(--primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={14} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-bright)',
                  }}
                >
                  {a.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    marginTop: 2,
                  }}
                >
                  {pct}% of bookings
                </div>
              </div>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--text-bright)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {a.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
