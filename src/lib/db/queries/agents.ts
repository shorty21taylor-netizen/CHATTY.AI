// Typed query helpers for agent_configs / agent_runs / agent_activity.

import { and, desc, eq, sql } from "drizzle-orm";

import type { OrgTx } from "../drizzle";
import {
  agentActivity,
  agentConfigs,
  agentRuns,
  type AgentConfig,
  type AgentRun,
  type NewAgentConfig,
} from "@/db/schema";

export async function listByOrg(tx: OrgTx): Promise<AgentConfig[]> {
  return tx.select().from(agentConfigs).orderBy(agentConfigs.agentType);
}

export async function getConfig(
  tx: OrgTx,
  agentType: string,
): Promise<AgentConfig | null> {
  const [row] = await tx
    .select()
    .from(agentConfigs)
    .where(eq(agentConfigs.agentType, agentType))
    .limit(1);
  return row ?? null;
}

export async function getConfigById(
  tx: OrgTx,
  id: string,
): Promise<AgentConfig | null> {
  const [row] = await tx
    .select()
    .from(agentConfigs)
    .where(eq(agentConfigs.id, id))
    .limit(1);
  return row ?? null;
}

export async function upsertConfig(
  tx: OrgTx,
  input: NewAgentConfig,
): Promise<AgentConfig> {
  const [row] = await tx
    .insert(agentConfigs)
    .values(input)
    .onConflictDoUpdate({
      target: [agentConfigs.orgId, agentConfigs.agentType],
      set: {
        name: input.name,
        status: input.status,
        config: input.config,
        completenessPct: input.completenessPct,
        activationMode: input.activationMode,
        updatedAt: sql`now()`,
      },
    })
    .returning();
  return row;
}

export async function updateStatus(
  tx: OrgTx,
  id: string,
  status: AgentConfig["status"],
  activationMode?: AgentConfig["activationMode"],
): Promise<AgentConfig | null> {
  const [row] = await tx
    .update(agentConfigs)
    .set({
      status,
      activationMode: activationMode ?? null,
      updatedAt: sql`now()`,
    })
    .where(eq(agentConfigs.id, id))
    .returning();
  return row ?? null;
}

export async function touchLastRun(
  tx: OrgTx,
  id: string,
): Promise<void> {
  await tx
    .update(agentConfigs)
    .set({ lastRunAt: sql`now()`, updatedAt: sql`now()` })
    .where(eq(agentConfigs.id, id));
}

// ---------------------------------------------------------------------------
// Runs + activity
// ---------------------------------------------------------------------------

export async function logRun(
  tx: OrgTx,
  run: Omit<
    typeof agentRuns.$inferInsert,
    "id" | "createdAt"
  >,
): Promise<AgentRun> {
  const [row] = await tx.insert(agentRuns).values(run).returning();
  await touchLastRun(tx, run.agentId);
  return row;
}

export async function logActivity(
  tx: OrgTx,
  activity: Omit<
    typeof agentActivity.$inferInsert,
    "id" | "createdAt"
  >,
): Promise<void> {
  await tx.insert(agentActivity).values(activity);
}

export async function recentRuns(
  tx: OrgTx,
  agentId: string,
  limit = 30,
): Promise<AgentRun[]> {
  return tx
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.agentId, agentId))
    .orderBy(desc(agentRuns.createdAt))
    .limit(limit);
}

export async function recentActivity(
  tx: OrgTx,
  agentId: string,
  limit = 50,
) {
  return tx
    .select({
      activity: agentActivity,
      run: agentRuns,
    })
    .from(agentActivity)
    .innerJoin(agentRuns, eq(agentActivity.agentRunId, agentRuns.id))
    .where(eq(agentRuns.agentId, agentId))
    .orderBy(desc(agentActivity.createdAt))
    .limit(limit);
}

export { agentConfigs, agentRuns, agentActivity };
void and;
