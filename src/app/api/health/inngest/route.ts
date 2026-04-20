import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// ---------------------------------------------------------------------------
// Inngest registration health check
// ---------------------------------------------------------------------------
// Silent-failure mode this endpoint catches: Railway deploy goes green but
// Inngest never re-registers (missing/expired signing key, introspection
// endpoint unreachable, app URL misconfigured), so all cron functions stop
// firing. The dashboard stays up, users get no brief, and nobody notices for
// days.
//
// We don't ask Inngest's own API (avoid another outbound dep) — instead we
// check that the tables cron workflows *write to* have recent activity,
// scaled to each function's cadence. If nothing has fired recently AND we
// have active orgs that should be receiving briefs, something is wrong.
//
// This endpoint is intentionally public (no auth). It returns 200 when
// healthy, 503 when degraded. Point a monitoring service at it.
// ---------------------------------------------------------------------------

interface RegisteredFunction {
  id: string;
  /** Cron expression if this is a scheduled function. */
  cron?: string;
  /** Threshold before we consider this function stale (seconds). */
  staleAfterSec: number;
  /** How we measure this function's last-seen time. */
  activityQuery: string;
  /**
   * If truthy and the row count for the "relevant" org check is 0, skip
   * the staleness assertion. E.g. signal-sync is expected to be silent
   * when there are no active signal_sources yet.
   */
  guardQuery?: string;
}

const REGISTERED: RegisteredFunction[] = [
  {
    id: "brief-scheduler",
    cron: "*/15 * * * *",
    staleAfterSec: 60 * 60, // 1h grace
    activityQuery: "SELECT MAX(created_at) AS last FROM decision_briefs",
    guardQuery: "SELECT COUNT(*) FROM brief_preferences WHERE enabled = true",
  },
  {
    id: "signal-sync",
    cron: "*/30 * * * *",
    staleAfterSec: 2 * 60 * 60, // 2h grace
    activityQuery:
      "SELECT MAX(last_sync_at) AS last FROM signal_sources WHERE is_active = true",
    guardQuery: "SELECT COUNT(*) FROM signal_sources WHERE is_active = true",
  },
  {
    id: "agent-metrics-rollup",
    cron: "0 * * * *",
    staleAfterSec: 3 * 60 * 60, // 3h grace
    activityQuery: "SELECT MAX(created_at) AS last FROM agent_metrics",
    guardQuery: "SELECT COUNT(*) FROM agent_configs WHERE is_active = true",
  },
  {
    id: "outbound-call-dispatch",
    cron: "*/2 * * * *",
    staleAfterSec: 6 * 60 * 60, // 6h grace — low-traffic workflow
    activityQuery: "SELECT MAX(created_at) AS last FROM call_tasks",
    guardQuery: "SELECT COUNT(*) FROM call_tasks WHERE status = 'pending'",
  },
  {
    id: "feedback-process",
    cron: "0 18 * * *",
    staleAfterSec: 48 * 60 * 60, // daily cron — 2-day grace
    activityQuery:
      "SELECT MAX((operator_feedback->>'feedback_prompted_at')::timestamptz) AS last FROM decision_briefs WHERE operator_feedback ? 'feedback_prompted_at'",
    guardQuery:
      "SELECT COUNT(*) FROM brief_preferences WHERE enabled = true AND sms_enabled = true",
  },
];

const OTHER_FUNCTIONS = [
  "decision-run",
  "brief-deliver",
  "brief-run",
  "agent-run",
  "agent-inbound-reply",
  "cadence-step-execute",
  "reclaim-sweeper-dispatcher",
  "reclaim-sweep-org",
  "simulation-run",
  "memory-graph-build",
  "outbound-call-reconcile",
];

async function maybeScalar(sql: string): Promise<number> {
  try {
    const { rows } = await pool.query(sql);
    const row = rows[0];
    if (!row) return 0;
    const v = row[Object.keys(row)[0]];
    return typeof v === "string" ? parseInt(v, 10) : Number(v ?? 0);
  } catch {
    return 0;
  }
}

async function maybeLastSeen(sql: string): Promise<Date | null> {
  try {
    const { rows } = await pool.query(sql);
    const v = rows[0]?.last;
    return v ? new Date(v) : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const now = Date.now();
  const envStatus = {
    INNGEST_EVENT_KEY: !!process.env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY: !!process.env.INNGEST_SIGNING_KEY,
    DATABASE_URL: !!process.env.DATABASE_URL,
    REDIS_URL: !!process.env.REDIS_URL,
    NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
  };

  const checks = await Promise.all(
    REGISTERED.map(async (fn) => {
      const lastSeen = await maybeLastSeen(fn.activityQuery);
      const guardCount = fn.guardQuery ? await maybeScalar(fn.guardQuery) : 1;
      const ageSec = lastSeen
        ? Math.floor((now - lastSeen.getTime()) / 1000)
        : null;

      let status: "healthy" | "stale" | "skipped" | "never_run" = "never_run";
      if (guardCount === 0) {
        status = "skipped";
      } else if (lastSeen) {
        status = ageSec! <= fn.staleAfterSec ? "healthy" : "stale";
      }

      return {
        id: fn.id,
        cron: fn.cron,
        status,
        last_seen_at: lastSeen?.toISOString() ?? null,
        age_seconds: ageSec,
        stale_after_seconds: fn.staleAfterSec,
        guard_rows: guardCount,
      };
    }),
  );

  const missingEnvs = Object.entries(envStatus)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  const staleFns = checks.filter((c) => c.status === "stale");
  const degraded = missingEnvs.length > 0 || staleFns.length > 0;

  return NextResponse.json(
    {
      status: degraded ? "degraded" : "healthy",
      version: process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
      timestamp: new Date().toISOString(),
      env: envStatus,
      missing_envs: missingEnvs,
      cron_functions: checks,
      event_driven_functions: OTHER_FUNCTIONS,
      stale_functions: staleFns.map((f) => f.id),
      guidance: degraded
        ? [
            missingEnvs.length > 0
              ? `Set missing env vars on Railway: ${missingEnvs.join(", ")}`
              : null,
            staleFns.length > 0
              ? `Stale crons: ${staleFns.map((f) => f.id).join(", ")}. Check https://app.inngest.com for this app. If deployed function count is wrong, the Inngest registration failed on last deploy.`
              : null,
          ].filter(Boolean)
        : [],
    },
    { status: degraded ? 503 : 200 },
  );
}
