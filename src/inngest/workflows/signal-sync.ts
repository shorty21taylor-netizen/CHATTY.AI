import { inngest } from "../client";
import { query } from "@/lib/db";

/**
 * Signal Sync Workflow
 *
 * Runs every 30 minutes. Fetches new signals from active sources
 * and ingests them into signal_events.
 */
export const signalSync = inngest.createFunction(
  {
    id: "signal-sync",
    name: "Sync Signal Sources",
    concurrency: { limit: 1 },
  },
  { cron: "*/30 * * * *" },
  async ({ step }) => {
    // Step 1: Get all active signal sources
    const sources = await step.run("get-active-sources", async () => {
      try {
        const result = await query<{
          id: string;
          org_id: string;
          source_type: string;
          config: Record<string, unknown>;
        }>(
          `SELECT id, org_id, source_type, config
           FROM signal_sources
           WHERE is_active = true AND source_type != 'internal_crm'
           LIMIT 500`,
          []
        );
        return result.rows;
      } catch {
        console.warn("[SignalSync] No signal sources table or no active sources");
        return [];
      }
    });

    if (sources.length === 0) {
      return { synced: 0, message: "No active signal sources" };
    }

    // Step 2: Sync each source
    let totalSynced = 0;
    for (const source of sources) {
      const count = await step.run(
        `sync-${source.source_type}-${source.id}`,
        async () => {
          try {
            // For now, just update the last_sync_at timestamp
            // Real adapters will be added as CRM integrations are built
            await query(
              `UPDATE signal_sources SET last_sync_at = NOW() WHERE id = $1`,
              [source.id]
            );
            return 0; // No new events until adapters are built
          } catch (e) {
            console.error(`[SignalSync] Failed to sync ${source.source_type}:`, e);
            return 0;
          }
        }
      );
      totalSynced += count;
    }

    return { synced: totalSynced, sources: sources.length };
  }
);
