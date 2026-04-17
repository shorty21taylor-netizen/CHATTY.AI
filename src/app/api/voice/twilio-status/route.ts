import { NextRequest, NextResponse } from "next/server";

import { validateTwilioSignature } from "@/lib/twilio/client";
import { db } from "@/lib/db/drizzle";
import { voiceCalls } from "@/db/schema";
import { eq } from "drizzle-orm";
import { insertSignalEvent } from "@/lib/db/queries";
import { generateEmbedding, eventToEmbeddingText } from "@/lib/utils/embedding";
import { dispatchAgentsForEvent } from "@/lib/agents/dispatcher";
import { fetchConversation } from "@/lib/elevenlabs/conversational-ai";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });

  const signature = req.headers.get("x-twilio-signature") || "";
  if (process.env.NODE_ENV === "production") {
    const isValid = validateTwilioSignature(signature, req.url, params);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
  }

  const callSid = params.CallSid || "";
  const callStatus = params.CallStatus || "";
  const durationStr = params.CallDuration || params.Duration || "";

  if (!callSid) {
    return NextResponse.json({ ok: true });
  }

  const [call] = await db
    .select()
    .from(voiceCalls)
    .where(eq(voiceCalls.callSid, callSid))
    .limit(1);

  if (!call) {
    return NextResponse.json({ ok: true });
  }

  const statusMap: Record<string, string> = {
    completed: "completed",
    busy: "failed",
    "no-answer": "no_answer",
    failed: "failed",
    canceled: "failed",
  };
  const dbStatus = statusMap[callStatus] || callStatus;

  const updates: Record<string, unknown> = {
    status: dbStatus,
  };

  if (callStatus === "completed" || callStatus === "busy" || callStatus === "no-answer" || callStatus === "failed") {
    updates.endedAt = new Date();
  }

  if (durationStr) {
    updates.durationSeconds = parseInt(durationStr, 10) || 0;
  }

  if (callStatus === "completed" && call.elevenlabsConversationId) {
    try {
      const convo = await fetchConversation(call.elevenlabsConversationId);
      if (convo.transcript) {
        updates.transcript = convo.transcript;
      }
    } catch (err) {
      console.error("[twilio-status] fetchConversation failed:", err);
    }
  }

  await db
    .update(voiceCalls)
    .set(updates)
    .where(eq(voiceCalls.callSid, callSid));

  if (callStatus === "completed") {
    const signalData = {
      call_sid: callSid,
      caller_number: call.callerNumber,
      called_number: call.calledNumber,
      duration_seconds: updates.durationSeconds || call.durationSeconds,
      outcome: call.outcome,
      direction: call.direction,
    };

    const embeddingText = eventToEmbeddingText({
      event_type: "inbound_call_completed",
      entity_type: "conversation",
      data: signalData,
    });
    const embedding = await generateEmbedding(embeddingText);

    await insertSignalEvent(call.orgId, {
      source_type: "voice_call",
      event_type: "inbound_call_completed",
      entity_type: "conversation",
      entity_id: call.id,
      data: signalData,
      embedding: embedding.length > 0 ? embedding : undefined,
    });

    dispatchAgentsForEvent({
      orgId: call.orgId,
      eventType: "inbound_call_completed",
      entityType: "conversation",
      entityId: call.id,
      data: signalData,
    }).catch((err) =>
      console.error("[twilio-status] dispatch failed:", err),
    );
  }

  return NextResponse.json({ ok: true });
}
