'use client';

import { useMemo, useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  ShieldCheck,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileEdit,
  Send,
  AlertCircle,
  DollarSign,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Status config — only status accents are hardcoded (they're theme-agnostic
// indicator colors); everything else routes through theme tokens.
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  won: {
    label: 'WON',
    color: 'var(--emerald-bright)',
    barColor: 'var(--emerald-bright)',
    icon: CheckCircle,
  },
  sent: {
    label: 'SENT',
    color: '#3b82f6',
    barColor: '#3b82f6',
    icon: Send,
  },
  viewed: {
    label: 'VIEWED',
    color: '#8b5cf6',
    barColor: '#8b5cf6',
    icon: Eye,
  },
  draft: {
    label: 'DRAFT',
    color: 'var(--text-muted)',
    barColor: 'var(--text-muted)',
    icon: FileEdit,
  },
  lost: {
    label: 'LOST',
    color: 'var(--negative)',
    barColor: 'var(--negative)',
    icon: XCircle,
  },
  expired: {
    label: 'EXPIRED',
    color: '#f59e0b',
    barColor: '#f59e0b',
    icon: AlertCircle,
  },
};

const FILTERS = ['all', 'draft', 'sent', 'viewed', 'won', 'lost', 'expired'];

const PROPOSALS = [
  {
    id: 1,
    clientName: 'Thompson Residence',
    address: '1847 Oak Grove Ln',
    value: 18400,
    jobType: 'Full Roof Replacement',
    status: 'won',
    progress: 100,
    metaTop: 'Signed 2 days ago',
    metaBottom: 'Contract signed, job scheduled for next week',
  },
  {
    id: 2,
    clientName: 'Patel Home',
    address: '2412 Birchwood Ln',
    value: 12800,
    jobType: 'HVAC System Install',
    status: 'sent',
    progress: 50,
    metaTop: 'Sent 3 days ago',
    metaBottom: 'Viewed 2x — awaiting response',
  },
  {
    id: 3,
    clientName: 'Williams Property',
    address: '8821 Sunset Blvd',
    value: 34200,
    jobType: 'Solar Panel Array (24 panels)',
    status: 'viewed',
    progress: 70,
    metaTop: 'Sent 1 week ago',
    metaBottom: 'Viewed 5x — high engagement, follow up',
  },
  {
    id: 4,
    clientName: 'Chen Residence',
    address: '5523 Maple Ave',
    value: 28500,
    jobType: 'Kitchen Remodel',
    status: 'draft',
    progress: 15,
    metaTop: 'Created today',
    metaBottom: 'Awaiting final line items before send',
  },
  {
    id: 5,
    clientName: 'Rodriguez Home',
    address: '214 Cedar Park Rd',
    value: 6200,
    jobType: 'Roof Repair + Gutters',
    status: 'won',
    progress: 100,
    metaTop: 'Signed yesterday',
    metaBottom: 'Deposit received, starting Monday',
  },
  {
    id: 6,
    clientName: 'Davis Property',
    address: '8877 Pinecrest Way',
    value: 22100,
    jobType: 'Complete Exterior',
    status: 'sent',
    progress: 40,
    metaTop: 'Sent 5 days ago',
    metaBottom: 'No activity yet — ping scheduled for tomorrow',
  },
  {
    id: 7,
    clientName: 'Anderson Residence',
    address: '1204 Elm Street',
    value: 4800,
    jobType: 'HVAC Maintenance Contract',
    status: 'lost',
    progress: 100,
    metaTop: 'Declined 3 days ago',
    metaBottom: 'Went with cheaper competitor — save objection data',
  },
  {
    id: 8,
    clientName: 'Miller Home',
    address: '7660 Willow Creek',
    value: 15600,
    jobType: 'Storm Damage Roof',
    status: 'expired',
    progress: 100,
    metaTop: 'Sent 30 days ago',
    metaBottom: 'No response — dead lead reactivation queued',
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProposalsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredProposals = useMemo(() => {
    let list = PROPOSALS;
    if (filter !== 'all') list = list.filter((p) => p.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.clientName.toLowerCase().includes(q) ||
          p.jobType.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filter, search]);

  const pipelineValue = useMemo(
    () =>
      PROPOSALS.filter((p) => !['lost', 'expired'].includes(p.status)).reduce(
        (sum, p) => sum + p.value,
        0
      ),
    []
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 8,
        }}
      >
        <div>
          <div
            className="t-eyebrow"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <FileText size={12} style={{ color: 'var(--emerald-bright)' }} />
            Deliverable
          </div>
          <h1
            className="t-h1"
            style={{
              margin: '6px 0 6px',
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: '-0.01em',
            }}
          >
            Proposals Out
          </h1>
          <p
            className="t-body-sm"
            style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-body)' }}
          >
            Every quote sent, every view tracked, every dead quote revived.
          </p>
        </div>
        <button type="button" className="btn-primary">
          <Plus size={16} />
          Create Proposal
        </button>
      </div>

      {/* KPI row — 5 cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr',
          gap: 16,
          marginTop: 28,
        }}
      >
        {/* Total Pipeline Value — featured */}
        <div
          className="dark-card"
          style={{
            padding: 20,
            position: 'relative',
            borderLeft: '3px solid var(--emerald-bright)',
          }}
        >
          <div
            className="t-eyebrow"
            style={{
              color: 'var(--emerald-bright)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <DollarSign size={12} />
            Total Pipeline Value
          </div>
          <div
            className="t-kpi"
            style={{ marginTop: 8, color: 'var(--emerald-bright)' }}
          >
            ${pipelineValue.toLocaleString()}
          </div>
        </div>

        <KpiCard label="Total Proposals" value="34" icon={FileText} />
        <KpiCard label="Pending" value="12" icon={Clock} />
        <KpiCard
          label="Won"
          value="15"
          icon={CheckCircle}
          valueColor="var(--emerald-bright)"
        />
        <KpiCard
          label="Lost"
          value="7"
          icon={XCircle}
          valueColor="var(--text-muted)"
        />
      </div>

      {/* Filter pills + search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginTop: 28,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={filter === f ? 'filter-pill-active' : 'filter-pill'}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search proposals..."
            style={{ paddingLeft: 34, width: 260 }}
          />
        </div>
      </div>

      {/* Proposals grid */}
      <div
        className="proposals-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        {filteredProposals.map((p) => (
          <ProposalCard key={p.id} proposal={p} />
        ))}
        {filteredProposals.length === 0 ? (
          <div
            className="dark-card"
            style={{
              padding: 40,
              gridColumn: '1 / -1',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
            }}
          >
            No proposals match your filter.
          </div>
        ) : null}
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          :global(.proposals-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KPI card
// ---------------------------------------------------------------------------

function KpiCard({ label, value, icon: Icon, valueColor }) {
  return (
    <div className="dark-card" style={{ padding: 20 }}>
      <div
        className="t-eyebrow"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        <Icon size={12} style={{ color: 'var(--text-muted)' }} />
        {label}
      </div>
      <div
        className="t-kpi"
        style={{
          marginTop: 8,
          color: valueColor || 'var(--text-bright)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Proposal card
// ---------------------------------------------------------------------------

function ProposalCard({ proposal }) {
  const s = STATUS_CONFIG[proposal.status];

  // Lost + Expired get a colored left accent border so they pop at a glance.
  const accent =
    proposal.status === 'lost'
      ? '3px solid var(--negative)'
      : proposal.status === 'expired'
        ? '3px solid #f59e0b'
        : null;

  return (
    <div
      className="dark-card"
      style={{
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
        borderLeft: accent || undefined,
      }}
    >
      {/* Top row: name + value */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div className="t-h3">{proposal.clientName}</div>
          <div className="t-body-sm" style={{ marginTop: 2 }}>
            {proposal.address}
          </div>
        </div>
        <div
          className="t-h2"
          style={{
            color: 'var(--emerald-bright)',
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          ${proposal.value.toLocaleString()}
        </div>
      </div>

      {/* Middle: job type + status pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 16,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            minWidth: 0,
          }}
        >
          <ShieldCheck size={14} style={{ color: 'var(--text-muted)' }} />
          <span
            className="t-body"
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {proposal.jobType}
          </span>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            padding: '3px 10px',
            borderRadius: 999,
            background: `color-mix(in srgb, ${s.color} 14%, transparent)`,
            color: s.color,
            whiteSpace: 'nowrap',
          }}
        >
          {s.label}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 3,
          background: 'var(--border)',
          borderRadius: 999,
          marginTop: 14,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${proposal.progress}%`,
            background: s.barColor,
            borderRadius: 999,
            transition: 'width .3s ease',
          }}
        />
      </div>

      {/* Footer meta */}
      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="t-body-sm" style={{ color: 'var(--text-bright)' }}>
          {proposal.metaTop}
        </div>
        <div
          className="t-body-sm"
          style={{ fontStyle: 'italic', marginTop: 2 }}
        >
          {proposal.metaBottom}
        </div>
      </div>
    </div>
  );
}
