-- Industry Prompt Templates
-- Hand-written migration (applied by scripts/migrate-sql.mjs at boot)

CREATE TABLE IF NOT EXISTS industry_prompt_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry      TEXT NOT NULL,
  use_case      TEXT NOT NULL,
  prompt_text   TEXT NOT NULL,
  variables     JSONB NOT NULL DEFAULT '[]'::jsonb,
  version       INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ipt_industry_idx ON industry_prompt_templates (industry);
CREATE INDEX IF NOT EXISTS ipt_industry_use_case_idx ON industry_prompt_templates (industry, use_case);

-- Seed: Roofing templates
INSERT INTO industry_prompt_templates (industry, use_case, prompt_text, variables) VALUES
('roofing', 'lead_intake_script', E'Hi {{contact_name}}, this is {{company_name}}. We received your request for a {{service_type}} estimate. I''d love to schedule a free inspection at your convenience. Are mornings or afternoons better for you this week?', '["contact_name", "company_name", "service_type"]'::jsonb),
('roofing', 'appointment_confirmation', E'{{contact_name}}, your roof inspection with {{company_name}} is confirmed for {{appointment_date}} at {{appointment_time}}. Our estimator {{assigned_to}} will arrive in a marked truck. Please ensure roof access is clear. Reply CONFIRM or call us to reschedule.', '["contact_name", "company_name", "appointment_date", "appointment_time", "assigned_to"]'::jsonb),
('roofing', 'review_request', E'Hi {{contact_name}}, thank you for choosing {{company_name}} for your {{service_type}} project! We''d really appreciate a quick Google review — it helps other homeowners find quality roofers. Here''s the link: {{review_url}}', '["contact_name", "company_name", "service_type", "review_url"]'::jsonb),
('roofing', 'weather_triggered_outreach', E'{{contact_name}}, with the {{weather_event}} heading to {{city}} this {{weather_date}}, now is a great time to check your roof for vulnerabilities. {{company_name}} offers free storm-prep inspections. Want me to schedule one this week?', '["contact_name", "weather_event", "city", "weather_date", "company_name"]'::jsonb),

-- Seed: HVAC templates
('hvac', 'lead_intake_script', E'Hi {{contact_name}}, this is {{company_name}}. Thanks for reaching out about your {{service_type}} needs. Is this for a repair, maintenance, or new installation? I can get a tech out to you as soon as {{next_available}}.', '["contact_name", "company_name", "service_type", "next_available"]'::jsonb),
('hvac', 'appointment_confirmation', E'{{contact_name}}, your HVAC {{service_type}} appointment with {{company_name}} is set for {{appointment_date}} at {{appointment_time}}. Tech: {{assigned_to}}. Please make sure the unit is accessible. Reply CONFIRM or call to reschedule.', '["contact_name", "company_name", "service_type", "appointment_date", "appointment_time", "assigned_to"]'::jsonb),
('hvac', 'review_request', E'Hi {{contact_name}}, glad we could help with your {{service_type}}! If {{company_name}} earned a 5-star experience, we''d love a Google review: {{review_url}} — it means a lot to our small team.', '["contact_name", "company_name", "service_type", "review_url"]'::jsonb),
('hvac', 'weather_triggered_outreach', E'{{contact_name}}, {{city}} is expecting {{weather_event}} this {{weather_date}}. Don''t get caught without heat/cooling — {{company_name}} has same-day tune-up slots available. Want me to book one?', '["contact_name", "city", "weather_event", "weather_date", "company_name"]'::jsonb),

-- Seed: Solar templates
('solar', 'lead_intake_script', E'Hi {{contact_name}}, this is {{company_name}}. We saw your interest in solar for your {{property_type}} property. Based on your area, most homeowners save ${{estimated_savings}}/mo. Want to schedule a free site assessment?', '["contact_name", "company_name", "property_type", "estimated_savings"]'::jsonb),
('solar', 'appointment_confirmation', E'{{contact_name}}, your solar site assessment with {{company_name}} is confirmed for {{appointment_date}} at {{appointment_time}}. Our consultant {{assigned_to}} will review your roof orientation, shading, and energy usage. Have a recent electric bill handy if possible.', '["contact_name", "company_name", "appointment_date", "appointment_time", "assigned_to"]'::jsonb),
('solar', 'review_request', E'{{contact_name}}, thank you for going solar with {{company_name}}! Your system is projected to offset {{offset_pct}}% of your energy. If you''re happy with the experience, a Google review really helps: {{review_url}}', '["contact_name", "company_name", "offset_pct", "review_url"]'::jsonb),
('solar', 'weather_triggered_outreach', E'{{contact_name}}, great news — {{city}} is expecting {{sunny_days}} sunny days this month, perfect for solar production. {{company_name}} still has installation slots for this quarter. Want to lock in the current incentive rate?', '["contact_name", "city", "sunny_days", "company_name"]'::jsonb)

ON CONFLICT DO NOTHING;
