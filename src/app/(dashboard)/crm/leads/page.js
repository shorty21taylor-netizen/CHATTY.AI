'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Loader2,
  DollarSign,
  Clock,
  User,
  ArrowRight,
  Flame,
  Target,
  Check,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Kanban columns — actual lead statuses from validate.ts / the DB schema.
// "qualified" and "proposal_sent" in the user-facing spec map to the closest
// schema values (appointment_set+inspected → Qualified, quoted → Proposal).
const COLUMNS = [
  { key: 'new', label: 'New', color: '#6366f1' },
  { key: 'contacted', label: 'Contacted', color: '#8b5cf6' },
  { key: 'qualified', label: 'Qualified', color: '#06b6d4', includes: ['appointment_set', 'inspected'] },
  { key: 'quoted', label: 'Proposal', color: '#0ea5e9' },
  { key: 'negotiating', label: 'Negotiation', color: '#f59e0b' },
  { key: 'won', label: 'Won', color: '#10b981' },
  { key: 'lost', label: 'Lost', color: '#ef4444' },
];

const SERVICE_TYPES = [
  'roofing', 'hvac', 'solar', 'siding', 'windows', 'gutters',
  'painting', 'remodeling', 'plumbing', 'electrical', 'landscaping', 'other',
];

const PRIORITIES = ['hot', 'high', 'medium', 'low'];

const NEXT_STATUSES = {
  new: ['contacted', 'lost'],
  contacted: ['appointment_set', 'lost'],
  appointment_set: ['inspected', 'lost'],
  inspected: ['quoted', 'lost'],
  quoted: ['negotiating', 'won', 'lost'],
  negotiating: ['won', 'lost'],
  won: [],
  lost: [],
  on_hold: ['contacted', 'lost'],
};

function formatCurrency(n) {
  if (!n && n !== 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(n));
}

function daysBetween(from, to = new Date()) {
  if (!from) return null;
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

function priorityIcon(p) {
  if (p === 'hot') return <Flame size={12} className="text-rose-400" />;
  if (p === 'high') return <Target size={12} className="text-amber-400" />;
  return null;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actingOn, setActingOn] = useState(null);

  async function loadLeads() {
    try {
      setLoading(true);
      const [lRes, cRes] = await Promise.all([
        fetch('/api/crm/leads?limit=200'),
        fetch('/api/crm/contacts?limit=200'),
      ]);
      if (!lRes.ok) throw new Error('Failed to load leads');
      const lJson = await lRes.json();
      const cJson = cRes.ok ? await cRes.json() : { contacts: [] };
      setLeads(lJson.leads ?? []);
      setContacts(cJson.contacts ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  const contactById = useMemo(() => {
    const m = new Map();
    contacts.forEach((c) => m.set(c.id, c));
    return m;
  }, [contacts]);

  const columnsData = useMemo(() => {
    return COLUMNS.map((col) => {
      const statuses = col.includes ?? [col.key];
      const rows = leads.filter((l) => statuses.includes(l.status));
      const value = rows.reduce(
        (sum, l) => sum + Number(l.estimated_value ?? 0),
        0
      );
      return { ...col, rows, value };
    });
  }, [leads]);

  const selected = useMemo(
    () => leads.find((l) => l.id === selectedId) ?? null,
    [leads, selectedId]
  );

  async function handleStatusChange(leadId, newStatus, lostReason) {
    setActingOn(leadId);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          status: newStatus,
          ...(lostReason ? { lost_reason: lostReason } : {}),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to update status');
      }
      await loadLeads();
    } catch (err) {
      setError(err.message);
    } finally {
      setActingOn(null);
    }
  }

  function handleCreated(lead) {
    setLeads((prev) => [lead, ...prev]);
    setModalOpen(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-bright)]">
            Leads pipeline
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Drag leads through each stage. Click a card for details + quick actions.
          </p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} />
          New Lead
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
          {error}
        </div>
      ) : null}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columnsData.map((col) => (
          <div
            key={col.key}
            className="w-72 flex-none rounded-2xl border p-3"
            style={{
              background: 'var(--surface-1)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between px-1 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: col.color }}
                />
                <span className="text-sm font-semibold text-[var(--text-bright)]">
                  {col.label}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {col.rows.length}
                </span>
              </div>
              <span className="text-xs tabular-nums text-[var(--text-muted)]">
                {formatCurrency(col.value)}
              </span>
            </div>
            <div className="space-y-2">
              {loading && col.rows.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--border)] px-3 py-4 text-center text-xs text-[var(--text-subtle)]">
                  Loading…
                </div>
              ) : col.rows.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--border)] px-3 py-4 text-center text-xs text-[var(--text-subtle)]">
                  No leads
                </div>
              ) : (
                col.rows.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    contact={contactById.get(lead.contact_id)}
                    onClick={() => setSelectedId(lead.id)}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selected ? (
          <LeadDetailPanel
            lead={selected}
            contact={contactById.get(selected.contact_id)}
            acting={actingOn === selected.id}
            onClose={() => setSelectedId(null)}
            onStatusChange={(s, reason) =>
              handleStatusChange(selected.id, s, reason)
            }
          />
        ) : null}
      </AnimatePresence>

      <NewLeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
        contacts={contacts}
      />
    </div>
  );
}

function LeadCard({ lead, contact, onClick }) {
  const days = daysBetween(lead.updated_at || lead.created_at);
  const name = contact
    ? [contact.first_name, contact.last_name].filter(Boolean).join(' ').trim() ||
      contact.company ||
      contact.email ||
      'Contact'
    : '—';
  return (
    <motion.button
      layout
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="w-full rounded-xl border p-3 text-left transition-colors"
      style={{
        background: 'var(--surface-2)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {priorityIcon(lead.priority)}
            <span className="truncate text-sm font-medium text-[var(--text-bright)]">
              {lead.title || 'Untitled lead'}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <User size={11} />
            <span className="truncate">{name}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)]">
        {lead.service_type ? (
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-2 py-0.5 capitalize">
            {lead.service_type.replace(/_/g, ' ')}
          </span>
        ) : null}
        {lead.estimated_value ? (
          <span className="inline-flex items-center gap-0.5 font-medium text-[var(--emerald-bright)]">
            <DollarSign size={11} />
            {Math.round(Number(lead.estimated_value)).toLocaleString()}
          </span>
        ) : null}
        {lead.source ? (
          <span className="truncate capitalize">
            via {lead.source.replace(/_/g, ' ')}
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex items-center gap-1 text-[11px] text-[var(--text-subtle)]">
        <Clock size={10} />
        {days != null ? `${days}d in stage` : '—'}
      </div>
    </motion.button>
  );
}

function LeadDetailPanel({ lead, contact, acting, onClose, onStatusChange }) {
  const [lostReason, setLostReason] = useState('');
  const [showLostInput, setShowLostInput] = useState(false);
  const nextStatuses = NEXT_STATUSES[lead.status] ?? [];
  const name = contact
    ? [contact.first_name, contact.last_name].filter(Boolean).join(' ').trim() ||
      contact.company ||
      contact.email
    : '—';

  useEffect(() => {
    setShowLostInput(false);
    setLostReason('');
  }, [lead.id]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l"
        style={{
          background: 'var(--surface-1)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Lead detail
            </div>
            <h3 className="mt-0.5 text-lg font-semibold text-[var(--text-bright)]">
              {lead.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-bright)]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <KV label="Contact" value={name} />
          <KV label="Status" value={lead.status} capitalize />
          <KV label="Priority" value={lead.priority ?? '—'} capitalize />
          <KV
            label="Service"
            value={lead.service_type?.replace(/_/g, ' ') ?? '—'}
            capitalize
          />
          <KV label="Estimated value" value={formatCurrency(lead.estimated_value)} />
          <KV
            label="Source"
            value={lead.source?.replace(/_/g, ' ') ?? '—'}
            capitalize
          />
          <KV
            label="Follow-up"
            value={
              lead.follow_up_date
                ? new Date(lead.follow_up_date).toLocaleDateString()
                : '—'
            }
          />
          <KV label="Assigned to" value={lead.assigned_to ?? '—'} />
          {lead.description ? (
            <div>
              <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Description
              </div>
              <p className="mt-1 text-sm text-[var(--text-bright)] whitespace-pre-wrap">
                {lead.description}
              </p>
            </div>
          ) : null}
          {lead.lost_reason ? (
            <KV label="Lost reason" value={lead.lost_reason} />
          ) : null}
        </div>

        <div className="border-t border-[var(--border)] p-5 space-y-3">
          <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
            Change status
          </div>
          {showLostInput ? (
            <div className="space-y-2">
              <textarea
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="Reason for loss (optional)"
                rows={2}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-bright)] outline-none focus:border-[var(--emerald-bright)]"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLostInput(false)}
                  disabled={acting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    onStatusChange('lost', lostReason);
                    setShowLostInput(false);
                  }}
                  disabled={acting}
                >
                  Mark lost
                </Button>
              </div>
            </div>
          ) : nextStatuses.length === 0 ? (
            <div className="text-sm text-[var(--text-muted)]">
              Lead is in a terminal state.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((s) => {
                const isLost = s === 'lost';
                const isWon = s === 'won';
                return (
                  <Button
                    key={s}
                    size="sm"
                    variant={isWon ? 'default' : 'outline'}
                    disabled={acting}
                    onClick={() => {
                      if (isLost) setShowLostInput(true);
                      else onStatusChange(s);
                    }}
                    className="capitalize"
                  >
                    {acting ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : isWon ? (
                      <Check size={12} />
                    ) : isLost ? (
                      <XCircle size={12} />
                    ) : (
                      <ArrowRight size={12} />
                    )}
                    {s.replace(/_/g, ' ')}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}

function KV({ label, value, capitalize }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </span>
      <span
        className={`text-right text-[var(--text-bright)] ${
          capitalize ? 'capitalize' : ''
        }`}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}

function NewLeadModal({ open, onClose, onCreated, contacts }) {
  const [form, setForm] = useState({
    contact_id: '',
    title: '',
    service_type: '',
    priority: 'medium',
    estimated_value: '',
    source: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setForm({
        contact_id: '',
        title: '',
        service_type: '',
        priority: 'medium',
        estimated_value: '',
        source: '',
        description: '',
      });
      setError(null);
      setSaving(false);
    }
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = {
        contact_id: form.contact_id,
        title: form.title,
      };
      if (form.service_type) body.service_type = form.service_type;
      if (form.priority) body.priority = form.priority;
      if (form.estimated_value) {
        body.estimated_value = Number(form.estimated_value);
      }
      if (form.source) body.source = form.source;
      if (form.description) body.description = form.description;

      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json?.error ||
            (json?.details?.[0]?.message ?? 'Failed to create lead')
        );
      }
      onCreated?.(json.lead);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        key="modal"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg overflow-hidden rounded-2xl border"
          style={{
            background: 'var(--surface-1)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <h3 className="font-semibold text-[var(--text-bright)]">New Lead</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-bright)]"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <div className="space-y-4 p-6">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Contact *
              </span>
              <select
                required
                value={form.contact_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contact_id: e.target.value }))
                }
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-bright)] outline-none focus:border-[var(--emerald-bright)]"
              >
                <option value="">Select a contact…</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {[c.first_name, c.last_name].filter(Boolean).join(' ') ||
                      c.company ||
                      c.email ||
                      'Unnamed'}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Title *
              </span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-bright)] outline-none focus:border-[var(--emerald-bright)]"
                placeholder="e.g. Roof replacement — 123 Oak St"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Service
                </span>
                <select
                  value={form.service_type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, service_type: e.target.value }))
                  }
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-bright)] outline-none focus:border-[var(--emerald-bright)] capitalize"
                >
                  <option value="">—</option>
                  {SERVICE_TYPES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Priority
                </span>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priority: e.target.value }))
                  }
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-bright)] outline-none focus:border-[var(--emerald-bright)] capitalize"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Est. value
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={form.estimated_value}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, estimated_value: e.target.value }))
                  }
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-bright)] outline-none focus:border-[var(--emerald-bright)]"
                  placeholder="0"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Source
                </span>
                <input
                  value={form.source}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, source: e.target.value }))
                  }
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-bright)] outline-none focus:border-[var(--emerald-bright)]"
                  placeholder="referral, website…"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Notes
              </span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-bright)] outline-none focus:border-[var(--emerald-bright)]"
              />
            </label>
            {error ? (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {error}
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-6 py-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? 'Creating…' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
