'use client';

import { TrendingUp, Plus, Clock, Zap, DollarSign } from 'lucide-react';

// ---------------------------------------------------------------------------
// Stage config — accent colors are theme-agnostic semantic indicators
// ---------------------------------------------------------------------------

const STAGES = [
  { id: 'new', label: 'New Lead', color: 'var(--text-muted)', border: 'var(--border-strong)' },
  { id: 'qualified', label: 'Qualified', color: '#38bdf8', border: '#38bdf8' },
  { id: 'proposal', label: 'Proposal Sent', color: '#2563EB', border: '#2563EB' },
  { id: 'negotiation', label: 'Negotiation', color: '#f59e0b', border: '#f59e0b' },
  { id: 'closing', label: 'Closing', color: 'var(--primary)', border: 'var(--primary)' },
];

// Deterministic avatar color from agent name
const AGENT_COLORS = [
  '#0F8A4F', '#2563EB', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6',
];
function agentAvatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AGENT_COLORS[Math.abs(h) % AGENT_COLORS.length];
}
function initials(name) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

// ---------------------------------------------------------------------------
// Mock deals — 20 total across 5 stages
// ---------------------------------------------------------------------------

const DEALS = {
  new: [
    { id: 1, name: 'Harrison Property', service: 'Full Roof Replacement', value: 22400, days: 1, agent: 'Instant Lead Response', lastTouch: 'AI reached out 15m ago' },
    { id: 2, name: 'Novak Residence', service: 'HVAC System Replacement', value: 14200, days: 1, agent: 'Form Bot', lastTouch: 'Form qualified 32m ago' },
    { id: 3, name: 'Garcia Home', service: 'Solar Panel Array', value: 28800, days: 2, agent: 'Social DM Agent', lastTouch: 'DM auto-replied 1h ago' },
    { id: 4, name: 'Baker Property', service: 'Gutter Install', value: 4800, days: 2, agent: 'Instant Lead Response', lastTouch: 'AI qualified 2h ago' },
    { id: 5, name: 'Ortiz Residence', service: 'Siding Replacement', value: 18600, days: 3, agent: 'Form Bot', lastTouch: 'Web form 4h ago' },
    { id: 6, name: 'Walker Home', service: 'Kitchen Remodel', value: 32500, days: 4, agent: 'Social DM Agent', lastTouch: 'IG DM 1d ago' },
  ],
  qualified: [
    { id: 7, name: 'Thompson Residence', service: 'Full Roof Replacement', value: 18400, days: 3, agent: 'Appointment Setter', lastTouch: 'Inspection booked 3h ago' },
    { id: 8, name: 'Patel Home', service: 'HVAC System Install', value: 12800, days: 2, agent: 'Objection Handler', lastTouch: 'Budget clarified 1h ago' },
    { id: 9, name: 'Chen Residence', service: 'Kitchen Remodel', value: 28500, days: 4, agent: 'Appointment Setter', lastTouch: 'Site visit Thu 10a' },
    { id: 10, name: 'Kim Property', service: 'Solar Consult', value: 24600, days: 3, agent: 'Objection Handler', lastTouch: 'Objections logged 5h ago' },
    { id: 11, name: 'Foster Home', service: 'Storm Damage Roof', value: 9800, days: 2, agent: 'Appointment Setter', lastTouch: 'Booked Friday 2p' },
  ],
  proposal: [
    { id: 12, name: 'Williams Property', service: 'Solar Panel Array (24 panels)', value: 34200, days: 5, agent: 'Quote Follow-Up', lastTouch: 'AI followed up 2h ago' },
    { id: 13, name: 'Davis Property', service: 'Complete Exterior', value: 22100, days: 4, agent: 'Quote Follow-Up', lastTouch: 'Ping scheduled tomorrow' },
    { id: 14, name: 'Sullivan Home', service: 'Full Roof + Gutters', value: 19200, days: 6, agent: 'Quote Follow-Up', lastTouch: 'Viewed 3x · no reply' },
    { id: 15, name: 'Nguyen Residence', service: 'HVAC + Ducts', value: 16400, days: 5, agent: 'Quote Follow-Up', lastTouch: 'Follow-up sent 1d ago' },
  ],
  negotiation: [
    { id: 16, name: 'Rodriguez Home', service: 'Roof Repair + Gutters', value: 6200, days: 2, agent: 'Objection Handler', lastTouch: 'Counter-offer sent 3h ago' },
    { id: 17, name: 'Park Property', service: 'Full Exterior + Paint', value: 28800, days: 4, agent: 'Objection Handler', lastTouch: 'Discount req. handled' },
    { id: 18, name: 'Brooks Residence', service: 'HVAC Install', value: 11400, days: 3, agent: 'Quote Follow-Up', lastTouch: 'Warranty Q&A 1h ago' },
  ],
  closing: [
    { id: 19, name: 'Patrick Residence', service: 'Full Roof Replacement', value: 21500, days: 1, agent: 'Appointment Setter', lastTouch: 'Contract out 2h ago' },
    { id: 20, name: 'Mitchell Property', service: 'Solar Array + Battery', value: 38200, days: 2, agent: 'Quote Follow-Up', lastTouch: 'Signature pending' },
  ],
};

const FUNNEL = [
  { from: 'New Lead', to: 'Qualified', rate: 60 },
  { from: 'Qualified', to: 'Proposal', rate: 43 },
  { from: 'Proposal', to: 'Negotiation', rate: 58 },
  { from: 'Negotiation', to: 'Closing', rate: 57 },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PipelinePage() {
  const totalPipeline = 284600;

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
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
            className="t-eyebrow"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <TrendingUp size={12} style={{ color: 'var(--primary)' }} />
            Pipeline
          </div>
          <h1 className="t-h1" style={{ margin: '6px 0 4px' }}>
            Pipeline
          </h1>
          <p className="t-body-sm" style={{ margin: 0 }}>
            Every open deal from first touch to signed contract.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--primary-dark)',
              }}
            >
              Total Pipeline Value
            </span>
            <span
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: 'var(--primary)',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
                marginTop: 4,
              }}
            >
              ${totalPipeline.toLocaleString()}
            </span>
          </div>
          <button type="button" className="btn-primary">
            <Plus size={16} />
            Add Deal
          </button>
        </div>
      </div>

      {/* Stat strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 16,
          marginTop: 28,
        }}
        className="pipeline-stats-grid"
      >
        <StatCell label="New Leads" value="47" />
        <StatCell label="Qualified" value="28" />
        <StatCell label="Proposal Sent" value="12" />
        <StatCell label="Negotiation" value="7" />
        <StatCell label="Closing" value="4" accent />
      </div>

      {/* Kanban */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(240px, 1fr))',
          gap: 14,
          marginTop: 28,
          overflowX: 'auto',
          paddingBottom: 8,
        }}
        className="kanban-board"
      >
        {STAGES.map((s) => (
          <KanbanColumn
            key={s.id}
            stage={s}
            deals={DEALS[s.id] || []}
          />
        ))}
      </div>

      {/* Conversion Funnel */}
      <div className="dark-card" style={{ padding: 24, marginTop: 32 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 20,
            gap: 16,
          }}
        >
          <div>
            <h2 className="t-h2" style={{ margin: 0 }}>
              Conversion Funnel
            </h2>
            <p className="t-body-sm" style={{ margin: '4px 0 0' }}>
              Stage-to-stage conversion rates over the last 30 days.
            </p>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}
          className="funnel-grid"
        >
          {FUNNEL.map((f) => (
            <FunnelBar key={f.from} from={f.from} to={f.to} rate={f.rate} />
          ))}
        </div>
      </div>

      {/* Responsive */}
      <style jsx>{`
        @media (max-width: 1100px) {
          :global(.pipeline-stats-grid) {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          :global(.funnel-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 700px) {
          :global(.pipeline-stats-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          :global(.funnel-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat cell (top strip)
// ---------------------------------------------------------------------------

function StatCell({ label, value, accent }) {
  return (
    <div
      className="dark-card"
      style={{
        padding: 16,
        borderLeft: accent ? '3px solid var(--primary)' : undefined,
      }}
    >
      <div
        className="t-eyebrow"
        style={{ color: accent ? 'var(--primary)' : 'var(--text-muted)' }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 26,
          fontWeight: 700,
          color: accent ? 'var(--primary)' : 'var(--text-bright)',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kanban column
// ---------------------------------------------------------------------------

function KanbanColumn({ stage, deals }) {
  const sum = deals.reduce((s, d) => s + d.value, 0);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 240,
      }}
    >
      {/* Column header with colored top border */}
      <div
        className="dark-card"
        style={{
          padding: '14px 14px',
          borderTop: `3px solid ${stage.border}`,
          borderRadius: 12,
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
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: stage.color,
            }}
          >
            {stage.label}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              background: 'var(--surface-2)',
              padding: '2px 8px',
              borderRadius: 999,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {deals.length}
          </span>
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-bright)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          ${sum.toLocaleString()}
        </div>
      </div>

      {/* Cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxHeight: 620,
          overflowY: 'auto',
          paddingRight: 2,
        }}
      >
        {deals.map((d) => (
          <DealCard key={d.id} d={d} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Deal card
// ---------------------------------------------------------------------------

function DealCard({ d }) {
  const color = agentAvatarColor(d.agent);
  return (
    <div
      className="dark-card deal-card"
      style={{
        padding: 14,
        cursor: 'pointer',
        transition: 'transform .15s, box-shadow .15s',
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--text-bright)',
          lineHeight: 1.2,
        }}
      >
        {d.name}
      </div>
      <div className="t-body-sm" style={{ marginTop: 2 }}>
        {d.service}
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--primary)',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        ${d.value.toLocaleString()}
      </div>

      {/* Days in stage pill */}
      <div style={{ marginTop: 10 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: '3px 8px',
            borderRadius: 999,
            background: 'var(--surface-2)',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}
        >
          <Clock size={10} />
          {d.days} day{d.days === 1 ? '' : 's'} in stage
        </span>
      </div>

      {/* Footer: agent avatar + last touch */}
      <div
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          title={d.agent}
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: color,
            color: '#ffffff',
            fontSize: 10,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            letterSpacing: '0.02em',
          }}
        >
          {initials(d.agent)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            {d.agent}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              marginTop: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <Zap size={10} style={{ color: 'var(--primary)' }} />
            {d.lastTouch}
          </div>
        </div>
      </div>

      <style jsx>{`
        .deal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Funnel bar
// ---------------------------------------------------------------------------

function FunnelBar({ from, to, rate }) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          {from} → {to}
        </span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {rate}%
        </span>
      </div>
      <div
        style={{
          marginTop: 8,
          height: 8,
          background: 'var(--surface-2)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${rate}%`,
            height: '100%',
            background:
              'linear-gradient(90deg, var(--primary), var(--primary-dark))',
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}
