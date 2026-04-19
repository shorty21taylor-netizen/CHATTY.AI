/**
 * Decision Engine — 3-Pass Claude Chain
 *
 * The brain of Chatty AI. Runs signal analysis → pattern recognition → brief generation.
 * Called by the /api/decision/trigger endpoint and Inngest decision-run workflow.
 */

import { runPass1 } from "./pass-1-signal-analysis";
import { runPass2 } from "./pass-2-pattern-recognition";
import { runPass3 } from "./pass-3-brief-generation";
import { query, queryOne } from "../db";
import {
  getPipelineSummary,
  getDailyActivity,
  getOverdueFollowUps,
  getRecentFeedback,
} from "../db/queries";
import { getBusinessProfile } from "@/lib/business-profile";
import { getTopAgents } from "@/lib/agent-metrics/rollup";
import { searchNodes } from "@/lib/memory-graph/nodes";
import { logError } from "@/lib/error-log";

export interface DecisionEngineOptions {
  vertical?: string;
  operatorName?: string;
}

export interface DecisionEngineResult {
  briefId: string;
  brief: Awaited<ReturnType<typeof runPass3>>["brief"];
  trace: {
    pass1: Awaited<ReturnType<typeof runPass1>>;
    pass2: Awaited<ReturnType<typeof runPass2>>;
    pass3: Awaited<ReturnType<typeof runPass3>>;
  };
  totalDurationMs: number;
}

export async function runDecisionEngine(
  orgId: string,
  options: DecisionEngineOptions = {}
): Promise<DecisionEngineResult> {
  const startTime = Date.now();
  const { vertical = "home_services", operatorName = "Operator" } = options;

  console.log(`[DecisionEngine] Starting 3-pass chain for org ${orgId}`);

  // Load business profile for context injection
  let profileContext: string | undefined;
  let resolvedVertical = vertical;
  let resolvedName = operatorName;
  try {
    const profile = await getBusinessProfile(orgId);
    if (profile) {
      if (profile.primaryServiceType) resolvedVertical = profile.primaryServiceType.toLowerCase();
      if (profile.ownerFirstName) resolvedName = profile.ownerFirstName;
      const parts: string[] = [];
      if (profile.primaryServiceType) parts.push(`This org is a ${profile.primaryServiceType} contractor`);
      if (profile.teamSize) parts.push(`with ${profile.teamSize} team members`);
      if (profile.companyName) parts.push(`operating as ${profile.companyName}`);
      if (profile.pricingPhilosophy) parts.push(`pricing philosophy: ${profile.pricingPhilosophy}`);
      if (profile.serviceSubtypes?.length) parts.push(`service subtypes: ${profile.serviceSubtypes.join(", ")}`);
      if (parts.length > 0) profileContext = parts.join(", ") + ".";
    }
  } catch (err) {
    console.warn("[DecisionEngine] Could not load business profile:", err);
  }

  // Step 1: Build unified context from signal_events
  const signalSummary = await buildSignalSummary(orgId);
  const recentEvents = await getRecentEvents(orgId);
  const previousBriefs = await getPreviousBriefs(orgId);

  // Inject yesterday's top agents as a signal
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const topAgents = await getTopAgents(orgId, yesterday.toISOString().split("T")[0], 3);
    if (topAgents.length > 0) {
      signalSummary.agentPerformance = topAgents.map((a) => ({
        agentType: a.agentType,
        runs: a.runs,
        conversions: a.leadsConverted,
        successRate: a.runs > 0 ? Math.round((a.successes / a.runs) * 100) : 0,
      }));
    }
  } catch {
    // Agent metrics table may not exist yet
  }

  // Inject similar past situations from memory graph
  try {
    const summaryText = JSON.stringify(signalSummary).slice(0, 500);
    const similarMemories = await searchNodes(orgId, summaryText, 3);
    if (similarMemories.length > 0) {
      signalSummary.memoryGraphMatches = similarMemories.map((m) => ({
        nodeType: m.node_type,
        summary: m.summary,
        similarity: Math.round((m.similarity || 0) * 100) / 100,
        data: m.data,
      }));
    }
  } catch {
    // Memory graph table may not exist yet
  }

  // Pass 1: Signal Analysis (real signal_events input via buildSignalSummary)
  console.log("[DecisionEngine] Running Pass 1: Signal Analysis...");
  const pass1 = await runPass1({
    orgId,
    signalSummary,
    recentEvents,
    externalContext: {},
    orgVertical: resolvedVertical,
  });
  console.log(
    `[DecisionEngine] Pass 1 complete: ${pass1.patterns.length} patterns found (mock=${pass1.used_mock}, ${pass1.duration_ms}ms)`
  );

  // Observability: log when Pass 1 falls back to mock in production so we can
  // catch a missing ANTHROPIC_API_KEY or a bad model id on Railway.
  if (pass1.used_mock && process.env.NODE_ENV === "production") {
    await logError({
      orgId,
      level: "warn",
      source: "decision-engine.pass1",
      message: "Pass 1 returned mock output in production — Claude call did not succeed",
      meta: {
        total_events: (signalSummary as { total_events?: number }).total_events ?? 0,
        has_api_key: Boolean(process.env.ANTHROPIC_API_KEY),
      },
    });
  }

  // Build CRM context for Pass 2 — pipeline state, today's activity, overdue
  // follow-ups, and the operator feedback loop. These are what the PASS_2_SYSTEM
  // prompt advertises; before PR W the prompt claimed to have them but the
  // builder passed nothing.
  const crmContext = await buildPass2CrmContext(orgId);

  // Pass 2: Pattern Recognition
  console.log("[DecisionEngine] Running Pass 2: Pattern Recognition...");
  const pass2 = await runPass2(pass1, previousBriefs, profileContext, crmContext);
  console.log(
    `[DecisionEngine] Pass 2 complete: ${pass2.recommendations.length} recommendations (${pass2.duration_ms}ms, mock=${pass2.used_mock})`
  );

  if (pass2.used_mock && process.env.NODE_ENV === "production") {
    await logError({
      orgId,
      level: "warn",
      source: "decision-engine.pass2",
      message: "Pass 2 returned mock output in production — Claude call did not succeed",
      meta: {
        has_api_key: Boolean(process.env.ANTHROPIC_API_KEY),
        pass1_pattern_count: pass1.patterns.length,
        crm_pipeline_rows: crmContext.pipelineSummary?.length ?? 0,
        crm_activity_rows: crmContext.dailyActivity?.length ?? 0,
        overdue_followups: crmContext.overdueFollowUps?.length ?? 0,
      },
    });
  }

  // Pass 3: Brief Generation
  console.log("[DecisionEngine] Running Pass 3: Brief Generation...");
  const pass3 = await runPass3(pass2, resolvedName, resolvedVertical, orgId);
  console.log(
    `[DecisionEngine] Pass 3 complete: "${pass3.brief.headline}" (${pass3.duration_ms}ms, mock=${pass3.used_mock})`
  );

  if (pass3.used_mock && process.env.NODE_ENV === "production") {
    await logError({
      orgId,
      level: "warn",
      source: "decision-engine.pass3",
      message: "Pass 3 returned mock output in production — Claude call did not succeed",
      meta: {
        has_api_key: Boolean(process.env.ANTHROPIC_API_KEY),
        pass2_recommendations: pass2.recommendations.length,
      },
    });
  }

  // Store the brief in the database
  const briefId = await storeBrief(orgId, pass1, pass2, pass3, {
    signalSummary,
    recentEventsCount: recentEvents.length,
    crmContext,
  });

  const totalDurationMs = Date.now() - startTime;
  console.log(
    `[DecisionEngine] Complete for org ${orgId} in ${totalDurationMs}ms`
  );

  return {
    briefId,
    brief: pass3.brief,
    trace: { pass1, pass2, pass3 },
    totalDurationMs,
  };
}

// -- Helper functions --

async function buildSignalSummary(
  orgId: string
): Promise<Record<string, unknown>> {
  // Prefer an existing unified_context row for today (upstream writers may populate it)
  try {
    const result = await queryOne<{ signal_summary: Record<string, unknown> }>(
      `SELECT signal_summary FROM unified_context
       WHERE org_id = $1 AND context_date = CURRENT_DATE
       ORDER BY created_at DESC LIMIT 1`,
      [orgId]
    );
    if (result?.signal_summary && Object.keys(result.signal_summary).length > 0) {
      return result.signal_summary;
    }
  } catch {
    // fallthrough to aggregate
  }

  // Aggregate directly from signal_events so Pass 1 always gets a real summary
  // even when no upstream writer has built a unified_context row yet.
  try {
    const totalRow = await queryOne<{
      total_events: number;
      first_seen: string | null;
      last_seen: string | null;
    }>(
      `SELECT
         COUNT(*)::int AS total_events,
         MIN(created_at)::text AS first_seen,
         MAX(created_at)::text AS last_seen
       FROM signal_events
       WHERE org_id = $1 AND created_at > NOW() - INTERVAL '24 hours'`,
      [orgId]
    );

    const totalEvents = totalRow?.total_events ?? 0;
    if (totalEvents === 0) return getDefaultSignalSummary();

    const [eventRows, sourceRows, entityRows] = await Promise.all([
      query<{ event_type: string; cnt: number }>(
        `SELECT event_type, COUNT(*)::int AS cnt
         FROM signal_events
         WHERE org_id = $1 AND created_at > NOW() - INTERVAL '24 hours'
         GROUP BY event_type
         ORDER BY cnt DESC`,
        [orgId]
      ),
      query<{ source_type: string; cnt: number }>(
        `SELECT source_type, COUNT(*)::int AS cnt
         FROM signal_events
         WHERE org_id = $1 AND created_at > NOW() - INTERVAL '24 hours'
         GROUP BY source_type
         ORDER BY cnt DESC`,
        [orgId]
      ),
      query<{ entity_type: string | null; cnt: number }>(
        `SELECT entity_type, COUNT(*)::int AS cnt
         FROM signal_events
         WHERE org_id = $1 AND created_at > NOW() - INTERVAL '24 hours'
         GROUP BY entity_type
         ORDER BY cnt DESC`,
        [orgId]
      ),
    ]);

    const event_breakdown: Record<string, number> = {};
    eventRows.rows.forEach((r) => (event_breakdown[r.event_type || "unknown"] = r.cnt));
    const source_breakdown: Record<string, number> = {};
    sourceRows.rows.forEach((r) => (source_breakdown[r.source_type || "unknown"] = r.cnt));
    const entity_breakdown: Record<string, number> = {};
    entityRows.rows.forEach((r) => (entity_breakdown[r.entity_type || "unknown"] = r.cnt));

    // Pull fresh micro_metrics so Pass 1 sees KPIs (trend, benchmarks)
    let microMetricRows: Array<{
      metric_name: string;
      metric_value: number;
      benchmark: number | null;
      trend: number | null;
    }> = [];
    try {
      const metrics = await query<{
        metric_name: string;
        metric_value: number;
        benchmark: number | null;
        trend: number | null;
      }>(
        `SELECT metric_name, metric_value, benchmark, trend
         FROM micro_metrics
         WHERE org_id = $1 AND metric_date >= CURRENT_DATE - INTERVAL '7 days'
         ORDER BY metric_date DESC
         LIMIT 50`,
        [orgId]
      );
      microMetricRows = metrics.rows;
    } catch {
      // micro_metrics may be empty or table not yet migrated
    }

    return {
      window_hours: 24,
      total_events: totalEvents,
      event_breakdown,
      source_breakdown,
      entity_breakdown,
      first_seen: totalRow?.first_seen,
      last_seen: totalRow?.last_seen,
      micro_metrics: microMetricRows,
      sourced_from: "signal_events.live",
    };
  } catch (err) {
    console.warn("[DecisionEngine] Aggregation from signal_events failed:", err);
    return getDefaultSignalSummary();
  }
}

async function getRecentEvents(
  orgId: string
): Promise<Record<string, unknown>[]> {
  try {
    const result = await query<{ data: Record<string, unknown> }>(
      `SELECT data FROM signal_events
       WHERE org_id = $1 AND created_at > NOW() - INTERVAL '24 hours'
       ORDER BY created_at DESC LIMIT 50`,
      [orgId]
    );
    return result.rows.map((r) => r.data);
  } catch {
    console.warn("[DecisionEngine] No recent events found");
    return [];
  }
}

async function getPreviousBriefs(
  orgId: string
): Promise<Record<string, unknown>[]> {
  try {
    const result = await query<{ recommendations: Record<string, unknown> }>(
      `SELECT recommendations FROM decision_briefs
       WHERE org_id = $1
       ORDER BY brief_date DESC LIMIT 7`,
      [orgId]
    );
    return result.rows.map((r) => r.recommendations);
  } catch {
    return [];
  }
}

async function storeBrief(
  orgId: string,
  pass1: Awaited<ReturnType<typeof runPass1>>,
  pass2: Awaited<ReturnType<typeof runPass2>>,
  pass3: Awaited<ReturnType<typeof runPass3>>,
  traceInput: {
    signalSummary: Record<string, unknown>;
    recentEventsCount: number;
    crmContext: Awaited<ReturnType<typeof buildPass2CrmContext>>;
  }
): Promise<string> {
  const { signalSummary, recentEventsCount, crmContext } = traceInput;
  try {
    const result = await queryOne<{ id: string }>(
      `INSERT INTO decision_briefs (
        id, org_id, brief_date, decision_engine_trace, recommendations,
        priority, voice_summary, created_at
      ) VALUES (
        gen_random_uuid(), $1, CURRENT_DATE, $2, $3, $4, $5, NOW()
      ) RETURNING id`,
      [
        orgId,
        JSON.stringify({
          pass1: {
            patterns: pass1.patterns,
            signal_quality_score: pass1.signal_quality_score,
            summary: pass1.summary,
            duration_ms: pass1.duration_ms,
            used_mock: pass1.used_mock,
            signal_summary_source: (signalSummary as { sourced_from?: string }).sourced_from ?? "unknown",
            input_events_count: recentEventsCount,
          },
          pass2: {
            diagnosis: pass2.diagnosis,
            recommendations: pass2.recommendations,
            risk_flags: pass2.risk_flags,
            opportunities: pass2.opportunities,
            duration_ms: pass2.duration_ms,
            used_mock: pass2.used_mock,
            crm_context_snapshot: {
              pipeline_rows: crmContext.pipelineSummary?.length ?? 0,
              activity_rows: crmContext.dailyActivity?.length ?? 0,
              overdue_followups: crmContext.overdueFollowUps?.length ?? 0,
              feedback_events: crmContext.recentFeedback?.length ?? 0,
            },
          },
          pass3: {
            headline: pass3.brief.headline,
            duration_ms: pass3.duration_ms,
            used_mock: pass3.used_mock,
          },
        }),
        JSON.stringify(pass3.brief),
        pass3.brief.actions[0]?.priority || "medium",
        pass3.brief.voice_summary,
      ]
    );
    return result?.id || "unknown";
  } catch (e) {
    console.error("[DecisionEngine] Failed to store brief:", e);
    return "failed-to-store";
  }
}

function getDefaultSignalSummary(): Record<string, unknown> {
  return {
    window_hours: 24,
    total_events: 0,
    event_breakdown: {},
    source_breakdown: {},
    entity_breakdown: {},
    sourced_from: "empty.default",
    note: "No signals in last 24h — connect a source or run the seed script",
  };
}

/**
 * Build the CRM context block Pass 2 reasons over.
 *
 * PASS_2_SYSTEM advertises pipeline_summary, daily_activity, overdue follow-ups,
 * and previous brief feedback. Before PR W those promises were empty. This
 * helper fetches all four in parallel and tolerates missing tables/views so a
 * freshly-migrated org still gets a run instead of a crash.
 */
async function buildPass2CrmContext(orgId: string): Promise<{
  pipelineSummary: Record<string, unknown>[];
  dailyActivity: Record<string, unknown>[];
  overdueFollowUps: Record<string, unknown>[];
  recentFeedback: Record<string, unknown>[];
}> {
  const [pipelineRes, activityRes, overdueRes, feedbackRows] = await Promise.allSettled([
    getPipelineSummary(orgId),
    getDailyActivity(orgId),
    getOverdueFollowUps(orgId, 30),
    getRecentFeedback(orgId, 10),
  ]);

  const pipelineSummary =
    pipelineRes.status === "fulfilled"
      ? (pipelineRes.value.rows as unknown as Record<string, unknown>[])
      : [];
  const dailyActivity =
    activityRes.status === "fulfilled"
      ? (activityRes.value.rows as unknown as Record<string, unknown>[])
      : [];
  // Overdue follow-ups: keep only the fields Claude needs — stripping
  // operator-PII like phone/email keeps the prompt tight and reduces token cost.
  const overdueFollowUps =
    overdueRes.status === "fulfilled"
      ? (overdueRes.value.rows as unknown as Array<Record<string, unknown>>).map((r) => ({
          id: r.id,
          service_type: r.service_type,
          status: r.status,
          priority: r.priority,
          estimated_value: r.estimated_value,
          follow_up_date: r.follow_up_date,
          days_overdue:
            r.follow_up_date
              ? Math.floor(
                  (Date.now() - new Date(r.follow_up_date as string).getTime()) /
                    86400000
                )
              : null,
        }))
      : [];
  const recentFeedback =
    feedbackRows.status === "fulfilled"
      ? (feedbackRows.value as unknown as Record<string, unknown>[])
      : [];

  if (pipelineRes.status === "rejected") {
    console.warn("[DecisionEngine] crm_pipeline_summary query failed:", pipelineRes.reason);
  }
  if (activityRes.status === "rejected") {
    console.warn("[DecisionEngine] crm_daily_activity query failed:", activityRes.reason);
  }
  if (overdueRes.status === "rejected") {
    console.warn("[DecisionEngine] overdue follow-ups query failed:", overdueRes.reason);
  }
  if (feedbackRows.status === "rejected") {
    console.warn("[DecisionEngine] feedback_events query failed:", feedbackRows.reason);
  }

  return { pipelineSummary, dailyActivity, overdueFollowUps, recentFeedback };
}