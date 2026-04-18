-- Memory Graph + Operator Playbooks
-- Hand-written migration (applied by scripts/migrate-sql.mjs at boot)

-- 1. memory_nodes — entities in the org's knowledge graph
CREATE TABLE IF NOT EXISTS memory_nodes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            TEXT NOT NULL,
  node_type         TEXT NOT NULL CHECK (node_type IN ('contact','opportunity','agent_run','brief','outcome')),
  entity_id         TEXT NOT NULL,
  summary           TEXT,
  embedding         vector(1024),
  data              JSONB NOT NULL DEFAULT '{}'::jsonb,
  relevance_score   NUMERIC NOT NULL DEFAULT 0,
  last_referenced_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS memory_nodes_org_type_entity_uq
  ON memory_nodes (org_id, node_type, entity_id);
CREATE INDEX IF NOT EXISTS memory_nodes_org_type_idx
  ON memory_nodes (org_id, node_type);
CREATE INDEX IF NOT EXISTS memory_nodes_org_last_ref_idx
  ON memory_nodes (org_id, last_referenced_at DESC);

ALTER TABLE memory_nodes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'memory_nodes_org_rls') THEN
    CREATE POLICY memory_nodes_org_rls ON memory_nodes
      FOR ALL USING (org_id = current_setting('app.current_org_id', true));
  END IF;
END $$;

-- 2. memory_edges — relationships between nodes
CREATE TABLE IF NOT EXISTS memory_edges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      TEXT NOT NULL,
  from_node   UUID NOT NULL REFERENCES memory_nodes(id) ON DELETE CASCADE,
  to_node     UUID NOT NULL REFERENCES memory_nodes(id) ON DELETE CASCADE,
  edge_type   TEXT NOT NULL CHECK (edge_type IN ('touched','converted','followed_by','caused','similar_to')),
  weight      NUMERIC NOT NULL DEFAULT 1,
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS memory_edges_org_from_to_type_uq
  ON memory_edges (org_id, from_node, to_node, edge_type);
CREATE INDEX IF NOT EXISTS memory_edges_org_from_idx
  ON memory_edges (org_id, from_node);
CREATE INDEX IF NOT EXISTS memory_edges_org_to_idx
  ON memory_edges (org_id, to_node);

ALTER TABLE memory_edges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'memory_edges_org_rls') THEN
    CREATE POLICY memory_edges_org_rls ON memory_edges
      FOR ALL USING (org_id = current_setting('app.current_org_id', true));
  END IF;
END $$;

-- 3. operator_playbooks — replayable action sequences
CREATE TABLE IF NOT EXISTS operator_playbooks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                TEXT NOT NULL,
  name                  TEXT NOT NULL,
  description           TEXT,
  trigger_signal        JSONB NOT NULL DEFAULT '{}'::jsonb,
  steps                 JSONB NOT NULL DEFAULT '[]'::jsonb,
  success_count         INTEGER NOT NULL DEFAULT 0,
  last_run_at           TIMESTAMPTZ,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  derived_from_signal_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS operator_playbooks_org_active_idx
  ON operator_playbooks (org_id, is_active);

ALTER TABLE operator_playbooks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'operator_playbooks_org_rls') THEN
    CREATE POLICY operator_playbooks_org_rls ON operator_playbooks
      FOR ALL USING (org_id = current_setting('app.current_org_id', true));
  END IF;
END $$;
