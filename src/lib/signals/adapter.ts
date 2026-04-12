// Signal Adapter Interface

export interface NormalizedEvent { event_type: string; entity_type?: string; entity_id?: string; data: Record<string, any>; source_id?: string; timestamp?: string; }
export interface AdapterConfig { credentials: Record<string, any>; config: Record<string, any>; lastSyncAt?: Date; }
export interface SignalAdapter { readonly sourceType: string; fetchNewEvents(adapterConfig: AdapterConfig): Promise<NormalizedEvent[]>; testConnection(credentials: Record<string, any>): Promise<{ ok: boolean; error?: string }>; }
