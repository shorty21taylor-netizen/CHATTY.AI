'use client';

import { useMemo, useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Edit2,
  RefreshCw,
  Sparkles,
  Phone,
  Home,
  FileSearch,
  CheckCircle2,
  Users,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Status + source config (theme-agnostic indicator colors via color-mix)
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  confirmed: { label: 'CONFIRMED', color: 'var(--primary)' },
  pending: { label: 'PENDING', color: '#f59e0b' },
  rescheduled: { label: 'RESCHEDULED', color: '#3b82f6' },
};

const SOURCE_CONFIG = {
  ai: { label: 'AI AGENT', color: 'var(--primary)' },
  manual: { label: 'MANUAL', color: 'var(--text-muted)' },
  referral: { label: 'REFERRAL', color: '#8b5cf6' },
};

const SERVICE_ICONS = {
  estimate: FileSearch,
  site_visit: Home,
  sales_call: Phone,
};

// ---------------------------------------------------------------------------
// Mock appointments — 12 total across Today / Tomorrow / This Week
// ---------------------------------------------------------------------------

const APPOINTMENTS = [
  // Today (4)
  { id: 1, group: 'today', time: '10:00 AM', name: 'Thompson Residence', service: 'Roof Inspection Estimate', serviceType: 'estimate', address: '1847 Oak Grove Dr', status: 'confirmed', source: 'ai' },
  { id: 2, group: 'today', time: '11:30 AM', name: 'Patel Home', service: 'HVAC System Site Visit', serviceType: 'site_visit', address: '2412 Birchwood Ln', status: 'confirmed', source: 'ai' },
  { id: 3, group: 'today', time: '2:30 PM', name: 'Williams Property', service: 'Solar Consultation', serviceType: 'sales_call', address: '8821 Sunset Blvd', status: 'pending', source: 'manual' },
  { id: 4, group: 'today', time: '4:00 PM', name: 'Chen Residence', service: 'Kitchen Remodel Estimate', serviceType: 'estimate', address: '5523 Maple Ave', status: 'rescheduled', source: 'ai' },
  // Tomorrow (4)
  { id: 5, group: 'tomorrow', time: '9:00 AM', name: 'Rodriguez Home', service: 'Gutter Replacement Site Visit', serviceType: 'site_visit', address: '214 Cedar Park Rd', status: 'confirmed', source: 'ai' },
  { id: 6, group: 'tomorrow', time: '10:30 AM', name: 'Davis Property', service: 'Full Exterior Estimate', serviceType: 'estimate', address: '8877 Pinecrest Way', status: 'confirmed', source: 'referral' },
  { id: 7, group: 'tomorrow', time: '1:00 PM', name: 'Anderson Residence', service: 'HVAC Maintenance Call', serviceType: 'sales_call', address: '1204 Elm Street', status: 'confirmed', source: 'ai' },
  { id: 8, group: 'tomorrow', time: '3:30 PM', name: 'Miller Home', service: 'Storm Damage Estimate', serviceType: 'estimate', address: '7660 Willow Creek', status: 'pending', source: 'manual' },
  // This Week (4)
  { id: 9, group: 'week', day: 'Thu', time: '9:30 AM', name: 'Martinez Property', service: 'Solar Panel Site Visit', serviceType: 'site_visit', address: '3301 Oakridge Dr', status: 'confirmed', source: 'ai' },
  { id: 10, group: 'week', day: 'Thu', time: '2:00 PM', name: 'Brown Residence', service: 'Roof Replacement Sales Call', serviceType: 'sales_call', address: '5519 Meadow Ln', status: 'confirmed', source: 'ai' },
  { id: 11, group: 'week', day: 'Fri', time: '11:00 AM', name: 'Lee Property', service: 'HVAC Install Estimate', serviceType: 'estimate', address: '2287 Highland Ct', status: 'confirmed', source: 'referral' },
  { id: 12, group: 'week', day: 'Sat', time: '10:00 AM', name: 'Green Residence', service: 'Solar Consultation', serviceType: 'sales_call', address: '1104 Birchwood Pl', status: 'rescheduled', source: 'ai' },
];

const BOOKED_BY_AI = [
  { agent: 'Appointment Setter', count: 14, icon: Calendar },
  { agent: 'Instant Lead Response', count: 8, icon: Sparkles },
  { agent: 'Social DM Agent', count: 4, icon: Users },
];

const CALENDAR_DAYS = [
  { label: 'Mon', count: 4, isToday: true },
  { label: 'Tue', count: 4 },
  { label: 'Wed', count: 3 },
  { label: 'Thu', count: 2 },
  { label: 'Fri', count: 1 },
  { label: 'Sat', count: 1 },
  { label: 'Sun', count: 0 },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AppointmentsPage() {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return APPOINTMENTS;
    if (filter === 'today') return APPOINTMENTS.filter((a) => a.group === 'today');
    if (filter === 'week') return APPOINTMENTS;
    if (filter === 'estimates') return APPOINTMENTS.filter((a) => a.serviceType === 'estimate');
    if (filter === 'site_visits') return APPOINTMENTS.filter((a) => a.serviceType === 'site_visit');
    if (filter === 'sales_calls') return APPOINTMENTS.filter((a) => a.serviceType === 'sales_call');
    return APPOINTMENTS;
  }, [filter]);

  const today = filtered.filter((a) => a.group === 'today');
  const tomorrow = filtered.filter((a) => a.group === 'tomorrow');
  const week = filtered.filter((a) => a.group === 'week');

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
            <Calendar size={12} style={{ color: 'var(--primary)' }} />
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
            Your calendar fills itself. Here&apos;s what the AI booked.
          </p>
        </div>
        <button type="button" className="btn-primary">
          <Plus size={16} />
          Book Appointment
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
        <StatCard icon={<Clock size={13} />} label="Today" value="8" />
        <StatCard icon={<Calendar size={13} />} label="This Week" value="34" />
        <StatCard
          icon={<Sparkles size={13} />}
          label="Booked by AI"
          value="26"
          accent
        />
        <StatCard
          icon={<CheckCircle2 size={13} />}
          label="Show Rate"
          value="87%"
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
          { k: 'week', l: 'This Week' },
          { k: 'estimates', l: 'Estimates' },
          { k: 'site_visits', l: 'Site Visits' },
          { k: 'sales_calls', l: 'Sales Calls' },
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
          {today.length > 0 ? (
            <AppointmentGroup label="Today" items={today} />
          ) : null}
          {tomorrow.length > 0 ? (
            <AppointmentGroup label="Tomorrow" items={tomorrow} />
          ) : null}
          {week.length > 0 ? (
            <AppointmentGroup label="This Week" items={week} last />
          ) : null}
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: 13,
              }}
            >
              No appointments match your filter.
            </div>
          ) : null}
        </div>

        {/* RIGHT: calendar + Booked by AI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CalendarWidget />
          <BookedByAiCard />
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
// Appointment group + row
// ---------------------------------------------------------------------------

function AppointmentGroup({ label, items, last }) {
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
        <AppointmentRow key={a.id} a={a} last={i === items.length - 1} />
      ))}
    </div>
  );
}

function AppointmentRow({ a, last }) {
  const ServiceIcon = SERVICE_ICONS[a.serviceType] || Calendar;
  const status = STATUS_CONFIG[a.status];
  const source = SOURCE_CONFIG[a.source];

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
          <ServiceIcon size={14} style={{ color: 'var(--text-muted)' }} />
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
          {a.service}
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
          <MapPin size={12} />
          {a.address}
        </div>
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
        <div style={{ display: 'inline-flex', gap: 6 }}>
          <Pill color={status.color}>{status.label}</Pill>
          <Pill color={source.color}>{source.label}</Pill>
        </div>
        <div style={{ display: 'inline-flex', gap: 6 }}>
          <IconButton title="Edit">
            <Edit2 size={13} />
          </IconButton>
          <IconButton title="Reschedule">
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
// Calendar widget
// ---------------------------------------------------------------------------

function CalendarWidget() {
  const max = Math.max(...CALENDAR_DAYS.map((d) => d.count), 1);
  return (
    <div className="dark-card" style={{ padding: 20 }}>
      <div
        className="t-eyebrow"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        <Calendar size={11} style={{ color: 'var(--primary)' }} />
        This Week
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
        {CALENDAR_DAYS.map((d) => {
          const isToday = d.isToday;
          return (
            <div
              key={d.label}
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
// Booked by AI summary
// ---------------------------------------------------------------------------

function BookedByAiCard() {
  const total = BOOKED_BY_AI.reduce((s, a) => s + a.count, 0);
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
        <span className="t-body-sm">appointments this week</span>
      </div>

      <div
        style={{
          marginTop: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {BOOKED_BY_AI.map((a) => {
          const Icon = a.icon;
          const pct = Math.round((a.count / total) * 100);
          return (
            <div
              key={a.agent}
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
                  {a.agent}
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
