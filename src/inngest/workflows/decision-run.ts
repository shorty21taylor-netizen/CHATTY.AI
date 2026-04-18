import { inngest } from "../client";
import { runDecisionEngine } from "@/lib/decision-engine";
import { query } from "@/lib/db";

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
    // Discover all orgs that have at least one active signal source OR recent signal_events
    // (so newly-onboarded orgs without a source connection but with seeded data still run).
    const activeOrgs = await step.run("get-active-orgs", async () => {
      const rows = await query<{
        org_id: string;
        operator_name: string | null;
        vertical: string | null;
      }>(
        `WITH org_pool AS (
           SELECT DISTINCT org_id FROM signal_sources WHERE is_active = true
           UNION
           SELECT DISTINCT org_id FROM signal_events
           WHERE created_at > NOW() - INTERVAL '7 days'
         )
         SELECT
           op.org_id,
           bp.owner_first_name AS operator_name,
           COALESCE(bp.primary_service_type, 'home_services') AS vertical
         FROM org_pool op
         LEFT JOIN business_profile bp ON bp.org_id::text = op.org_id::text`,
        []
      );
      return rows.rows.map((r) => ({
        orgId: r.org_id,
        operatorName: r.operator_name ?? "Operator",
        vertical: (r.vertical ?? "home_services").toLowerCase(),
      }));
    });

    if (activeOrgs.length === 0) {
      return { triggered: 0, note: "no active orgs found" };
    }

    // Trigger decision run for each org
    const events = activeOrgs.map((org) => ({
      name: "decision/run" as const,
      data: {
        orgId: org.orgId,
        operatorName: org.operatorName,
        vertical: org.vertical,
      },
    }));

    await step.sendEvent("trigger-all-orgs", events);

    return { triggered: activeOrgs.length };
  }
);
