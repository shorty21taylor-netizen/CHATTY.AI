-- Migration 021: Add email delivery channel to brief_preferences
-- + error_log table for Sentry-style error tracking

ALTER TABLE brief_preferences
  ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_address TEXT;

CREATE TABLE IF NOT EXISTS error_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        TEXT,
  level         TEXT NOT NULL DEFAULT 'error',
  source        TEXT NOT NULL,
  message       TEXT NOT NULL,
  stack         TEXT,
  meta          JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_error_log_org_created ON error_log (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_log_level ON error_log (level, created_at DESC);

ALTER TABLE error_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY error_log_org_isolation ON error_log
  USING (org_id = current_setting('app.current_org_id', true));
