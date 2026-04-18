import { inngest } from "../client";
import { runDecisionEngine } from "@/lib/decision-engine";

/**
 * Decision Run Workflow
 *
 * Triggered by POST /api/decision/trigger or the daily cron.
 * Runs the 3-pass Claude chain and stores the brief.
 */
export const decisionRun = inngest.createFunction(
  {
    id: "decision-run",
    name: "Run Decision Engine",
    retries: 1,
    concurrency: {
      limit: 5,
      key: "event.data.orgId",
    },
  },
  { event: "decision/run" },
  async ({ event, step }) => {
    const { orgId, vertical, operatorName } = event.data;

    // Step 1: Run the 3-pass decision engine
    const result = await step.run("run-decision-engine", async () => {
      return await runDecisionEngine(orgId, { vertical, operatorName });
    });

    // Step 2: Queue brief delivery
    await step.sendEvent("queue-brief-delivery", {
      name: "brief/deliver",
      data: {
        orgId,
        briefId: result.briefId,
        brief: result.brief,
      },
    });

    return {
      briefId: result.briefId,
      headline: result.brief.headline,
      totalDurationMs: result.totalDurationMs,
    };
  }
);

/**
 * Daily Decision Trigger — runs at 5:30am every day
 * Triggers a decision run for all active organizations.
 */
export const dailyDecisionTrigger = inngest.createFunction(
  {
    id: "daily-decision-trigger",
    name: "Daily Decision Trigger",
    concurrency: { limit: 1 },
  },
  { cron: "30 5 * * *" },
  async ({ step }) => {
    // In production, query all active orgs from the database
    // For now, we'll use a placeholder
    const activeOrgs = await step.run("get-active-orgs", async () => {
      // TODO: Query signal_sources for distinct active org_ids
      return [{ orgId: "org_demo_harbor_dental", operatorName: "Harbor Dental" }];
    });

    // Trigger decision run for each org
    const events = activeOrgs.map((org) => ({
      name: "decision/run" as const,
      data: {
        orgId: org.orgId,
        operatorName: org.operatorName,
        vertical: "home_services",
      },
    }));

    await step.sendEvent("trigger-all-orgs", events);

    return { triggered: activeOrgs.length };
  }
);
