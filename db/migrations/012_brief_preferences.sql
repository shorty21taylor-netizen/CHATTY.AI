-- 012_brief_preferences.sql
-- Per-org Daily Brief delivery preferences

CREATE TABLE IF NOT EXISTS brief_preferences (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        TEXT NOT NULL UNIQUE,
  enabled       BOOLEAN DEFAULT true,
  delivery_time TEXT DEFAULT '06:00',
  timezone      TEXT DEFAULT 'America/New_York',
  sms_enabled   BOOLEAN DEFAULT true,
  voice_enabled BOOLEAN DEFAULT true,
  phone_number  TEXT,
  voice_id      TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_brief_preferences_org ON brief_preferences (org_id);
CREATE INDEX idx_brief_preferences_enabled ON brief_preferences (enabled, delivery_time);

-- RLS
ALTER TABLE brief_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY brief_preferences_org_isolation ON brief_preferences
  USING (org_id = current_setting('app.current_org_id', true));
