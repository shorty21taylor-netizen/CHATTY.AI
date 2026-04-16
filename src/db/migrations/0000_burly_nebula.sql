CREATE TYPE "public"."agent_activation_mode" AS ENUM('shadow', 'draft', 'full_auto');--> statement-breakpoint
CREATE TYPE "public"."agent_run_status" AS ENUM('success', 'failed', 'escalated', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."agent_status" AS ENUM('not_configured', 'draft', 'shadow', 'active', 'paused');--> statement-breakpoint
CREATE TYPE "public"."appointment_booked_by" AS ENUM('ai_agent', 'manual', 'referral');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('confirmed', 'pending', 'rescheduled', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."contact_status" AS ENUM('active', 'nurturing', 'won', 'lost', 'cold');--> statement-breakpoint
CREATE TYPE "public"."contact_type" AS ENUM('lead', 'customer', 'past_customer', 'vip');--> statement-breakpoint
CREATE TYPE "public"."deal_stage" AS ENUM('new_lead', 'qualified', 'proposal_sent', 'negotiation', 'closing', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."feedback_type" AS ENUM('action_taken', 'action_ignored', 'outcome', 'comment');--> statement-breakpoint
CREATE TYPE "public"."insurance_experience" AS ENUM('none', 'some', 'primary_focus');--> statement-breakpoint
CREATE TYPE "public"."pricing_philosophy" AS ENUM('premium', 'mid', 'value', 'insurance_first');--> statement-breakpoint
CREATE TYPE "public"."brief_priority" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('draft', 'sent', 'viewed', 'won', 'lost', 'expired');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('salesforce', 'hubspot', 'google_ads', 'facebook_ads', 'gmail', 'weather', 'twilio_sms', 'internal_crm', 'custom');--> statement-breakpoint
CREATE TABLE "agent_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"agent_run_id" uuid NOT NULL,
	"action_type" text NOT NULL,
	"action_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"result" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"agent_type" text NOT NULL,
	"name" text NOT NULL,
	"status" "agent_status" DEFAULT 'not_configured' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"completeness_pct" integer DEFAULT 0 NOT NULL,
	"activation_mode" "agent_activation_mode",
	"last_run_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_configs_org_type_uq" UNIQUE("org_id","agent_type")
);
--> statement-breakpoint
CREATE TABLE "agent_knowledge_base" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"doc_name" text NOT NULL,
	"doc_type" text NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1024),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"trigger_event_id" uuid,
	"contact_id" uuid,
	"status" "agent_run_status" NOT NULL,
	"reasoning_trace" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"duration_ms" integer,
	"cost_usd" numeric,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"scenario_tag" text NOT NULL,
	"template_text" text NOT NULL,
	"variant" text,
	"performance_score" numeric,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"appointment_type" text,
	"address" text,
	"status" "appointment_status" DEFAULT 'pending' NOT NULL,
	"booked_by" "appointment_booked_by" DEFAULT 'manual' NOT NULL,
	"agent_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"company_name" text,
	"dba" text,
	"primary_service_type" text,
	"service_subtypes" text[] DEFAULT '{}'::text[] NOT NULL,
	"year_founded" integer,
	"team_size" integer,
	"service_area" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"website" text,
	"google_profile_url" text,
	"main_phone" text,
	"billing_address" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"pricing_philosophy" "pricing_philosophy",
	"usp_1" text,
	"usp_2" text,
	"usp_3" text,
	"warranty_years" integer,
	"certifications" text[] DEFAULT '{}'::text[] NOT NULL,
	"insurance_experience" "insurance_experience",
	"google_reviews_count" integer,
	"google_rating" real,
	"bbb_rating" text,
	"competitors" text[] DEFAULT '{}'::text[] NOT NULL,
	"customer_themes" text[] DEFAULT '{}'::text[] NOT NULL,
	"owner_first_name" text,
	"voice_formal_casual" integer DEFAULT 5,
	"voice_concise_detailed" integer DEFAULT 5,
	"voice_warm_direct" integer DEFAULT 5,
	"sample_sentences" text[] DEFAULT '{}'::text[] NOT NULL,
	"never_use_phrases" text[] DEFAULT '{}'::text[] NOT NULL,
	"local_phrases" text[] DEFAULT '{}'::text[] NOT NULL,
	"business_hours" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"timezone" text,
	"lunch_break" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"after_hours_emergency" boolean DEFAULT false NOT NULL,
	"quiet_hours" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "business_profile_org_id_unique" UNIQUE("org_id")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"phone" text,
	"email" text,
	"source" text,
	"type" "contact_type" DEFAULT 'lead' NOT NULL,
	"status" "contact_status" DEFAULT 'active' NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"notes" text,
	"address_line1" text,
	"city" text,
	"state" text,
	"zip" text,
	"last_activity_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"proposal_id" uuid,
	"stage" "deal_stage" DEFAULT 'new_lead' NOT NULL,
	"value_usd" numeric DEFAULT '0' NOT NULL,
	"days_in_stage" integer DEFAULT 0 NOT NULL,
	"assigned_agent_id" uuid,
	"last_activity_at" timestamp with time zone,
	"last_activity_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decision_briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"brief_date" date NOT NULL,
	"context_id" uuid,
	"decision_engine_trace" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"recommendations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"priority" "brief_priority" DEFAULT 'medium' NOT NULL,
	"voice_summary_text" text,
	"voice_summary_url" text,
	"delivered_at" timestamp with time zone,
	"delivered_via" text,
	"operator_feedback" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"brief_id" uuid,
	"feedback_type" "feedback_type" NOT NULL,
	"feedback_text" text,
	"confidence_delta" numeric,
	"outcome_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "micro_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"metric_date" date NOT NULL,
	"vertical" text,
	"metric_name" text NOT NULL,
	"metric_value" numeric NOT NULL,
	"benchmark" numeric,
	"trend" numeric,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"title" text NOT NULL,
	"service_type" text,
	"amount_usd" numeric DEFAULT '0' NOT NULL,
	"status" "proposal_status" DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp with time zone,
	"last_viewed_at" timestamp with time zone,
	"view_count" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signal_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text,
	"event_type" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"embedding" vector(1024),
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signal_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"source_type" "source_type" NOT NULL,
	"name" text NOT NULL,
	"credentials" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_sync_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unified_context" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"context_date" date NOT NULL,
	"signal_summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"recent_events" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"previous_briefs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"external_context" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unified_context_org_date_uq" UNIQUE("org_id","context_date")
);
--> statement-breakpoint
ALTER TABLE "agent_activity" ADD CONSTRAINT "agent_activity_agent_run_id_agent_runs_id_fk" FOREIGN KEY ("agent_run_id") REFERENCES "public"."agent_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_knowledge_base" ADD CONSTRAINT "agent_knowledge_base_agent_id_agent_configs_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_agent_id_agent_configs_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_trigger_event_id_signal_events_id_fk" FOREIGN KEY ("trigger_event_id") REFERENCES "public"."signal_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_templates" ADD CONSTRAINT "agent_templates_agent_id_agent_configs_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_agent_id_agent_configs_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_configs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_assigned_agent_id_agent_configs_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."agent_configs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_briefs" ADD CONSTRAINT "decision_briefs_context_id_unified_context_id_fk" FOREIGN KEY ("context_id") REFERENCES "public"."unified_context"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_events" ADD CONSTRAINT "feedback_events_brief_id_decision_briefs_id_fk" FOREIGN KEY ("brief_id") REFERENCES "public"."decision_briefs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_activity_org_run_idx" ON "agent_activity" USING btree ("org_id","agent_run_id");--> statement-breakpoint
CREATE INDEX "agent_activity_org_created_idx" ON "agent_activity" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX "agent_configs_org_status_idx" ON "agent_configs" USING btree ("org_id","status");--> statement-breakpoint
CREATE INDEX "agent_kb_org_agent_idx" ON "agent_knowledge_base" USING btree ("org_id","agent_id");--> statement-breakpoint
CREATE INDEX "agent_kb_org_type_idx" ON "agent_knowledge_base" USING btree ("org_id","doc_type");--> statement-breakpoint
CREATE INDEX "agent_runs_org_agent_idx" ON "agent_runs" USING btree ("org_id","agent_id");--> statement-breakpoint
CREATE INDEX "agent_runs_org_created_idx" ON "agent_runs" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX "agent_runs_org_contact_idx" ON "agent_runs" USING btree ("org_id","contact_id");--> statement-breakpoint
CREATE INDEX "agent_templates_org_agent_idx" ON "agent_templates" USING btree ("org_id","agent_id");--> statement-breakpoint
CREATE INDEX "agent_templates_scenario_idx" ON "agent_templates" USING btree ("org_id","scenario_tag");--> statement-breakpoint
CREATE INDEX "appointments_org_scheduled_idx" ON "appointments" USING btree ("org_id","scheduled_at");--> statement-breakpoint
CREATE INDEX "appointments_org_contact_idx" ON "appointments" USING btree ("org_id","contact_id");--> statement-breakpoint
CREATE INDEX "appointments_org_status_idx" ON "appointments" USING btree ("org_id","status");--> statement-breakpoint
CREATE INDEX "business_profile_org_idx" ON "business_profile" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "contacts_org_idx" ON "contacts" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "contacts_org_status_idx" ON "contacts" USING btree ("org_id","status");--> statement-breakpoint
CREATE INDEX "contacts_org_type_idx" ON "contacts" USING btree ("org_id","type");--> statement-breakpoint
CREATE INDEX "contacts_org_lastact_idx" ON "contacts" USING btree ("org_id","last_activity_at");--> statement-breakpoint
CREATE INDEX "contacts_org_phone_idx" ON "contacts" USING btree ("org_id","phone");--> statement-breakpoint
CREATE INDEX "contacts_org_email_idx" ON "contacts" USING btree ("org_id","email");--> statement-breakpoint
CREATE INDEX "deals_org_stage_idx" ON "deals" USING btree ("org_id","stage");--> statement-breakpoint
CREATE INDEX "deals_org_contact_idx" ON "deals" USING btree ("org_id","contact_id");--> statement-breakpoint
CREATE INDEX "deals_org_lastact_idx" ON "deals" USING btree ("org_id","last_activity_at");--> statement-breakpoint
CREATE INDEX "decision_briefs_org_date_idx" ON "decision_briefs" USING btree ("org_id","brief_date");--> statement-breakpoint
CREATE INDEX "decision_briefs_org_created_idx" ON "decision_briefs" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX "feedback_events_org_brief_idx" ON "feedback_events" USING btree ("org_id","brief_id");--> statement-breakpoint
CREATE INDEX "feedback_events_org_created_idx" ON "feedback_events" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX "micro_metrics_org_date_idx" ON "micro_metrics" USING btree ("org_id","metric_date");--> statement-breakpoint
CREATE INDEX "micro_metrics_org_name_idx" ON "micro_metrics" USING btree ("org_id","metric_name");--> statement-breakpoint
CREATE INDEX "proposals_org_contact_idx" ON "proposals" USING btree ("org_id","contact_id");--> statement-breakpoint
CREATE INDEX "proposals_org_status_idx" ON "proposals" USING btree ("org_id","status");--> statement-breakpoint
CREATE INDEX "proposals_org_created_idx" ON "proposals" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX "signal_events_org_created_idx" ON "signal_events" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX "signal_events_org_type_idx" ON "signal_events" USING btree ("org_id","event_type");--> statement-breakpoint
CREATE INDEX "signal_events_entity_idx" ON "signal_events" USING btree ("org_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "signal_sources_org_idx" ON "signal_sources" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "signal_sources_org_type_idx" ON "signal_sources" USING btree ("org_id","source_type");--> statement-breakpoint
CREATE INDEX "unified_context_org_date_idx" ON "unified_context" USING btree ("org_id","context_date");