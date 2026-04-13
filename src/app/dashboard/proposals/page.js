'use client';

import { useMemo, useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  AlertCircle,
  FileEdit,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const STATS = [
  { id: 'total', label: 'Total Proposals', value: '34', icon: FileText },
  { id: 'pending', label: 'Pending', value: '12', icon: Clock },
  { id: 'won', label: 'Won', value: '15', icon: CheckCircle2 },
  { id: 'lost', label: 'Lost', value: '7', icon: XCircle },
];

const FILTERS = ['All', 'Draft', 'Sent', 'Viewed', 'Won', 'Lost', 'Expired'];

const PROPOSALS = [
  {
    id: 1,
    customer: 'Thompson Residence',
    address: '1847 Oak Grove Dr',
    service: 'Full Roof Replacement',
    amount: 18400,
    amountLabel: '$18,400',
    status: 'Won',
    sentDate: 'Signed 2 days ago',
    activity: 'Contract signed, job scheduled for next week',
    progress: 100,
  },
  {
    id: 2,
    customer: 'Patel Home',
    address: '2412 Birchwood Ln',
    service: 'HVAC System Install',
    amount: 12800,
    amountLabel: '$12,800',
    status: 'Sent',
    sentDate: 'Sent 3 days ago',
    activity: 'Viewed 2x — awaiting response',
    progress: 50,
  },
  {
    id: 3,
    customer: 'Williams Property',
    address: '8901 Sunset Blvd',
    service: 'Solar Panel Array (24 panels)',
    amount: 34200,
    amountLabel: '$34,200',
    status: 'Viewed',
    sentDate: 'Sent 1 week ago',
    activity: 'Viewed 5x — high engagement, follow up',
    progress: 70,
  },
  {
    id: 4,
    customer: 'Chen Residence',
    address: '5523 Maple Ave',
    service: 'Kitchen Remodel',
    amount: 28500,
    amountLabel: '$28,500',
    status: 'Draft',
    sentDate: 'Created today',
    activity: 'Awaiting final line items before send',
    progress: 20,
  },
  {
    id: 5,
    customer: 'Rodriguez Home',
    address: '314 Cedar Park Rd',
    service: 'Roof Repair + Gutters',
    amount: 6200,
    amountLabel: '$6,200',
    status: 'Won',
    sentDate: 'Signed yesterday',
    activity: 'Deposit received, starting Monday',
    progress: 100,
  },
  {
    id: 6,
    customer: 'Davis Property',
    address: '6677 Pinecrest Way',
    service: 'Complete Exterior',
    amount: 22100,
    amountLabel: '$22,100',
    status: 'Sent',
    sentDate: 'Sent 5 days ago',
    activity: 'No activity yet — ping scheduled for tomorrow',
    progress: 50,
  },
  {
    id: 7,
    customer: 'Anderson Residence',
    address: '1204 Elm Street',
    service: 'HVAC Maintenance Contract',
    amount: 4800,
    amountLabel: '$4,800/yr',
    status: 'Lost',
    sentDate: 'Declined 3 days ago',
    activity: 'Went with cheaper competitor — save objection data',
    progress: 100,
  },
  {
    id: 8,
    customer: 'Miller Home',
    address: '7890 Willow Creek',
    service: 'Storm Damage Roof',
    amount: 15600,
    amountLabel: '$15,600',
    status: 'Expired',
    sentDate: 'Sent 30 days ago',
    activity: 'No response — dead lead reactivation queued',
    progress: 30,
  },
];

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS = {
  Draft: {
    icon: FileEdit,
    border: 'border-l-zinc-500',
    badge: 'bg-zinc-700/50 text-zinc-300 ring-zinc-600',
    iconBg: 'bg-zinc-700/50',
    iconColor: 'text-zinc-300',
    bar: 'bg-zinc-500',
    bucket: 'Draft',
  },
  Sent: {
    icon: Send,
    border: 'border-l-sky-500',
    badge: 'bg-sky-500/15 text-sky-400 ring-sky-500/30',
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    bar: 'bg-sky-500',
    bucket: 'Sent',
  },
  Viewed: {
    icon: Eye,
    border: 'border-l-indigo-500',
    badge: 'bg-indigo-500/15 text-indigo-400 ring-indigo-500/30',
    iconBg: 'bg-indigo-500/15',
    iconColor: 'text-indigo-400',
    bar: 'bg-indigo-500',
    bucket: 'Viewed',
  },
  Won: {
    icon: CheckCircle2,
    border: 'border-l-emerald-500',
    badge: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    bar: 'bg-emerald-500',
    bucket: 'Won',
  },
  Lost: {
    icon: XCircle,
    border: 'border-l-red-500',
    badge: 'bg-red-500/15 text-red-400 ring-red-500/30',
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    bar: 'bg-red-500',
    bucket: 'Lost',
  },
  Expired: {
    icon: AlertCircle,
    border: 'border-l-amber-500',
    badge: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    bar: 'bg-amber-500',
    bucket: 'Sent',
  },
};

const PIPELINE_STEPS = [
  { label: 'Draft', buckets: ['Draft'], color: 'bg-zinc-500' },
  { label: 'Sent', buckets: ['Sent', 'Expired'], color: 'bg-sky-500' },
  { label: 'Viewed', buckets: ['Viewed'], color: 'bg-indigo-500' },
  { label: 'Won', buckets: ['Won'], color: 'bg-emerald-500' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProposalsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  const totalPipeline = useMemo(
    () =>
      PROPOSALS.filter((p) => !['Lost', 'Expired'].includes(p.status)).reduce(
        (sum, p) => sum + p.amount,
        0
      ),
    []
  );

  const filtered = useMemo(() => {
    let list = PROPOSALS;
    if (activeFilter !== 'All') {
      list = list.filter((p) => p.status === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.customer.toLowerCase().includes(q) ||
          p.service.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeFilter, search]);

  // Pipeline totals per bucket
  const pipelineTotals = useMemo(() => {
    const totals = { Draft: 0, Sent: 0, Viewed: 0, Won: 0, Lost: 0 };
    for (const p of PROPOSALS) {
      if (p.status === 'Lost') totals.Lost += p.amount;
      else if (p.status === 'Expired') totals.Sent += p.amount;
      else if (totals[p.status] !== undefined) totals[p.status] += p.amount;
    }
    return totals;
  }, []);

  return (
    <div className="min-h-full -mx-11 -my-10 bg-zinc-950 px-6 py-10 sm:px-10 text-zinc-100">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/30">
                <FileText size={20} className="text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Proposals
              </h1>
            </div>
            <p className="text-sm text-zinc-400 sm:text-base">
              Track every quote, bid, and proposal from sent to signed
            </p>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
          >
            <Plus size={16} />
            Create Proposal
          </button>
        </header>

        {/* Stats + total pipeline */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
          <div className="col-span-1 flex items-center gap-4 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-5 ring-1 ring-inset ring-emerald-500/20 lg:col-span-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-inset ring-emerald-500/40">
              <DollarSign size={22} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                <TrendingUp size={11} /> Total Pipeline Value
              </div>
              <div className="text-3xl font-bold text-white tabular-nums">
                ${totalPipeline.toLocaleString()}
              </div>
            </div>
          </div>
          {STATS.map((s) => (
            <StatCard key={s.id} stat={s} />
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-center sm:justify-between">
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
              placeholder="Search proposals..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        {/* Proposal list */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((p) => (
            <ProposalCard key={p.id} proposal={p} />
          ))}
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center text-sm text-zinc-500">
              No proposals match your filter.
            </div>
          ) : null}
        </div>

        {/* Pipeline summary bar */}
        <PipelineSummary totals={pipelineTotals} />
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

function ProposalCard({ proposal }) {
  const s = STATUS[proposal.status];
  const Icon = s.icon;

  return (
    <div
      className={`group cursor-pointer rounded-xl border border-zinc-800 border-l-4 ${s.border} bg-zinc-900 p-5 transition hover:border-zinc-700`}
    >
      {/* Top: customer + amount */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-white">
            {proposal.customer}
          </h3>
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            {proposal.address}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-2xl font-bold tracking-tight text-white tabular-nums">
            {proposal.amountLabel}
          </div>
        </div>
      </div>

      {/* Service + status */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${s.iconBg}`}
          >
            <Icon size={14} className={s.iconColor} />
          </div>
          <span className="truncate text-sm text-zinc-300">
            {proposal.service}
          </span>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${s.badge}`}
        >
          {proposal.status}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full ${s.bar} transition-all`}
          style={{ width: `${proposal.progress}%` }}
        />
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span className="text-zinc-500">{proposal.sentDate}</span>
      </div>
      <p className="mt-2 text-xs italic text-zinc-400">{proposal.activity}</p>
    </div>
  );
}

function PipelineSummary({ totals }) {
  const fmt = (n) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toLocaleString()}`;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Pipeline Summary
        </h3>
        <span className="text-[11px] text-zinc-500">Amount by stage</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 sm:flex-nowrap">
        {PIPELINE_STEPS.map((step, i) => {
          const val = step.buckets.reduce((s, b) => s + (totals[b] || 0), 0);
          return (
            <div key={step.label} className="flex items-center gap-2">
              <div className="flex min-w-[110px] flex-col rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  <span className={`h-1.5 w-1.5 rounded-full ${step.color}`} />
                  {step.label}
                </span>
                <span className="mt-0.5 text-sm font-bold text-white tabular-nums">
                  {fmt(val)}
                </span>
              </div>
              {i < PIPELINE_STEPS.length - 1 ? (
                <span className="text-zinc-600">→</span>
              ) : null}
            </div>
          );
        })}

        {/* Lost separator */}
        <div className="mx-3 hidden h-10 w-px bg-zinc-800 sm:block" />
        <div className="flex items-center gap-2">
          <div className="flex min-w-[110px] flex-col rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Lost
            </span>
            <span className="mt-0.5 text-sm font-bold text-white tabular-nums">
              {fmt(totals.Lost)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
