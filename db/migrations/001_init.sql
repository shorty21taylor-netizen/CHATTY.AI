-- 001_init.sql â Core tables for Chatty AI OS
-- Requires: pgvector extension (see 002_add_pgvector.sql)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Signal Sources â registered data source connections per org
CREATE TABLE signal_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'salesforce', 'hubspot', 'google_ads', 'facebook_ads',
    'gmail', 'weather', 'custom'
  )),
  name TEXT NOT NULL,
  credentials JSONB DEFAULT '{}',
  config JSONB DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_signal_sources_org ON signal_sources(org_id);

-- 2. Signal Events â normalized events with vector embeddings
CREATE TABLE signal_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_signal_events_org_date ON signal_events(org_id, created_at DESC);
CREATE INDEX idx_signal_events_org_type ON signal_events(org_id, event_type);

-- 3. Unified Context â denormalized view per account for Decision Engine
CREATE TABLE unified_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id TEXT NOT NULL,
  context_date DATE NOT NULL DEFAULT CURRENT_DATE,
  signal_summary JSONB DEFAULT '{}',
  recent_events JSONB DEFAULT '[]',
  previous_briefs JSONB DEFAULT '[]',
  external_context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_unified_context_org_date ON unified_context(org_id, context_date);

-- 4. Decision Briefs â generated Daily Briefs with decision lineage
CREATE TABLE decision_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id TEXT NOT NULL,
  brief_date DATE NOT NULL DEFAULT CURRENT_DATE,
  context_id UUID REFERENCES unified_context(id),
  decision_engine_trace JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  voice_summary TEXT,
  delivered_at TIMESTAMPTZ,
  delivered_via TEXT,
  operator_feedback JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_decision_briefs_org_date ON decision_briefs(org_id, brief_date DESC);

-- 5. Micro Metrics â vertical-specific KPIs per org
CREATE TABLE micro_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id TEXT NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vertical TEXT,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  benchmark NUMERIC,
  trend NUMERIC,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_micro_metrics_org_date ON micro_metrics(org_id, metric_date DESC);
CREATE INDEX idx_micro_metrics_org_name ON micro_metrics(org_id, metric_name);

-- 6. Feedback Events â operator outcomes linked to briefs
CREATE TABLE feedback_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id TEXT NOT NULL,
  brief_id UUID REFERENCES decision_briefs(id),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN (
    'action_taken', 'action_ignored', 'outcome', 'comment'
  )),
  feedback_text TEXT,
  confidence_delta NUMERIC,
  outcome_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_events_org ON feedback_events(org_id);
CREATE INDEX idx_feedback_events_brief ON feedback_events(brief_id);

-- Row-Level Security
ALTER TABLE signal_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_events ENABLE ROW LEVEL SECURITY;
