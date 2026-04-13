'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Calendar,
  User,
  ClipboardList,
  Loader2,
  ArrowRight,
  Check,
  Pause,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Schema job statuses from validate.ts:
//   scheduled · materials_ordered · in_progress · on_hold · completed ·
//   punch_list · invoiced · paid · warranty
// The user-facing tabs group these into 4 buckets. "Cancelled" maps to
// on_hold since the schema has no explicit cancelled status.
const TABS = [
  {
    key: 'scheduled',
    label: 'Scheduled',
    statuses: ['scheduled', 'materials_ordered'],
    color: '#6366f1',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    statuses: ['in_progress', 'punch_list'],
    color: '#f59e0b',
  },
  {
    key: 'completed',
    label: 'Completed',
    statuses: ['completed', 'invoiced', 'paid', 'warranty'],
    color: '#10b981',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    statuses: ['on_hold'],
    color: '#ef4444',
  },
];

const STATUS_COLORS = {
  scheduled: '#6366f1',
  materials_ordered: '#8b5cf6',
  in_progress: '#f59e0b',
  punch_list: '#f97316',
  on_hold: '#ef4444',
  completed: '#10b981',
  invoiced: '#0ea5e9',
  paid: '#059669',
  warranty: '#64748b',
};

// For each status, the logical "next" statuses the operator can advance to.
const NEXT_STATUSES = {
  scheduled: ['materials_ordered', 'in_progress', 'on_hold'],
  materials_ordered: ['in_progress', 'on_hold'],
  in_progress: ['punch_list', 'completed', 'on_hold'],
  punch_list: ['completed', 'on_hold'],
  on_hold: ['scheduled', 'in_progress'],
  completed: ['invoiced', 'warranty'],
  invoiced: ['paid'],
  paid: ['warranty'],
  warranty: [],
};

const STATUS_ICONS = {
  on_hold: Pause,
  in_progress: Play,
  completed: Check,
  default: ArrowRight,
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(n) {
  if (!n && n !== 0) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(n));
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] ?? 'var(--emerald-bright)';
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize"
      style={{
        color,
        borderColor: color + '55',
        background: color + '14',
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      />
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('scheduled');
  const [actingOn, setActingOn] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const [jRes, cRes] = await Promise.all([
        fetch('/api/crm/jobs?limit=200'),
        fetch('/api/crm/contacts?limit=200'),
      ]);
      if (!jRes.ok) throw new Error('Failed to load jobs');
      const jJson = await jRes.json();
      const cJson = cRes.ok ? await cRes.json() : { contacts: [] };
      setJobs(jJson.jobs ?? []);
      setContacts(cJson.contacts ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const contactById = useMemo(() => {
    const m = new Map();
    contacts.forEach((c) => m.set(c.id, c));
    return m;
  }, [contacts]);

  const counts = useMemo(() => {
    const c = {};
    TABS.forEach((t) => {
      c[t.key] = jobs.filter((j) => t.statuses.includes(j.status)).length;
    });
    return c;
  }, [jobs]);

  const visible = useMemo(() => {
    const tab = TABS.find((t) => t.key === activeTab);
    if (!tab) return [];
    return jobs.filter((j) => tab.statuses.includes(j.status));
  }, [jobs, activeTab]);

  async function handleStatusChange(jobId, newStatus) {
    setActingOn(jobId);
    try {
      const res = await fetch(`/api/crm/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to update job status');
      }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-bright)]">
          Active jobs
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Track the work in motion across your crews.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-1">
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'text-[var(--text-bright)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-bright)]'
              }`}
              style={
                active
                  ? { background: 'var(--surface-1)' }
                  : undefined
              }
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: tab.color }}
              />
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                  active
                    ? 'bg-[var(--emerald-tint)] text-[var(--emerald-bright)]'
                    : 'bg-[var(--surface-3)] text-[var(--text-muted)]'
                }`}
              >
                {counts[tab.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
          {error}
        </div>
      ) : null}

      {/* Cards */}
      {loading && jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] py-16 text-center text-sm text-[var(--text-muted)]">
          Loading jobs…
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] py-16 text-center text-sm text-[var(--text-muted)]">
          No jobs in this bucket yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                contact={contactById.get(job.contact_id)}
                acting={actingOn === job.id}
                onStatusChange={(s) => handleStatusChange(job.id, s)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function JobCard({ job, contact, acting, onStatusChange }) {
  const contactName = contact
    ? [contact.first_name, contact.last_name].filter(Boolean).join(' ').trim() ||
      contact.company ||
      contact.email ||
      'Contact'
    : '—';
  const scheduled = job.start_date || job.end_date;
  const nextOptions = NEXT_STATUSES[job.status] ?? [];
  const crewCount = Array.isArray(job.assigned_crew)
    ? job.assigned_crew.length
    : 0;
  const jobValue = formatCurrency(job.job_value);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex flex-col rounded-2xl border p-5"
      style={{
        background: 'var(--surface-1)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Briefcase size={14} className="text-[var(--text-muted)]" />
            <h3 className="truncate font-semibold text-[var(--text-bright)]">
              {job.title}
            </h3>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <User size={11} />
            <span className="truncate">{contactName}</span>
          </div>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-[var(--text-subtle)] uppercase tracking-wider">
            Scheduled
          </dt>
          <dd className="mt-0.5 flex items-center gap-1 text-[var(--text-bright)]">
            <Calendar size={11} />
            {formatDate(scheduled)}
          </dd>
        </div>
        {jobValue ? (
          <div>
            <dt className="text-[var(--text-subtle)] uppercase tracking-wider">
              Value
            </dt>
            <dd className="mt-0.5 font-medium text-[var(--emerald-bright)]">
              {jobValue}
            </dd>
          </div>
        ) : null}
        {job.service_type ? (
          <div>
            <dt className="text-[var(--text-subtle)] uppercase tracking-wider">
              Service
            </dt>
            <dd className="mt-0.5 capitalize text-[var(--text-bright)]">
              {job.service_type.replace(/_/g, ' ')}
            </dd>
          </div>
        ) : null}
        {crewCount > 0 ? (
          <div>
            <dt className="text-[var(--text-subtle)] uppercase tracking-wider">
              Crew
            </dt>
            <dd className="mt-0.5 text-[var(--text-bright)]">
              {crewCount} {crewCount === 1 ? 'member' : 'members'}
            </dd>
          </div>
        ) : null}
      </dl>

      {job.notes ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-[var(--surface-2)] p-3 text-xs text-[var(--text-muted)]">
          <ClipboardList
            size={13}
            className="mt-0.5 flex-none text-[var(--text-subtle)]"
          />
          <p className="line-clamp-3">{job.notes}</p>
        </div>
      ) : null}

      {nextOptions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          {nextOptions.map((s) => {
            const Icon = STATUS_ICONS[s] ?? STATUS_ICONS.default;
            return (
              <Button
                key={s}
                size="sm"
                variant="outline"
                disabled={acting}
                onClick={() => onStatusChange(s)}
                className="capitalize"
              >
                {acting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Icon size={12} />
                )}
                {s.replace(/_/g, ' ')}
              </Button>
            );
          })}
        </div>
      ) : null}
    </motion.article>
  );
}
