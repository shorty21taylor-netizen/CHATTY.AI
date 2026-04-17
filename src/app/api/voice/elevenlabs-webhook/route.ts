import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { db } from "@/lib/db/drizzle";
import { voiceCalls } from "@/db/schema";
import { eq } from "drizzle-orm";

const WEBHOOK_SECRET = process.env.ELEVENLABS_WEBHOOK_SECRET || "";

function verifySignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature),
  );
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-elevenlabs-signature") || "";

  if (process.env.NODE_ENV === "production" && WEBHOOK_SECRET) {
    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const conversationId = payload.conversation_id as string;
  if (!conversationId) {
    return NextResponse.json({ ok: true });
  }

  const [call] = await db
    .select()
    .from(voiceCalls)
    .where(eq(voiceCalls.elevenlabsConversationId, conversationId))
    .limit(1);

  if (!call) {
    return NextResponse.json({ ok: true });
  }

  const updates: Record<string, unknown> = {};

  if (payload.transcript && Array.isArray(payload.transcript)) {
    updates.transcript = payload.transcript;
  }

  const analysis = payload.analysis as Record<string, unknown> | undefined;
  if (analysis?.outcome) {
    updates.outcome = analysis.outcome as string;
  }
  if (analysis?.outcome_data) {
    updates.outcomeData = analysis.outcome_data;
  }

  if (Object.keys(updates).length > 0) {
    await db
      .update(voiceCalls)
      .set(updates)
      .where(eq(voiceCalls.elevenlabsConversationId, conversationId));
  }

  return NextResponse.json({ ok: true });
}
