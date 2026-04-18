import { query, queryOne } from "@/lib/db";

export type EdgeType = "touched" | "converted" | "followed_by" | "caused" | "similar_to";

export interface MemoryEdge {
  id: string;
  org_id: string;
  from_node: string;
  to_node: string;
  edge_type: EdgeType;
  weight: number;
  data: Record<string, unknown>;
  created_at: string;
}

export interface Neighbor {
  node_id: string;
  node_type: string;
  entity_id: string;
  summary: string | null;
  edge_type: EdgeType;
  weight: number;
  direction: "outgoing" | "incoming";
}

export async function linkNodes(
  orgId: string,
  fromId: string,
  toId: string,
  edgeType: EdgeType,
  weight = 1,
  data: Record<string, unknown> = {},
): Promise<string> {
  const result = await queryOne<{ id: string }>(
    `INSERT INTO memory_edges (org_id, from_node, to_node, edge_type, weight, data)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (org_id, from_node, to_node, edge_type)
     DO UPDATE SET
       weight = memory_edges.weight + $5,
       data = memory_edges.data || EXCLUDED.data
     RETURNING id`,
    [orgId, fromId, toId, edgeType, weight, JSON.stringify(data)],
  );
  return result?.id || "unknown";
}

export async function getNeighbors(
  orgId: string,
  nodeId: string,
  depth = 1,
): Promise<Neighbor[]> {
  if (depth <= 1) {
    return getDirectNeighbors(orgId, nodeId);
  }

  const visited = new Set<string>([nodeId]);
  let frontier = [nodeId];
  const allNeighbors: Neighbor[] = [];

  for (let d = 0; d < depth; d++) {
    const nextFrontier: string[] = [];
    for (const nid of frontier) {
      const neighbors = await getDirectNeighbors(orgId, nid);
      for (const n of neighbors) {
        if (!visited.has(n.node_id)) {
          visited.add(n.node_id);
          nextFrontier.push(n.node_id);
          allNeighbors.push(n);
        }
      }
    }
    frontier = nextFrontier;
    if (frontier.length === 0) break;
  }

  return allNeighbors;
}

async function getDirectNeighbors(
  orgId: string,
  nodeId: string,
): Promise<Neighbor[]> {
  const result = await query<Neighbor>(
    `SELECT
       n.id AS node_id,
       n.node_type,
       n.entity_id,
       n.summary,
       e.edge_type,
       e.weight,
       CASE WHEN e.from_node = $2 THEN 'outgoing' ELSE 'incoming' END AS direction
     FROM memory_edges e
     JOIN memory_nodes n ON n.id = CASE WHEN e.from_node = $2 THEN e.to_node ELSE e.from_node END
     WHERE e.org_id = $1 AND (e.from_node = $2 OR e.to_node = $2)
     ORDER BY e.weight DESC`,
    [orgId, nodeId],
  );
  return result.rows;
}
