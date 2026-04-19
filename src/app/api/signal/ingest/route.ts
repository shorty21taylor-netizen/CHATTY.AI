import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { validateBody, signalIngestSchema, ValidationError } from "@/lib/utils/validate";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { insertSignalEvent } from "@/lib/db/queries";
import { getAdapter } from "@/lib/signals/registry";
import { generateEmbedding, eventToEmbeddingText } from "@/lib/utils/embedding";
import { dispatchAgentsForEvent } from "@/lib/agents/dispatcher";

export async function POST(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 120 requests/min per org
    const rl = await rateLimitRequest(orgId, "signal-ingest", { limit: 120 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const data = validateBody(signalIngestSchema, body);

    // Verify source is registered and active
    const adapter = getAdapter(data.source_key);
    if (!adapter) {
      return NextResponse.json(
        { error: `Unknown source type: ${data.source_key}` },
        { status: 400 }
      );
    }

    // Generate vector embedding for semantic search
    const embeddingText = eventToEmbeddingText({
      event_type: data.event_type,
      entity_type: data.entity_type,
      data: data.data,
    });
    const embedding = await generateEmbedding(embeddingText);

    // Store the event
    const event = await insertSignalEvent(orgId, {
      source_type: data.source_key,
      event_type: data.event_type,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      data: data.data,
      embedding: embedding.length > 0 ? embedding : undefined,
    });

    // Fire-and-forget agent dispatch — same pattern as /api/webhooks/meta,
    // /api/forms/[slug]/submit, and the internal-crm adapter. Without this,
    // programmatically ingested signals sat in the DB until the decision
    // engine picked them up 24h later; agents with matching triggers never
    // fired in real time. Errors are logged, not raised, so the caller
    // still sees a 201 for the store operation.
    dispatchAgentsForEvent({
      orgId,
      eventType: data.event_type,
      entityType: data.entity_type,
      entityId: data.entity_id,
      data: data.data,
    }).catch((err) =>
      console.error("[signal-ingest] dispatch failed:", err),
    );

    return NextResponse.json(
      { success: true, event_id: event?.id, queued_to: "inngest" },
      { status: 201, headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[Signal Ingest] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
