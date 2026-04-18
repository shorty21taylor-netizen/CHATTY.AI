-- Scale hardening for 1000-org target
-- Hand-written migration (applied by scripts/migrate-sql.mjs at boot)

-- Partial index for active-only signal sources (reduces index size)
CREATE INDEX IF NOT EXISTS signal_sources_active_idx
  ON signal_sources (org_id, source_type) WHERE is_active = true;

-- Covering index for signal_events 24h lookback (most common query)
CREATE INDEX IF NOT EXISTS signal_events_org_created_24h_idx
  ON signal_events (org_id, created_at DESC)
  WHERE created_at > (now() - interval '48 hours');

-- Index for contacts phone lookup (used by inbound SMS matching)
CREATE INDEX IF NOT EXISTS contacts_phone_idx
  ON contacts (phone) WHERE phone IS NOT NULL;

-- Index for leads follow_up overdue check
CREATE INDEX IF NOT EXISTS leads_follow_up_overdue_idx
  ON leads (org_id, follow_up_date)
  WHERE status NOT IN ('won', 'lost') AND follow_up_date IS NOT NULL;

-- Composite index for operator_playbooks active lookup
CREATE INDEX IF NOT EXISTS operator_playbooks_org_success_idx
  ON operator_playbooks (org_id, success_count DESC)
  WHERE is_active = true;
