-- 013_stripe_billing.sql
-- Stripe subscription + billing tracking tables

CREATE TABLE IF NOT EXISTS stripe_customers (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                     TEXT NOT NULL UNIQUE,
  stripe_customer_id         TEXT NOT NULL UNIQUE,
  stripe_subscription_id     TEXT,
  stripe_subscription_status TEXT DEFAULT 'incomplete',
  current_plan               TEXT NOT NULL DEFAULT 'starter',
  current_price_monthly      NUMERIC(10,2),
  cancel_at_period_end       BOOLEAN DEFAULT false,
  trial_ends_at              TIMESTAMPTZ,
  current_period_end         TIMESTAMPTZ,
  payment_method_last4       TEXT,
  payment_method_brand       TEXT,
  created_at                 TIMESTAMPTZ DEFAULT now(),
  updated_at                 TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stripe_customers_org       ON stripe_customers (org_id);
CREATE INDEX idx_stripe_customers_stripe_id ON stripe_customers (stripe_customer_id);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY stripe_customers_org_isolation ON stripe_customers
  USING (org_id = current_setting('app.current_org_id', true));

-- Usage tracking per billing period
CREATE TABLE IF NOT EXISTS billing_usage (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id               TEXT NOT NULL,
  period_start         DATE NOT NULL,
  period_end           DATE NOT NULL,
  sms_sent             INTEGER NOT NULL DEFAULT 0,
  voice_minutes        INTEGER NOT NULL DEFAULT 0,
  agents_active        INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  UNIQUE (org_id, period_start)
);

CREATE INDEX idx_billing_usage_org ON billing_usage (org_id, period_start DESC);

ALTER TABLE billing_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY billing_usage_org_isolation ON billing_usage
  USING (org_id = current_setting('app.current_org_id', true));
