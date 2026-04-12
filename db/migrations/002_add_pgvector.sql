-- 002_add_pgvector.sql â Add vector embedding support
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to signal_events for semantic search
ALTER TABLE signal_events ADD COLUMN embedding vector(1024);

-- Create IVFFlat index for approximate nearest neighbor search
-- Note: requires at least 1000 rows before creating; run after seeding
-- CREATE INDEX idx_signal_events_embedding ON signal_events
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
