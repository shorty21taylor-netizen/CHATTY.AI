-- 004_inbound_sms.sql
-- Adds orphan_sms, contact_suppressions, and agent_escalations tables
-- for the inbound SMS reply router.

-- ============================================================================
-- Suppression reason enum
-- ============================================================================

CREATE TYPE suppression_reason AS ENUM (
  'sms_stop',
  'email_unsubscribe',
  'manual',
  'not_interested'
);

-- ============================================================================
-- orphan_sms — inbound SMS from numbers we can't match to a contact.
-- Cross-org table (no RLS) since we don't know the org yet.
-- ============================================================================

CREATE TABLE orphan_sms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_phone      TEXT NOT NULL,
  to_phone        TEXT NOT NULL,
  body            TEXT NOT NULL DEFAULT '',
  message_sid     TEXT,
  matched_contact_id UUID,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX orphan_sms_from_phone_idx ON orphan_sms (from_phone);
CREATE INDEX orphan_sms_received_at_idx ON orphan_sms (received_at);

-- ============================================================================
-- contact_suppressions — opt-out / suppression records per contact.
-- RLS by org_id.
-- ============================================================================

CREATE TABLE contact_suppressions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  contact_id      UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  reason          suppression_reason NOT NULL,
  source          TEXT,
  suppressed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX contact_suppressions_org_contact_idx
  ON contact_suppressions (org_id, contact_id)
  WHERE suppressed_at IS NOT NULL;

CREATE INDEX contact_suppressions_org_idx ON contact_suppressions (org_id);

ALTER TABLE contact_suppressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY contact_suppressions_org_policy ON contact_suppressions
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- ============================================================================
-- agent_escalations — records when an agent escalates to a human.
-- RLS by org_id.
-- ============================================================================

CREATE TABLE agent_escalations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  run_id          UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,
  reason          TEXT NOT NULL,
  notified_via    TEXT,
  notified_at     TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX agent_escalations_org_idx ON agent_escalations (org_id);
CREATE INDEX agent_escalations_org_run_idx ON agent_escalations (org_id, run_id);

ALTER TABLE agent_escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY agent_escalations_org_policy ON agent_escalations
  USING (org_id = current_setting('app.current_org_id', true)::uuid);
