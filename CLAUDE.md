# Chatty AI -- AI Operating System for Home Service Contractors

## Project Overview
Chatty AI is a 3-layer AI OS that turns raw business signals into daily actionable intelligence for contractors (roofing, HVAC, solar, exteriors, remodeling).

**Architecture: Chatty AI is the CRM.** It is a built-in lightweight CRM plus AI
operator. There is **no** OAuth integration with Salesforce, HubSpot, or other
external CRMs — contractors manage contacts, leads, estimates, jobs, and
interactions directly in Chatty, and every write emits a signal that the
Decision Engine reasons over.

**Layers:**
1. **Signal Network** -- Ingests push-driven signals from the built-in CRM
   (contact/lead/estimate/job/interaction activity) plus optional pull-based
   signals (weather, custom webhooks).
2. **The Brain (Decision Engine)** -- 3-pass Claude prompt chain that reasons over signals and produces decisions.
3. **Daily Brief** -- Delivers actionable intelligence via SMS at 6am + Mission Control dashboard.

## Tech Stack
- **Framework:** Next.js 15 (App Router, plain JavaScript frontend, TypeScript for backend/API routes)
- **Hosting:** Railway (Next.js deployment)
- **Database:** Railway Postgres + pgvector extension
- **Auth:** Clerk Organizations (multi-tenant, row-level security)
- **Background Jobs:** Inngest
- **AI:** Anthropic Claude Sonnet (decision engine), Voyage AI (embeddings)
- **Voice:** ElevenLabs Conversational AI (live voice agents), ElevenLabs TTS (voice notes), ElevenLabs Voice Lab (cloning)
- **SMS:** Twilio (per-client sub-accounts)
- **Payments:** Stripe
- **Cache:** Railway Redis
- **UI:** Tailwind CSS, Framer Motion, Lucide React, Recharts

## CRITICAL: Voice Architecture
**DO NOT use Vapi.** ElevenLabs is the exclusive voice provider:
- **ElevenLabs Conversational AI** -- Live inbound/outbound voice agents (natural conversations)
- **ElevenLabs TTS** -- Text-to-speech for voice notes in Daily Brief
- **ElevenLabs Voice Lab** -- Voice cloning for branded agent voices
- Remove any Vapi references from the codebase immediately

## Database Schema (6 Signal Tables + 5 CRM Tables)

### 1. signal_sources
Registered data source connections per organization.
- id: UUID (primary key)
- org_id: TEXT (from Clerk)
- source_type: TEXT (CHECK: internal_crm, google_ads, facebook_ads, gmail, weather, custom)
- name: TEXT
- credentials: JSONB (encrypted API keys if applicable)
- config: JSONB (source-specific settings)
- last_sync_at: TIMESTAMPTZ
- is_active: BOOLEAN
App-layer filter: `org_id = auth().orgId`

The built-in CRM is registered as `source_type = 'internal_crm'` and is
push-driven — emit helpers on `InternalCrmAdapter` are called directly from
CRM API routes instead of a scheduled pull.

### 2. signal_events
Normalized events from all sources with vector embeddings.
- id: UUID (primary key)
- org_id: UUID (FK)
- source_type: TEXT
- event_type: TEXT (lead_received, ad_click, email_opened, etc.)
- entity_type: TEXT (lead, customer, opportunity)
- data: JSONB (raw normalized event data)
- embedding: vector (pgvector for semantic search)
- created_at: TIMESTAMP
RLS: org_id = auth.org_id()

### 3. unified_context
Denormalized view per account (what Decision Engine reads).
- id: UUID (primary key)
- org_id: UUID (FK)
- context_date: DATE
- signal_summary: JSONB
- recent_events: JSONB
- previous_briefs: JSONB
- external_context: JSONB
RLS: org_id = auth.org_id()

### 4. decision_briefs
Generated Daily Briefs with full decision lineage.
- id: UUID (primary key)
- org_id: UUID (FK)
- brief_date: DATE
- context_id: UUID (FK to unified_context)
- decision_engine_trace: JSONB (full 3-pass reasoning)
- recommendations: JSONB (array of action items)
- voice_summary: TEXT (TTS audio transcript)
- delivered_at: TIMESTAMP
- operator_feedback: JSONB
RLS: org_id = auth.org_id()

### 5. micro_metrics
Vertical-specific KPIs per organization.
- id: UUID (primary key)
- org_id: UUID (FK)
- metric_date: DATE
- vertical: TEXT (roofing, hvac, solar)
- metric_name: TEXT
- metric_value: NUMERIC
- benchmark: NUMERIC
- trend: NUMERIC (WoW change %)
RLS: org_id = auth.org_id()

### 6. feedback_events
Operator outcomes linked back to briefs.
- id: UUID (primary key)
- org_id: UUID (FK)
- brief_id: UUID (FK to decision_briefs)
- feedback_type: ENUM (action_taken, action_ignored, outcome, comment)
- feedback_text: TEXT
- confidence_delta: NUMERIC
- outcome_data: JSONB
RLS: org_id = auth.org_id()

## CRM Schema (5 Tables + 2 Views)

All CRM tables have `org_id TEXT NOT NULL`, `updated_at` auto-maintained via
trigger, and are scoped per-org at the application layer (every query filters
by `org_id`).

### 7. contacts
Customers, prospects, property managers, GCs.
- id: UUID, org_id: TEXT
- first_name, last_name, email, phone, company
- address_line1/2, city, state, zip
- property_type (residential, commercial, multi_family, hoa)
- contact_type (homeowner, property_manager, general_contractor, realtor, insurance_adjuster, other)
- source (manual, website, referral, ad_click, phone_call, walk_in, social_media, home_advisor, angies_list, google_lsa, other)
- source_detail, status (active, inactive, do_not_contact)
- tags: TEXT[], custom_fields: JSONB, notes: TEXT

### 8. leads
Opportunities attached to a contact.
- id: UUID, org_id: TEXT, contact_id: UUID (ON DELETE CASCADE)
- title, description
- service_type (roofing, hvac, solar, siding, windows, gutters, painting, remodeling, plumbing, electrical, landscaping, other)
- status (new, contacted, appointment_set, inspected, quoted, negotiating, won, lost, on_hold)
- lost_reason, estimated_value, assigned_to, priority (hot, high, medium, low)
- follow_up_date (DATE), appointment_date (TIMESTAMPTZ), closed_at
- source, source_detail, tags, custom_fields, notes

### 9. estimates
Quotes sent to contacts, optionally tied to a lead.
- id: UUID, org_id: TEXT, contact_id: UUID, lead_id: UUID (ON DELETE SET NULL)
- estimate_number: TEXT (e.g. `EST-2026-0042`, auto-generated per-org per-year)
- title, line_items: JSONB (array of {description, qty, unit_price, total})
- subtotal, tax_rate, tax_amount, discount, total
- status (draft, sent, viewed, accepted, rejected, expired, revised)
- valid_until, sent_at, responded_at

### 10. jobs
Work in progress / completed for a contact, optionally tied to a lead/estimate.
- id: UUID, org_id: TEXT, contact_id: UUID
- lead_id, estimate_id: UUID (ON DELETE SET NULL)
- title, description, service_type
- status (scheduled, materials_ordered, in_progress, on_hold, completed, punch_list, invoiced, paid, warranty)
- job_value, cost, profit_margin
- start_date, end_date, completed_at
- job_address_line1/2, job_city, job_state, job_zip
- assigned_crew: JSONB[], tags, custom_fields, notes

### 11. interactions
Call/email/SMS/note/meeting/site_visit history, linked to contact + optionally lead/job.
- id: UUID, org_id: TEXT
- contact_id: UUID, lead_id, job_id: UUID (ON DELETE SET NULL)
- interaction_type (call, email, sms, note, meeting, site_visit, voicemail, follow_up)
- direction (inbound, outbound, internal)
- subject, summary, details
- duration_seconds, outcome, created_by, occurred_at

### Views
- **crm_pipeline_summary** — open leads + weighted pipeline value grouped by service_type and status.
- **crm_daily_activity** — today's interaction counts by interaction_type + direction.

## API Patterns & Middleware

### Authentication
All API routes enforce Clerk authentication:
```typescript
import { auth } from "@clerk/nextjs/server";
export async function POST(req: Request) {
  const { orgId, userId } = await auth();
  if (!orgId) return Response.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Signal Ingestion: POST /api/signal/ingest
Validates source_key, normalizes data through adapter, creates signal_events row with embedding, triggers signal-sync workflow in Inngest.

### Decision Trigger: POST /api/decision/trigger
Builds unified_context from signal_events for today, triggers decision-run workflow in Inngest, returns immediately (async).

### CRM REST API: /api/crm/*
All CRM routes enforce Clerk `orgId`, run Zod validation, rate limit per
org, and — on writes — fire-and-forget an `emit*` helper from
`src/lib/signals/adapters/internal-crm.ts` so the Decision Engine sees the
activity.

- **Contacts:** `GET /api/crm/contacts`, `POST /api/crm/contacts`,
  `GET /api/crm/contacts/[id]` (returns contact + recent_leads + interaction count),
  `PATCH /api/crm/contacts/[id]`, `DELETE /api/crm/contacts/[id]` (soft-delete → `status=inactive`).
  POST emits `contact_created`.
- **Leads:** `GET /api/crm/leads` (filters: status, service_type, priority, assigned_to, overdue_only),
  `POST /api/crm/leads`, `GET /api/crm/leads/[id]` (returns lead + contact + interactions),
  `PATCH /api/crm/leads/[id]` with `{action:"update_status"}` logs the transition as
  an interaction and emits `lead_status_changed`. POST emits `lead_created`.
- **Estimates:** `GET /api/crm/estimates`, `POST /api/crm/estimates` (auto-generates
  `EST-YYYY-NNNN` per-org per-year; derives subtotal/tax/total from line_items),
  `GET`/`PATCH /api/crm/estimates/[id]`. PATCH to `status=sent` emits `estimate_sent`;
  `status=accepted` emits `estimate_accepted`.
- **Jobs:** `GET /api/crm/jobs` (supports `start_date_from/to`, `end_date_from/to`),
  `POST /api/crm/jobs`, `GET`/`PATCH /api/crm/jobs/[id]`. PATCH status-change emits
  `job_status_changed`; `status=completed` additionally emits `job_completed`.
- **Interactions:** `GET /api/crm/interactions` (filters: contact_id, lead_id, job_id, type, direction, since),
  `POST /api/crm/interactions`. POST emits `interaction_logged`.
- **Pipeline:** `GET /api/crm/pipeline` — returns pipeline_summary + daily_activity
  + overdue_follow_ups + derived totals for the dashboard header.

### Webhooks: Verify Before Processing
All webhook handlers verify signatures (Twilio X-Twilio-Signature, Stripe stripe-signature, CRM hmac-signature).

### Voice Call Flow (ElevenLabs Conversational AI)
Inbound call → Twilio → `/api/voice/twilio-inbound` → inserts `voice_calls`
row → returns TwiML `<Connect><Stream>` pointing to ElevenLabs ConvAI WebSocket
(`wss://api.elevenlabs.io/v1/convai/conversation?agent_id=...`). ElevenLabs
agent qualifies the caller using an industry-aware system prompt built from
the org's `business_profile`. On call completion Twilio hits
`/api/voice/twilio-status` which updates the `voice_calls` row with duration
and status, fetches the conversation transcript from ElevenLabs, emits a
`signal_event` (`source_type='voice_call'`, `event_type='inbound_call_completed'`),
and dispatches downstream agents. Optionally ElevenLabs posts to
`/api/voice/elevenlabs-webhook` with outcome analysis to enrich the row.

### Telegram Executive Assistant
Personal EA for the operator, accessible via Telegram bot.

**Link Flow:** Dashboard → `POST /api/telegram/link` (Clerk-authed) → generates
6-digit code stored in Redis with 10min TTL → returns `https://t.me/{bot}?start={code}`.
User opens the link in Telegram → bot receives `/start {code}` → webhook at
`/api/webhooks/telegram` looks up the code in Redis, creates a `telegram_sessions`
row linking `chat_id` ↔ `org_id`, deletes the code.

**Message Flow:** Inbound Telegram message → webhook verifies
`X-Telegram-Bot-Api-Secret-Token` → persists to `telegram_messages` →
dispatches to `ea-agent.ts`:
- `/brief` — fetches today's Daily Brief via `briefQueries.today()`
- `/metrics` — fetches `crm_daily_activity` view
- `/pipeline` — fetches `crm_pipeline_summary` + top 5 open leads
- `/help` — static command reference
- Plain text — Claude Haiku (`claude-haiku-4-5-20251001`) with org metrics context

**Files:**
- `src/lib/telegram/client.ts` — Telegram Bot API wrapper (sendMessage, setWebhook, etc.)
- `src/lib/telegram/ea-agent.ts` — Command dispatcher + Claude Haiku NL fallback
- `src/app/api/webhooks/telegram/route.ts` — Webhook handler
- `src/app/api/telegram/link/route.ts` — Link code generation (Clerk-authed)
- `src/app/api/telegram/messages/route.ts` — Messages + sessions API (Clerk-authed)
- `src/app/dashboard/agents/telegram-ea/page.js` — Dashboard UI
- `db/migrations/010_telegram_ea.sql` — telegram_sessions + telegram_messages tables

## Stripe Billing & Plan Gating

### Data Model
Two hand-written tables in `db/migrations/013_stripe_billing.sql` (NOT managed
by drizzle-kit — apply manually on new environments):

- **stripe_customers** — links `org_id` (Clerk) to `stripe_customer_id`,
  tracks `stripe_subscription_id`, `stripe_subscription_status`, `current_plan`
  (starter | pro | scale), `cancel_at_period_end`, `current_period_end`.
  RLS: `org_id = current_setting('app.current_org_id')`.
- **billing_usage** — per-org per-month usage counters: `sms_sent`,
  `voice_minutes`, `agents_active`. Unique on `(org_id, period_start)`.
  RLS same as above.

**Applying the migration on Railway:**
```bash
railway run psql $DATABASE_URL -f db/migrations/013_stripe_billing.sql
```

### Plan Limits (defined in `src/lib/stripe/client.ts`)
| | Starter | Pro | Scale |
|---|---|---|---|
| SMS/mo | 2,000 | 5,000 | 20,000 |
| Voice min | 200 | 500 | 2,000 |
| Agents | 3 | 11 | 11 |
| Team seats | 1 | 5 | -1 (unlimited) |
| Voice Lab | No | No | Yes |
| Priority Engine | No | No | Yes |

A limit value of **-1** means unlimited. Price IDs are loaded from env vars
`STRIPE_PRICE_<PLAN>_<CYCLE>` (e.g. `STRIPE_PRICE_PRO_MONTHLY`).

### Billing-Gate Helpers (`src/lib/stripe/billing-gate.ts`)
- `getBillingStatus(orgId)` — returns `{ hasSubscription, plan, status, isActive,
  isTrial, cancelAtPeriodEnd, currentPeriodEnd }`.
- `checkUsageLimit(orgId, resource)` — returns `{ allowed, current, limit, resource }`.
  Call this **before** any spend path (SMS send, voice call start, agent creation).
- `incrementUsage(orgId, resource, amount?)` — atomic `INSERT … ON CONFLICT DO
  UPDATE SET field = field + amount`. Call **after** the spend succeeds.

### API Routes
- **`POST /api/stripe/create-session`** — Clerk-authed. Accepts `{ plan, billing_cycle }`.
  Upserts `stripe_customers` row if first checkout, creates Stripe Checkout Session,
  returns `{ url }`.
- **`POST /api/stripe/portal`** — Clerk-authed. Creates Stripe Customer Portal
  session, returns `{ url }`. Used by "Manage billing" / "Update card" buttons.
- **`GET /api/stripe/status`** — Clerk-authed. Returns plan + subscription status +
  per-resource usage + plan limits in one payload. **Degrades gracefully**: if the
  DB tables don't exist or any query fails, logs the error and returns a free-tier
  fallback (starter plan, zero usage, full limits) so the dashboard never 500s.
- **`POST /api/webhooks/stripe`** — Verifies `stripe-signature` via
  `getStripe().webhooks.constructEvent()`. Handled events:
  - `checkout.session.completed` — activates subscription, sets plan from metadata
  - `invoice.paid` — marks subscription active
  - `invoice.payment_failed` — marks past_due
  - `customer.subscription.updated` — syncs status, cancel_at_period_end, current_period_end
  - `customer.subscription.deleted` — marks canceled, clears subscription ID

### Dashboard UX
- **`/checkout?plan=starter&billing=monthly`** — Plan summary with cycle toggle
  (monthly/annual). "Continue to Stripe" → POST create-session → redirect to
  Stripe Checkout. On success Stripe redirects to `/dashboard?checkout=success`;
  on cancel to `/checkout?canceled=true`.
- **`/dashboard/billing`** — Fetches `GET /api/stripe/status`, shows plan hero
  with status pill, usage bars (SMS / voice / agents), payment method card, and
  plan comparison grid. "Manage billing" → POST portal → Stripe Customer Portal.

### Files
- `db/migrations/013_stripe_billing.sql` — stripe_customers + billing_usage tables
- `src/lib/stripe/client.ts` — Stripe singleton, plan limits, price mapping
- `src/lib/stripe/billing-gate.ts` — getBillingStatus, checkUsageLimit, incrementUsage
- `src/app/api/stripe/create-session/route.ts` — Checkout session creation
- `src/app/api/stripe/portal/route.ts` — Billing portal session creation
- `src/app/api/stripe/status/route.ts` — GET billing status (graceful fallback)
- `src/app/api/webhooks/stripe/route.ts` — Webhook handler with DB writes
- `src/app/checkout/page.js` — Checkout page with plan/cycle selection
- `src/app/dashboard/billing/page.js` — Billing dashboard with live data

## Decision Engine: 3-Pass Claude Chain

### Pass 1: Signal Analysis
Claude reads all signals from past 24h and identifies patterns (opportunities, quality indicators, risk signals, anomalies).
Input: unified_context | Output: structured JSON with patterns + confidence

### Pass 2: Pattern Recognition
Claude reasons about what patterns mean vs historical baseline, identifies operator bottleneck, highest ROI action.
Input: Pass 1 output + previous_briefs | Output: decision framework with top 3-5 recommendations

### Pass 3: Brief Generation
Claude drafts the Daily Brief: 3-5 bullet points max, each with action + why + expected impact, plus voice-friendly summary for TTS.
Input: Pass 2 output | Output: brief_id with full decision_engine_trace logged

## Agent Simulation Runtime

Dry-run regression harness for all agents. Operators trigger simulations against
canned or custom signals; the runner dispatches to a pure (side-effect-free)
dry-run handler from the registry, captures simulated output, and optionally
compares against a golden `actual_output` to produce a `comparison_score`
(0.0–1.0).

**Flow:** Dashboard or API `POST /api/simulations/trigger` → creates
`agent_simulations` row (status=pending) → dispatches Inngest event
`simulation/run` → `simulationRunWorkflow` calls `runSimulation()` →
registry dry-run handler returns `{ reply_preview, actions_planned, confidence }`
→ scoring engine computes `comparison_score` → row updated to
status=completed|failed with duration_ms.

**Files:**
- `src/lib/simulations/runner.ts` — orchestrates create → dispatch → score → update
- `src/lib/simulations/registry.ts` — maps agent_type → dry-run handler (10 agents)
- `src/lib/simulations/scoring.ts` — field-level comparison (deep-equal=1.0, partial=weighted)
- `src/lib/simulations/scenarios.ts` — 6 canned scenarios covering main agent types
- `src/inngest/workflows/simulation-run.ts` — Inngest function for async execution
- `src/app/api/simulations/trigger/route.ts` — POST trigger endpoint (Clerk-authed)
- `src/app/api/simulations/[id]/route.ts` — GET single simulation (org-filtered)
- `src/app/api/simulations/list/route.ts` — GET last 50 simulations for org
- `src/app/dashboard/agents/simulations/page.js` — Dashboard UI with run modal
- `db/migrations/011_agent_simulations.sql` — agent_simulations table with RLS
- `db/seed/simulations.ts` — Seed canned scenarios for demo org

## Signal Adapters

Adapters normalize inbound data into `NormalizedEvent` rows in `signal_events`
with Voyage embeddings. Two modes:

### Push-driven (built-in CRM)
- `InternalCrmAdapter` in `src/lib/signals/adapters/internal-crm.ts`.
- `fetchNewEvents()` is a no-op — nothing to poll.
- Instead, 8 `emit*` helpers are invoked directly from CRM API routes:
  `emitContactCreated`, `emitLeadCreated`, `emitLeadStatusChanged`,
  `emitEstimateSent`, `emitEstimateAccepted`, `emitJobStatusChanged`,
  `emitJobCompleted`, `emitInteractionLogged`.
- Each emit builds a `NormalizedEvent`, generates a Voyage embedding via
  `eventToEmbeddingText` + `generateEmbedding`, and calls `insertSignalEvent`
  with `source_type='internal_crm'`.
- Emits are fire-and-forget with `.catch(console.error)` so a signal failure
  never blocks the CRM API response.

### Pull-based (external signals)
- `WeatherAdapter`, `CustomWebhookAdapter` — `signal-sync` Inngest workflow
  polls these on schedule.

## Inngest Background Workflows

### signal-sync (every 30 min)
Fetches new signals from active **pull-based** sources (weather, custom webhooks).
The built-in CRM does not participate — its signals are emitted inline from API routes.

### brief-scheduler (cron every 15 min)
Reads `brief_preferences` for enabled orgs, computes current time in each
org's timezone via `Intl.DateTimeFormat`, floors to 15-min window, and emits
`brief/run` for matching orgs. Replaces the old hardcoded 5:30am trigger.

### brief-run (event: brief/run)
Consumes `brief/run` event from scheduler or manual trigger. Checks idempotency
(skip if `decision_briefs` row exists for org + today), loads org profile from
`business_profile`, runs the 3-pass Decision Engine via `runDecisionEngine()`,
emits `brief/deliver` with the result.

### decision-run (triggered via API)
Runs the 3-pass Decision Engine: build context -> Pass 1 -> Pass 2 -> Pass 3 -> store brief -> queue delivery.

### brief-deliver (event: brief/deliver)
Loads delivery preferences from `brief_preferences`. If `voice_enabled`,
generates voice summary via ElevenLabs TTS (`textToSpeech()`). If `sms_enabled`
and `phone_number` set, sends SMS via `sendSms()` with priority emoji + top 3
recommendations + dashboard link. Updates `decision_briefs.delivered_at`.
Schedules `feedback/process` event at T+24h via `step.sleepUntil`.

### feedback-process (daily at 6pm)
Sends SMS asking operator about brief accuracy, collects feedback_events, aggregates confidence_delta.

### analytics-update (hourly)
Recalculates all micro_metrics: KPIs, benchmarks, trends.

## Environment Variables

```env
# Database (Railway Postgres)
DATABASE_URL=postgresql://...

# Cache (Railway Redis)
REDIS_URL=redis://...

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# AI & Embeddings
ANTHROPIC_API_KEY=sk-ant-...
VOYAGE_API_KEY=...
VOYAGE_MODEL=voyage-3

# Voice (ElevenLabs ONLY -- NO VAPI)
ELEVENLABS_API_KEY=...
ELEVENLABS_AGENT_ID=...
ELEVENLABS_WEBHOOK_SECRET=...

# SMS (Twilio)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_ANNUAL=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...

# Background Jobs (Inngest)
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Meta DMs (Messenger / Instagram)
META_APP_SECRET=...
META_VERIFY_TOKEN=...

# Telegram EA Bot
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEBHOOK_SECRET=...
TELEGRAM_BOT_USERNAME=ChattyOpsBot

# Application
NEXT_PUBLIC_APP_URL=https://chattyai-production.up.railway.app
NODE_ENV=production
```

## Code Style & Conventions

### Frontend (JavaScript/JSX)
- Functional components with hooks
- Async operations in useEffect
- File naming: camelCase (dashboardCard.jsx)

### Backend (TypeScript)
- Strict mode enabled
- All API responses typed with interfaces
- Database queries use the `pg` Pool via `query<T>()` in `src/lib/db/index.ts`
  and typed helpers in `src/lib/db/queries.ts`
- Error handling: try/catch with structured responses
- File naming: kebab-case (signal-adapter.ts)

### Database Queries
- Parameterized SQL via `query<T>(sql, params)` — never interpolate strings
- Always filter by `org_id` in every SELECT/UPDATE/DELETE
- Cache frequently accessed rows in Redis

## Roadmap

Chatty AI's built-in CRM is the product — we are not building toward external
CRM integrations.

1. **Now:** Lightweight CRM (contacts, leads, estimates, jobs, interactions)
   + push-driven signal emission + 3-pass Decision Engine + Daily Brief SMS.
2. **Next:** Mission Control dashboard tightening, voice-note briefs via
   ElevenLabs TTS, SMS feedback loop, richer pipeline analytics and benchmarks.
   Native capture channels: Forms, SMS, Voice (ElevenLabs), Meta DMs
   (Messenger/Instagram), Email.
3. **Later:** ElevenLabs Conversational AI agents for inbound/outbound calls
   that auto-log interactions, voice-clone branded agents, Stripe-powered
   billing tiers.
4. **Never:** OAuth integrations with Salesforce, HubSpot, or other external
   CRMs. Contractors who already live in those tools are not the ICP —
   Chatty is for operators who want one system that just works.

## Critical Reminders
1. **Voice:** Always use ElevenLabs for all voice functionality. Never use Vapi.
2. **CRM-first:** Chatty AI is the CRM. Do not add Salesforce/HubSpot/Pipedrive
   OAuth adapters — all CRM data lives in our own `contacts`/`leads`/
   `estimates`/`jobs`/`interactions` tables.
3. **Multi-tenancy:** Every query must filter by `org_id` from Clerk auth context.
4. **Signal emission:** After every CRM write that matters, emit a signal
   fire-and-forget via the appropriate `emit*` helper in
   `src/lib/signals/adapters/internal-crm.ts`.
5. **Async:** Dispatch long-running work to Inngest; never block API responses.
6. **Testing:** Write tests for Decision Engine passes, signal adapters, and API routes.
7. **Secrets:** Never commit API keys; use .env.local and Railway environment variables.
