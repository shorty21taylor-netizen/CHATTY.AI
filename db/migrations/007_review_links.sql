-- 007_review_links.sql
-- Tokenized review-request redirect links with click tracking.

CREATE TABLE review_request_links (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL,
  contact_id        UUID NOT NULL,
  agent_run_id      UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
  token             TEXT NOT NULL UNIQUE,
  destination_url   TEXT NOT NULL,
  clicks_count      INTEGER NOT NULL DEFAULT 0,
  first_clicked_at  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX review_request_links_org_idx ON review_request_links (org_id);
CREATE INDEX review_request_links_token_idx ON review_request_links (token);
CREATE INDEX review_request_links_org_created_idx ON review_request_links (org_id, created_at);

ALTER TABLE review_request_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY review_request_links_org_policy ON review_request_links
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Add review URL columns to business_profile
ALTER TABLE business_profile
  ADD COLUMN IF NOT EXISTS google_review_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_review_url TEXT;
