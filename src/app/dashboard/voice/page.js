import { auth } from '@clerk/nextjs/server';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { voiceCalls } from '@/db/schema';
import VoiceClient from './voice-client';

// Force dynamic — this page depends on auth() and live DB reads.
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const QUALIFIED_OUTCOMES = new Set([
  'qualified',
  'booked',
  'won',
  'appointment_set',
]);

const OUTCOME_COLOR = {
  booked: 'var(--primary)',
  won: 'var(--primary)',
  qualified: '#3b82f6',
  appointment_set: '#3b82f6',
  rescheduled: '#f59e0b',
  voicemail: 'var(--text-muted)',
  no_answer: 'var(--text-muted)',
  missed: 'var(--text-muted)',
  no_outcome: 'var(--text-muted)',
};

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0m 00s';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}m ${s}s`;
}

function formatRelative(date) {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function displayContact(call) {
  // For inbound, the caller is the contact. For outbound, the called party.
  return call.direction === 'inbound'
    ? call.callerNumber || 'Unknown caller'
    : call.calledNumber || 'Unknown number';
}

function displayOutcome(outcome) {
  if (!outcome) return { label: 'NO OUTCOME', color: OUTCOME_COLOR.no_outcome };
  const key = String(outcome).toLowerCase();
  return {
    label: key.replace(/_/g, ' ').toUpperCase(),
    color: OUTCOME_COLOR[key] || 'var(--text-muted)',
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function VoicePage() {
  const { orgId } = await auth();

  const emptyStats = {
    total: 0,
    inbound: 0,
    outbound: 0,
    qualifiedCount: 0,
    qualifiedPct: 0,
    avgDurationSeconds: 0,
    avgDurationLabel: '—',
  };

  let stats = emptyStats;
  let recentCalls = [];

  if (orgId) {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Week-window aggregates. voice_calls.org_id is a plain text column
      // (stores Clerk orgId as-is), not a uuid with RLS — so we can filter
      // directly instead of going through withOrgContext.
      const [agg] = await db
        .select({
          total: sql`COUNT(*)::int`.mapWith(Number),
          inbound: sql`COUNT(*) FILTER (WHERE ${voiceCalls.direction} = 'inbound')::int`.mapWith(Number),
          outbound: sql`COUNT(*) FILTER (WHERE ${voiceCalls.direction} = 'outbound')::int`.mapWith(Number),
          qualified: sql`COUNT(*) FILTER (WHERE ${voiceCalls.outcome} IN ('qualified','booked','won','appointment_set'))::int`.mapWith(Number),
          avgDuration: sql`COALESCE(AVG(${voiceCalls.durationSeconds}), 0)::int`.mapWith(Number),
        })
        .from(voiceCalls)
        .where(
          and(
            eq(voiceCalls.orgId, orgId),
            gte(voiceCalls.startedAt, sevenDaysAgo),
          ),
        );

      const total = agg?.total ?? 0;
      const qualified = agg?.qualified ?? 0;
      const avgDur = agg?.avgDuration ?? 0;

      stats = {
        total,
        inbound: agg?.inbound ?? 0,
        outbound: agg?.outbound ?? 0,
        qualifiedCount: qualified,
        qualifiedPct: total > 0 ? Math.round((qualified * 100) / total) : 0,
        avgDurationSeconds: avgDur,
        avgDurationLabel: total > 0 ? formatDuration(avgDur) : '—',
      };

      // Recent calls — last 10 across all time for this org.
      const rows = await db
        .select({
          id: voiceCalls.id,
          direction: voiceCalls.direction,
          status: voiceCalls.status,
          callerNumber: voiceCalls.callerNumber,
          calledNumber: voiceCalls.calledNumber,
          durationSeconds: voiceCalls.durationSeconds,
          startedAt: voiceCalls.startedAt,
          outcome: voiceCalls.outcome,
        })
        .from(voiceCalls)
        .where(eq(voiceCalls.orgId, orgId))
        .orderBy(desc(voiceCalls.startedAt))
        .limit(10);

      recentCalls = rows.map((r) => {
        const { label, color } = displayOutcome(r.outcome);
        const isQualified = r.outcome && QUALIFIED_OUTCOMES.has(String(r.outcome).toLowerCase());
        // `isQualified` is a read-through flag the UI doesn't currently use
        // but exposing it keeps the door open for row highlighting later.
        void isQualified;
        return {
          id: r.id,
          direction: r.direction,
          contact: displayContact(r),
          status: r.status ? r.status.replace(/_/g, ' ') : 'unknown',
          duration: formatDuration(r.durationSeconds ?? 0),
          outcome: label,
          outcomeColor: color,
          when: formatRelative(r.startedAt),
        };
      });
    } catch (err) {
      // Fail-open on DB errors: render the empty state rather than a 500.
      // This page is read-only telemetry; a blip in the DB shouldn't take
      // the whole dashboard down.
      console.error('[voice-dashboard] query failed', err);
      stats = emptyStats;
      recentCalls = [];
    }
  }

  return <VoiceClient stats={stats} recentCalls={recentCalls} />;
}
