import { getNode, type MemoryNode } from "./nodes";
import { getNeighbors, type Neighbor } from "./edges";
import { query } from "@/lib/db";

export interface EgoGraph {
  center: MemoryNode;
  neighbors: Neighbor[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    nodeTypes: Record<string, number>;
  };
}

export async function buildGraphAroundContact(
  orgId: string,
  contactId: string,
): Promise<EgoGraph | null> {
  const center = await getNode(orgId, "contact", contactId);
  if (!center) return null;

  const neighbors = await getNeighbors(orgId, center.id, 2);

  const nodeTypes: Record<string, number> = { contact: 1 };
  for (const n of neighbors) {
    nodeTypes[n.node_type] = (nodeTypes[n.node_type] || 0) + 1;
  }

  return {
    center,
    neighbors,
    stats: {
      totalNodes: 1 + neighbors.length,
      totalEdges: neighbors.length,
      nodeTypes,
    },
  };
}

export interface GraphSnapshot {
  nodes: { id: string; type: string; entity_id: string; summary: string | null; relevance: number }[];
  edges: { from: string; to: string; type: string; weight: number }[];
}

export async function getOrgGraph(
  orgId: string,
  limit = 200,
): Promise<GraphSnapshot> {
  const nodesResult = await query<{
    id: string;
    node_type: string;
    entity_id: string;
    summary: string | null;
    relevance_score: number;
  }>(
    `SELECT id, node_type, entity_id, summary, relevance_score
     FROM memory_nodes
     WHERE org_id = $1
     ORDER BY last_referenced_at DESC NULLS LAST
     LIMIT $2`,
    [orgId, limit],
  );

  const nodeIds = nodesResult.rows.map((n) => n.id);
  if (nodeIds.length === 0) {
    return { nodes: [], edges: [] };
  }

  const edgesResult = await query<{
    from_node: string;
    to_node: string;
    edge_type: string;
    weight: number;
  }>(
    `SELECT from_node, to_node, edge_type, weight
     FROM memory_edges
     WHERE org_id = $1 AND from_node = ANY($2) AND to_node = ANY($2)`,
    [orgId, nodeIds],
  );

  return {
    nodes: nodesResult.rows.map((n) => ({
      id: n.id,
      type: n.node_type,
      entity_id: n.entity_id,
      summary: n.summary,
      relevance: Number(n.relevance_score),
    })),
    edges: edgesResult.rows.map((e) => ({
      from: e.from_node,
      to: e.to_node,
      type: e.edge_type,
      weight: Number(e.weight),
    })),
  };
}
