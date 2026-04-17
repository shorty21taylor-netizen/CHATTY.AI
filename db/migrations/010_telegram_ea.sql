-- 010_telegram_ea.sql
-- Telegram Executive Assistant: sessions + message history.

CREATE TABLE telegram_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        TEXT NOT NULL,
  user_id       TEXT NOT NULL,
  chat_id       BIGINT UNIQUE NOT NULL,
  username      TEXT,
  linked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  preferences   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_telegram_sessions_org ON telegram_sessions(org_id, created_at DESC);
CREATE INDEX idx_telegram_sessions_chat ON telegram_sessions(chat_id);

ALTER TABLE telegram_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY telegram_sessions_org_isolation ON telegram_sessions
  USING (org_id = current_setting('app.current_org_id', true));

CREATE TABLE telegram_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        TEXT NOT NULL,
  chat_id       BIGINT NOT NULL,
  direction     TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  message_type  TEXT,
  text          TEXT,
  payload       JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_telegram_messages_org ON telegram_messages(org_id, created_at DESC);
CREATE INDEX idx_telegram_messages_chat ON telegram_messages(chat_id, created_at DESC);

ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY telegram_messages_org_isolation ON telegram_messages
  USING (org_id = current_setting('app.current_org_id', true));
