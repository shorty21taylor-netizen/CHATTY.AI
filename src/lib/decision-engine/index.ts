import { runPass1, type Pass1Result } from "./pass-1-signal-analysis";
import { runPass2, type Pass2Result } from "./pass-2-pattern-recognition";
import { runPass3, type Pass3Result } from "./pass-3-brief-generation";
import { getOrCreateContext, updateContext, getRecentEvents, getRecentBriefs, insertBrief } from "../db/queries";
import type { DecisionTrace } from "../db/types";

export interface DecisionRunResult { briefId: string; pass1: Pass1Result; pass2: Pass2Result; pass3: Pass3Result; totalDurationMs: number; }

export async function runDecisionEngine(orgId: string, options: { vertical?: string; operatorName?: string; date?: string } = {}): Promise<DecisionRunResult> {
  const date = options.date || new Date().toISOString().split("T")[0];
  const vertical = options.vertical || "general";
  const operatorName = options.operatorName || "Operator";
  const startTime = Date.now();
  console.log(`[Decision Engine] Starting 3-pass run for org=${orgId}`);

  const context = await getOrCreateContext(orgId, date);
  const recentEvents = await getRecentEvents(orgId, 100);
  const previousBriefs = await getRecentBriefs(orgId, 7);
  await updateContext(context.id, { recent_events: recentEvents, previous_briefs: previousBriefs.map((b:any)=>({date:b.brief_date,recommendations:b.recommendations,priority:b.priority})) });
  const updatedContext = await getOrCreateContext(orgId, date);

  const pass1 = await runPass1(updatedContext);
  const pass2 = await runPass2(pass1, previousBriefs as any, vertical);
  const pass3 = await runPass3(pass2, operatorName, vertical, date);
  const totalDurationMs = Date.now() - startTime;

  const trace: DecisionTrace = { pass1: {...pass1,timestamp:pass1.timestamp}, pass2: {...pass2,timestamp:pass2.timestamp}, pass3: {...pass3,timestamp:pass3.timestamp}, total_duration_ms: totalDurationMs };
  const brief = await insertBrief(orgId, { brief_date: date, context_id: context.id, decision_engine_trace: trace, recommendations: pass3.recommendations, priority: pass3.priority, voice_summary: pass3.voice_text });
  return { briefId: brief!.id, pass1, pass2, pass3, totalDurationMs };
}
