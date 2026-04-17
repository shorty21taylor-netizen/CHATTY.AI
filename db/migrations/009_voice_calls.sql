-- 009_voice_calls.sql
-- Voice call tracking for ElevenLabs Conversational AI inbound calls.

CREATE TABLE voice_calls (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                   TEXT NOT NULL,
  call_sid                 TEXT UNIQUE NOT NULL,
  elevenlabs_conversation_id TEXT,
  caller_number            TEXT NOT NULL,
  called_number            TEXT NOT NULL,
  direction                TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  status                   TEXT NOT NULL DEFAULT 'ringing' CHECK (status IN ('ringing','in_progress','completed','failed','no_answer')),
  started_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at                 TIMESTAMPTZ,
  duration_seconds         INTEGER,
  transcript               JSONB,
  outcome                  TEXT CHECK (outcome IN ('qualified','unqualified','appointment_booked','voicemail','no_answer','abandoned')),
  outcome_data             JSONB,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_voice_calls_org_started ON voice_calls(org_id, started_at DESC);
CREATE INDEX idx_voice_calls_call_sid ON voice_calls(call_sid);

ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY voice_calls_org_isolation ON voice_calls
  USING (org_id = current_setting('app.current_org_id', true));

-- Add ElevenLabs agent ID + Twilio phone number to business_profile
ALTER TABLE business_profile ADD COLUMN IF NOT EXISTS elevenlabs_agent_id TEXT;
ALTER TABLE business_profile ADD COLUMN IF NOT EXISTS twilio_phone_number TEXT;
