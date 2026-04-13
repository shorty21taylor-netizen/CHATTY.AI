import { inngest } from "../client";
import { getAdapter } from "@/lib/signals/registry";
import { insertSignalEvent, getActiveSourcesByOrg } from "@/lib/db/queries";
import { query } from "@/lib/db";
import { generateEmbedding, eventToEmbeddingText } from "@/lib/utils/embedding";

export const signalSync = inngest.createFunction(
  {
    id: "signal-sync",
    name: "Signal Sync",
    triggers: [{ cron: "*/30 * * * *" }],
  },
  async ({ step }) => {
    const orgs = await step.run("get-active-orgs", async () => {
      const rows = await query(`SELECT DISTINCT org_id FROM signal_sources WHERE is_active = true`);
      return rows.map(r => r.org_id);
    });
    let totalEvents = 0;
    for (const orgId of orgs) {
      const events = await step.run(`sync-org-${orgId}`, async () => {
        const sources = await getActiveSourcesByOrg(orgId);
        let orgEvents = 0;
        for (const source of sources) {
          const adapter = getAdapter(source.source_type);
          if (!adapter) continue;
          try {
            const newEvents = await adapter.fetchNewEvents({ credentials: source.credentials, config: source.config, lastSyncAt: source.last_sync_at });
            for (const event of newEvents) {
              const embText = eventToEmbeddingText(event);
              const emb = await generateEmbedding(embText);
              await insertSignalEvent(orgId, { source_type: source.source_type, event_type: event.event_type, entity_type: event.entity_type, entity_id: event.entity_id, data: event.data, embedding: emb.length > 0 ? emb : undefined });
              orgEvents++;
            }
            await query(`UPDATE signal_sources SET last_sync_at = NOW() WHERE id = $1`, [source.id]);
          } catch (error) { console.error(`Sync error ${source.source_type}:`, error); }
        }
        return orgEvents;
      });
      totalEvents += events;
    }
    return { synced_orgs: orgs.length, total_events: totalEvents };
  }
);
