-- Chatty AI — pgvector + RLS bootstrap.
--
-- This migration is idempotent: it can be re-run safely. It should be
-- applied AFTER the generated schema migration (0000_*.sql) so the
-- `vector(1024)` columns and all `org_id`-scoped tables exist.
--
-- Responsibilities:
--   1. Enable pgvector (for Voyage embeddings on signal_events +
--      agent_knowledge_base).
--   2. Create an `auth` schema + `auth.org_id()` helper that RLS policies
--      consult — it reads the per-connection GUC `app.current_org_id`.
--   3. Enable RLS and attach an `org_isolation` policy on every
--      multi-tenant table.
--   4. Create an ivfflat index on signal_events.embedding for ANN.
--
-- The app layer must `SET LOCAL app.current_org_id = '<uuid>'` once per
-- transaction before running queries — see `withOrgContext` in
-- `src/lib/db/drizzle.ts`.

-- -----------------------------------------------------------------------
-- 1. Extensions
-- -----------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()

-- -----------------------------------------------------------------------
-- 2. auth.org_id() helper
-- -----------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.org_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_org_id', true), '')::uuid;
$$;

COMMENT ON FUNCTION auth.org_id() IS
  'Returns the org UUID for the current request. Reads the per-tx GUC `app.current_org_id` which is set by src/lib/db/drizzle.ts#withOrgContext.';

-- -----------------------------------------------------------------------
-- 3. Row-level security
-- -----------------------------------------------------------------------

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'signal_sources',
    'signal_events',
    'unified_context',
    'decision_briefs',
    'micro_metrics',
    'feedback_events',
    'agent_configs',
    'agent_knowledge_base',
    'agent_templates',
    'agent_runs',
    'agent_activity',
    'contacts',
    'appointments',
    'proposals',
    'deals',
    'business_profile'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Force RLS so even the table owner is subject to policies (important
    -- because the Railway role owns the tables).
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);

    -- Drop stale policy to stay idempotent.
    EXECUTE format('DROP POLICY IF EXISTS org_isolation ON %I', t);

    -- Single policy covers SELECT / INSERT / UPDATE / DELETE:
    --   rows are visible only when the row's org_id matches
    --   current_setting('app.current_org_id'), and the same check applies
    --   to WITH CHECK on writes.
    EXECUTE format($f$
      CREATE POLICY org_isolation ON %I
        USING (org_id = auth.org_id())
        WITH CHECK (org_id = auth.org_id())
    $f$, t);
  END LOOP;
END
$$;

-- -----------------------------------------------------------------------
-- 4. Vector ANN index
-- -----------------------------------------------------------------------
--
-- ivfflat is a good default for the first wave of data (hundreds of
-- thousands of rows). Swap to hnsw when we outgrow it.
--
-- `lists` heuristic: floor(sqrt(row_count)) once we have real data. We
-- start at 100 and can re-tune with `REINDEX INDEX … CONCURRENTLY`.

CREATE INDEX IF NOT EXISTS signal_events_embedding_idx
  ON signal_events
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS agent_kb_embedding_idx
  ON agent_knowledge_base
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- -----------------------------------------------------------------------
-- 5. updated_at triggers
-- -----------------------------------------------------------------------
--
-- Every table with an `updated_at` column gets a trigger that bumps it on
-- UPDATE. Keeping this in SQL (vs application code) is safer because the
-- trigger fires even for raw-SQL maintenance.

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END
$$;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'signal_sources',
    'agent_configs',
    'agent_knowledge_base',
    'agent_templates',
    'contacts',
    'appointments',
    'proposals',
    'deals',
    'business_profile'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_touch_updated_at ON %I', t, t);
    EXECUTE format($f$
      CREATE TRIGGER %I_touch_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION touch_updated_at()
    $f$, t, t);
  END LOOP;
END
$$;
