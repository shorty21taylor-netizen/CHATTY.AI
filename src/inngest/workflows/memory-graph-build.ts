import { inngest } from "../client";
import { query as rawQuery } from "@/lib/db";
import { upsertNode } from "@/lib/memory-graph/nodes";
import { linkNodes } from "@/lib/memory-graph/edges";
import { derivePlaybooksFromHistory } from "@/lib/playbooks/inference";

export const memoryGraphBuild = inngest.createFunction(
  {
    id: "memory-graph-build",
    name: "Nightly Memory Graph Build",
    concurrency: { limit: 1 },
  },
  { cron: "0 2 * * *" },
  async ({ step }) => {
    const orgs = await step.run("list-active-orgs", async () => {
      const result = await rawQuery(
        `SELECT DISTINCT org_id FROM signal_events
         WHERE created_at > NOW() - INTERVAL '24 hours'`,
        [],
      );
      return result.rows.map((r: { org_id: string }) => r.org_id);
    });

    let totalNodes = 0;
    let totalEdges = 0;

    for (const orgId of orgs) {
      const counts = await step.run(`build-graph-${orgId}`, async () => {
        return buildGraphForOrg(orgId);
      });
      totalNodes += counts.nodes;
      totalEdges += counts.edges;
    }

    const dayOfWeek = new Date().getDay();
    let playbookResults = {};
    if (dayOfWeek === 0) {
      for (const orgId of orgs) {
        const result = await step.run(`derive-playbooks-${orgId}`, async () => {
          try {
            return await derivePlaybooksFromHistory(orgId);
          } catch (err) {
            console.warn(`[MemoryGraph] Playbook derivation failed for ${orgId}:`, err);
            return { proposed: 0, created: [] };
          }
        });
        playbookResults = { ...playbookResults, [orgId]: result };
      }
    }

    return {
      orgsProcessed: orgs.length,
      totalNodes,
      totalEdges,
      playbookDerivation: dayOfWeek === 0 ? playbookResults : "skipped (not Sunday)",
    };
  },
);

async function buildGraphForOrg(
  orgId: string,
): Promise<{ nodes: number; edges: number }> {
  let nodeCount = 0;
  let edgeCount = 0;

  const events = await rawQuery(
    `SELECT id, event_type, entity_type, entity_id, data, created_at
     FROM signal_events
     WHERE org_id = $1 AND created_at > NOW() - INTERVAL '24 hours'
     ORDER BY created_at`,
    [orgId],
  );

  const entityNodes = new Map<string, string>();

  for (const event of events.rows) {
    const e = event as {
      id: string;
      event_type: string;
      entity_type: string | null;
      entity_id: string | null;
      data: Record<string, unknown>;
      created_at: string;
    };

    if (!e.entity_id || !e.entity_type) continue;

    const nodeType = mapEntityToNodeType(e.entity_type);
    if (!nodeType) continue;

    const summary = buildNodeSummary(e.event_type, e.entity_type, e.data);
    const nodeId = await upsertNode(orgId, nodeType, e.entity_id, summary, e.data);
    entityNodes.set(`${nodeType}:${e.entity_id}`, nodeId);
    nodeCount++;

    const contactId = (e.data as Record<string, unknown>).contact_id as string | undefined;
    if (contactId && nodeType !== "contact") {
      const contactKey = `contact:${contactId}`;
      let contactNodeId = entityNodes.get(contactKey);
      if (!contactNodeId) {
        contactNodeId = await upsertNode(orgId, "contact", contactId, `Contact ${contactId}`, {});
        entityNodes.set(contactKey, contactNodeId);
        nodeCount++;
      }

      const edgeType = e.event_type.includes("converted") || e.event_type.includes("accepted")
        ? "converted" as const
        : "touched" as const;

      await linkNodes(orgId, contactNodeId, nodeId, edgeType, 1, {
        event_type: e.event_type,
      });
      edgeCount++;
    }

    const leadId = (e.data as Record<string, unknown>).lead_id as string | undefined;
    if (leadId && e.entity_id !== leadId) {
      const leadKey = `opportunity:${leadId}`;
      let leadNodeId = entityNodes.get(leadKey);
      if (!leadNodeId) {
        leadNodeId = await upsertNode(orgId, "opportunity", leadId, `Lead ${leadId}`, {});
        entityNodes.set(leadKey, leadNodeId);
        nodeCount++;
      }
      await linkNodes(orgId, nodeId, leadNodeId, "followed_by", 1, {
        event_type: e.event_type,
      });
      edgeCount++;
    }
  }

  return { nodes: nodeCount, edges: edgeCount };
}

function mapEntityToNodeType(entityType: string): "contact" | "opportunity" | "agent_run" | "brief" | "outcome" | null {
  switch (entityType) {
    case "contact": return "contact";
    case "lead":
    case "estimate":
    case "opportunity": return "opportunity";
    case "agent_run": return "agent_run";
    case "brief": return "brief";
    case "job":
    case "outcome": return "outcome";
    default: return null;
  }
}

function buildNodeSummary(
  eventType: string,
  entityType: string,
  data: Record<string, unknown>,
): string {
  const parts = [`${eventType} on ${entityType}`];
  if (data.title) parts.push(`"${data.title}"`);
  if (data.status) parts.push(`status: ${data.status}`);
  if (data.estimated_value) parts.push(`value: $${data.estimated_value}`);
  if (data.service_type) parts.push(`service: ${data.service_type}`);
  return parts.join(" | ");
}
