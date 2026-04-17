-- 011_agent_simulations.sql
-- Agent simulation runtime — dry-run agents against canned or custom signals

CREATE TABLE IF NOT EXISTS agent_simulations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        TEXT NOT NULL,
  agent_type    TEXT NOT NULL,
  scenario_name TEXT,
  input_signal  JSONB NOT NULL,
  simulated_output JSONB,
  actual_output JSONB,
  comparison_score NUMERIC,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','running','completed','failed')),
  error         TEXT,
  duration_ms   INTEGER,
  created_at    TIMESTAMPTZ DEFAULT now(),
  completed_at  TIMESTAMPTZ
);

CREATE INDEX idx_agent_simulations_org_created ON agent_simulations (org_id, created_at DESC);
CREATE INDEX idx_agent_simulations_org_type    ON agent_simulations (org_id, agent_type);

-- RLS
ALTER TABLE agent_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY agent_simulations_org_isolation ON agent_simulations
  USING (org_id = current_setting('app.current_org_id', true));
