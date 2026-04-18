/**
 * GET /api/admin/decision-engine/health
 *
 * Observability endpoint for PR T (Pass 1 activation). Returns, for the
 * authenticated org:
 *   - Whether the latest decision_brief used real Claude or fell back to mock
 *   - How many signal_events fed Pass 1
 *   - Where the signal_summary came from (signal_events.live | unified_context | empty)
 *   - Per-pass duration + headline
 *
 * Useful for confirming on Railway that the engine is actually talking to
 * Claude against real data, not serving a cached mock.
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";

interface BriefTrace {
  pass1?: {
    used_mock?: boolean;
    signal_summary_source?: string;
    input_events_count?: number;
    signal_quality_score?: number;
    duration_ms?: number;
    summary?: string;
  };
  pass2?: { duration_ms?: number; recommendations?: unknown[] };
  pass3?: { headline?: string; duration_ms?: number };
}

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const latest = await queryOne<{
      id: string;
      brief_date: string;
      created_at: string;
      decision_engine_trace: BriefTrace;
      priority: string;
    }>(
      `SELECT id, brief_date, created_at, decision_engine_trace, priority
       FROM decision_briefs
       WHERE org_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [orgId]
    );

    const eventsLast24h = await queryOne<{ cnt: number }>(
      `SELECT COUNT(*)::int AS cnt
       FROM signal_events
       WHERE org_id = $1 AND created_at > NOW() - INTERVAL '24 hours'`,
      [orgId]
    );

    const activeSources = await query<{ source_type: string; is_active: boolean }>(
      `SELECT source_type, is_active
       FROM signal_sources
       WHERE org_id = $1
       ORDER BY source_type`,
      [orgId]
    );

    if (!latest) {
      return NextResponse.json({
        ok: true,
        has_brief: false,
        events_last_24h: eventsLast24h?.cnt ?? 0,
        signal_sources: activeSources.rows,
        message:
          "No decision_briefs yet for this org — POST /api/decision/trigger to generate one",
      });
    }

    const trace = latest.decision_engine_trace ?? {};
    const pass1 = trace.pass1 ?? {};
    const claudeLive = pass1.used_mock === false;

    return NextResponse.json({
      ok: true,
      has_brief: true,
      brief_id: latest.id,
      brief_date: latest.brief_date,
      created_at: latest.created_at,
      priority: latest.priority,
      pass1: {
        used_mock: pass1.used_mock ?? null,
        claude_live: claudeLive,
        signal_summary_source: pass1.signal_summary_source ?? "unknown",
        input_events_count: pass1.input_events_count ?? 0,
        signal_quality_score: pass1.signal_quality_score ?? null,
        duration_ms: pass1.duration_ms ?? null,
        summary: pass1.summary ?? null,
      },
      pass2: {
        duration_ms: trace.pass2?.duration_ms ?? null,
        recommendation_count: Array.isArray(trace.pass2?.recommendations)
          ? trace.pass2!.recommendations!.length
          : null,
      },
      pass3: {
        headline: trace.pass3?.headline ?? null,
        duration_ms: trace.pass3?.duration_ms ?? null,
      },
      environment: {
        anthropic_api_key_present: Boolean(process.env.ANTHROPIC_API_KEY),
        node_env: process.env.NODE_ENV,
      },
      events_last_24h: eventsLast24h?.cnt ?? 0,
      signal_sources: activeSources.rows,
    });
  } catch (err) {
    console.error("[DecisionEngineHealth] Failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load decision engine health",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
