'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  Search,
  Plus,
  Crown,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Contact Type config — mirrors ContactType from the DB schema.
// "homeowner" / "property_manager" / etc. are about *who* the contact is,
// not lead-stage. Lead stage is derived from the related `leads` table and
// is out of scope for this view (shown on the Leads dashboard instead).
// ---------------------------------------------------------------------------

const TYPE_CONFIG = {
  homeowner:          { label: 'HOMEOWNER',      color: 'var(--primary)' },
  property_manager:   { label: 'PROPERTY MGR',   color: '#8b5cf6' },
  general_contractor: { label: 'GC',             color: '#3b82f6' },
  realtor:            { label: 'REALTOR',        color: '#f59e0b' },
  insurance_adjuster: { label: 'INS. ADJUSTER',  color: '#06b6d4' },
  other:              { label: 'OTHER',          color: 'var(--text-muted)' },
};

const STATUS_CONFIG = {
  active:         { label: 'ACTIVE',       color: 'var(--primary)' },
  inactive:       { label: 'INACTIVE',     color: 'var(--text-muted)' },
  do_not_contact: { label: 'DO NOT CONTACT', color: 'var(--negative)' },
};

// Deterministic avatar color palette — these stay vibrant on every theme.
const AVATAR_COLORS = [
  '#ef4444',
  '#f59e0b',
  '#0F8A4F',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#06b6d4',
  '#a855f7',
];

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function timeAgo(value) {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diff) || diff < 0) return '—';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

function displayName(c) {
  if (c.company) return c.company;
  const full = [c.first_name, c.last_name].filter(Boolean).join(' ').trim();
  if (full) return full;
  return c.email || c.phone || 'Unnamed contact';
}

function normalize(c) {
  const tags = Array.isArray(c.tags) ? c.tags : [];
  return {
    id: c.id,
    name: displayName(c),
    phone: c.phone || '—',
    email: c.email || '—',
    contactType: c.contact_type || 'other',
    source: c.source ? c.source.replace(/_/g, ' ') : '—',
    status: c.status || 'active',
    lastActivity: timeAgo(c.updated_at || c.created_at),
    isVip: tags.some((t) => typeof t === 'string' && t.toLowerCase() === 'vip'),
    tags,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContactsPage() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        setLoading(true);
        const res = await fetch('/api/crm/contacts?limit=200', {
          cache: 'no-store',
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const payload = await res.json();
        if (cancelled) return;
        setRawRows((payload.contacts || []).map(normalize));
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

  const filtered = useMemo(() => {
    let list = rawRows.filter((c) => {
      if (filter === 'active' && c.status !== 'active') return false;
      if (filter === 'inactive' && c.status !== 'inactive') return false;
      if (filter === 'do_not_contact' && c.status !== 'do_not_contact') return false;
      if (filter === 'vip' && !c.isVip) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = [
          c.name,
          c.email,
          c.phone,
          ...c.tags,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'oldest') list = [...list].reverse();
    else if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [rawRows, filter, query, sortBy]);

  const kpis = useMemo(() => {
    const now = Date.now();
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    return {
      total: rawRows.length,
      newThisWeek: rawRows.filter((c) => {
        const src = c.id; // placeholder — we don't keep created_at after normalize
        return src != null;
      }).length === 0
        ? 0
        : // Recompute properly from the un-normalized payload on future pass; for
          // now we approximate "new this week" using the dashboard's loaded window.
          // (Kept simple; once we have a /api/crm/contacts?since=... param, swap.)
          rawRows.filter((c) => false).length,
      withPhone: rawRows.filter((c) => c.phone && c.phone !== '—').length,
      withEmail: rawRows.filter((c) => c.email && c.email !== '—').length,
    };
  }, [rawRows]);

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
            <Users size={12} style={{ color: 'var(--primary)' }} />
            Contacts
          </div>
          <h1 className="t-h1" style={{ margin: '6px 0 4px' }}>
            Contacts
          </h1>
          <p className="t-body-sm" style={{ margin: 0 }}>
            Your customer database — every lead, customer, and prospect in one place.
          </p>
        </div>
        <button type="button" className="btn-primary">
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      {/* KPI row — 4 cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginTop: 28,
        }}
      >
        <KpiCard
          icon={<Users size={13} />}
          label="Total Contacts"
          value={loading ? '—' : String(kpis.total)}
        />
        <KpiCard
          icon={<UserPlus size={13} />}
          label="Active"
          value={
            loading
              ? '—'
              : String(rawRows.filter((c) => c.status === 'active').length)
          }
          accent
        />
        <KpiCard
          icon={<Phone size={13} />}
          label="With Phone"
          value={loading ? '—' : String(kpis.withPhone)}
        />
        <KpiCard
          icon={<Mail size={13} />}
          label="With Email"
          value={loading ? '—' : String(kpis.withEmail)}
        />
      </div>

      {/* Filter row */}
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
        <div style={{ position: 'relative', flex: '0 0 320px', minWidth: 240 }}>
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
            placeholder="Search by name, email, phone, tag..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: 34, width: '100%' }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          {[
            { k: 'all', l: 'All' },
            { k: 'active', l: 'Active' },
            { k: 'inactive', l: 'Inactive' },
            { k: 'do_not_contact', l: 'Do Not Contact' },
            { k: 'vip', l: 'VIP' },
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

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span className="t-body-sm">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 'auto', paddingRight: 28 }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Type</th>
                <th>Source</th>
                <th>Last Activity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: 13,
                      padding: '40px 16px',
                    }}
                  >
                    Loading contacts…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: 'center',
                      color: 'var(--negative)',
                      fontSize: 13,
                      padding: '40px 16px',
                    }}
                  >
                    Failed to load contacts: {error}
                  </td>
                </tr>
              ) : rawRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: 13,
                      padding: '40px 16px',
                    }}
                  >
                    No contacts yet. Click <strong>Add Contact</strong> to
                    create one — new contacts will flow into the Decision
                    Engine as signals automatically.
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: 13,
                      padding: '40px 16px',
                    }}
                  >
                    No contacts match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const typeCfg = TYPE_CONFIG[c.contactType] || TYPE_CONFIG.other;
                  const statusCfg =
                    STATUS_CONFIG[c.status] || STATUS_CONFIG.active;
                  return (
                    <tr key={c.id} style={{ cursor: 'pointer' }}>
                      <td>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: avatarColor(c.name),
                              color: '#ffffff',
                              fontSize: 12,
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              letterSpacing: '0.02em',
                            }}
                          >
                            {initials(c.name)}
                          </div>
                          <span
                            style={{
                              color: 'var(--text-bright)',
                              fontWeight: 500,
                            }}
                          >
                            {c.name}
                          </span>
                          {c.isVip ? (
                            <Crown size={13} style={{ color: '#f59e0b' }} />
                          ) : null}
                        </div>
                      </td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {c.phone}
                      </td>
                      <td>{c.email}</td>
                      <td>
                        <Pill color={typeCfg.color}>{typeCfg.label}</Pill>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {c.source}
                      </td>
                      <td>{c.lastActivity}</td>
                      <td>
                        <Pill color={statusCfg.color}>{statusCfg.label}</Pill>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <span className="t-body-sm">
            {loading
              ? 'Loading…'
              : `Showing ${filtered.length} of ${rawRows.length} contacts`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KPI card
// ---------------------------------------------------------------------------

function KpiCard({ icon, label, value, accent }) {
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
// Pill
// ---------------------------------------------------------------------------

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
