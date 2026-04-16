// Chatty AI — Drizzle schema
//
// This is the single source of truth for the production Postgres schema.
// Every table has `org_id` (Clerk organization UUID) + `created_at` and,
// where appropriate, `updated_at`. Row-level security is enabled via a
// separate migration (`enable_pgvector_and_rls.sql`) so the app layer can
// set `app.current_org_id` once per request and every downstream query is
// automatically scoped.
//
// Tables are grouped into three pillars:
//   - Signal / Decision Engine (6 tables)
//   - Agent runtime (5 tables)
//   - Business data (4 tables + `business_profile`)
//
// IMPORTANT: the existing `src/lib/db/types.ts` + raw-SQL `queries.ts`
// remain the source of truth for the initial lightweight CRM (contacts /
// leads / estimates / jobs / interactions). The tables below are the
// production rebuild — Drizzle-native, RLS-enforced. Query helpers under
// `src/lib/db/queries/*` read from these.

import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// pgvector custom type (Voyage voyage-3 produces 1024-dim embeddings)
// ---------------------------------------------------------------------------

const vector = (name: string, dimensions: number) =>
  customType<{ data: number[]; driverData: string }>({
    dataType() {
      return `vector(${dimensions})`;
    },
    toDriver(value: number[]) {
      return `[${value.join(",")}]`;
    },
    fromDriver(value: string): number[] {
      // pgvector returns "[0.1,0.2,...]"
      return value
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((v) => Number(v));
    },
  })(name);

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const sourceTypeEnum = pgEnum("source_type", [
  "salesforce",
  "hubspot",
  "google_ads",
  "facebook_ads",
  "gmail",
  "weather",
  "twilio_sms",
  "internal_crm",
  "custom",
]);

export const priorityEnum = pgEnum("brief_priority", ["high", "medium", "low"]);

export const feedbackTypeEnum = pgEnum("feedback_type", [
  "action_taken",
  "action_ignored",
  "outcome",
  "comment",
]);

export const agentStatusEnum = pgEnum("agent_status", [
  "not_configured",
  "draft",
  "shadow",
  "active",
  "paused",
]);

export const agentActivationModeEnum = pgEnum("agent_activation_mode", [
  "shadow",
  "draft",
  "full_auto",
]);

export const agentRunStatusEnum = pgEnum("agent_run_status", [
  "success",
  "failed",
  "escalated",
  "skipped",
]);

export const contactTypeEnum = pgEnum("contact_type", [
  "lead",
  "customer",
  "past_customer",
  "vip",
]);

export const contactStatusEnum = pgEnum("contact_status", [
  "active",
  "nurturing",
  "won",
  "lost",
  "cold",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "confirmed",
  "pending",
  "rescheduled",
  "cancelled",
  "completed",
]);

export const appointmentBookedByEnum = pgEnum("appointment_booked_by", [
  "ai_agent",
  "manual",
  "referral",
]);

export const proposalStatusEnum = pgEnum("proposal_status", [
  "draft",
  "sent",
  "viewed",
  "won",
  "lost",
  "expired",
]);

export const dealStageEnum = pgEnum("deal_stage", [
  "new_lead",
  "qualified",
  "proposal_sent",
  "negotiation",
  "closing",
  "won",
  "lost",
]);

export const pricingPhilosophyEnum = pgEnum("pricing_philosophy", [
  "premium",
  "mid",
  "value",
  "insurance_first",
]);

export const insuranceExperienceEnum = pgEnum("insurance_experience", [
  "none",
  "some",
  "primary_focus",
]);

// ---------------------------------------------------------------------------
// Shared columns
// ---------------------------------------------------------------------------

const orgId = () => uuid("org_id").notNull();
const pk = () =>
  uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`);
const createdAt = () =>
  timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`);
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`);

// ===========================================================================
// 1. signal_sources
// ===========================================================================

export const signalSources = pgTable(
  "signal_sources",
  {
    id: pk(),
    orgId: orgId(),
    sourceType: sourceTypeEnum("source_type").notNull(),
    name: text("name").notNull(),
    credentials: jsonb("credentials").notNull().default({}),
    config: jsonb("config").notNull().default({}),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("signal_sources_org_idx").on(t.orgId),
    index("signal_sources_org_type_idx").on(t.orgId, t.sourceType),
  ],
);

// ===========================================================================
// 2. signal_events
// ===========================================================================

export const signalEvents = pgTable(
  "signal_events",
  {
    id: pk(),
    orgId: orgId(),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id"),
    eventType: text("event_type").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    data: jsonb("data").notNull().default({}),
    embedding: vector("embedding", 1024),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    createdAt: createdAt(),
  },
  (t) => [
    index("signal_events_org_created_idx").on(t.orgId, t.createdAt),
    index("signal_events_org_type_idx").on(t.orgId, t.eventType),
    index("signal_events_entity_idx").on(t.orgId, t.entityType, t.entityId),
    // ivfflat index for ANN over embeddings — created in a post-generate SQL migration
  ],
);

// ===========================================================================
// 3. unified_context
// ===========================================================================

export const unifiedContext = pgTable(
  "unified_context",
  {
    id: pk(),
    orgId: orgId(),
    contextDate: date("context_date").notNull(),
    signalSummary: jsonb("signal_summary").notNull().default({}),
    recentEvents: jsonb("recent_events").notNull().default([]),
    previousBriefs: jsonb("previous_briefs").notNull().default([]),
    externalContext: jsonb("external_context").notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [
    unique("unified_context_org_date_uq").on(t.orgId, t.contextDate),
    index("unified_context_org_date_idx").on(t.orgId, t.contextDate),
  ],
);

// ===========================================================================
// 4. decision_briefs
// ===========================================================================

export const decisionBriefs = pgTable(
  "decision_briefs",
  {
    id: pk(),
    orgId: orgId(),
    briefDate: date("brief_date").notNull(),
    contextId: uuid("context_id").references(() => unifiedContext.id, {
      onDelete: "set null",
    }),
    decisionEngineTrace: jsonb("decision_engine_trace").notNull().default({}),
    recommendations: jsonb("recommendations").notNull().default([]),
    priority: priorityEnum("priority").notNull().default("medium"),
    voiceSummaryText: text("voice_summary_text"),
    voiceSummaryUrl: text("voice_summary_url"),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    deliveredVia: text("delivered_via"),
    operatorFeedback: jsonb("operator_feedback").notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [
    index("decision_briefs_org_date_idx").on(t.orgId, t.briefDate),
    index("decision_briefs_org_created_idx").on(t.orgId, t.createdAt),
  ],
);

// ===========================================================================
// 5. micro_metrics
// ===========================================================================

export const microMetrics = pgTable(
  "micro_metrics",
  {
    id: pk(),
    orgId: orgId(),
    metricDate: date("metric_date").notNull(),
    vertical: text("vertical"),
    metricName: text("metric_name").notNull(),
    metricValue: numeric("metric_value").notNull(),
    benchmark: numeric("benchmark"),
    trend: numeric("trend"),
    data: jsonb("data").notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [
    index("micro_metrics_org_date_idx").on(t.orgId, t.metricDate),
    index("micro_metrics_org_name_idx").on(t.orgId, t.metricName),
  ],
);

// ===========================================================================
// 6. feedback_events
// ===========================================================================

export const feedbackEvents = pgTable(
  "feedback_events",
  {
    id: pk(),
    orgId: orgId(),
    briefId: uuid("brief_id").references(() => decisionBriefs.id, {
      onDelete: "cascade",
    }),
    feedbackType: feedbackTypeEnum("feedback_type").notNull(),
    feedbackText: text("feedback_text"),
    confidenceDelta: numeric("confidence_delta"),
    outcomeData: jsonb("outcome_data").notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [
    index("feedback_events_org_brief_idx").on(t.orgId, t.briefId),
    index("feedback_events_org_created_idx").on(t.orgId, t.createdAt),
  ],
);

// ===========================================================================
// 7. agent_configs
// ===========================================================================

export const agentConfigs = pgTable(
  "agent_configs",
  {
    id: pk(),
    orgId: orgId(),
    agentType: text("agent_type").notNull(), // instant_lead_response, form_bot, ...
    name: text("name").notNull(),
    status: agentStatusEnum("status").notNull().default("not_configured"),
    config: jsonb("config").notNull().default({}),
    completenessPct: integer("completeness_pct").notNull().default(0),
    activationMode: agentActivationModeEnum("activation_mode"),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique("agent_configs_org_type_uq").on(t.orgId, t.agentType),
    index("agent_configs_org_status_idx").on(t.orgId, t.status),
  ],
);

// ===========================================================================
// 8. agent_knowledge_base
// ===========================================================================

export const agentKnowledgeBase = pgTable(
  "agent_knowledge_base",
  {
    id: pk(),
    orgId: orgId(),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agentConfigs.id, { onDelete: "cascade" }),
    docName: text("doc_name").notNull(),
    docType: text("doc_type").notNull(), // pricing | faq | warranty | competitor | other
    content: text("content").notNull(),
    embedding: vector("embedding", 1024),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("agent_kb_org_agent_idx").on(t.orgId, t.agentId),
    index("agent_kb_org_type_idx").on(t.orgId, t.docType),
  ],
);

// ===========================================================================
// 9. agent_templates
// ===========================================================================

export const agentTemplates = pgTable(
  "agent_templates",
  {
    id: pk(),
    orgId: orgId(),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agentConfigs.id, { onDelete: "cascade" }),
    scenarioTag: text("scenario_tag").notNull(),
    templateText: text("template_text").notNull(),
    variant: text("variant"), // 'A' | 'B' | 'C' | null
    performanceScore: numeric("performance_score"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("agent_templates_org_agent_idx").on(t.orgId, t.agentId),
    index("agent_templates_scenario_idx").on(t.orgId, t.scenarioTag),
  ],
);

// ===========================================================================
// 10. agent_runs
// ===========================================================================

export const agentRuns = pgTable(
  "agent_runs",
  {
    id: pk(),
    orgId: orgId(),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agentConfigs.id, { onDelete: "cascade" }),
    triggerEventId: uuid("trigger_event_id").references(() => signalEvents.id, {
      onDelete: "set null",
    }),
    contactId: uuid("contact_id"), // FK added inline below via contacts table
    status: agentRunStatusEnum("status").notNull(),
    reasoningTrace: jsonb("reasoning_trace").notNull().default({}),
    durationMs: integer("duration_ms"),
    costUsd: numeric("cost_usd"),
    createdAt: createdAt(),
  },
  (t) => [
    index("agent_runs_org_agent_idx").on(t.orgId, t.agentId),
    index("agent_runs_org_created_idx").on(t.orgId, t.createdAt),
    index("agent_runs_org_contact_idx").on(t.orgId, t.contactId),
  ],
);

// ===========================================================================
// 11. agent_activity
// ===========================================================================

export const agentActivity = pgTable(
  "agent_activity",
  {
    id: pk(),
    orgId: orgId(),
    agentRunId: uuid("agent_run_id")
      .notNull()
      .references(() => agentRuns.id, { onDelete: "cascade" }),
    actionType: text("action_type").notNull(), // send_sms, send_email, book_appointment, ...
    actionPayload: jsonb("action_payload").notNull().default({}),
    result: jsonb("result").notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [
    index("agent_activity_org_run_idx").on(t.orgId, t.agentRunId),
    index("agent_activity_org_created_idx").on(t.orgId, t.createdAt),
  ],
);

// ===========================================================================
// 12. contacts
// ===========================================================================

export const contacts = pgTable(
  "contacts",
  {
    id: pk(),
    orgId: orgId(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    phone: text("phone"),
    email: text("email"),
    source: text("source"),
    type: contactTypeEnum("type").notNull().default("lead"),
    status: contactStatusEnum("status").notNull().default("active"),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    notes: text("notes"),
    addressLine1: text("address_line1"),
    city: text("city"),
    state: text("state"),
    zip: text("zip"),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("contacts_org_idx").on(t.orgId),
    index("contacts_org_status_idx").on(t.orgId, t.status),
    index("contacts_org_type_idx").on(t.orgId, t.type),
    index("contacts_org_lastact_idx").on(t.orgId, t.lastActivityAt),
    index("contacts_org_phone_idx").on(t.orgId, t.phone),
    index("contacts_org_email_idx").on(t.orgId, t.email),
  ],
);

// ===========================================================================
// 13. appointments
// ===========================================================================

export const appointments = pgTable(
  "appointments",
  {
    id: pk(),
    orgId: orgId(),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(60),
    appointmentType: text("appointment_type"),
    address: text("address"),
    status: appointmentStatusEnum("status").notNull().default("pending"),
    bookedBy: appointmentBookedByEnum("booked_by").notNull().default("manual"),
    agentId: uuid("agent_id").references(() => agentConfigs.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("appointments_org_scheduled_idx").on(t.orgId, t.scheduledAt),
    index("appointments_org_contact_idx").on(t.orgId, t.contactId),
    index("appointments_org_status_idx").on(t.orgId, t.status),
  ],
);

// ===========================================================================
// 14. proposals
// ===========================================================================

export const proposals = pgTable(
  "proposals",
  {
    id: pk(),
    orgId: orgId(),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    serviceType: text("service_type"),
    amountUsd: numeric("amount_usd").notNull().default("0"),
    status: proposalStatusEnum("status").notNull().default("draft"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    lastViewedAt: timestamp("last_viewed_at", { withTimezone: true }),
    viewCount: integer("view_count").notNull().default(0),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("proposals_org_contact_idx").on(t.orgId, t.contactId),
    index("proposals_org_status_idx").on(t.orgId, t.status),
    index("proposals_org_created_idx").on(t.orgId, t.createdAt),
  ],
);

// ===========================================================================
// 15. deals
// ===========================================================================

export const deals = pgTable(
  "deals",
  {
    id: pk(),
    orgId: orgId(),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    proposalId: uuid("proposal_id").references(() => proposals.id, {
      onDelete: "set null",
    }),
    stage: dealStageEnum("stage").notNull().default("new_lead"),
    valueUsd: numeric("value_usd").notNull().default("0"),
    daysInStage: integer("days_in_stage").notNull().default(0),
    assignedAgentId: uuid("assigned_agent_id").references(
      () => agentConfigs.id,
      { onDelete: "set null" },
    ),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
    lastActivityNote: text("last_activity_note"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("deals_org_stage_idx").on(t.orgId, t.stage),
    index("deals_org_contact_idx").on(t.orgId, t.contactId),
    index("deals_org_lastact_idx").on(t.orgId, t.lastActivityAt),
  ],
);

// ===========================================================================
// 16. business_profile (1 row per org)
// ===========================================================================

export const businessProfile = pgTable(
  "business_profile",
  {
    id: pk(),
    orgId: uuid("org_id").notNull().unique(),
    companyName: text("company_name"),
    dba: text("dba"),
    primaryServiceType: text("primary_service_type"),
    serviceSubtypes: text("service_subtypes")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    yearFounded: integer("year_founded"),
    teamSize: integer("team_size"),
    serviceArea: jsonb("service_area").notNull().default({}),
    website: text("website"),
    googleProfileUrl: text("google_profile_url"),
    mainPhone: text("main_phone"),
    billingAddress: jsonb("billing_address").notNull().default({}),
    pricingPhilosophy: pricingPhilosophyEnum("pricing_philosophy"),
    usp1: text("usp_1"),
    usp2: text("usp_2"),
    usp3: text("usp_3"),
    warrantyYears: integer("warranty_years"),
    certifications: text("certifications")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    insuranceExperience: insuranceExperienceEnum("insurance_experience"),
    googleReviewsCount: integer("google_reviews_count"),
    googleRating: real("google_rating"),
    bbbRating: text("bbb_rating"),
    competitors: text("competitors")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    customerThemes: text("customer_themes")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    ownerFirstName: text("owner_first_name"),
    voiceFormalCasual: integer("voice_formal_casual").default(5),
    voiceConciseDetailed: integer("voice_concise_detailed").default(5),
    voiceWarmDirect: integer("voice_warm_direct").default(5),
    sampleSentences: text("sample_sentences")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    neverUsePhrases: text("never_use_phrases")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    localPhrases: text("local_phrases")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    businessHours: jsonb("business_hours").notNull().default({}),
    timezone: text("timezone"),
    lunchBreak: jsonb("lunch_break").notNull().default({}),
    afterHoursEmergency: boolean("after_hours_emergency")
      .notNull()
      .default(false),
    quietHours: jsonb("quiet_hours").notNull().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("business_profile_org_idx").on(t.orgId)],
);

// ---------------------------------------------------------------------------
// Type exports — Drizzle inference for callers
// ---------------------------------------------------------------------------

export type SignalSource = typeof signalSources.$inferSelect;
export type NewSignalSource = typeof signalSources.$inferInsert;
export type SignalEvent = typeof signalEvents.$inferSelect;
export type NewSignalEvent = typeof signalEvents.$inferInsert;
export type UnifiedContextRow = typeof unifiedContext.$inferSelect;
export type DecisionBrief = typeof decisionBriefs.$inferSelect;
export type NewDecisionBrief = typeof decisionBriefs.$inferInsert;
export type MicroMetric = typeof microMetrics.$inferSelect;
export type FeedbackEvent = typeof feedbackEvents.$inferSelect;
export type AgentConfig = typeof agentConfigs.$inferSelect;
export type NewAgentConfig = typeof agentConfigs.$inferInsert;
export type AgentKnowledge = typeof agentKnowledgeBase.$inferSelect;
export type AgentTemplate = typeof agentTemplates.$inferSelect;
export type AgentRun = typeof agentRuns.$inferSelect;
export type AgentActivity = typeof agentActivity.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type Proposal = typeof proposals.$inferSelect;
export type NewProposal = typeof proposals.$inferInsert;
export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
export type BusinessProfile = typeof businessProfile.$inferSelect;
export type NewBusinessProfile = typeof businessProfile.$inferInsert;

// ---------------------------------------------------------------------------
// Convenience: list of every table that needs RLS (consumed by the
// `enable_pgvector_and_rls.sql` migration).
// ---------------------------------------------------------------------------

export const RLS_TABLES = [
  "signal_sources",
  "signal_events",
  "unified_context",
  "decision_briefs",
  "micro_metrics",
  "feedback_events",
  "agent_configs",
  "agent_knowledge_base",
  "agent_templates",
  "agent_runs",
  "agent_activity",
  "contacts",
  "appointments",
  "proposals",
  "deals",
  "business_profile",
] as const;

// Suppress unused-var warnings for helpers not referenced at top level
void primaryKey;
