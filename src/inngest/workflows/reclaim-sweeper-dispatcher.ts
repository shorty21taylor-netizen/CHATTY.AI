import { inngest } from "../client";
import { query } from "@/lib/db";

export const reclaimSweeperDispatcher = inngest.createFunction(
  {
    id: "reclaim-sweeper-dispatcher",
    name: "Reclaim Sweeper Dispatcher",
    retries: 2,
    concurrency: { limit: 1 },
  },
  { cron: "0 8 * * *" },
  async ({ step }) => {
    const orgIds = await step.run("load-active-orgs", async () => {
      const result = await query<{ org_id: string }>(
        `SELECT DISTINCT org_id::text FROM business_profile WHERE org_id IS NOT NULL`
      );
      return result.rows.map((r) => r.org_id);
    });

    if (orgIds.length === 0) {
      return { status: "no_orgs", dispatched: 0 };
    }

    await step.run("fan-out", async () => {
      const events = orgIds.map((orgId) => ({
        name: "reclaim/sweep-org" as const,
        data: { orgId },
      }));
      await inngest.send(events);
    });

    return { status: "dispatched", orgCount: orgIds.length };
  },
);
