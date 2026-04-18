-- Industry Prompt Templates
-- Hand-written migration (applied by scripts/migrate-sql.mjs at boot)

CREATE TABLE IF NOT EXISTS industry_prompt_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry      TEXT NOT NULL,
  use_case      TEXT NOT NULL,
  name          TEXT NOT NULL,
  prompt_text   TEXT NOT NULL,
  variables     JSONB NOT NULL DEFAULT '[]'::jsonb,
  version       INTEGER NOT NULL DEFAULT 1,
  is_system     BOOLEAN NOT NULL DEFAULT true,
  org_id        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ipt_industry_usecase_version_org_uq
  ON industry_prompt_templates (industry, use_case, version, COALESCE(org_id, '__system__'));

CREATE INDEX IF NOT EXISTS ipt_industry_idx ON industry_prompt_templates (industry);
CREATE INDEX IF NOT EXISTS ipt_industry_use_case_idx ON industry_prompt_templates (industry, use_case);
CREATE INDEX IF NOT EXISTS ipt_org_idx ON industry_prompt_templates (org_id) WHERE org_id IS NOT NULL;

-- RLS: system templates visible to all; org-specific only to owning org
ALTER TABLE industry_prompt_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ipt_system_read') THEN
    CREATE POLICY ipt_system_read ON industry_prompt_templates
      FOR SELECT USING (is_system = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ipt_org_read') THEN
    CREATE POLICY ipt_org_read ON industry_prompt_templates
      FOR SELECT USING (org_id = current_setting('app.current_org_id', true));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ipt_org_write') THEN
    CREATE POLICY ipt_org_write ON industry_prompt_templates
      FOR ALL USING (org_id = current_setting('app.current_org_id', true));
  END IF;
END $$;

-- Seed: Roofing templates
INSERT INTO industry_prompt_templates (industry, use_case, name, prompt_text, variables) VALUES
('roofing', 'lead_intake', 'Roofing Lead Intake',
 E'Hi {{contact_name}}, this is {{company_name}}. We received your request for a {{service_type}} estimate. I''d love to schedule a free inspection at your convenience. Are mornings or afternoons better for you this week?',
 '["contact_name", "company_name", "service_type"]'::jsonb),

('roofing', 'weather_damage_followup', 'Storm Damage Follow-Up',
 E'{{contact_name}}, with the {{weather_event}} that hit {{city}} on {{weather_date}}, now is a critical time to inspect your roof for damage. {{company_name}} offers free storm-damage assessments — most insurance claims require a professional inspection within 30 days. Want me to schedule one this week?',
 '["contact_name", "weather_event", "city", "weather_date", "company_name"]'::jsonb),

('roofing', 'appointment_confirm', 'Roof Inspection Confirmation',
 E'{{contact_name}}, your roof inspection with {{company_name}} is confirmed for {{appointment_date}} at {{appointment_time}}. Our estimator {{assigned_to}} will arrive in a marked truck. Please ensure roof access is clear. Reply CONFIRM or call us to reschedule.',
 '["contact_name", "company_name", "appointment_date", "appointment_time", "assigned_to"]'::jsonb),

('roofing', 'review_request', 'Roofing Review Request',
 E'Hi {{contact_name}}, thank you for choosing {{company_name}} for your {{service_type}} project! We''d really appreciate a quick Google review — it helps other homeowners find quality roofers. Here''s the link: {{review_url}}',
 '["contact_name", "company_name", "service_type", "review_url"]'::jsonb),

-- Seed: HVAC templates
('hvac', 'lead_intake', 'HVAC Lead Intake',
 E'Hi {{contact_name}}, this is {{company_name}}. Thanks for reaching out about your {{service_type}} needs. Is this for a repair, maintenance, or new installation? I can get a tech out to you as soon as {{next_available}}.',
 '["contact_name", "company_name", "service_type", "next_available"]'::jsonb),

('hvac', 'emergency_callout', 'Emergency HVAC Callout',
 E'{{contact_name}}, we understand your {{issue_type}} is urgent. {{company_name}} has a tech available {{availability_window}}. Emergency service fee is {{service_fee}} — waived if you proceed with the repair. Want me to dispatch {{assigned_to}} now?',
 '["contact_name", "issue_type", "company_name", "availability_window", "service_fee", "assigned_to"]'::jsonb),

('hvac', 'maintenance_reminder', 'Seasonal Maintenance Reminder',
 E'Hi {{contact_name}}, it''s been {{months_since}} months since your last HVAC tune-up. With {{season}} approaching, {{company_name}} recommends a preventive check to avoid breakdowns and keep efficiency high. We have openings {{available_dates}}. Want to book?',
 '["contact_name", "months_since", "season", "company_name", "available_dates"]'::jsonb),

('hvac', 'review_request', 'HVAC Review Request',
 E'Hi {{contact_name}}, glad we could help with your {{service_type}}! If {{company_name}} earned a 5-star experience, we''d love a Google review: {{review_url}} — it means a lot to our small team.',
 '["contact_name", "company_name", "service_type", "review_url"]'::jsonb),

-- Seed: Solar templates
('solar', 'lead_intake', 'Solar Lead Intake',
 E'Hi {{contact_name}}, this is {{company_name}}. We saw your interest in solar for your {{property_type}} property. Based on your area, most homeowners save ${{estimated_savings}}/mo. Want to schedule a free site assessment?',
 '["contact_name", "company_name", "property_type", "estimated_savings"]'::jsonb),

('solar', 'quote_followup', 'Solar Quote Follow-Up',
 E'{{contact_name}}, just following up on the solar proposal we sent {{days_ago}} days ago. Your estimated system would offset {{offset_pct}}% of your energy at ${{monthly_payment}}/mo — less than your current electric bill. The {{incentive_name}} incentive expires {{incentive_deadline}}. Any questions I can answer?',
 '["contact_name", "days_ago", "offset_pct", "monthly_payment", "incentive_name", "incentive_deadline"]'::jsonb),

('solar', 'site_survey_scheduling', 'Solar Site Survey Scheduling',
 E'{{contact_name}}, your solar site assessment with {{company_name}} is confirmed for {{appointment_date}} at {{appointment_time}}. Our consultant {{assigned_to}} will review your roof orientation, shading, and energy usage. Have a recent electric bill handy if possible.',
 '["contact_name", "company_name", "appointment_date", "appointment_time", "assigned_to"]'::jsonb),

('solar', 'review_request', 'Solar Review Request',
 E'{{contact_name}}, thank you for going solar with {{company_name}}! Your system is projected to offset {{offset_pct}}% of your energy. If you''re happy with the experience, a Google review really helps: {{review_url}}',
 '["contact_name", "company_name", "offset_pct", "review_url"]'::jsonb)

ON CONFLICT DO NOTHING;
