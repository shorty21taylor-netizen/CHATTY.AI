-- 003_light_crm_tables.sql — Light built-in CRM for Chatty AI
-- Replaces external-CRM integration strategy. All tables use org_id TEXT for
-- Clerk-org isolation and have RLS enabled to match the existing schema.

-- =============================================================================
-- 1. contacts — people (homeowners, property managers, commercial clients)
-- =============================================================================
CREATE TABLE contacts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id         TEXT NOT NULL,

  first_name     TEXT,
  last_name      TEXT,
  email          TEXT,
  phone          TEXT,
  company        TEXT,

  address_line1  TEXT,
  address_line2  TEXT,
  city           TEXT,
  state          TEXT,
  zip            TEXT,

  property_type  TEXT CHECK (property_type IN (
    'residential', 'commercial', 'multi_family', 'hoa'
  )),

  contact_type   TEXT CHECK (contact_type IN (
    'homeowner', 'property_manager', 'general_contractor',
    'realtor', 'insurance_adjuster', 'other'
  )),

  source         TEXT CHECK (source IN (
    'manual', 'website', 'referral', 'ad_click', 'phone_call',
    'walk_in', 'social_media', 'home_advisor', 'angies_list',
    'google_lsa', 'other'
  )),
  source_detail  TEXT,

  status         TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'inactive', 'do_not_contact'
  )),

  tags           JSONB DEFAULT '[]',
  custom_fields  JSONB DEFAULT '{}',
  notes          TEXT,

  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_org              ON contacts(org_id);
CREATE INDEX idx_contacts_org_status       ON contacts(org_id, status);
CREATE INDEX idx_contacts_org_email        ON contacts(org_id, email);
CREATE INDEX idx_contacts_org_phone        ON contacts(org_id, phone);
CREATE INDEX idx_contacts_org_created      ON contacts(org_id, created_at DESC);

-- =============================================================================
-- 2. leads — sales opportunities tied to contacts
-- =============================================================================
CREATE TABLE leads (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id            TEXT NOT NULL,
  contact_id        UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  title             TEXT NOT NULL,
  description       TEXT,

  service_type      TEXT CHECK (service_type IN (
    'roofing', 'hvac', 'solar', 'siding', 'windows', 'gutters',
    'painting', 'remodeling', 'plumbing', 'electrical',
    'landscaping', 'other'
  )),

  status            TEXT DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'appointment_set', 'inspected',
    'quoted', 'negotiating', 'won', 'lost', 'on_hold'
  )),
  lost_reason       TEXT,

  estimated_value   NUMERIC(12, 2),
  assigned_to       TEXT,
  priority          TEXT DEFAULT 'medium' CHECK (priority IN (
    'hot', 'high', 'medium', 'low'
  )),

  follow_up_date    DATE,
  appointment_date  TIMESTAMPTZ,

  source            TEXT CHECK (source IN (
    'manual', 'website', 'referral', 'ad_click', 'phone_call',
    'walk_in', 'social_media', 'home_advisor', 'angies_list',
    'google_lsa', 'other'
  )),
  source_detail     TEXT,

  tags              JSONB DEFAULT '[]',
  custom_fields     JSONB DEFAULT '{}',
  notes             TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  closed_at         TIMESTAMPTZ
);

CREATE INDEX idx_leads_org                 ON leads(org_id);
CREATE INDEX idx_leads_org_status          ON leads(org_id, status);
CREATE INDEX idx_leads_org_service         ON leads(org_id, service_type);
CREATE INDEX idx_leads_org_contact         ON leads(org_id, contact_id);
CREATE INDEX idx_leads_org_priority        ON leads(org_id, priority);
CREATE INDEX idx_leads_org_followup        ON leads(org_id, follow_up_date);
CREATE INDEX idx_leads_org_created         ON leads(org_id, created_at DESC);

-- =============================================================================
-- 3. estimates — quotes / proposals
-- =============================================================================
CREATE TABLE estimates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id            TEXT NOT NULL,
  contact_id        UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  lead_id           UUID REFERENCES leads(id) ON DELETE SET NULL,

  estimate_number   TEXT,
  title             TEXT,
  line_items        JSONB DEFAULT '[]',  -- [{description, qty, unit_price, total}]

  subtotal          NUMERIC(12, 2) DEFAULT 0,
  tax_rate          NUMERIC(5, 4)  DEFAULT 0,
  tax_amount        NUMERIC(12, 2) DEFAULT 0,
  discount          NUMERIC(12, 2) DEFAULT 0,
  total             NUMERIC(12, 2) DEFAULT 0,

  status            TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'viewed', 'accepted',
    'rejected', 'expired', 'revised'
  )),

  valid_until       DATE,
  sent_at           TIMESTAMPTZ,
  responded_at      TIMESTAMPTZ,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_estimates_org_number ON estimates(org_id, estimate_number)
  WHERE estimate_number IS NOT NULL;
CREATE INDEX idx_estimates_org               ON estimates(org_id);
CREATE INDEX idx_estimates_org_status        ON estimates(org_id, status);
CREATE INDEX idx_estimates_org_contact       ON estimates(org_id, contact_id);
CREATE INDEX idx_estimates_org_lead          ON estimates(org_id, lead_id);
CREATE INDEX idx_estimates_org_created       ON estimates(org_id, created_at DESC);

-- =============================================================================
-- 4. jobs — contracted work / active projects
-- =============================================================================
CREATE TABLE jobs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id            TEXT NOT NULL,
  contact_id        UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  lead_id           UUID REFERENCES leads(id) ON DELETE SET NULL,
  estimate_id       UUID REFERENCES estimates(id) ON DELETE SET NULL,

  title             TEXT NOT NULL,
  description       TEXT,
  service_type      TEXT CHECK (service_type IN (
    'roofing', 'hvac', 'solar', 'siding', 'windows', 'gutters',
    'painting', 'remodeling', 'plumbing', 'electrical',
    'landscaping', 'other'
  )),

  status            TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'materials_ordered', 'in_progress', 'on_hold',
    'completed', 'punch_list', 'invoiced', 'paid', 'warranty'
  )),

  job_value         NUMERIC(12, 2),
  cost              NUMERIC(12, 2),
  profit_margin     NUMERIC(12, 2),

  start_date        DATE,
  end_date          DATE,

  job_address_line1 TEXT,
  job_address_line2 TEXT,
  job_city          TEXT,
  job_state         TEXT,
  job_zip           TEXT,

  assigned_crew     JSONB DEFAULT '[]',

  tags              JSONB DEFAULT '[]',
  custom_fields     JSONB DEFAULT '{}',
  notes             TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  completed_at      TIMESTAMPTZ
);

CREATE INDEX idx_jobs_org                  ON jobs(org_id);
CREATE INDEX idx_jobs_org_status           ON jobs(org_id, status);
CREATE INDEX idx_jobs_org_service          ON jobs(org_id, service_type);
CREATE INDEX idx_jobs_org_contact          ON jobs(org_id, contact_id);
CREATE INDEX idx_jobs_org_start            ON jobs(org_id, start_date);
CREATE INDEX idx_jobs_org_created          ON jobs(org_id, created_at DESC);

-- =============================================================================
-- 5. interactions — activity log (calls, emails, SMS, notes, meetings)
-- =============================================================================
CREATE TABLE interactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id            TEXT NOT NULL,
  contact_id        UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  lead_id           UUID REFERENCES leads(id) ON DELETE SET NULL,
  job_id            UUID REFERENCES jobs(id)  ON DELETE SET NULL,

  interaction_type  TEXT NOT NULL CHECK (interaction_type IN (
    'call', 'email', 'sms', 'note', 'meeting',
    'site_visit', 'voicemail', 'follow_up'
  )),
  direction         TEXT CHECK (direction IN (
    'inbound', 'outbound', 'internal'
  )),

  subject           TEXT,
  summary           TEXT,
  details           TEXT,
  duration_seconds  INTEGER,
  outcome           TEXT,
  created_by        TEXT,

  occurred_at       TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interactions_org                ON interactions(org_id);
CREATE INDEX idx_interactions_org_contact        ON interactions(org_id, contact_id);
CREATE INDEX idx_interactions_org_lead           ON interactions(org_id, lead_id);
CREATE INDEX idx_interactions_org_job            ON interactions(org_id, job_id);
CREATE INDEX idx_interactions_org_type           ON interactions(org_id, interaction_type);
CREATE INDEX idx_interactions_org_occurred       ON interactions(org_id, occurred_at DESC);

-- =============================================================================
-- updated_at auto-maintenance trigger
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contacts_updated_at   BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_leads_updated_at      BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_estimates_updated_at  BEFORE UPDATE ON estimates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_jobs_updated_at       BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- Row-Level Security (matches existing schema — application filters by org_id)
-- =============================================================================
ALTER TABLE contacts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads         ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions  ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Views — pipeline + daily activity summaries
-- =============================================================================

-- Lead counts by status + pipeline value per service_type (per org)
CREATE OR REPLACE VIEW crm_pipeline_summary AS
SELECT
  org_id,
  service_type,
  status,
  COUNT(*)                                 AS lead_count,
  COALESCE(SUM(estimated_value), 0)::NUMERIC(14, 2)  AS pipeline_value,
  COALESCE(AVG(estimated_value), 0)::NUMERIC(12, 2)  AS avg_lead_value
FROM leads
WHERE status NOT IN ('won', 'lost')
GROUP BY org_id, service_type, status;

-- Interaction counts by type for today (per org)
CREATE OR REPLACE VIEW crm_daily_activity AS
SELECT
  org_id,
  interaction_type,
  direction,
  COUNT(*)                                           AS interaction_count,
  SUM(COALESCE(duration_seconds, 0))                 AS total_duration_seconds
FROM interactions
WHERE occurred_at::DATE = CURRENT_DATE
GROUP BY org_id, interaction_type, direction;

-- =============================================================================
-- Update signal_sources CHECK constraint to include 'internal_crm'
-- =============================================================================
ALTER TABLE signal_sources
  DROP CONSTRAINT IF EXISTS signal_sources_source_type_check;

ALTER TABLE signal_sources
  ADD CONSTRAINT signal_sources_source_type_check
  CHECK (source_type IN (
    'internal_crm',
    'salesforce', 'hubspot', 'google_ads', 'facebook_ads',
    'gmail', 'weather', 'custom'
  ));
