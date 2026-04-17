-- 005_cadence_engine.sql
-- Multi-step agent cadences with exit conditions and per-org concurrency.

-- ============================================================================
-- Cadence run status enum
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE cadence_run_status AS ENUM ('running', 'completed', 'exited', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- agent_cadences — defines a multi-step cadence attached to an agent
-- ============================================================================

CREATE TABLE agent_cadences (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL,
  agent_config_id   UUID NOT NULL REFERENCES agent_configs(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  total_steps       INTEGER NOT NULL DEFAULT 1,
  exit_conditions   JSONB NOT NULL DEFAULT '{"reply_received":true,"booked":true,"opted_out":true}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX agent_cadences_org_idx ON agent_cadences (org_id);
CREATE INDEX agent_cadences_org_agent_idx ON agent_cadences (org_id, agent_config_id);

ALTER TABLE agent_cadences ENABLE ROW LEVEL SECURITY;
CREATE POLICY agent_cadences_org_policy ON agent_cadences
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- ============================================================================
-- cadence_steps — ordered steps within a cadence
-- ============================================================================

CREATE TABLE cadence_steps (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cadence_id        UUID NOT NULL REFERENCES agent_cadences(id) ON DELETE CASCADE,
  step_index        INTEGER NOT NULL,
  delay_seconds     INTEGER NOT NULL DEFAULT 0,
  channel           TEXT NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms', 'email')),
  prompt_override   TEXT,
  template_snippet  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cadence_id, step_index)
);

CREATE INDEX cadence_steps_cadence_idx ON cadence_steps (cadence_id);

-- cadence_steps inherits org isolation from the FK to agent_cadences.
-- No separate org_id column needed, but we add RLS via the join.

-- ============================================================================
-- cadence_runs — tracks a cadence execution per entity
-- ============================================================================

CREATE TABLE cadence_runs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL,
  cadence_id          UUID NOT NULL REFERENCES agent_cadences(id) ON DELETE CASCADE,
  entity_type         TEXT NOT NULL,
  entity_id           UUID NOT NULL,
  current_step_index  INTEGER NOT NULL DEFAULT 0,
  status              cadence_run_status NOT NULL DEFAULT 'running',
  exit_reason         TEXT,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  next_step_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX cadence_runs_org_status_next_idx
  ON cadence_runs (org_id, status, next_step_at);
CREATE INDEX cadence_runs_org_entity_idx
  ON cadence_runs (org_id, entity_type, entity_id);
CREATE INDEX cadence_runs_cadence_idx
  ON cadence_runs (cadence_id);

ALTER TABLE cadence_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY cadence_runs_org_policy ON cadence_runs
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- ============================================================================
-- Add cadence_id to agent_configs (nullable FK)
-- ============================================================================

ALTER TABLE agent_configs
  ADD COLUMN IF NOT EXISTS cadence_id UUID REFERENCES agent_cadences(id) ON DELETE SET NULL;
