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
  bigint,
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

export const suppressionReasonEnum = pgEnum("suppression_reason", [
  "sms_stop",
  "email_unsubscribe",
  "manual",
  "not_interested",
]);

export const cadenceRunStatusEnum = pgEnum("cadence_run_status", [
  "running",
  "completed",
  "exited",
  "failed",
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
    cadenceId: uuid("cadence_id"),
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
    googleReviewUrl: text("google_review_url"),
    facebookReviewUrl: text("facebook_review_url"),
    elevenlabsAgentId: text("elevenlabs_agent_id"),
    twilioPhoneNumber: text("twilio_phone_number"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("business_profile_org_idx").on(t.orgId)],
);

// ===========================================================================
// 16. orphan_sms — inbound SMS from unmatched phone numbers
// ===========================================================================

export const orphanSms = pgTable(
  "orphan_sms",
  {
    id: pk(),
    fromPhone: text("from_phone").notNull(),
    toPhone: text("to_phone").notNull(),
    body: text("body").notNull().default(""),
    messageSid: text("message_sid"),
    matchedContactId: uuid("matched_contact_id"),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    createdAt: createdAt(),
  },
  (t) => [
    index("orphan_sms_from_phone_idx").on(t.fromPhone),
    index("orphan_sms_received_at_idx").on(t.receivedAt),
  ],
);

// ===========================================================================
// 17. contact_suppressions — opt-out / suppression records
// ===========================================================================

export const contactSuppressions = pgTable(
  "contact_suppressions",
  {
    id: pk(),
    orgId: orgId(),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    reason: suppressionReasonEnum("reason").notNull(),
    source: text("source"),
    suppressedAt: timestamp("suppressed_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    createdAt: createdAt(),
  },
  (t) => [
    index("contact_suppressions_org_idx").on(t.orgId),
    index("contact_suppressions_org_contact_idx").on(t.orgId, t.contactId),
  ],
);

// ===========================================================================
// 18. agent_escalations — human escalation records
// ===========================================================================

export const agentEscalations = pgTable(
  "agent_escalations",
  {
    id: pk(),
    orgId: orgId(),
    runId: uuid("run_id")
      .notNull()
      .references(() => agentRuns.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id").references(() => contacts.id, {
      onDelete: "set null",
    }),
    reason: text("reason").notNull(),
    notifiedVia: text("notified_via"),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index("agent_escalations_org_idx").on(t.orgId),
    index("agent_escalations_org_run_idx").on(t.orgId, t.runId),
  ],
);

// ===========================================================================
// 19. agent_cadences — multi-step cadence definitions
// ===========================================================================

export const agentCadences = pgTable(
  "agent_cadences",
  {
    id: pk(),
    orgId: orgId(),
    agentConfigId: uuid("agent_config_id")
      .notNull()
      .references(() => agentConfigs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    totalSteps: integer("total_steps").notNull().default(1),
    exitConditions: jsonb("exit_conditions")
      .notNull()
      .default({ reply_received: true, booked: true, opted_out: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("agent_cadences_org_idx").on(t.orgId),
    index("agent_cadences_org_agent_idx").on(t.orgId, t.agentConfigId),
  ],
);

// ===========================================================================
// 20. cadence_steps — ordered steps within a cadence
// ===========================================================================

export const cadenceSteps = pgTable(
  "cadence_steps",
  {
    id: pk(),
    cadenceId: uuid("cadence_id")
      .notNull()
      .references(() => agentCadences.id, { onDelete: "cascade" }),
    stepIndex: integer("step_index").notNull(),
    delaySeconds: integer("delay_seconds").notNull().default(0),
    channel: text("channel").notNull().default("sms"),
    promptOverride: text("prompt_override"),
    templateSnippet: text("template_snippet"),
    createdAt: createdAt(),
  },
  (t) => [
    unique("cadence_steps_cadence_idx_uq").on(t.cadenceId, t.stepIndex),
    index("cadence_steps_cadence_idx").on(t.cadenceId),
  ],
);

// ===========================================================================
// 21. cadence_runs — tracks a cadence execution per entity
// ===========================================================================

export const cadenceRuns = pgTable(
  "cadence_runs",
  {
    id: pk(),
    orgId: orgId(),
    cadenceId: uuid("cadence_id")
      .notNull()
      .references(() => agentCadences.id, { onDelete: "cascade" }),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    currentStepIndex: integer("current_step_index").notNull().default(0),
    status: cadenceRunStatusEnum("status").notNull().default("running"),
    exitReason: text("exit_reason"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    nextStepAt: timestamp("next_step_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index("cadence_runs_org_status_next_idx").on(t.orgId, t.status, t.nextStepAt),
    index("cadence_runs_org_entity_idx").on(t.orgId, t.entityType, t.entityId),
    index("cadence_runs_cadence_idx").on(t.cadenceId),
  ],
);

// ===========================================================================
// 22. org_reclaim_state — per-org reclaim sweeper state
// ===========================================================================

export const orgReclaimState = pgTable("org_reclaim_state", {
  orgId: uuid("org_id").primaryKey(),
  lastSweepAt: timestamp("last_sweep_at", { withTimezone: true }),
  sweepResults: jsonb("sweep_results").notNull().default({}),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ===========================================================================
// 23. review_request_links — tokenized redirect links with click tracking
// ===========================================================================

export const reviewRequestLinks = pgTable(
  "review_request_links",
  {
    id: pk(),
    orgId: orgId(),
    contactId: uuid("contact_id").notNull(),
    agentRunId: uuid("agent_run_id").references(() => agentRuns.id, {
      onDelete: "set null",
    }),
    token: text("token").notNull().unique(),
    destinationUrl: text("destination_url").notNull(),
    clicksCount: integer("clicks_count").notNull().default(0),
    firstClickedAt: timestamp("first_clicked_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index("review_request_links_org_idx").on(t.orgId),
    index("review_request_links_token_idx").on(t.token),
    index("review_request_links_org_created_idx").on(t.orgId, t.createdAt),
  ],
);

export const orgFormConfigs = pgTable(
  "org_form_configs",
  {
    id: pk(),
    orgId: orgId(),
    slug: text("slug").notNull().unique(),
    name: text("name"),
    isActive: boolean("is_active").notNull().default(true),
    fieldMapping: jsonb("field_mapping").notNull().default({}),
    redirectUrl: text("redirect_url"),
    honeypotField: text("honeypot_field").notNull().default("website_url"),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("org_form_configs_slug_idx").on(t.slug),
    index("org_form_configs_org_active_idx").on(t.orgId, t.isActive),
  ],
);

// ===========================================================================
// 21. voice_calls — inbound/outbound voice call tracking
// ===========================================================================

export const voiceCalls = pgTable(
  "voice_calls",
  {
    id: pk(),
    orgId: text("org_id").notNull(),
    callSid: text("call_sid").notNull().unique(),
    elevenlabsConversationId: text("elevenlabs_conversation_id"),
    callerNumber: text("caller_number").notNull(),
    calledNumber: text("called_number").notNull(),
    direction: text("direction").notNull(),
    status: text("status").notNull().default("ringing"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationSeconds: integer("duration_seconds"),
    transcript: jsonb("transcript"),
    outcome: text("outcome"),
    outcomeData: jsonb("outcome_data"),
    createdAt: createdAt(),
  },
  (t) => [
    index("idx_voice_calls_org_started").on(t.orgId, t.startedAt),
    index("idx_voice_calls_call_sid").on(t.callSid),
  ],
);

// ===========================================================================
// 22. telegram_sessions — linked Telegram chats for EA
// ===========================================================================

export const telegramSessions = pgTable(
  "telegram_sessions",
  {
    id: pk(),
    orgId: text("org_id").notNull(),
    userId: text("user_id").notNull(),
    chatId: bigint("chat_id", { mode: "number" }).notNull().unique(),
    username: text("username"),
    linkedAt: timestamp("linked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
    preferences: jsonb("preferences").notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [
    index("idx_telegram_sessions_org").on(t.orgId, t.createdAt),
    index("idx_telegram_sessions_chat").on(t.chatId),
  ],
);

// ===========================================================================
// 23. telegram_messages — EA message history
// ===========================================================================

export const telegramMessages = pgTable(
  "telegram_messages",
  {
    id: pk(),
    orgId: text("org_id").notNull(),
    chatId: bigint("chat_id", { mode: "number" }).notNull(),
    direction: text("direction").notNull(),
    messageType: text("message_type"),
    text: text("text"),
    payload: jsonb("payload"),
    createdAt: createdAt(),
  },
  (t) => [
    index("idx_telegram_messages_org").on(t.orgId, t.createdAt),
    index("idx_telegram_messages_chat").on(t.chatId, t.createdAt),
  ],
);

// ===========================================================================
// 24. agent_simulations — dry-run agent testing
// ===========================================================================

export const agentSimulations = pgTable(
  "agent_simulations",
  {
    id: pk(),
    orgId: text("org_id").notNull(),
    agentType: text("agent_type").notNull(),
    scenarioName: text("scenario_name"),
    inputSignal: jsonb("input_signal").notNull(),
    simulatedOutput: jsonb("simulated_output"),
    actualOutput: jsonb("actual_output"),
    comparisonScore: numeric("comparison_score"),
    status: text("status").notNull().default("pending"),
    error: text("error"),
    durationMs: integer("duration_ms"),
    createdAt: createdAt(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_agent_simulations_org_created").on(t.orgId, t.createdAt),
    index("idx_agent_simulations_org_type").on(t.orgId, t.agentType),
  ],
);

// ===========================================================================
// 25. brief_preferences — per-org Daily Brief delivery settings
// ===========================================================================

export const briefPreferences = pgTable(
  "brief_preferences",
  {
    id: pk(),
    orgId: text("org_id").notNull().unique(),
    enabled: boolean("enabled").notNull().default(true),
    deliveryTime: text("delivery_time").notNull().default("06:00"),
    timezone: text("timezone").notNull().default("America/New_York"),
    smsEnabled: boolean("sms_enabled").notNull().default(true),
    voiceEnabled: boolean("voice_enabled").notNull().default(true),
    phoneNumber: text("phone_number"),
    voiceId: text("voice_id"),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index("idx_brief_preferences_org").on(t.orgId),
    index("idx_brief_preferences_enabled").on(t.enabled, t.deliveryTime),
  ],
);

// ===========================================================================
// 26. stripe_customers — Stripe subscription tracking
// ===========================================================================

export const stripeCustomers = pgTable(
  "stripe_customers",
  {
    id: pk(),
    orgId: text("org_id").notNull().unique(),
    stripeCustomerId: text("stripe_customer_id").notNull().unique(),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripeSubscriptionStatus: text("stripe_subscription_status").default("incomplete"),
    currentPlan: text("current_plan").notNull().default("starter"),
    currentPriceMonthly: numeric("current_price_monthly"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    paymentMethodLast4: text("payment_method_last4"),
    paymentMethodBrand: text("payment_method_brand"),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index("idx_stripe_customers_org").on(t.orgId),
    index("idx_stripe_customers_stripe_id").on(t.stripeCustomerId),
  ],
);

// ===========================================================================
// 27. billing_usage — per-period usage tracking
// ===========================================================================

export const billingUsage = pgTable(
  "billing_usage",
  {
    id: pk(),
    orgId: text("org_id").notNull(),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    smsSent: integer("sms_sent").notNull().default(0),
    voiceMinutes: integer("voice_minutes").notNull().default(0),
    agentsActive: integer("agents_active").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    unique("billing_usage_org_period_uq").on(t.orgId, t.periodStart),
    index("idx_billing_usage_org").on(t.orgId, t.periodStart),
  ],
);

// ===========================================================================
// 28. industry_prompt_templates — per-industry prompt library
// ===========================================================================

export const industryPromptTemplates = pgTable(
  "industry_prompt_templates",
  {
    id: pk(),
    industry: text("industry").notNull(),
    useCase: text("use_case").notNull(),
    name: text("name").notNull(),
    promptText: text("prompt_text").notNull(),
    variables: jsonb("variables").notNull().default([]),
    version: integer("version").notNull().default(1),
    isSystem: boolean("is_system").notNull().default(true),
    orgId: text("org_id"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("ipt_industry_idx").on(t.industry),
    index("ipt_industry_use_case_idx").on(t.industry, t.useCase),
    index("ipt_org_idx").on(t.orgId),
  ],
);

// ===========================================================================
// 29. memory_nodes — entity nodes in the org's knowledge graph
// ===========================================================================

export const memoryNodeTypeEnum = pgEnum("memory_node_type", [
  "contact",
  "opportunity",
  "agent_run",
  "brief",
  "outcome",
]);

export const memoryEdgeTypeEnum = pgEnum("memory_edge_type", [
  "touched",
  "converted",
  "followed_by",
  "caused",
  "similar_to",
]);

export const memoryNodes = pgTable(
  "memory_nodes",
  {
    id: pk(),
    orgId: text("org_id").notNull(),
    nodeType: text("node_type").notNull(),
    entityId: text("entity_id").notNull(),
    summary: text("summary"),
    embedding: vector("embedding", 1024),
    data: jsonb("data").notNull().default({}),
    relevanceScore: numeric("relevance_score").notNull().default("0"),
    lastReferencedAt: timestamp("last_referenced_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique("memory_nodes_org_type_entity_uq").on(t.orgId, t.nodeType, t.entityId),
    index("memory_nodes_org_type_idx").on(t.orgId, t.nodeType),
    index("memory_nodes_org_last_ref_idx").on(t.orgId, t.lastReferencedAt),
  ],
);

// ===========================================================================
// 30. memory_edges — relationships between memory nodes
// ===========================================================================

export const memoryEdges = pgTable(
  "memory_edges",
  {
    id: pk(),
    orgId: text("org_id").notNull(),
    fromNode: uuid("from_node").notNull().references(() => memoryNodes.id, { onDelete: "cascade" }),
    toNode: uuid("to_node").notNull().references(() => memoryNodes.id, { onDelete: "cascade" }),
    edgeType: text("edge_type").notNull(),
    weight: numeric("weight").notNull().default("1"),
    data: jsonb("data").notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [
    unique("memory_edges_org_from_to_type_uq").on(t.orgId, t.fromNode, t.toNode, t.edgeType),
    index("memory_edges_org_from_idx").on(t.orgId, t.fromNode),
    index("memory_edges_org_to_idx").on(t.orgId, t.toNode),
  ],
);

// ===========================================================================
// 31. operator_playbooks — replayable action sequences
// ===========================================================================

export const operatorPlaybooks = pgTable(
  "operator_playbooks",
  {
    id: pk(),
    orgId: text("org_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    triggerSignal: jsonb("trigger_signal").notNull().default({}),
    steps: jsonb("steps").notNull().default([]),
    successCount: integer("success_count").notNull().default(0),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    derivedFromSignalIds: jsonb("derived_from_signal_ids").notNull().default([]),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("operator_playbooks_org_active_idx").on(t.orgId, t.isActive),
  ],
);

// ===========================================================================
// 32. agent_metrics — per-agent daily performance rollup
// ===========================================================================

export const agentMetrics = pgTable(
  "agent_metrics",
  {
    id: pk(),
    orgId: text("org_id").notNull(),
    agentId: text("agent_id").notNull(),
    agentType: text("agent_type").notNull(),
    metricDate: date("metric_date").notNull(),
    runs: integer("runs").notNull().default(0),
    successes: integer("successes").notNull().default(0),
    failures: integer("failures").notNull().default(0),
    leadsTouched: integer("leads_touched").notNull().default(0),
    leadsConverted: integer("leads_converted").notNull().default(0),
    messagesSent: integer("messages_sent").notNull().default(0),
    avgResponseSeconds: numeric("avg_response_seconds"),
    data: jsonb("data").notNull().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique("agent_metrics_org_agent_date_uq").on(t.orgId, t.agentId, t.metricDate),
    index("agent_metrics_org_date_idx").on(t.orgId, t.metricDate),
    index("agent_metrics_org_type_idx").on(t.orgId, t.agentType),
  ],
);

// ===========================================================================
// 33. call_tasks — outbound voice call task queue
// ===========================================================================

export const callTasks = pgTable(
  "call_tasks",
  {
    id: pk(),
    orgId: text("org_id").notNull(),
    contactId: text("contact_id"),
    contactName: text("contact_name"),
    contactPhone: text("contact_phone").notNull(),
    callGoal: text("call_goal").notNull().default("custom"),
    customPrompt: text("custom_prompt"),
    status: text("status").notNull().default("queued"),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull().default(sql`now()`),
    startedAt: timestamp("started_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    agentId: uuid("agent_id"),
    briefId: uuid("brief_id"),
    convaiConversationId: text("convai_conversation_id"),
    transcript: jsonb("transcript"),
    outcome: text("outcome"),
    outcomeNotes: text("outcome_notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("call_tasks_org_status_sched_idx").on(t.orgId, t.status, t.scheduledFor),
    index("call_tasks_org_agent_idx").on(t.orgId, t.agentId),
    index("call_tasks_org_brief_idx").on(t.orgId, t.briefId),
  ],
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
export type OrphanSms = typeof orphanSms.$inferSelect;
export type NewOrphanSms = typeof orphanSms.$inferInsert;
export type ContactSuppression = typeof contactSuppressions.$inferSelect;
export type NewContactSuppression = typeof contactSuppressions.$inferInsert;
export type AgentEscalation = typeof agentEscalations.$inferSelect;
export type NewAgentEscalation = typeof agentEscalations.$inferInsert;
export type AgentCadence = typeof agentCadences.$inferSelect;
export type NewAgentCadence = typeof agentCadences.$inferInsert;
export type CadenceStep = typeof cadenceSteps.$inferSelect;
export type NewCadenceStep = typeof cadenceSteps.$inferInsert;
export type CadenceRun = typeof cadenceRuns.$inferSelect;
export type NewCadenceRun = typeof cadenceRuns.$inferInsert;
export type OrgReclaimState = typeof orgReclaimState.$inferSelect;
export type ReviewRequestLink = typeof reviewRequestLinks.$inferSelect;
export type NewReviewRequestLink = typeof reviewRequestLinks.$inferInsert;
export type OrgFormConfig = typeof orgFormConfigs.$inferSelect;
export type NewOrgFormConfig = typeof orgFormConfigs.$inferInsert;
export type VoiceCall = typeof voiceCalls.$inferSelect;
export type NewVoiceCall = typeof voiceCalls.$inferInsert;
export type TelegramSession = typeof telegramSessions.$inferSelect;
export type NewTelegramSession = typeof telegramSessions.$inferInsert;
export type TelegramMessage = typeof telegramMessages.$inferSelect;
export type NewTelegramMessage = typeof telegramMessages.$inferInsert;
export type AgentSimulation = typeof agentSimulations.$inferSelect;
export type NewAgentSimulation = typeof agentSimulations.$inferInsert;
export type BriefPreference = typeof briefPreferences.$inferSelect;
export type NewBriefPreference = typeof briefPreferences.$inferInsert;
export type StripeCustomer = typeof stripeCustomers.$inferSelect;
export type NewStripeCustomer = typeof stripeCustomers.$inferInsert;
export type BillingUsageRow = typeof billingUsage.$inferSelect;
export type NewBillingUsage = typeof billingUsage.$inferInsert;
export type IndustryPromptTemplate = typeof industryPromptTemplates.$inferSelect;
export type NewIndustryPromptTemplate = typeof industryPromptTemplates.$inferInsert;
export type AgentMetric = typeof agentMetrics.$inferSelect;
export type NewAgentMetric = typeof agentMetrics.$inferInsert;
export type MemoryNode = typeof memoryNodes.$inferSelect;
export type NewMemoryNode = typeof memoryNodes.$inferInsert;
export type MemoryEdge = typeof memoryEdges.$inferSelect;
export type NewMemoryEdge = typeof memoryEdges.$inferInsert;
export type OperatorPlaybook = typeof operatorPlaybooks.$inferSelect;
export type NewOperatorPlaybook = typeof operatorPlaybooks.$inferInsert;
export type CallTask = typeof callTasks.$inferSelect;
export type NewCallTask = typeof callTasks.$inferInsert;

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
  "contact_suppressions",
  "agent_escalations",
  "agent_cadences",
  "cadence_runs",
  "org_reclaim_state",
  "review_request_links",
  "org_form_configs",
  "voice_calls",
  "telegram_sessions",
  "telegram_messages",
  "agent_simulations",
  "brief_preferences",
  "stripe_customers",
  "billing_usage",
  "industry_prompt_templates",
  "agent_metrics",
  "memory_nodes",
  "memory_edges",
  "operator_playbooks",
  "call_tasks",
] as const;

// Suppress unused-var warnings for helpers not referenced at top level
void primaryKey;
