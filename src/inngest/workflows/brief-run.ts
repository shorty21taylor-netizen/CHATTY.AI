import { inngest } from "../client";
import { runDecisionEngine } from "@/lib/decision-engine";
import { queryOne } from "@/lib/db";
import { db } from "@/lib/db/drizzle";
import { businessProfile, briefPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";

export const briefRun = inngest.createFunction(
  {
    id: "brief-run",
    name: "Run Daily Brief for Org",
    retries: 1,
    concurrency: {
      limit: 25,
      key: "event.data.orgId",
    },
  },
  { event: "brief/run" },
  async ({ event, step }) => {
    const { orgId } = event.data as { orgId: string };

    const existing = await step.run("check-idempotency", async () => {
      const row = await queryOne<{ id: string }>(
        `SELECT id FROM decision_briefs
         WHERE org_id = $1 AND brief_date = CURRENT_DATE
         LIMIT 1`,
        [orgId],
      );
      return row?.id || null;
    });

    if (existing) {
      return { skipped: true, briefId: existing, reason: "already_generated_today" };
    }

    const orgContext = await step.run("load-org-context", async () => {
      const [profile] = await db
        .select({
          companyName: businessProfile.companyName,
          primaryServiceType: businessProfile.primaryServiceType,
        })
        .from(businessProfile)
        .where(eq(businessProfile.orgId, orgId))
        .limit(1);

      return {
        operatorName: profile?.companyName || "Operator",
        vertical: profile?.primaryServiceType || "home_services",
      };
    });

    const result = await step.run("run-decision-engine", async () => {
      return runDecisionEngine(orgId, {
        vertical: orgContext.vertical,
        operatorName: orgContext.operatorName,
      });
    });

    await step.sendEvent("queue-brief-delivery", {
      name: "brief/deliver",
      data: {
        orgId,
        briefId: result.briefId,
        brief: result.brief,
      },
    });

    return {
      skipped: false,
      briefId: result.briefId,
      headline: result.brief.headline,
      totalDurationMs: result.totalDurationMs,
    };
  },
);
