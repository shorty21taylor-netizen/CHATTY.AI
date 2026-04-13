'use client';

import { useMemo, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  ChevronDown,
  UserPlus,
  UserCheck,
  Crown,
  TrendingUp,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const STATS = [
  { id: 'total', label: 'Total Contacts', value: '247', icon: Users },
  { id: 'new', label: 'New This Week', value: '18', icon: UserPlus },
  { id: 'customers', label: 'Customers', value: '89', icon: UserCheck },
  { id: 'leads', label: 'Leads', value: '158', icon: TrendingUp },
];

const FILTERS = ['All', 'Leads', 'Customers', 'Past Customers', 'VIP'];
const SORTS = ['Newest', 'Oldest', 'Name A-Z', 'Last Activity'];

const CONTACTS = [
  {
    id: 1,
    name: 'Marcus Miller',
    phone: '(555) 234-5678',
    email: 'marcus@email.com',
    type: 'Lead',
    source: 'Google Ads',
    activity: '2h ago',
    status: 'Active',
    avatarColor: 'bg-emerald-500',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    phone: '(555) 345-6789',
    email: 'sarah.chen@email.com',
    type: 'Customer',
    source: 'Referral',
    activity: 'Yesterday',
    status: 'Won',
    avatarColor: 'bg-indigo-500',
  },
  {
    id: 3,
    name: 'James Rodriguez',
    phone: '(555) 456-7890',
    email: 'james.r@email.com',
    type: 'Lead',
    source: 'Facebook',
    activity: '3h ago',
    status: 'Nurturing',
    avatarColor: 'bg-amber-500',
  },
  {
    id: 4,
    name: 'Patricia Williams',
    phone: '(555) 567-8901',
    email: 'p.williams@email.com',
    type: 'VIP',
    source: 'Inbound Call',
    activity: '1 day ago',
    status: 'Active',
    avatarColor: 'bg-pink-500',
  },
  {
    id: 5,
    name: 'Robert Thompson',
    phone: '(555) 678-9012',
    email: 'rob.t@email.com',
    type: 'Customer',
    source: 'Website Form',
    activity: '3 days ago',
    status: 'Won',
    avatarColor: 'bg-cyan-500',
  },
  {
    id: 6,
    name: 'Jennifer Davis',
    phone: '(555) 789-0123',
    email: 'jen.davis@email.com',
    type: 'Lead',
    source: 'Google Ads',
    activity: '5h ago',
    status: 'Active',
    avatarColor: 'bg-violet-500',
  },
  {
    id: 7,
    name: 'Michael Brown',
    phone: '(555) 890-1234',
    email: 'm.brown@email.com',
    type: 'Past Customer',
    source: 'Referral',
    activity: '2 weeks ago',
    status: 'Cold',
    avatarColor: 'bg-zinc-500',
  },
  {
    id: 8,
    name: 'Lisa Anderson',
    phone: '(555) 901-2345',
    email: 'lisa.a@email.com',
    type: 'Lead',
    source: 'Facebook',
    activity: '1h ago',
    status: 'Nurturing',
    avatarColor: 'bg-rose-500',
  },
  {
    id: 9,
    name: 'David Wilson',
    phone: '(555) 012-3456',
    email: 'd.wilson@email.com',
    type: 'Customer',
    source: 'Google Ads',
    activity: 'Yesterday',
    status: 'Won',
    avatarColor: 'bg-teal-500',
  },
  {
    id: 10,
    name: 'Amy Martinez',
    phone: '(555) 123-4567',
    email: 'amy.m@email.com',
    type: 'Lead',
    source: 'Website Form',
    activity: '4 days ago',
    status: 'Lost',
    avatarColor: 'bg-orange-500',
  },
  {
    id: 11,
    name: 'Kevin Lee',
    phone: '(555) 234-5679',
    email: 'kevin.lee@email.com',
    type: 'VIP',
    source: 'Inbound Call',
    activity: 'Today',
    status: 'Active',
    avatarColor: 'bg-fuchsia-500',
  },
  {
    id: 12,
    name: 'Rachel Green',
    phone: '(555) 345-6780',
    email: 'rachel.g@email.com',
    type: 'Lead',
    source: 'Referral',
    activity: '6h ago',
    status: 'Nurturing',
    avatarColor: 'bg-lime-500',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_BADGE = {
  Lead: 'bg-indigo-500/15 text-indigo-400 ring-indigo-500/30',
  Customer: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  'Past Customer': 'bg-zinc-700/50 text-zinc-300 ring-zinc-600',
  VIP: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
};

const STATUS_BADGE = {
  Active: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  Nurturing: 'bg-yellow-500/15 text-yellow-400 ring-yellow-500/30',
  Won: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  Lost: 'bg-red-500/15 text-red-400 ring-red-500/30',
  Cold: 'bg-zinc-700/50 text-zinc-400 ring-zinc-600',
};

function initials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContactsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Newest');

  const filtered = useMemo(() => {
    let list = CONTACTS;
    if (activeFilter !== 'All') {
      if (activeFilter === 'VIP') list = list.filter((c) => c.type === 'VIP');
      else if (activeFilter === 'Leads')
        list = list.filter((c) => c.type === 'Lead');
      else if (activeFilter === 'Customers')
        list = list.filter((c) => c.type === 'Customer');
      else if (activeFilter === 'Past Customers')
        list = list.filter((c) => c.type === 'Past Customer');
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }
    return list;
  }, [activeFilter, search]);

  return (
    <div className="min-h-full -mx-11 -my-10 bg-zinc-950 px-6 py-10 sm:px-10 text-zinc-100">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/30">
                <Users size={20} className="text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Contacts
              </h1>
            </div>
            <p className="text-sm text-zinc-400 sm:text-base">
              Your customer database — every lead, customer, and prospect in one place
            </p>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
          >
            <Plus size={16} />
            Add Contact
          </button>
        </header>

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <StatCard key={s.id} stat={s} />
          ))}
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  activeFilter === f
                    ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400 ring-1 ring-inset ring-zinc-700 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Sort */}
          <SortDropdown value={sort} onChange={setSort} />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Last Activity</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer border-b border-zinc-800/60 transition last:border-0 hover:bg-zinc-800/50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${c.avatarColor}`}
                        >
                          {initials(c.name)}
                        </span>
                        <span className="font-medium text-white">{c.name}</span>
                        {c.type === 'VIP' ? (
                          <Crown size={12} className="text-amber-400" />
                        ) : null}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-zinc-300 tabular-nums">
                      {c.phone}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-zinc-400">
                      {c.email}
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={TYPE_BADGE[c.type]}>{c.type}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-zinc-400">
                      {c.source}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-zinc-400">
                      {c.activity}
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={STATUS_BADGE[c.status]}>{c.status}</Badge>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-sm text-zinc-500"
                    >
                      No contacts match your filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3 text-xs text-zinc-500">
            <span>
              Showing{' '}
              <span className="font-semibold text-zinc-300">
                {filtered.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-zinc-300">
                {CONTACTS.length}
              </span>{' '}
              contacts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function StatCard({ stat }) {
  const Icon = stat.icon;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/30">
        <Icon size={18} className="text-emerald-400" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          {stat.label}
        </div>
        <div className="text-xl font-bold text-white tabular-nums">
          {stat.value}
        </div>
      </div>
    </div>
  );
}

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white"
      >
        Sort: <span className="text-white">{value}</span>
        <ChevronDown size={14} className={open ? 'rotate-180 transition' : 'transition'} />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl">
          {SORTS.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(s);
                setOpen(false);
              }}
              className={`flex w-full items-center px-3 py-2 text-left text-xs transition ${
                value === s
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Badge({ children, className }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  );
}
