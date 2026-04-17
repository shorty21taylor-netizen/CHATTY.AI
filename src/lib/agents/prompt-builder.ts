interface AgentTypeMeta {
  id: string;
  name: string;
  description: string;
  missionDefault: string;
}

export function buildAgentSystemPrompt(
  agentConfig: Record<string, any>,
  businessProfile: Record<string, any> | null,
  agentMeta: AgentTypeMeta,
): string {
  const cfg = (agentConfig.config ?? {}) as Record<string, any>;
  const bp = businessProfile;

  const missionStatement =
    cfg.mission?.statement || agentMeta.missionDefault;
  const nonNeg = cfg.mission?.non_negotiable;

  const voiceMode = cfg.voice?.mode ?? "inherit";
  const formality =
    voiceMode === "inherit"
      ? (bp?.voiceFormalCasual ?? 5)
      : (cfg.voice?.formality ?? 5);
  const verbosity =
    voiceMode === "inherit"
      ? (bp?.voiceConciseDetailed ?? 5)
      : (cfg.voice?.verbosity ?? 5);
  const warmth =
    voiceMode === "inherit"
      ? (bp?.voiceWarmDirect ?? 5)
      : (cfg.voice?.warmth ?? 5);

  const neverUse: string[] = bp?.neverUsePhrases ?? [];
  const localPhrases: string[] = bp?.localPhrases ?? [];
  const quickFacts: string[] = cfg.knowledge?.quick_facts ?? [];
  const bannedTopics: string[] = cfg.guardrails?.banned_topics ?? [];

  const guardrails = cfg.guardrails ?? {};
  const prohibited = guardrails.prohibited_promises ?? {};

  const parts: string[] = [];

  parts.push(`You are "${agentMeta.name}", an AI agent for ${bp?.companyName || "a home service contractor"}.`);
  parts.push("");
  parts.push(`## Mission`);
  parts.push(missionStatement);
  if (nonNeg) parts.push(`Non-negotiable: ${nonNeg}`);

  parts.push("");
  parts.push(`## Voice`);
  parts.push(`Formality: ${formality}/10 (1=very formal, 10=very casual)`);
  parts.push(`Verbosity: ${verbosity}/10 (1=terse, 10=detailed)`);
  parts.push(`Warmth: ${warmth}/10 (1=warm/friendly, 10=direct/professional)`);

  if (neverUse.length > 0) {
    parts.push(`Never use these phrases: ${neverUse.join(", ")}`);
  }
  if (localPhrases.length > 0) {
    parts.push(`Use local language: ${localPhrases.join(", ")}`);
  }

  if (bp) {
    parts.push("");
    parts.push(`## Business Context`);
    if (bp.companyName) parts.push(`Company: ${bp.companyName}${bp.dba ? ` (DBA: ${bp.dba})` : ""}`);
    if (bp.primaryServiceType) parts.push(`Primary service: ${bp.primaryServiceType}`);
    if (bp.ownerFirstName) parts.push(`Owner first name: ${bp.ownerFirstName}`);
    if (bp.mainPhone) parts.push(`Business phone: ${bp.mainPhone}`);
    if (bp.website) parts.push(`Website: ${bp.website}`);
    const usps = [bp.usp1, bp.usp2, bp.usp3].filter(Boolean);
    if (usps.length > 0) parts.push(`Unique selling points: ${usps.join("; ")}`);
    if (bp.warrantyYears) parts.push(`Warranty: ${bp.warrantyYears} years`);
    if (bp.certifications && bp.certifications.length > 0) {
      parts.push(`Certifications: ${bp.certifications.join(", ")}`);
    }
  }

  if (quickFacts.length > 0) {
    parts.push("");
    parts.push(`## Quick Facts`);
    quickFacts.forEach((f: string) => parts.push(`- ${f}`));
  }

  parts.push("");
  parts.push(`## Guardrails`);
  if (guardrails.required_sms_disclosure) {
    parts.push(`- Every SMS MUST end with "Reply STOP to opt out."`);
  }
  if (prohibited.no_pricing) parts.push("- NEVER quote specific pricing or estimates");
  if (prohibited.no_timeline) parts.push("- NEVER promise specific timelines");
  if (prohibited.no_warranty_extension) parts.push("- NEVER promise warranty extensions");
  if (bannedTopics.length > 0) {
    parts.push(`- NEVER discuss: ${bannedTopics.join(", ")}`);
  }

  parts.push("");
  parts.push(`## Output Format`);
  parts.push(`Compose a single SMS message. Keep it under 320 characters when possible. Be conversational, not robotic. Use the contact's first name if available.`);

  return parts.join("\n");
}

export interface ConversationMessage {
  role: "assistant" | "user";
  content: string;
}

/**
 * Build a continuation system prompt and messages array for an ongoing
 * SMS conversation. The system prompt is the same as the initial one
 * with an extra instruction about conversation context. The history
 * becomes Claude messages rather than being stuffed into the system prompt.
 */
export function buildContinuationPrompt(
  agentConfig: Record<string, any>,
  businessProfile: Record<string, any> | null,
  agentMeta: AgentTypeMeta,
  conversationHistory: ConversationMessage[],
): { system: string; messages: Array<{ role: "user" | "assistant"; content: string }> } {
  const base = buildAgentSystemPrompt(agentConfig, businessProfile, agentMeta);

  const system = [
    base,
    "",
    "## Conversation Context",
    "This is an active SMS conversation. The customer has replied to your previous message.",
    "Read the full thread below and compose the next reply.",
    "Stay consistent with what you already said. Don't repeat yourself.",
    "If they ask to schedule, try to suggest 2-3 time slots.",
    "If they seem uninterested, be gracious and brief.",
  ].join("\n");

  const messages = conversationHistory.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  return { system, messages };
}
