import { query, queryOne } from "@/lib/db";
import { inngest } from "@/inngest/client";

export interface PlaybookStep {
  stepIndex: number;
  agentType: string;
  action: string;
  delaySeconds: number;
  config: Record<string, unknown>;
}

export interface Playbook {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  trigger_signal: Record<string, unknown>;
  steps: PlaybookStep[];
  success_count: number;
  last_run_at: string | null;
  is_active: boolean;
  derived_from_signal_ids: string[];
  created_at: string;
}

export async function listPlaybooks(
  orgId: string,
  activeOnly = true,
): Promise<Playbook[]> {
  const whereClause = activeOnly
    ? "WHERE org_id = $1 AND is_active = true"
    : "WHERE org_id = $1";

  const result = await query<Playbook>(
    `SELECT id, org_id, name, description, trigger_signal, steps,
            success_count, last_run_at, is_active, derived_from_signal_ids, created_at
     FROM operator_playbooks
     ${whereClause}
     ORDER BY success_count DESC, created_at DESC`,
    [orgId],
  );
  return result.rows;
}

export async function getPlaybook(
  orgId: string,
  id: string,
): Promise<Playbook | null> {
  return queryOne<Playbook>(
    `SELECT id, org_id, name, description, trigger_signal, steps,
            success_count, last_run_at, is_active, derived_from_signal_ids, created_at
     FROM operator_playbooks
     WHERE org_id = $1 AND id = $2`,
    [orgId, id],
  );
}

export async function runPlaybook(
  orgId: string,
  id: string,
): Promise<{ dispatched: number }> {
  const playbook = await getPlaybook(orgId, id);
  if (!playbook) throw new Error(`Playbook ${id} not found`);

  const steps = Array.isArray(playbook.steps)
    ? (playbook.steps as PlaybookStep[])
    : [];

  for (const step of steps) {
    await inngest.send({
      name: "agent/run",
      data: {
        orgId,
        agentType: step.agentType,
        action: step.action,
        config: step.config,
        playbookId: id,
        stepIndex: step.stepIndex,
      },
    });
  }

  await query(
    `UPDATE operator_playbooks
     SET last_run_at = now(), success_count = success_count + 1, updated_at = now()
     WHERE org_id = $1 AND id = $2`,
    [orgId, id],
  );

  return { dispatched: steps.length };
}

export async function createPlaybook(
  orgId: string,
  name: string,
  description: string,
  triggerSignal: Record<string, unknown>,
  steps: PlaybookStep[],
  derivedFromSignalIds: string[] = [],
): Promise<string> {
  const result = await queryOne<{ id: string }>(
    `INSERT INTO operator_playbooks (org_id, name, description, trigger_signal, steps, derived_from_signal_ids)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      orgId,
      name,
      description,
      JSON.stringify(triggerSignal),
      JSON.stringify(steps),
      JSON.stringify(derivedFromSignalIds),
    ],
  );
  return result?.id || "unknown";
}
