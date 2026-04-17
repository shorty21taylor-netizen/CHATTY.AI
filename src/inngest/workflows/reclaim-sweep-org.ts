import { inngest } from "../client";
import { query } from "@/lib/db";
import { withOrgContext } from "@/lib/db/drizzle";
import { orgReclaimState } from "@/db/schema";
import { sql } from "drizzle-orm";
import {
  emitLeadDormant,
  emitEstimateGhosted,
  emitCustomerDormant,
} from "@/lib/signals/adapters/internal-crm";

interface ReclaimConfig {
  dead_lead_days?: number;
  ghosted_bid_days?: number;
  past_customer_days?: number;
  past_customer_quiet_days?: number;
}

const DEFAULTS: Required<ReclaimConfig> = {
  dead_lead_days: 30,
  ghosted_bid_days: 14,
  past_customer_days: 180,
  past_customer_quiet_days: 90,
};

export const reclaimSweepOrg = inngest.createFunction(
  {
    id: "reclaim-sweep-org",
    name: "Reclaim Sweep Per-Org",
    retries: 2,
    concurrency: {
      limit: 20,
      key: "event.data.orgId",
    },
  },
  { event: "reclaim/sweep-org" },
  async ({ event, step }) => {
    const { orgId } = event.data;

    const config = await step.run("load-config", async () => {
      const row = await query<{ reclaim_config: ReclaimConfig | null }>(
        `SELECT (config->>'reclaim_config')::jsonb AS reclaim_config
         FROM business_profile WHERE org_id = $1 LIMIT 1`,
        [orgId],
      );
      return { ...DEFAULTS, ...(row.rows[0]?.reclaim_config ?? {}) };
    });

    const [deadLeads, ghostedBids, pastCustomers] = await Promise.all([
      step.run("sweep-dead-leads", async () => {
        const result = await query<{
          id: string;
          contact_id: string;
          title: string | null;
          service_type: string | null;
          status: string;
          priority: string | null;
          estimated_value: string | null;
        }>(
          `SELECT l.id, l.contact_id, l.title, l.service_type, l.status,
                  l.priority, l.estimated_value
           FROM leads l
           LEFT JOIN contact_suppressions cs
             ON cs.contact_id = l.contact_id::uuid AND cs.org_id = l.org_id::uuid
           WHERE l.org_id = $1
             AND l.status IN ('new', 'contacted')
             AND l.updated_at < NOW() - make_interval(days => $2)
             AND cs.id IS NULL
           ORDER BY l.updated_at ASC
           LIMIT 50`,
          [orgId, config.dead_lead_days],
        );

        let dispatched = 0;
        for (const lead of result.rows) {
          try {
            await emitLeadDormant(orgId, {
              id: lead.id,
              contact_id: lead.contact_id,
              title: lead.title,
              service_type: lead.service_type,
              status: lead.status,
              priority: lead.priority,
              estimated_value: lead.estimated_value,
            });
            dispatched++;
          } catch (err) {
            console.error("[reclaim-sweep] dead lead emit failed:", err);
          }
        }
        return { found: result.rows.length, dispatched };
      }),

      step.run("sweep-ghosted-bids", async () => {
        const result = await query<{
          id: string;
          contact_id: string;
          title: string | null;
          total: string | null;
          estimate_number: string | null;
          sent_at: string | null;
        }>(
          `SELECT e.id, e.contact_id, e.title, e.total, e.estimate_number, e.sent_at
           FROM estimates e
           LEFT JOIN contact_suppressions cs
             ON cs.contact_id = e.contact_id::uuid AND cs.org_id = e.org_id::uuid
           WHERE e.org_id = $1
             AND e.status = 'sent'
             AND e.sent_at < NOW() - make_interval(days => $2)
             AND cs.id IS NULL
             AND NOT EXISTS (
               SELECT 1 FROM agent_activity aa
               JOIN agent_runs ar ON ar.id = aa.agent_run_id
               WHERE ar.contact_id = e.contact_id::uuid
                 AND aa.action_type = 'receive_sms'
                 AND aa.created_at > e.sent_at
             )
           ORDER BY e.sent_at ASC
           LIMIT 50`,
          [orgId, config.ghosted_bid_days],
        );

        let dispatched = 0;
        for (const est of result.rows) {
          try {
            await emitEstimateGhosted(orgId, {
              id: est.id,
              contact_id: est.contact_id,
              title: est.title,
              total: est.total,
              estimate_number: est.estimate_number,
              sent_at: est.sent_at,
            });
            dispatched++;
          } catch (err) {
            console.error("[reclaim-sweep] ghosted bid emit failed:", err);
          }
        }
        return { found: result.rows.length, dispatched };
      }),

      step.run("sweep-past-customers", async () => {
        const result = await query<{
          id: string;
          contact_id: string;
          title: string | null;
          service_type: string | null;
          job_value: string | null;
          completed_at: string | null;
        }>(
          `SELECT j.id, j.contact_id, j.title, j.service_type, j.job_value, j.completed_at
           FROM jobs j
           LEFT JOIN contact_suppressions cs
             ON cs.contact_id = j.contact_id::uuid AND cs.org_id = j.org_id::uuid
           WHERE j.org_id = $1
             AND j.status = 'completed'
             AND j.completed_at < NOW() - make_interval(days => $2)
             AND cs.id IS NULL
             AND NOT EXISTS (
               SELECT 1 FROM agent_activity aa
               JOIN agent_runs ar ON ar.id = aa.agent_run_id
               WHERE ar.contact_id = j.contact_id::uuid
                 AND aa.created_at > NOW() - make_interval(days => $3)
             )
           ORDER BY j.completed_at ASC
           LIMIT 50`,
          [orgId, config.past_customer_days, config.past_customer_quiet_days],
        );

        let dispatched = 0;
        for (const job of result.rows) {
          try {
            await emitCustomerDormant(orgId, {
              id: job.id,
              contact_id: job.contact_id,
              title: job.title,
              service_type: job.service_type,
              job_value: job.job_value,
              completed_at: job.completed_at,
            });
            dispatched++;
          } catch (err) {
            console.error("[reclaim-sweep] past customer emit failed:", err);
          }
        }
        return { found: result.rows.length, dispatched };
      }),
    ]);

    await step.run("update-sweep-state", async () => {
      return withOrgContext(orgId, async (tx) => {
        await tx
          .insert(orgReclaimState)
          .values({
            orgId,
            lastSweepAt: sql`now()`,
            sweepResults: {
              dead_leads: deadLeads,
              ghosted_bids: ghostedBids,
              past_customers: pastCustomers,
            },
          })
          .onConflictDoUpdate({
            target: orgReclaimState.orgId,
            set: {
              lastSweepAt: sql`now()`,
              sweepResults: {
                dead_leads: deadLeads,
                ghosted_bids: ghostedBids,
                past_customers: pastCustomers,
              },
              updatedAt: sql`now()`,
            },
          });
      });
    });

    return {
      status: "completed",
      orgId,
      deadLeads,
      ghostedBids,
      pastCustomers,
    };
  },
);
