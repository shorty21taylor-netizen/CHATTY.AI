# Chatty AI -- AI Operating System for Home Service Contractors

## Project Overview
Chatty AI is a 3-layer AI OS that turns raw business signals into daily actionable intelligence for contractors (roofing, HVAC, solar, exteriors, remodeling).

**Layers:**
1. **Signal Network** -- Ingests data from CRMs, ad platforms, email, calls, weather into unified context
2. **The Brain (Decision Engine)** -- 3-pass Claude prompt chain that reasons over signals and produces decisions
3. **Daily Brief** -- Delivers actionable intelligence via SMS at 6am + Mission Control dashboard

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

## Database Schema (6 Core Tables + RLS)

### 1. signal_sources
Registered data source connections per organization.
- id: UUID (primary key)
- org_id: UUID (from Clerk, FK)
- source_type: ENUM (salesforce, hubspot, google_ads, facebook_ads, gmail, weather, custom)
- name: TEXT
- credentials: JSONB (encrypted OAuth tokens or API keys)
- config: JSONB (source-specific settings)
- last_sync_at: TIMESTAMP
- is_active: BOOLEAN
RLS: org_id = auth.org_id()

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

### Webhooks: Verify Before Processing
All webhook handlers verify signatures (Twilio X-Twilio-Signature, Stripe stripe-signature, CRM hmac-signature).

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

## Inngest Background Workflows

### signal-sync (every 30 min)
Fetches new signals from active sources and ingests them.

### decision-run (triggered via API)
Runs the 3-pass Decision Engine: build context -> Pass 1 -> Pass 2 -> Pass 3 -> store brief -> queue delivery.

### brief-deliver (after decision-run)
Generates voice summary via ElevenLabs TTS, sends SMS via Twilio, logs delivery timestamp.

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

# SMS (Twilio)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Background Jobs (Inngest)
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

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
- Database queries use Drizzle ORM
- Error handling: try/catch with structured responses
- File naming: kebab-case (signal-adapter.ts)

### Database Queries
- Use Drizzle ORM, avoid raw SQL
- Always filter by org_id (RLS + explicit check)
- Cache frequently accessed rows in Redis

## Critical Reminders
1. **Voice:** Always use ElevenLabs for all voice functionality. Never use Vapi.
2. **Multi-tenancy:** Every query must filter by org_id from Clerk auth context.
3. **RLS:** Enable row-level security on all sensitive tables.
4. **Async:** Dispatch long-running work to Inngest; never block API responses.
5. **Testing:** Write tests for Decision Engine passes, signal adapters, and API routes.
6. **Secrets:** Never commit API keys; use .env.local and Railway environment variables.
