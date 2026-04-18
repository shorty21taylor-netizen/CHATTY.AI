import { query, queryOne } from "@/lib/db";
import { generateEmbedding } from "@/lib/utils/embedding";

export type NodeType = "contact" | "opportunity" | "agent_run" | "brief" | "outcome";

export interface MemoryNode {
  id: string;
  org_id: string;
  node_type: NodeType;
  entity_id: string;
  summary: string | null;
  data: Record<string, unknown>;
  relevance_score: number;
  last_referenced_at: string | null;
  created_at: string;
}

export async function upsertNode(
  orgId: string,
  nodeType: NodeType,
  entityId: string,
  summary: string,
  data: Record<string, unknown> = {},
  embedding?: number[],
): Promise<string> {
  const emb = embedding && embedding.length > 0
    ? embedding
    : await generateEmbedding(summary);

  const embValue = emb.length > 0 ? `[${emb.join(",")}]` : null;

  const result = await queryOne<{ id: string }>(
    `INSERT INTO memory_nodes (org_id, node_type, entity_id, summary, embedding, data, last_referenced_at)
     VALUES ($1, $2, $3, $4, $5::vector, $6, now())
     ON CONFLICT (org_id, node_type, entity_id)
     DO UPDATE SET
       summary = EXCLUDED.summary,
       embedding = COALESCE(EXCLUDED.embedding, memory_nodes.embedding),
       data = memory_nodes.data || EXCLUDED.data,
       last_referenced_at = now(),
       updated_at = now()
     RETURNING id`,
    [orgId, nodeType, entityId, summary, embValue, JSON.stringify(data)],
  );

  return result?.id || "unknown";
}

export async function getNode(
  orgId: string,
  nodeType: NodeType,
  entityId: string,
): Promise<MemoryNode | null> {
  return queryOne<MemoryNode>(
    `SELECT id, org_id, node_type, entity_id, summary, data, relevance_score,
            last_referenced_at, created_at
     FROM memory_nodes
     WHERE org_id = $1 AND node_type = $2 AND entity_id = $3`,
    [orgId, nodeType, entityId],
  );
}

export async function searchNodes(
  orgId: string,
  queryText: string,
  limit = 20,
): Promise<(MemoryNode & { similarity: number })[]> {
  const embedding = await generateEmbedding(queryText);
  if (embedding.length === 0) {
    return searchNodesByText(orgId, queryText, limit);
  }

  const embStr = `[${embedding.join(",")}]`;
  const result = await query<MemoryNode & { similarity: number }>(
    `SELECT id, org_id, node_type, entity_id, summary, data, relevance_score,
            last_referenced_at, created_at,
            1 - (embedding <=> $2::vector) AS similarity
     FROM memory_nodes
     WHERE org_id = $1 AND embedding IS NOT NULL
     ORDER BY embedding <=> $2::vector
     LIMIT $3`,
    [orgId, embStr, limit],
  );
  return result.rows;
}

async function searchNodesByText(
  orgId: string,
  queryText: string,
  limit: number,
): Promise<(MemoryNode & { similarity: number })[]> {
  const result = await query<MemoryNode & { similarity: number }>(
    `SELECT id, org_id, node_type, entity_id, summary, data, relevance_score,
            last_referenced_at, created_at,
            0.5 AS similarity
     FROM memory_nodes
     WHERE org_id = $1 AND summary ILIKE '%' || $2 || '%'
     ORDER BY last_referenced_at DESC NULLS LAST
     LIMIT $3`,
    [orgId, queryText, limit],
  );
  return result.rows;
}
