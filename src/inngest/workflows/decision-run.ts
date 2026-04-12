import { inngest } from "../client";
import { runDecisionEngine } from "@/lib/decision-engine";

export const decisionRun = inngest.createFunction(
  { id: "decision-run", name: "Decision Engine Run" },
  { event: "decision/trigger" },
  async ({ event, step }) => {
    const { orgId, vertical, operatorName } = event.data;
    const result = await step.run("run-decision-engine", async () => {
      return await runDecisionEngine(orgId, { vertical: vertical||"general", operatorName: operatorName||"Operator" });
    });
    await step.sendEvent("queue-brief-delivery", { name: "brief/deliver", data: { orgId, briefId: result.briefId, priority: result.pass3.priority } });
    return { briefId: result.briefId, duration_ms: result.totalDurationMs, recommendations: result.pass3.recommendations.length };
  }
);

export const dailyDecisionTrigger = inngest.createFunction(
  { id: "daily-decision-trigger", name: "Daily Decision Trigger" },
  { cron: "30 5 * * *" },
  async ({ step }) => {
    const { query } = await import("@/lib/db");
    const orgs = await step.run("get-orgs", async () => {
      return await query(`SELECT DISTINCT org_id FROM signal_sources WHERE is_active = true`);
    });
    for (const org of orgs) {
      await step.sendEvent(`trigger-${org.org_id}`, { name: "decision/trigger", data: { orgId: org.org_id } });
    }
    return { triggered: orgs.length };
  }
);
