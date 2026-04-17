// ElevenLabs Conversational AI wrapper
// CRITICAL: ElevenLabs is the EXCLUSIVE voice provider. DO NOT use Vapi.

import type { BusinessProfile } from "@/db/schema";

const BASE_URL = "https://api.elevenlabs.io/v1";

function headers() {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY required");
  }
  return {
    "xi-api-key": process.env.ELEVENLABS_API_KEY,
    "Content-Type": "application/json",
  };
}

export function createAgentConfig(
  orgId: string,
  profile: Partial<BusinessProfile>,
) {
  const company = profile.companyName || "our company";
  const industry = profile.primaryServiceType || "home services";
  const area =
    profile.serviceArea && typeof profile.serviceArea === "object"
      ? (profile.serviceArea as Record<string, unknown>).address || "your area"
      : "your area";
  const owner = profile.ownerFirstName || "the owner";
  const phone = profile.mainPhone || "";
  const website = profile.website || "";

  const systemPrompt = `You are a friendly, professional receptionist for ${company}, a ${industry} contractor serving ${area}.

Your job is to qualify inbound callers and, if they're a good fit, offer to book an appointment.

QUALIFICATION QUESTIONS (ask naturally, not as a checklist):
1. Are you a homeowner or property manager?
2. What's the issue or project you need help with?
3. What's the property address?
4. Are you the decision-maker for this project?
5. Do you have a timeline or urgency level?

RULES:
- Be warm and conversational — you represent ${owner}'s business.
- If the caller is qualified (homeowner/PM + real project + in service area), offer to schedule an appointment.
- If they ask about pricing, say "${company} provides free on-site estimates — I can get someone out to you this week."
- Never make up pricing, warranty terms, or technical details.
- If you can't help (wrong service type, out of area), politely let them know and thank them for calling.
- Keep the call under 3 minutes when possible.
${phone ? `- The office number is ${phone}.` : ""}
${website ? `- The website is ${website}.` : ""}

At the end of the call, summarize what you learned: caller name, project type, address, and whether an appointment was offered.`;

  const firstMessage = `Thanks for calling ${company}! My name is Alex — how can I help you today?`;

  return {
    orgId,
    systemPrompt,
    firstMessage,
    language: "en",
  };
}

export interface ConversationTranscript {
  conversation_id: string;
  status: string;
  transcript: Array<{ role: string; text: string; timestamp?: number }>;
  metadata?: Record<string, unknown>;
  analysis?: Record<string, unknown>;
}

export async function fetchConversation(
  conversationId: string,
): Promise<ConversationTranscript> {
  const r = await fetch(
    `${BASE_URL}/convai/conversations/${conversationId}`,
    { headers: headers() },
  );
  if (!r.ok) {
    throw new Error(
      `fetchConversation failed (${r.status}): ${await r.text()}`,
    );
  }
  return r.json();
}

export async function fetchConversationAudio(
  conversationId: string,
): Promise<string> {
  const r = await fetch(
    `${BASE_URL}/convai/conversations/${conversationId}/audio`,
    { headers: headers() },
  );
  if (!r.ok) {
    throw new Error(
      `fetchConversationAudio failed (${r.status}): ${await r.text()}`,
    );
  }
  const data = await r.json();
  return data.audio_url || "";
}
