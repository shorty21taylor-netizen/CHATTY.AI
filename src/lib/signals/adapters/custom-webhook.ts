import type { SignalAdapter, AdapterConfig, NormalizedEvent } from "../adapter";

export class CustomWebhookAdapter implements SignalAdapter {
  readonly sourceType = "custom";
  async fetchNewEvents(_config: AdapterConfig): Promise<NormalizedEvent[]> { return []; }
  async testConnection(_creds: Record<string, any>): Promise<{ ok: boolean; error?: string }> { return { ok: true }; }
  normalize(payload: Record<string, any>): NormalizedEvent {
    return { event_type: payload.event_type || "custom_event", entity_type: payload.entity_type, entity_id: payload.entity_id, data: payload.data || payload, source_id: payload.id || payload.source_id, timestamp: payload.timestamp || new Date().toISOString() };
  }
}
