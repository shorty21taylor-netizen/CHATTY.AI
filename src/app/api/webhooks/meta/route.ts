import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { query } from "@/lib/db";
import { insertSignalEvent } from "@/lib/db/queries";
import { generateEmbedding, eventToEmbeddingText } from "@/lib/utils/embedding";
import { dispatchAgentsForEvent } from "@/lib/agents/dispatcher";

const META_APP_SECRET = process.env.META_APP_SECRET || "";
const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "";

function verifySignature(rawBody: string, signature: string): boolean {
  if (!META_APP_SECRET) return false;
  const expected = "sha256=" + crypto
    .createHmac("sha256", META_APP_SECRET)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature),
  );
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === META_VERIFY_TOKEN) {
    return new Response(challenge || "", { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const signature = req.headers.get("x-hub-signature-256") || "";
  if (process.env.NODE_ENV === "production" && !verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.object !== "instagram" && payload.object !== "page") {
    return NextResponse.json({ received: true });
  }

  const entries = Array.isArray(payload.entry) ? payload.entry : [];

  for (const entry of entries) {
    const messaging = Array.isArray(entry.messaging) ? entry.messaging : [];

    for (const event of messaging) {
      if (!event.message?.text) continue;

      const senderId = event.sender?.id;
      const platform = payload.object === "instagram" ? "instagram" : "messenger";
      const messageText = event.message.text;
      const timestamp = event.timestamp
        ? new Date(event.timestamp).toISOString()
        : new Date().toISOString();

      const orgResult = await query<{ org_id: string }>(
        `SELECT DISTINCT org_id FROM signal_sources
         WHERE source_type = 'meta_dm' AND is_active = true
         LIMIT 10`,
        [],
      );

      for (const row of orgResult.rows) {
        const orgId = row.org_id;

        const signalData = {
          sender_id: senderId,
          platform,
          message_text: messageText,
          page_id: entry.id,
        };

        const embeddingText = eventToEmbeddingText({
          event_type: "inbound_dm",
          entity_type: "conversation",
          data: signalData,
        });
        const embedding = await generateEmbedding(embeddingText);

        await insertSignalEvent(orgId, {
          source_type: "meta_dm",
          event_type: "inbound_dm",
          entity_type: "conversation",
          entity_id: senderId,
          data: signalData,
          embedding: embedding.length > 0 ? embedding : undefined,
        });

        dispatchAgentsForEvent({
          orgId,
          eventType: "inbound_dm",
          entityType: "conversation",
          entityId: senderId || entry.id,
          data: signalData,
        }).catch((err) =>
          console.error("[meta-webhook] dispatch failed:", err),
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
