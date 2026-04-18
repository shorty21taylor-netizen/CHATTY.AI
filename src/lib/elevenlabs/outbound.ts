const ELEVEN_BASE = "https://api.elevenlabs.io/v1";

function getHeaders() {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY required");
  }
  return {
    "xi-api-key": process.env.ELEVENLABS_API_KEY,
    "Content-Type": "application/json",
  };
}

export interface OutboundCallOptions {
  convaiAgentId: string;
  toNumber: string;
  variables?: Record<string, string>;
  firstMessage?: string;
}

export interface OutboundCallResult {
  conversationId: string;
  status: string;
}

export async function startOutboundCall(
  opts: OutboundCallOptions,
): Promise<OutboundCallResult> {
  const body: Record<string, unknown> = {
    agent_id: opts.convaiAgentId,
    agent_overrides: {
      conversation_config: {
        agent: {
          first_message: opts.firstMessage,
        },
      },
    },
  };

  if (opts.variables && Object.keys(opts.variables).length > 0) {
    (body.agent_overrides as Record<string, unknown>).dynamic_variables = opts.variables;
  }

  const response = await fetch(`${ELEVEN_BASE}/convai/conversations/create-call`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      ...body,
      call: {
        phone_number: opts.toNumber,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs outbound call failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return {
    conversationId: data.conversation_id,
    status: data.status || "initiated",
  };
}

export async function endCall(conversationId: string): Promise<void> {
  const response = await fetch(
    `${ELEVEN_BASE}/convai/conversations/${conversationId}/end`,
    {
      method: "POST",
      headers: getHeaders(),
    },
  );
  if (!response.ok) {
    console.error(`[ElevenLabs] End call failed (${response.status})`);
  }
}

export interface ConversationTranscript {
  conversationId: string;
  status: string;
  turns: { role: string; text: string; timestamp?: string }[];
  duration_seconds?: number;
  metadata?: Record<string, unknown>;
}

export async function fetchTranscript(
  conversationId: string,
): Promise<ConversationTranscript> {
  const response = await fetch(
    `${ELEVEN_BASE}/convai/conversations/${conversationId}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs transcript fetch failed (${response.status})`);
  }

  const data = await response.json();
  return {
    conversationId: data.conversation_id,
    status: data.status || "unknown",
    turns: (data.transcript || []).map((t: Record<string, unknown>) => ({
      role: t.role || "unknown",
      text: t.message || t.text || "",
      timestamp: t.time_in_call_secs ? `${t.time_in_call_secs}s` : undefined,
    })),
    duration_seconds: data.metadata?.call_duration_secs,
    metadata: data.metadata,
  };
}
