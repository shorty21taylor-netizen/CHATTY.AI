-- Per-agent daily metrics rollup
-- Hand-written migration (applied by scripts/migrate-sql.mjs at boot)

CREATE TABLE IF NOT EXISTS agent_metrics (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                TEXT NOT NULL,
  agent_id              TEXT NOT NULL,
  agent_type            TEXT NOT NULL,
  metric_date           DATE NOT NULL,
  runs                  INTEGER NOT NULL DEFAULT 0,
  successes             INTEGER NOT NULL DEFAULT 0,
  failures              INTEGER NOT NULL DEFAULT 0,
  leads_touched         INTEGER NOT NULL DEFAULT 0,
  leads_converted       INTEGER NOT NULL DEFAULT 0,
  messages_sent         INTEGER NOT NULL DEFAULT 0,
  avg_response_seconds  NUMERIC,
  data                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS agent_metrics_org_agent_date_uq
  ON agent_metrics (org_id, agent_id, metric_date);
CREATE INDEX IF NOT EXISTS agent_metrics_org_date_idx
  ON agent_metrics (org_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS agent_metrics_org_type_idx
  ON agent_metrics (org_id, agent_type);

ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'agent_metrics_org_rls') THEN
    CREATE POLICY agent_metrics_org_rls ON agent_metrics
      FOR ALL USING (org_id = current_setting('app.current_org_id', true));
  END IF;
END $$;
