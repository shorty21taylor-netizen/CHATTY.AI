'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Target,
  Megaphone,
  PhoneCall,
  CloudLightning,
  Users,
  Mail,
  Briefcase,
  Sparkles,
} from 'lucide-react';

const CATEGORY_MAP = {
  leads: {
    label: 'Leads',
    icon: Target,
    color: '#10b981',
    eventTypes: ['lead_created', 'lead_status_changed'],
  },
  ads: {
    label: 'Ads',
    icon: Megaphone,
    color: '#818cf8',
    sourceTypes: ['google_ads', 'facebook_ads'],
  },
  calls: {
    label: 'Calls',
    icon: PhoneCall,
    color: '#f59e0b',
    match: (e) =>
      e.event_type === 'interaction_logged' &&
      (e.data?.interaction_type === 'call' ||
        e.data?.interaction_type === 'voicemail'),
  },
  weather: {
    label: 'Weather',
    icon: CloudLightning,
    color: '#38bdf8',
    sourceTypes: ['weather'],
  },
  crm: {
    label: 'CRM',
    icon: Users,
    color: '#f472b6',
    eventTypes: [
      'contact_created',
      'estimate_sent',
      'estimate_accepted',
      'job_status_changed',
      'job_completed',
      'interaction_logged',
    ],
  },
};

const MOCK_SIGNALS = [
  {
    id: 'sig-1',
    category: 'leads',
    title: 'New lead — Miller Residence (Roofing)',
    summary: 'Google LSA · $18.7k est. · contacted: 0m ago',
    timestamp: Date.now() - 2 * 60 * 1000,
    source: 'Google LSA',
  },
  {
    id: 'sig-2',
    category: 'calls',
    title: 'Inbound call — Thompson, 6m',
    summary: 'Outcome: scheduled site visit for Fri',
    timestamp: Date.now() - 18 * 60 * 1000,
    source: 'Twilio',
  },
  {
    id: 'sig-3',
    category: 'ads',
    title: 'Facebook storm-season creative CPL drop',
    summary: '$42 CPL (−22% WoW) · 9 clicks in last hour',
    timestamp: Date.now() - 42 * 60 * 1000,
    source: 'Facebook Ads',
  },
  {
    id: 'sig-4',
    category: 'weather',
    title: 'Severe thunderstorm watch — 2–4pm tomorrow',
    summary: 'Overlaps Thompson + Patel roof tear-offs',
    timestamp: Date.now() - 65 * 60 * 1000,
    source: 'NWS',
  },
  {
    id: 'sig-5',
    category: 'crm',
    title: 'Estimate accepted — Chen, $11.4k',
    summary: 'EST-2026-0038 · moved to scheduled',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    source: 'Built-in CRM',
  },
  {
    id: 'sig-6',
    category: 'leads',
    title: 'Lead status → quoted — Patel roof',
    summary: '$14.2k · follow-up: Thu',
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    source: 'Built-in CRM',
  },
  {
    id: 'sig-7',
    category: 'calls',
    title: 'Missed inbound call — Garcia',
    summary: 'Voicemail transcript available · 1:12',
    timestamp: Date.now() - 5.5 * 60 * 60 * 1000,
    source: 'Twilio',
  },
  {
    id: 'sig-8',
    category: 'ads',
    title: 'Google Ads — new keyword surge "storm damage roofing"',
    summary: 'Impressions +41% WoW · CTR 6.8%',
    timestamp: Date.now() - 7 * 60 * 60 * 1000,
    source: 'Google Ads',
  },
  {
    id: 'sig-9',
    category: 'crm',
    title: 'Contact added — Harper (referral)',
    summary: 'Commercial · gutters + siding inquiry',
    timestamp: Date.now() - 9 * 60 * 60 * 1000,
    source: 'Built-in CRM',
  },
  {
    id: 'sig-10',
    category: 'weather',
    title: 'Clear 48h window starting 6am Sat',
    summary: 'Good conditions for tear-off backlog',
    timestamp: Date.now() - 11 * 60 * 60 * 1000,
    source: 'NWS',
  },
];

const FILTERS = [
  { id: 'all', label: 'All', icon: Activity, color: 'var(--emerald-bright)' },
  { id: 'leads', label: 'Leads', icon: Target, color: '#10b981' },
  { id: 'ads', label: 'Ads', icon: Megaphone, color: '#818cf8' },
  { id: 'calls', label: 'Calls', icon: PhoneCall, color: '#f59e0b' },
  { id: 'weather', label: 'Weather', icon: CloudLightning, color: '#38bdf8' },
  { id: 'crm', label: 'CRM', icon: Users, color: '#f472b6' },
];

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function categorize(event) {
  for (const [key, cfg] of Object.entries(CATEGORY_MAP)) {
    if (cfg.match && cfg.match(event)) return key;
    if (cfg.eventTypes?.includes(event.event_type)) return key;
    if (cfg.sourceTypes?.includes(event.source_type)) return key;
  }
  return 'crm';
}

function summarize(event) {
  const d = event.data ?? {};
  if (event.event_type === 'lead_created')
    return `${d.service_type ?? 'lead'} · ${d.source ?? ''}`;
  if (event.event_type === 'lead_status_changed')
    return `${d.previous_status ?? ''} → ${d.status ?? ''}`;
  if (event.event_type === 'estimate_accepted')
    return `$${Number(d.total ?? 0).toLocaleString()} accepted`;
  if (event.event_type === 'interaction_logged')
    return `${d.interaction_type ?? 'note'} · ${d.direction ?? ''}`;
  return d.summary ?? '';
}

function titleFor(event) {
  const d = event.data ?? {};
  return d.title || d.summary || event.event_type || 'Signal event';
}

export default function SignalFeed({ events }) {
  const [filter, setFilter] = useState('all');

  const signals = useMemo(() => {
    if (events && events.length > 0) {
      return events.map((e) => ({
        id: e.id,
        category: categorize(e),
        title: titleFor(e),
        summary: summarize(e),
        timestamp: new Date(e.created_at).getTime(),
        source: e.source_type,
      }));
    }
    return MOCK_SIGNALS;
  }, [events]);

  const filtered = filter === 'all'
    ? signals
    : signals.filter((s) => s.category === filter);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="rounded-2xl border p-5 sm:p-6"
      style={{
        background: 'var(--surface-1)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[var(--emerald-bright)]" />
            <h3 className="font-semibold text-[var(--text-bright)]">
              Signal activity
            </h3>
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Live feed of the last 24 hours.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all"
                style={{
                  background: active
                    ? `color-mix(in srgb, ${f.color} 14%, transparent)`
                    : 'transparent',
                  borderColor: active
                    ? `color-mix(in srgb, ${f.color} 45%, transparent)`
                    : 'var(--border)',
                  color: active ? f.color : 'var(--text-muted)',
                }}
                aria-pressed={active}
              >
                <Icon size={11} />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="mt-5 max-h-[520px] space-y-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <motion.li
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--text-muted)]"
            >
              No signals matched this filter yet.
            </motion.li>
          ) : (
            filtered.map((s, i) => {
              const cfg = CATEGORY_MAP[s.category] ?? CATEGORY_MAP.crm;
              const Icon = cfg.icon;
              return (
                <motion.li
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, delay: i * 0.025 }}
                  className="flex gap-3 rounded-xl border p-3 transition-colors hover:border-[var(--border-strong)]"
                  style={{
                    background: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border"
                    style={{
                      background: `color-mix(in srgb, ${cfg.color} 12%, transparent)`,
                      borderColor: `color-mix(in srgb, ${cfg.color} 35%, transparent)`,
                      color: cfg.color,
                    }}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          color: cfg.color,
                          borderColor: `color-mix(in srgb, ${cfg.color} 35%, transparent)`,
                          background: `color-mix(in srgb, ${cfg.color} 10%, transparent)`,
                        }}
                      >
                        {cfg.label}
                      </span>
                      <span className="truncate text-sm font-medium text-[var(--text-bright)]">
                        {s.title}
                      </span>
                    </div>
                    {s.summary ? (
                      <div className="mt-1 truncate text-xs text-[var(--text-muted)]">
                        {s.summary}
                      </div>
                    ) : null}
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                      <span>{timeAgo(s.timestamp)}</span>
                      {s.source ? (
                        <>
                          <span>·</span>
                          <span className="truncate">{s.source}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </motion.li>
              );
            })
          )}
        </AnimatePresence>
      </ul>
    </motion.section>
  );
}
