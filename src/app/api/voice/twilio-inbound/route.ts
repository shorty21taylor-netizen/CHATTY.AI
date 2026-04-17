import { NextRequest } from "next/server";

import { validateTwilioSignature } from "@/lib/twilio/client";
import { db } from "@/lib/db/drizzle";
import { businessProfile, voiceCalls } from "@/db/schema";
import { eq } from "drizzle-orm";

const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID || "";

function twimlResponse(xml: string): Response {
  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

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
      return twimlResponse("<Response><Reject/></Response>");
    }
  }

  const callSid = params.CallSid || "";
  const from = params.From || "";
  const to = params.To || "";
  const direction = params.Direction === "outbound-api" ? "outbound" : "inbound";

  const [org] = await db
    .select({ orgId: businessProfile.orgId, agentId: businessProfile.elevenlabsAgentId })
    .from(businessProfile)
    .where(eq(businessProfile.twilioPhoneNumber, to))
    .limit(1);

  if (!org) {
    return twimlResponse("<Response><Reject/></Response>");
  }

  const agentId = org.agentId || ELEVENLABS_AGENT_ID;
  if (!agentId) {
    return twimlResponse(
      `<Response><Say>We're sorry, our voice system is not configured yet. Please call back later.</Say><Hangup/></Response>`,
    );
  }

  await db.insert(voiceCalls).values({
    orgId: org.orgId,
    callSid,
    callerNumber: from,
    calledNumber: to,
    direction,
    status: "ringing",
  });

  const statusCallbackUrl = new URL("/api/voice/twilio-status", req.url).toString();

  return twimlResponse(
    `<Response>` +
      `<Connect>` +
      `<Stream url="wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}">` +
      `<Parameter name="call_sid" value="${callSid}"/>` +
      `</Stream>` +
      `</Connect>` +
      `<Redirect>${statusCallbackUrl}</Redirect>` +
      `</Response>`,
  );
}
