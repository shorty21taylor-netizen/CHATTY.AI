-- 006_reclaim_state.sql
-- Minimal per-org state for the reclaim sweeper.

CREATE TABLE org_reclaim_state (
  org_id    UUID PRIMARY KEY,
  last_sweep_at  TIMESTAMPTZ,
  sweep_results  JSONB NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE org_reclaim_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_reclaim_state_org_policy ON org_reclaim_state
  USING (org_id = current_setting('app.current_org_id', true)::uuid);
