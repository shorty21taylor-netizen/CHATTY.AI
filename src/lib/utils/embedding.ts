// ─── Voyage AI Vector Embeddings ────────────────────────────────
// Used for semantic search over signal_events via pgvector.

const VOYAGE_BASE_URL = "https://api.voyageai.com/v1";

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = process.env.VOYAGE_MODEL || "voyage-3";
  const apiKey = process.env.VOYAGE_API_KEY;

  if (!apiKey) {
    console.warn("[Embedding] VOYAGE_API_KEY not set, skipping embedding");
    return [];
  }

  const response = await fetch(`${VOYAGE_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: [text],
      model,
      input_type: "document",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`[Embedding] Voyage AI error (${response.status}): ${error}`);
    return [];
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const model = process.env.VOYAGE_MODEL || "voyage-3";
  const apiKey = process.env.VOYAGE_API_KEY;

  if (!apiKey) {
    console.warn("[Embedding] VOYAGE_API_KEY not set, skipping embeddings");
    return texts.map(() => []);
  }

  // Voyage AI supports batch of up to 128 texts
  const batchSize = 128;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await fetch(`${VOYAGE_BASE_URL}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: batch,
        model,
        input_type: "document",
      }),
    });

    if (!response.ok) {
      console.error(`[Embedding] Batch ${i} failed`);
      allEmbeddings.push(...batch.map(() => []));
      continue;
    }

    const data = await response.json();
    allEmbeddings.push(...data.data.map((d: any) => d.embedding));
  }

  return allEmbeddings;
}

/**
 * Create a searchable text representation of a signal event for embedding.
 */
export function eventToEmbeddingText(event: {
  event_type: string;
  entity_type?: string;
  data: Record<string, any>;
}): string {
  const parts = [
    `Event: ${event.event_type}`,
    event.entity_type ? `Entity: ${event.entity_type}` : "",
    ...Object.entries(event.data)
      .filter(([_, v]) => v !== null && v !== undefined)
      .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`),
  ];
  return parts.filter(Boolean).join(" | ");
}
