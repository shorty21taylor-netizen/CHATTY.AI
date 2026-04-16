# Chatty AI — Database

## Stack

| Component | Tool |
|-----------|------|
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Migrations | drizzle-kit |
| Driver | `pg` (node-postgres) |
| Extensions | pgvector (embeddings), pgcrypto (UUIDs) |
| Hosting | Railway Postgres |

## Quick start

```bash
# 1. Copy env
cp .env.example .env.local
# fill in DATABASE_URL from Railway

# 2. Run the Drizzle migration
npm run db:migrate

# 3. Run the pgvector + RLS bootstrap (once, manually)
psql $DATABASE_URL -f src/db/migrations/enable_pgvector_and_rls.sql

# 4. Seed demo data
npm run db:seed

# 5. (Optional) Browse with Drizzle Studio
npm run db:studio
```

## Schema overview

16 tables across three groups:

**Signal / Decision Engine (6)**
- `signal_sources` — registered data connections per org
- `signal_events` — normalized events with pgvector embeddings
- `unified_context` — denormalized context per org per day
- `decision_briefs` — generated Daily Briefs with 3-pass trace
- `micro_metrics` — vertical-specific KPIs
- `feedback_events` — operator outcomes linked to briefs

**Agent Runtime (5)**
- `agent_configs` — one row per agent type per org (11 agent types)
- `agent_knowledge_base` — docs + embeddings per agent
- `agent_templates` — message templates with A/B/C variants
- `agent_runs` — execution log with reasoning trace + cost
- `agent_activity` — individual actions taken per run

**Business Data (5)**
- `contacts` — customers, leads, VIPs
- `appointments` — scheduled inspections / visits
- `proposals` — quotes sent to contacts
- `deals` — pipeline stages with assigned agents
- `business_profile` — one row per org (company settings)

## Row-Level Security (RLS)

Every table has an `org_id UUID NOT NULL` column. RLS is enforced via:

```sql
CREATE POLICY org_isolation ON <table>
  USING (org_id = auth.org_id())
  WITH CHECK (org_id = auth.org_id());
```

`auth.org_id()` reads the per-transaction GUC `app.current_org_id`.

### App-layer usage

```ts
import { withOrgContext } from "@/lib/db/drizzle";
import { contacts } from "@/db/schema";

const rows = await withOrgContext(orgId, (tx) =>
  tx.select().from(contacts),
);
```

`withOrgContext` opens a transaction, runs `SET LOCAL app.current_org_id`,
executes the callback, then commits. If no GUC is set the policy returns
zero rows — failing closed.

## Adding a new table

1. **Define** the table in `src/db/schema.ts` (add enums, indexes, FKs)
2. **Generate** the migration: `npm run db:generate`
3. **Run** the migration: `npm run db:migrate`
4. **Add RLS**: append the table name to the `tables` array in
   `src/db/migrations/enable_pgvector_and_rls.sql` and re-run it
5. **Create query helpers** in `src/lib/db/queries/<table>.ts`, export from
   `src/lib/db/queries/index.ts`

## npm scripts

| Script | Description |
|--------|-------------|
| `db:generate` | Generate SQL migration from schema changes |
| `db:migrate` | Apply pending migrations to the database |
| `db:studio` | Open Drizzle Studio (visual DB browser) |
| `db:seed` | Insert demo data (idempotent) |

## Seed data

`npm run db:seed` inserts a Summit Roofing demo org with:

- 1 business profile
- 11 agent configs (not_configured)
- 50 contacts
- 20 appointments
- 15 proposals
- 30 deals
- ~900 signal events (90 days)
- ~180 micro metrics (30 days)
- 7 decision briefs

The seed is idempotent — re-running it skips tables that already have data.
