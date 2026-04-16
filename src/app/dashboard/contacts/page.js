'use client';

import { useMemo, useState } from 'react';
import {
  Users,
  UserPlus,
  TrendingUp,
  UserCheck,
  Search,
  Plus,
  Crown,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Type + status color config — theme-aware. The hex values are semantic
// indicator colors that read well on both light and dark surfaces when
// rendered via color-mix at 14% opacity inside <Pill>.
// ---------------------------------------------------------------------------

const TYPE_CONFIG = {
  lead: { label: 'LEAD', color: 'var(--primary)' },
  customer: { label: 'CUSTOMER', color: '#8b5cf6' },
  past_customer: { label: 'PAST CUSTOMER', color: 'var(--text-muted)' },
  vip: { label: 'VIP', color: '#f59e0b' },
};

const STATUS_CONFIG = {
  active: { label: 'ACTIVE', color: 'var(--primary)' },
  won: { label: 'WON', color: 'var(--primary)' },
  nurturing: { label: 'NURTURING', color: '#3b82f6' },
  cold: { label: 'COLD', color: 'var(--text-muted)' },
  lost: { label: 'LOST', color: 'var(--negative)' },
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
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const MOCK_CONTACTS = [
  {
    id: 1,
    name: 'Marcus Miller',
    phone: '(555) 234-5678',
    email: 'marcus@email.com',
    type: 'lead',
    source: 'Google Ads',
    lastActivity: '2h ago',
    status: 'active',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    phone: '(555) 345-6789',
    email: 'sarah.chen@email.com',
    type: 'customer',
    source: 'Referral',
    lastActivity: 'Yesterday',
    status: 'won',
  },
  {
    id: 3,
    name: 'James Rodriguez',
    phone: '(555) 456-7890',
    email: 'james.r@email.com',
    type: 'lead',
    source: 'Facebook',
    lastActivity: '3h ago',
    status: 'nurturing',
  },
  {
    id: 4,
    name: 'Patricia Williams',
    phone: '(555) 567-8901',
    email: 'p.williams@email.com',
    type: 'vip',
    source: 'Inbound Call',
    lastActivity: '1 day ago',
    status: 'active',
    isVip: true,
  },
  {
    id: 5,
    name: 'Robert Thompson',
    phone: '(555) 678-9012',
    email: 'rob.t@email.com',
    type: 'customer',
    source: 'Website Form',
    lastActivity: '3 days ago',
    status: 'won',
  },
  {
    id: 6,
    name: 'Jennifer Davis',
    phone: '(555) 789-0123',
    email: 'jen.davis@email.com',
    type: 'lead',
    source: 'Google Ads',
    lastActivity: '5h ago',
    status: 'active',
  },
  {
    id: 7,
    name: 'Michael Brown',
    phone: '(555) 890-1234',
    email: 'm.brown@email.com',
    type: 'past_customer',
    source: 'Referral',
    lastActivity: '2 weeks ago',
    status: 'cold',
  },
  {
    id: 8,
    name: 'Lisa Anderson',
    phone: '(555) 901-2345',
    email: 'lisa.a@email.com',
    type: 'lead',
    source: 'Facebook',
    lastActivity: '1h ago',
    status: 'nurturing',
  },
  {
    id: 9,
    name: 'David Wilson',
    phone: '(555) 012-3456',
    email: 'd.wilson@email.com',
    type: 'customer',
    source: 'Google Ads',
    lastActivity: 'Yesterday',
    status: 'won',
  },
  {
    id: 10,
    name: 'Amy Martinez',
    phone: '(555) 123-4567',
    email: 'amy.m@email.com',
    type: 'lead',
    source: 'Website Form',
    lastActivity: '4 days ago',
    status: 'lost',
  },
  {
    id: 11,
    name: 'Kevin Lee',
    phone: '(555) 234-5679',
    email: 'kevin.lee@email.com',
    type: 'vip',
    source: 'Inbound Call',
    lastActivity: 'Today',
    status: 'active',
    isVip: true,
  },
  {
    id: 12,
    name: 'Rachel Green',
    phone: '(555) 345-6780',
    email: 'rachel.g@email.com',
    type: 'lead',
    source: 'Referral',
    lastActivity: '6h ago',
    status: 'nurturing',
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContactsPage() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filtered = useMemo(() => {
    let list = MOCK_CONTACTS.filter((c) => {
      if (filter === 'leads' && c.type !== 'lead') return false;
      if (filter === 'customers' && c.type !== 'customer') return false;
      if (filter === 'past' && c.type !== 'past_customer') return false;
      if (filter === 'vip' && c.type !== 'vip') return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !(
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.phone.includes(query)
          )
        ) {
          return false;
        }
      }
      return true;
    });

    if (sortBy === 'oldest') list = [...list].reverse();
    else if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [filter, query, sortBy]);

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
        <KpiCard icon={<Users size={13} />} label="Total Contacts" value="247" />
        <KpiCard
          icon={<UserPlus size={13} />}
          label="New This Week"
          value="18"
          accent
        />
        <KpiCard icon={<UserCheck size={13} />} label="Customers" value="89" />
        <KpiCard icon={<TrendingUp size={13} />} label="Leads" value="158" />
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
            placeholder="Search by name, email, phone..."
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
            { k: 'leads', l: 'Leads' },
            { k: 'customers', l: 'Customers' },
            { k: 'past', l: 'Past Customers' },
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
              {filtered.map((c) => (
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
                    <Pill color={TYPE_CONFIG[c.type].color}>
                      {TYPE_CONFIG[c.type].label}
                    </Pill>
                  </td>
                  <td>{c.source}</td>
                  <td>{c.lastActivity}</td>
                  <td>
                    <Pill color={STATUS_CONFIG[c.status].color}>
                      {STATUS_CONFIG[c.status].label}
                    </Pill>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
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
              ) : null}
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
            Showing {filtered.length} of {MOCK_CONTACTS.length} contacts
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
