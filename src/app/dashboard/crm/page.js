'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Target,
  FileText,
  Briefcase,
  Plus,
  ArrowUpRight,
  Phone,
  Mail,
  MessageSquare,
  StickyNote,
  CalendarCheck,
  Home as HomeIcon,
  Sparkles,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/Button';

const PENDING_ESTIMATE_STATUSES = new Set(['draft', 'sent', 'viewed']);
const ACTIVE_JOB_STATUSES = new Set([
  'scheduled',
  'materials_ordered',
  'in_progress',
  'on_hold',
]);

const FUNNEL_STAGES = [
  { label: 'New', statuses: ['new'], color: '#6366f1' },
  { label: 'Qualified', statuses: ['contacted', 'appointment_set', 'inspected'], color: '#8b5cf6' },
  { label: 'Proposal', statuses: ['quoted'], color: '#06b6d4' },
  { label: 'Negotiation', statuses: ['negotiating'], color: '#f59e0b' },
  { label: 'Won', statuses: ['won'], color: '#10b981' },
];

const INTERACTION_ICONS = {
  call: Phone,
  email: Mail,
  sms: MessageSquare,
  note: StickyNote,
  meeting: CalendarCheck,
  site_visit: HomeIcon,
  voicemail: Phone,
  follow_up: Sparkles,
};

function formatCurrency(n) {
  if (!n && n !== 0) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function SummaryCard({ icon: Icon, label, value, hint, accent = 'emerald', delay = 0 }) {
  const accentMap = {
    emerald: {
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.25)',
      color: 'var(--emerald-bright)',
    },
    indigo: {
      bg: 'rgba(99,102,241,0.08)',
      border: 'rgba(99,102,241,0.25)',
      color: '#818cf8',
    },
    amber: {
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.25)',
      color: '#fbbf24',
    },
    rose: {
      bg: 'rgba(244,63,94,0.08)',
      border: 'rgba(244,63,94,0.25)',
      color: '#fb7185',
    },
  };
  const a = accentMap[accent] ?? accentMap.emerald;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-2xl border p-5"
      style={{
        background: 'var(--surface-1)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            {label}
          </div>
          <div className="mt-2 text-3xl font-semibold text-[var(--text-bright)] tabular-nums">
            {value}
          </div>
          {hint ? (
            <div className="mt-1 text-xs text-[var(--text-subtle)]">{hint}</div>
          ) : null}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl border"
          style={{ background: a.bg, borderColor: a.border, color: a.color }}
        >
          <Icon size={18} />
        </div>
      </div>
    </motion.div>
  );
}

export default function CrmOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [pRes, cRes, eRes, jRes, iRes] = await Promise.all([
          fetch('/api/crm/pipeline'),
          fetch('/api/crm/contacts?limit=200'),
          fetch('/api/crm/estimates?limit=200'),
          fetch('/api/crm/jobs?limit=200'),
          fetch('/api/crm/interactions?limit=10'),
        ]);
        const [p, c, e, j, i] = await Promise.all([
          pRes.ok ? pRes.json() : {},
          cRes.ok ? cRes.json() : { contacts: [] },
          eRes.ok ? eRes.json() : { estimates: [] },
          jRes.ok ? jRes.json() : { jobs: [] },
          iRes.ok ? iRes.json() : { interactions: [] },
        ]);
        if (cancelled) return;
        setPipeline(p);
        setContacts(c.contacts ?? []);
        setEstimates(e.estimates ?? []);
        setJobs(j.jobs ?? []);
        setInteractions(i.interactions ?? []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load CRM data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalContacts = contacts.length;
  const pendingEstimates = estimates.filter((e) =>
    PENDING_ESTIMATE_STATUSES.has(e.status)
  ).length;
  const activeJobs = jobs.filter((j) => ACTIVE_JOB_STATUSES.has(j.status)).length;
  const openLeads = pipeline?.totals?.open_leads ?? 0;
  const pipelineValue = pipeline?.totals?.pipeline_value ?? 0;
  const overdueCount = pipeline?.totals?.overdue_count ?? 0;

  // Build funnel data from pipeline.rows, which have shape
  // { service_type, status, lead_count, pipeline_value }
  const statusCounts = {};
  (pipeline?.pipeline ?? []).forEach((row) => {
    statusCounts[row.status] =
      (statusCounts[row.status] ?? 0) + Number(row.lead_count ?? 0);
  });
  const funnelData = FUNNEL_STAGES.map((stage) => ({
    name: stage.label,
    count: stage.statuses.reduce((sum, s) => sum + (statusCounts[s] ?? 0), 0),
    color: stage.color,
  }));

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-muted)]">
          Couldn&apos;t load CRM data: {error}
        </div>
      ) : null}

      {/* Quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-bright)]">
            Pipeline at a glance
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Live snapshot of your book of business.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/crm/contacts">
            <Button size="sm" variant="outline">
              <Plus size={14} />
              Add Contact
            </Button>
          </Link>
          <Link href="/dashboard/crm/leads">
            <Button size="sm" variant="outline">
              <Plus size={14} />
              New Lead
            </Button>
          </Link>
          <Link href="/dashboard/crm/leads">
            <Button size="sm">
              <Plus size={14} />
              Create Estimate
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Users}
          label="Total Contacts"
          value={loading ? '…' : totalContacts.toLocaleString()}
          hint={totalContacts >= 200 ? 'showing 200+' : undefined}
          accent="indigo"
          delay={0}
        />
        <SummaryCard
          icon={Target}
          label="Active Leads"
          value={loading ? '…' : openLeads.toLocaleString()}
          hint={`${formatCurrency(pipelineValue)} weighted`}
          accent="emerald"
          delay={0.05}
        />
        <SummaryCard
          icon={FileText}
          label="Pending Estimates"
          value={loading ? '…' : pendingEstimates.toLocaleString()}
          hint="draft · sent · viewed"
          accent="amber"
          delay={0.1}
        />
        <SummaryCard
          icon={Briefcase}
          label="Active Jobs"
          value={loading ? '…' : activeJobs.toLocaleString()}
          hint="scheduled → in progress"
          accent="emerald"
          delay={0.15}
        />
      </div>

      {/* Overdue banner */}
      {overdueCount > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-400" size={18} />
            <div>
              <div className="text-sm font-semibold text-[var(--text-bright)]">
                {overdueCount} overdue follow-up{overdueCount === 1 ? '' : 's'}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Leads whose follow-up date has passed.
              </div>
            </div>
          </div>
          <Link
            href="/dashboard/crm/leads?overdue_only=true"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            Review leads <ArrowUpRight size={12} />
          </Link>
        </motion.div>
      ) : null}

      {/* Funnel + Activity grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Funnel chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl border p-6"
          style={{
            background: 'var(--surface-1)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[var(--emerald-bright)]" />
                <h3 className="font-semibold text-[var(--text-bright)]">
                  Pipeline funnel
                </h3>
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Leads by stage, new → won.
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="var(--text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    color: 'var(--text-bright)',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {funnelData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="rounded-2xl border p-6"
          style={{
            background: 'var(--surface-1)',
            borderColor: 'var(--border)',
          }}
        >
          <h3 className="mb-4 font-semibold text-[var(--text-bright)]">
            Recent activity
          </h3>
          {loading ? (
            <div className="text-sm text-[var(--text-muted)]">Loading…</div>
          ) : interactions.length === 0 ? (
            <div className="text-sm text-[var(--text-muted)]">
              No interactions yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {interactions.map((it) => {
                const Icon = INTERACTION_ICONS[it.interaction_type] ?? StickyNote;
                return (
                  <li key={it.id} className="flex gap-3">
                    <div
                      className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg border text-[var(--emerald-bright)]"
                      style={{
                        background: 'rgba(16,185,129,0.08)',
                        borderColor: 'rgba(16,185,129,0.2)',
                      }}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-bright)]">
                        <span className="font-medium capitalize">
                          {it.interaction_type?.replace('_', ' ')}
                        </span>
                        {it.direction ? (
                          <span className="text-xs text-[var(--text-subtle)]">
                            · {it.direction}
                          </span>
                        ) : null}
                      </div>
                      <div className="truncate text-xs text-[var(--text-muted)]">
                        {it.subject || it.outcome || it.summary || '—'}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--text-subtle)]">
                        {timeAgo(it.occurred_at)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
}
