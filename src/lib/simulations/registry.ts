export interface DryRunResult {
  reply_preview: string;
  actions_planned: string[];
  confidence: number;
}

type DryRunHandler = (
  inputSignal: Record<string, unknown>,
  orgId: string,
) => Promise<DryRunResult>;

function stub(agentLabel: string): DryRunHandler {
  return async (inputSignal) => {
    const contactName =
      (inputSignal.contact_name as string) ||
      (inputSignal.name as string) ||
      "Unknown";
    return {
      reply_preview: `[${agentLabel}] Would respond to ${contactName} based on signal data.`,
      actions_planned: [`${agentLabel}: evaluate signal`, `${agentLabel}: draft response`],
      confidence: 0.75,
    };
  };
}

const registry: Record<string, DryRunHandler> = {
  instant_lead_response: stub("Instant Lead Response"),
  cadence: stub("Cadence"),
  reclaim_aged: stub("Reclaim Aged"),
  reclaim_abandoned: stub("Reclaim Abandoned"),
  reclaim_reactivation: stub("Reclaim Reactivation"),
  review_request: stub("Review Request"),
  form_bot: stub("Form Bot"),
  social_dm: stub("Social DM"),
  voice: stub("Voice"),
  telegram_ea: stub("Telegram EA"),
};

export function getHandler(agentType: string): DryRunHandler | undefined {
  return registry[agentType];
}

export function getAgentTypes(): string[] {
  return Object.keys(registry);
}
