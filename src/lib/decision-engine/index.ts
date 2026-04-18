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
import { getBusinessProfile } from "@/lib/business-profile";

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

  // Pass 1: Signal Analysis
  console.log("[DecisionEngine] Running Pass 1: Signal Analysis...");
  const pass1 = await runPass1({
    orgId,
    signalSummary,
    recentEvents,
    externalContext: {},
  });
  console.log(
    `[DecisionEngine] Pass 1 complete: ${pass1.patterns.length} patterns found (${pass1.duration_ms}ms)`
  );

  // Pass 2: Pattern Recognition
  console.log("[DecisionEngine] Running Pass 2: Pattern Recognition...");
  const pass2 = await runPass2(pass1, previousBriefs, profileContext);
  console.log(
    `[DecisionEngine] Pass 2 complete: ${pass2.recommendations.length} recommendations (${pass2.duration_ms}ms)`
  );

  // Pass 3: Brief Generation
  console.log("[DecisionEngine] Running Pass 3: Brief Generation...");
  const pass3 = await runPass3(pass2, resolvedName, resolvedVertical);
  console.log(
    `[DecisionEngine] Pass 3 complete: "${pass3.brief.headline}" (${pass3.duration_ms}ms)`
  );

  // Store the brief in the database
  const briefId = await storeBrief(orgId, pass1, pass2, pass3);

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
  try {
    const result = await queryOne<{ signal_summary: Record<string, unknown> }>(
      `SELECT signal_summary FROM unified_context
       WHERE org_id = $1 AND context_date = CURRENT_DATE
       ORDER BY created_at DESC LIMIT 1`,
      [orgId]
    );
    return result?.signal_summary || getDefaultSignalSummary();
  } catch {
    console.warn("[DecisionEngine] No unified context found, using defaults");
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
  pass3: Awaited<ReturnType<typeof runPass3>>
): Promise<string> {
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
          },
          pass2: {
            diagnosis: pass2.diagnosis,
            recommendations: pass2.recommendations,
            risk_flags: pass2.risk_flags,
            opportunities: pass2.opportunities,
            duration_ms: pass2.duration_ms,
          },
          pass3: {
            headline: pass3.brief.headline,
            duration_ms: pass3.duration_ms,
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
    new_leads: 0,
    total_spend: 0,
    calls_received: 0,
    emails_opened: 0,
    appointments_booked: 0,
    note: "No signals ingested yet — connect your first data source",
  };
}