-- Recommendation-level feedback + confidence scoring
-- Hand-written migration (applied by scripts/migrate-sql.mjs at boot)

-- Add accuracy columns to decision_briefs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'decision_briefs' AND column_name = 'accuracy_score') THEN
    ALTER TABLE decision_briefs ADD COLUMN accuracy_score NUMERIC;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'decision_briefs' AND column_name = 'category_confidence') THEN
    ALTER TABLE decision_briefs ADD COLUMN category_confidence JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Per-recommendation feedback table
CREATE TABLE IF NOT EXISTS brief_recommendation_feedback (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                TEXT NOT NULL,
  brief_id              UUID NOT NULL,
  recommendation_index  INTEGER NOT NULL,
  outcome               TEXT NOT NULL CHECK (outcome IN ('helpful','harmful','noop')),
  operator_id           TEXT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS brf_org_brief_idx
  ON brief_recommendation_feedback (org_id, brief_id);
CREATE INDEX IF NOT EXISTS brf_org_created_idx
  ON brief_recommendation_feedback (org_id, created_at DESC);

ALTER TABLE brief_recommendation_feedback ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'brf_org_rls') THEN
    CREATE POLICY brf_org_rls ON brief_recommendation_feedback
      FOR ALL USING (org_id = current_setting('app.current_org_id', true));
  END IF;
END $$;
