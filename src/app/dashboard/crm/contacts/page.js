'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  Building2,
  MapPin,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const PAGE_SIZE = 25;

function nameOf(c) {
  const full = [c.first_name, c.last_name].filter(Boolean).join(' ').trim();
  return full || c.company || c.email || c.phone || 'Unnamed contact';
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function TagPills({ tags }) {
  if (!tags || tags.length === 0) return <span className="text-[var(--text-subtle)]">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((t) => (
        <span
          key={t}
          className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]"
        >
          {t}
        </span>
      ))}
      {tags.length > 3 ? (
        <span className="text-[11px] text-[var(--text-subtle)]">
          +{tags.length - 3}
        </span>
      ) : null}
    </div>
  );
}

function AddContactModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    address_line1: '',
    city: '',
    state: '',
    zip: '',
    tags: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        address_line1: '',
        city: '',
        state: '',
        zip: '',
        tags: '',
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
      const body = { ...form };
      // Drop empty strings, Zod optional() + z.string().email() rejects ''.
      Object.keys(body).forEach((k) => {
        if (body[k] === '') delete body[k];
      });
      if (form.tags) {
        body.tags = form.tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        delete body.tags;
      }

      const res = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json?.error ||
            (json?.details?.[0]?.message ?? 'Failed to create contact')
        );
      }
      onCreated?.(json.contact);
      onClose();
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
          className="w-full max-w-xl overflow-hidden rounded-2xl border"
          style={{
            background: 'var(--surface-1)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <h3 className="font-semibold text-[var(--text-bright)]">
              Add Contact
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-bright)]"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
            <Field label="First name">
              <input
                value={form.first_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, first_name: e.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="Last name">
              <input
                value={form.last_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, last_name: e.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="Phone">
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="Company" className="sm:col-span-2">
              <input
                value={form.company}
                onChange={(e) =>
                  setForm((f) => ({ ...f, company: e.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <input
                value={form.address_line1}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address_line1: e.target.value }))
                }
                className="input"
                placeholder="Street"
              />
            </Field>
            <Field label="City">
              <input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="input"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="State">
                <input
                  value={form.state}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, state: e.target.value }))
                  }
                  className="input"
                />
              </Field>
              <Field label="Zip">
                <input
                  value={form.zip}
                  onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
                  className="input"
                />
              </Field>
            </div>
            <Field label="Tags (comma-separated)" className="sm:col-span-2">
              <input
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                className="input"
                placeholder="referral, hot, repeat"
              />
            </Field>
          </div>
          {error ? (
            <div className="mx-6 mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
              {error}
            </div>
          ) : null}
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
              {saving ? 'Saving…' : 'Create Contact'}
            </Button>
          </div>
          <style jsx>{`
            :global(.input) {
              width: 100%;
              background: var(--surface-2);
              border: 1px solid var(--border);
              border-radius: 10px;
              color: var(--text-bright);
              font-size: 14px;
              padding: 8px 12px;
              outline: none;
              transition: border-color 0.15s;
            }
            :global(.input:focus) {
              border-color: var(--emerald-bright);
            }
          `}</style>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);

  // Debounce search input.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(offset),
        });
        if (debouncedSearch) params.set('q', debouncedSearch);
        const res = await fetch(`/api/crm/contacts?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to load contacts');
        const json = await res.json();
        if (!cancelled) setContacts(json.contacts ?? []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, offset]);

  // Reset offset when search changes.
  useEffect(() => {
    setOffset(0);
  }, [debouncedSearch]);

  const canPrev = offset > 0;
  const canNext = contacts.length === PAGE_SIZE;

  function handleCreated(c) {
    setOffset(0);
    setContacts((prev) => [c, ...prev]);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, or email…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2 pl-9 pr-3 text-sm text-[var(--text-bright)] outline-none placeholder:text-[var(--text-subtle)] focus:border-[var(--emerald-bright)]"
          />
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} />
          Add Contact
        </Button>
      </div>

      <div
        className="overflow-hidden rounded-2xl border"
        style={{
          background: 'var(--surface-1)',
          borderColor: 'var(--border)',
        }}
      >
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--border)] text-left">
            <tr className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              <th className="w-6 px-4 py-3" />
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading && contacts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-[var(--text-muted)]"
                >
                  Loading contacts…
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-[var(--text-muted)]"
                >
                  {debouncedSearch
                    ? 'No contacts match your search.'
                    : 'No contacts yet. Add your first one above.'}
                </td>
              </tr>
            ) : (
              contacts.map((c) => {
                const isOpen = expanded === c.id;
                return (
                  <ContactRow
                    key={c.id}
                    contact={c}
                    open={isOpen}
                    onToggle={() => setExpanded(isOpen ? null : c.id)}
                  />
                );
              })
            )}
          </tbody>
        </table>
        {error ? (
          <div className="border-t border-[var(--border)] px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--text-muted)]">
          <span>
            Showing {contacts.length === 0 ? 0 : offset + 1}–{offset + contacts.length}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!canPrev || loading}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!canNext || loading}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <AddContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}

function ContactRow({ contact, open, onToggle }) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer border-b border-[var(--border)] transition-colors hover:bg-[var(--hover-bg)]"
      >
        <td className="px-4 py-3 text-[var(--text-muted)]">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </td>
        <td className="px-4 py-3 font-medium text-[var(--text-bright)]">
          {nameOf(contact)}
        </td>
        <td className="px-4 py-3 text-[var(--text-muted)]">
          {contact.company || '—'}
        </td>
        <td className="px-4 py-3 text-[var(--text-muted)]">
          {contact.phone || '—'}
        </td>
        <td className="px-4 py-3 text-[var(--text-muted)]">
          {contact.email || '—'}
        </td>
        <td className="px-4 py-3">
          <TagPills tags={contact.tags} />
        </td>
        <td className="px-4 py-3 text-[var(--text-muted)]">
          {formatDate(contact.created_at)}
        </td>
      </tr>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.tr
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-b border-[var(--border)] bg-[var(--surface-2)]"
          >
            <td colSpan={7} className="px-4 py-4">
              <ContactDetail contact={contact} />
            </td>
          </motion.tr>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function ContactDetail({ contact }) {
  const addr = [
    contact.address_line1,
    contact.address_line2,
    [contact.city, contact.state].filter(Boolean).join(', '),
    contact.zip,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Mail size={14} />
          {contact.email || '—'}
        </div>
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Phone size={14} />
          {contact.phone || '—'}
        </div>
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Building2 size={14} />
          {contact.company || '—'}
        </div>
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <MapPin size={14} />
          <span className="truncate">{addr || '—'}</span>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <div className="text-xs uppercase tracking-wider text-[var(--text-subtle)]">
          Contact type
        </div>
        <div className="text-[var(--text-bright)]">
          {contact.contact_type?.replace(/_/g, ' ') || '—'}
        </div>
        <div className="mt-2 text-xs uppercase tracking-wider text-[var(--text-subtle)]">
          Property type
        </div>
        <div className="text-[var(--text-bright)]">
          {contact.property_type?.replace(/_/g, ' ') || '—'}
        </div>
        <div className="mt-2 text-xs uppercase tracking-wider text-[var(--text-subtle)]">
          Source
        </div>
        <div className="text-[var(--text-bright)]">
          {contact.source?.replace(/_/g, ' ') || '—'}
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <div className="text-xs uppercase tracking-wider text-[var(--text-subtle)]">
          Status
        </div>
        <div className="text-[var(--text-bright)]">
          {contact.status?.replace(/_/g, ' ') || '—'}
        </div>
        <div className="mt-2 text-xs uppercase tracking-wider text-[var(--text-subtle)]">
          Notes
        </div>
        <div className="text-[var(--text-muted)] line-clamp-3">
          {contact.notes || '—'}
        </div>
      </div>
    </div>
  );
}
