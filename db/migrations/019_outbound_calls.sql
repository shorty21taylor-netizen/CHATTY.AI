-- Outbound Voice Agent (ElevenLabs ConvAI)
-- Hand-written migration (applied by scripts/migrate-sql.mjs at boot)

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'call_goal') THEN
    CREATE TYPE call_goal AS ENUM ('reengage_lead','confirm_appointment','followup_quote','custom');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'call_task_status') THEN
    CREATE TYPE call_task_status AS ENUM ('queued','in_progress','completed','failed','no_answer','voicemail');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'call_outcome') THEN
    CREATE TYPE call_outcome AS ENUM ('booked','interested','not_interested','callback_requested','voicemail','no_answer','error');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS call_tasks (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                  TEXT NOT NULL,
  contact_id              TEXT,
  contact_name            TEXT,
  contact_phone           TEXT NOT NULL,
  call_goal               call_goal NOT NULL DEFAULT 'custom',
  custom_prompt           TEXT,
  status                  call_task_status NOT NULL DEFAULT 'queued',
  scheduled_for           TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at              TIMESTAMPTZ,
  ended_at                TIMESTAMPTZ,
  agent_id                UUID,
  brief_id                UUID,
  convai_conversation_id  TEXT,
  transcript              JSONB,
  outcome                 call_outcome,
  outcome_notes           TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS call_tasks_org_status_sched_idx
  ON call_tasks (org_id, status, scheduled_for);
CREATE INDEX IF NOT EXISTS call_tasks_org_agent_idx
  ON call_tasks (org_id, agent_id);
CREATE INDEX IF NOT EXISTS call_tasks_org_brief_idx
  ON call_tasks (org_id, brief_id);

ALTER TABLE call_tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'call_tasks_org_rls') THEN
    CREATE POLICY call_tasks_org_rls ON call_tasks
      FOR ALL USING (org_id = current_setting('app.current_org_id', true));
  END IF;
END $$;
