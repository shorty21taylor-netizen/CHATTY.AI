// Database Types for Chatty AI

export type SourceType = "salesforce"|"hubspot"|"google_ads"|"facebook_ads"|"gmail"|"weather"|"custom";
export type FeedbackType = "action_taken"|"action_ignored"|"outcome"|"comment";
export type Priority = "high"|"medium"|"low";

export interface SignalSource { id: string; org_id: string; source_type: SourceType; name: string; credentials: Record<string,any>; config: Record<string,any>; last_sync_at: Date|null; is_active: boolean; created_at: Date; updated_at: Date; }
export interface SignalEvent { id: string; org_id: string; source_type: string; source_id: string|null; event_type: string; entity_type: string|null; entity_id: string|null; data: Record<string,any>; embedding: number[]|null; created_at: Date; received_at: Date; }
export interface UnifiedContext { id: string; org_id: string; context_date: string; signal_summary: Record<string,any>; recent_events: SignalEvent[]; previous_briefs: DecisionBrief[]; external_context: Record<string,any>; created_at: Date; }
export interface DecisionBrief { id: string; org_id: string; brief_date: string; context_id: string; decision_engine_trace: DecisionTrace; recommendations: Recommendation[]; priority: Priority; voice_summary: string|null; delivered_at: Date|null; delivered_via: string|null; operator_feedback: Record<string,any>; created_at: Date; }
export interface DecisionTrace { pass1: { patterns: any[]; confidence: number; timestamp: string }; pass2: { decisions: any[]; rationale: string; confidence: number; timestamp: string }; pass3: { brief: string; recommendations: any[]; voice_text: string; timestamp: string }; total_duration_ms: number; }
export interface Recommendation { action: string; why: string; expected_impact: string; priority: Priority; category: string; }
export interface MicroMetric { id: string; org_id: string; metric_date: string; vertical: string|null; metric_name: string; metric_value: number; benchmark: number|null; trend: number|null; data: Record<string,any>; created_at: Date; }
export interface FeedbackEvent { id: string; org_id: string; brief_id: string; feedback_type: FeedbackType; feedback_text: string|null; confidence_delta: number|null; outcome_data: Record<string,any>; created_at: Date; }
export interface SignalIngestRequest { source_key: SourceType; event_type: string; data: Record<string,any>; entity_type?: string; entity_id?: string; }
export interface DecisionTriggerRequest { account_id: string; }
export interface ApiResponse<T = any> { success: boolean; data?: T; error?: string; }
