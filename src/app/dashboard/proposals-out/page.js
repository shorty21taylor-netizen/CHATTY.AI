'use client';

import { useEffect, useMemo, useState } from 'react';
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
  RefreshCw,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Status config — keys mirror EstimateStatus from the DB schema. Labels are
// contractor-friendly ("WON" / "LOST" rather than the raw
// "accepted" / "rejected") because "won the job" is how the operator
// thinks about it, but the underlying data is unchanged.
//
// Progress % is a UX hint ("where is this deal in the funnel?") derived from
// status alone — no separate DB column needed. draft/sent/viewed advance
// toward 100; accepted/rejected/expired stay at 100 because the deal is
// closed (one way or another).
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  accepted: {
    label: 'WON',
    color: 'var(--primary)',
    barColor: 'var(--primary)',
    icon: CheckCircle,
    progress: 100,
  },
  sent: {
    label: 'SENT',
    color: '#3b82f6',
    barColor: '#3b82f6',
    icon: Send,
    progress: 45,
  },
  viewed: {
    label: 'VIEWED',
    color: '#8b5cf6',
    barColor: '#8b5cf6',
    icon: Eye,
    progress: 70,
  },
  draft: {
    label: 'DRAFT',
    color: 'var(--text-muted)',
    barColor: 'var(--text-muted)',
    icon: FileEdit,
    progress: 15,
  },
  rejected: {
    label: 'LOST',
    color: 'var(--negative)',
    barColor: 'var(--negative)',
    icon: XCircle,
    progress: 100,
  },
  expired: {
    label: 'EXPIRED',
    color: '#f59e0b',
    barColor: '#f59e0b',
    icon: AlertCircle,
    progress: 100,
  },
  revised: {
    label: 'REVISED',
    color: '#8b5cf6',
    barColor: '#8b5cf6',
    icon: RefreshCw,
    progress: 55,
  },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'viewed', label: 'Viewed' },
  { key: 'accepted', label: 'Won' },
  { key: 'rejected', label: 'Lost' },
  { key: 'expired', label: 'Expired' },
];

// Closed-and-lost statuses do not contribute to open pipeline value.
const PIPELINE_EXCLUDE = new Set(['rejected', 'expired']);

// ---------------------------------------------------------------------------
// Row → display shape
// ---------------------------------------------------------------------------

function fmtClientName(row) {
  if (row.contact_company) return row.contact_company;
  const fn = (row.contact_first_name || '').trim();
  const ln = (row.contact_last_name || '').trim();
  const full = [fn, ln].filter(Boolean).join(' ');
  return full || 'Unknown contact';
}

function fmtAddress(row) {
  const line1 = (row.contact_address_line1 || '').trim();
  const city = (row.contact_city || '').trim();
  const state = (row.contact_state || '').trim();
  if (line1 && city) return `${line1}, ${city}${state ? ` ${state}` : ''}`;
  return line1 || [city, state].filter(Boolean).join(', ') || 'No address on file';
}

function fmtJobType(row) {
  if (row.title) return row.title;
  const first = Array.isArray(row.line_items) ? row.line_items[0] : null;
  if (first?.description) return first.description;
  return row.estimate_number || 'Estimate';
}

function timeAgo(value) {
  if (!value) return null;
  const diffMs = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return null;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return new Date(value).toLocaleDateString();
}

function fmtMetaTop(row) {
  switch (row.status) {
    case 'accepted': {
      const t = timeAgo(row.responded_at);
      return t ? `Accepted ${t}` : 'Accepted';
    }
    case 'rejected': {
      const t = timeAgo(row.responded_at);
      return t ? `Declined ${t}` : 'Declined';
    }
    case 'sent':
    case 'viewed':
    case 'revised': {
      const t = timeAgo(row.sent_at || row.updated_at);
      return t ? `Sent ${t}` : 'Sent';
    }
    case 'expired': {
      const t = row.valid_until
        ? `Expired ${new Date(row.valid_until).toLocaleDateString()}`
        : 'Expired';
      return t;
    }
    case 'draft':
    default: {
      const t = timeAgo(row.created_at);
      return t ? `Created ${t}` : 'Created';
    }
  }
}

function fmtMetaBottom(row) {
  const parts = [];
  if (row.estimate_number) parts.push(row.estimate_number);
  const count = Array.isArray(row.line_items) ? row.line_items.length : 0;
  if (count) parts.push(`${count} line item${count === 1 ? '' : 's'}`);
  if (row.status === 'sent' && row.valid_until) {
    parts.push(`valid until ${new Date(row.valid_until).toLocaleDateString()}`);
  }
  return parts.join(' · ') || '—';
}

function normalizeProposal(row) {
  const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.draft;
  const value = Number(row.total ?? 0);
  return {
    id: row.id,
    clientName: fmtClientName(row),
    address: fmtAddress(row),
    value: Number.isFinite(value) ? value : 0,
    jobType: fmtJobType(row),
    status: row.status,
    progress: cfg.progress,
    metaTop: fmtMetaTop(row),
    metaBottom: fmtMetaBottom(row),
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProposalsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        setLoading(true);
        const res = await fetch('/api/crm/estimates?limit=200', {
          cache: 'no-store',
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const payload = await res.json();
        if (cancelled) return;
        const mapped = (payload.estimates || []).map(normalizeProposal);
        setRows(mapped);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProposals = useMemo(() => {
    let list = rows;
    if (filter !== 'all') list = list.filter((p) => p.status === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.clientName.toLowerCase().includes(q) ||
          p.jobType.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
      );
    }
    return list;
  }, [rows, filter, search]);

  const kpis = useMemo(() => {
    const open = rows.filter((p) => !PIPELINE_EXCLUDE.has(p.status));
    return {
      pipelineValue: open.reduce((sum, p) => sum + p.value, 0),
      total: rows.length,
      pending: rows.filter((p) =>
        ['draft', 'sent', 'viewed', 'revised'].includes(p.status)
      ).length,
      won: rows.filter((p) => p.status === 'accepted').length,
      lost: rows.filter((p) => p.status === 'rejected').length,
    };
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
          marginBottom: 8,
        }}
      >
        <div>
          <div
            className="t-eyebrow"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <FileText size={12} style={{ color: 'var(--primary)' }} />
            Deliverable
          </div>
          <h1
            className="t-h1"
            style={{
              margin: '6px 0 6px',
              letterSpacing: '-0.02em',
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
            borderLeft: '3px solid var(--primary)',
          }}
        >
          <div
            className="t-eyebrow"
            style={{
              color: 'var(--primary)',
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
            style={{ marginTop: 8, color: 'var(--primary)' }}
          >
            {loading ? '—' : `$${kpis.pipelineValue.toLocaleString()}`}
          </div>
        </div>

        <KpiCard
          label="Total Proposals"
          value={loading ? '—' : String(kpis.total)}
          icon={FileText}
        />
        <KpiCard
          label="Pending"
          value={loading ? '—' : String(kpis.pending)}
          icon={Clock}
        />
        <KpiCard
          label="Won"
          value={loading ? '—' : String(kpis.won)}
          icon={CheckCircle}
          valueColor="var(--primary)"
        />
        <KpiCard
          label="Lost"
          value={loading ? '—' : String(kpis.lost)}
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
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={filter === f.key ? 'filter-pill-active' : 'filter-pill'}
            >
              {f.label}
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
        {loading ? (
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
            Loading proposals…
          </div>
        ) : error ? (
          <div
            className="dark-card"
            style={{
              padding: 40,
              gridColumn: '1 / -1',
              textAlign: 'center',
              color: 'var(--negative)',
              fontSize: 13,
            }}
          >
            Failed to load proposals: {error}
          </div>
        ) : rows.length === 0 ? (
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
            No proposals yet. Click <strong>Create Proposal</strong> to send
            your first one — it will show up here with live view tracking.
          </div>
        ) : filteredProposals.length === 0 ? (
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
        ) : (
          filteredProposals.map((p) => <ProposalCard key={p.id} proposal={p} />)
        )}
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
  const s = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.draft;

  // Lost + Expired get a colored left accent border so they pop at a glance.
  const accent =
    proposal.status === 'rejected'
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
            color: 'var(--primary)',
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
