// Database Types for Chatty AI

export type SourceType = "internal_crm"|"salesforce"|"hubspot"|"google_ads"|"facebook_ads"|"gmail"|"weather"|"custom";
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

// =============================================================================
// Light CRM — Contacts, Leads, Estimates, Jobs, Interactions
// =============================================================================

export type PropertyType = "residential" | "commercial" | "multi_family" | "hoa";

export type ContactType =
  | "homeowner" | "property_manager" | "general_contractor"
  | "realtor"   | "insurance_adjuster" | "other";

export type LeadSource =
  | "manual" | "website" | "referral" | "ad_click" | "phone_call"
  | "walk_in" | "social_media" | "home_advisor" | "angies_list"
  | "google_lsa" | "other";

export type ContactStatus = "active" | "inactive" | "do_not_contact";

export type ServiceType =
  | "roofing" | "hvac" | "solar" | "siding" | "windows" | "gutters"
  | "painting" | "remodeling" | "plumbing" | "electrical"
  | "landscaping" | "other";

export type LeadStatus =
  | "new" | "contacted" | "appointment_set" | "inspected"
  | "quoted" | "negotiating" | "won" | "lost" | "on_hold";

export type LeadPriority = "hot" | "high" | "medium" | "low";

export type EstimateStatus =
  | "draft" | "sent" | "viewed" | "accepted"
  | "rejected" | "expired" | "revised";

export type JobStatus =
  | "scheduled" | "materials_ordered" | "in_progress" | "on_hold"
  | "completed" | "punch_list" | "invoiced" | "paid" | "warranty";

export type InteractionType =
  | "call" | "email" | "sms" | "note" | "meeting"
  | "site_visit" | "voicemail" | "follow_up";

export type InteractionDirection = "inbound" | "outbound" | "internal";

export interface Contact {
  id: string;
  org_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  property_type: PropertyType | null;
  contact_type: ContactType | null;
  source: LeadSource | null;
  source_detail: string | null;
  status: ContactStatus;
  tags: string[];
  custom_fields: Record<string, any>;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Lead {
  id: string;
  org_id: string;
  contact_id: string;
  title: string;
  description: string | null;
  service_type: ServiceType | null;
  status: LeadStatus;
  lost_reason: string | null;
  estimated_value: number | null;
  assigned_to: string | null;
  priority: LeadPriority;
  follow_up_date: string | null;     // DATE → ISO 'YYYY-MM-DD'
  appointment_date: Date | null;
  source: LeadSource | null;
  source_detail: string | null;
  tags: string[];
  custom_fields: Record<string, any>;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  closed_at: Date | null;
}

export interface EstimateLineItem {
  description: string;
  qty: number;
  unit_price: number;
  total: number;
}

export interface Estimate {
  id: string;
  org_id: string;
  contact_id: string;
  lead_id: string | null;
  estimate_number: string | null;
  title: string | null;
  line_items: EstimateLineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  status: EstimateStatus;
  valid_until: string | null;        // DATE
  sent_at: Date | null;
  responded_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Estimate row enriched with the minimal contact display fields needed to
 * render a dashboard card (name, company, address). Produced by
 * `listEstimates` via LEFT JOIN on contacts — fields are nullable because a
 * contact could have been deleted. Core estimate fields remain identical
 * to `Estimate`.
 */
export interface EstimateWithContact extends Estimate {
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_company: string | null;
  contact_address_line1: string | null;
  contact_city: string | null;
  contact_state: string | null;
}

/**
 * Lead row enriched with the minimal contact display fields the follow-ups
 * and pipeline dashboards need (name, company). Produced by `listLeads`
 * via LEFT JOIN on contacts — contact fields are nullable because a contact
 * could have been deleted. Core lead fields remain identical to `Lead`.
 */
export interface LeadWithContact extends Lead {
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_company: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_city: string | null;
  contact_state: string | null;
}

export interface Job {
  id: string;
  org_id: string;
  contact_id: string;
  lead_id: string | null;
  estimate_id: string | null;
  title: string;
  description: string | null;
  service_type: ServiceType | null;
  status: JobStatus;
  job_value: number | null;
  cost: number | null;
  profit_margin: number | null;
  start_date: string | null;         // DATE
  end_date: string | null;           // DATE
  job_address_line1: string | null;
  job_address_line2: string | null;
  job_city: string | null;
  job_state: string | null;
  job_zip: string | null;
  assigned_crew: Array<string | { name?: string; role?: string; id?: string }>;
  tags: string[];
  custom_fields: Record<string, any>;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
}

export interface Interaction {
  id: string;
  org_id: string;
  contact_id: string;
  lead_id: string | null;
  job_id: string | null;
  interaction_type: InteractionType;
  direction: InteractionDirection | null;
  subject: string | null;
  summary: string | null;
  details: string | null;
  duration_seconds: number | null;
  outcome: string | null;
  created_by: string | null;
  occurred_at: Date;
  created_at: Date;
}

// -- View row shapes --

export interface PipelineSummaryRow {
  org_id: string;
  service_type: ServiceType | null;
  status: LeadStatus;
  lead_count: number;
  pipeline_value: number;
  avg_lead_value: number;
}

export interface DailyActivityRow {
  org_id: string;
  interaction_type: InteractionType;
  direction: InteractionDirection | null;
  interaction_count: number;
  total_duration_seconds: number;
}

// -- Input/filter shapes for CRUD helpers --

export interface ContactListFilter {
  search?: string;                   // matches first/last/email/phone/company
  status?: ContactStatus;
  contact_type?: ContactType;
  source?: LeadSource;
  limit?: number;
  offset?: number;
}

export interface LeadListFilter {
  status?: LeadStatus;
  service_type?: ServiceType;
  priority?: LeadPriority;
  assigned_to?: string;
  overdue_only?: boolean;            // follow_up_date <= today AND status not in (won, lost)
  limit?: number;
  offset?: number;
}

export interface JobListFilter {
  status?: JobStatus;
  service_type?: ServiceType;
  limit?: number;
  offset?: number;
}

export interface InteractionListFilter {
  interaction_type?: InteractionType;
  direction?: InteractionDirection;
  since?: Date | string;
  limit?: number;
  offset?: number;
}
