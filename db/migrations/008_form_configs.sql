-- 008_form_configs.sql
-- Per-org form configs for the public form submission endpoint.

CREATE TABLE org_form_configs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  field_mapping   JSONB NOT NULL DEFAULT '{}',
  redirect_url    TEXT,
  honeypot_field  TEXT NOT NULL DEFAULT 'website_url',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX org_form_configs_slug_idx ON org_form_configs (slug);
CREATE INDEX org_form_configs_org_active_idx ON org_form_configs (org_id, is_active);

ALTER TABLE org_form_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_form_configs_org_policy ON org_form_configs
  USING (org_id = current_setting('app.current_org_id', true)::uuid);
