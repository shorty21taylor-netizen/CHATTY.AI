import { query, queryOne } from "@/lib/db";

export type CallGoal = "reengage_lead" | "confirm_appointment" | "followup_quote" | "custom";
export type CallTaskStatus = "queued" | "in_progress" | "completed" | "failed" | "no_answer" | "voicemail";
export type CallOutcome = "booked" | "interested" | "not_interested" | "callback_requested" | "voicemail" | "no_answer" | "error";

export interface CallTask {
  id: string;
  org_id: string;
  contact_id: string | null;
  contact_name: string | null;
  contact_phone: string;
  call_goal: CallGoal;
  custom_prompt: string | null;
  status: CallTaskStatus;
  scheduled_for: string;
  started_at: string | null;
  ended_at: string | null;
  agent_id: string | null;
  brief_id: string | null;
  convai_conversation_id: string | null;
  transcript: Record<string, unknown> | null;
  outcome: CallOutcome | null;
  outcome_notes: string | null;
  created_at: string;
}

export interface EnqueueOptions {
  orgId: string;
  contactId?: string;
  contactName?: string;
  contactPhone: string;
  callGoal: CallGoal;
  customPrompt?: string;
  scheduledFor?: string;
  agentId?: string;
  briefId?: string;
}

export async function enqueueCallTask(opts: EnqueueOptions): Promise<string> {
  const result = await queryOne<{ id: string }>(
    `INSERT INTO call_tasks (org_id, contact_id, contact_name, contact_phone, call_goal, custom_prompt, scheduled_for, agent_id, brief_id)
     VALUES ($1, $2, $3, $4, $5::call_goal, $6, $7, $8, $9)
     RETURNING id`,
    [
      opts.orgId,
      opts.contactId || null,
      opts.contactName || null,
      opts.contactPhone,
      opts.callGoal,
      opts.customPrompt || null,
      opts.scheduledFor || new Date().toISOString(),
      opts.agentId || null,
      opts.briefId || null,
    ],
  );
  return result?.id || "unknown";
}

export async function getPendingTasks(orgId: string, limit = 20): Promise<CallTask[]> {
  const result = await query<CallTask>(
    `SELECT * FROM call_tasks
     WHERE org_id = $1 AND status = 'queued' AND scheduled_for <= now()
     ORDER BY scheduled_for ASC
     LIMIT $2`,
    [orgId, limit],
  );
  return result.rows;
}

export async function getCallTasks(orgId: string, limit = 50): Promise<CallTask[]> {
  const result = await query<CallTask>(
    `SELECT * FROM call_tasks
     WHERE org_id = $1 AND created_at > now() - interval '30 days'
     ORDER BY scheduled_for DESC
     LIMIT $2`,
    [orgId, limit],
  );
  return result.rows;
}

export async function getCallTask(orgId: string, id: string): Promise<CallTask | null> {
  return queryOne<CallTask>(
    `SELECT * FROM call_tasks WHERE org_id = $1 AND id = $2`,
    [orgId, id],
  );
}

export async function updateTaskStatus(
  id: string,
  status: CallTaskStatus,
  extra: Record<string, unknown> = {},
): Promise<void> {
  const sets: string[] = ["status = $2::call_task_status", "updated_at = now()"];
  const params: unknown[] = [id, status];
  let paramIdx = 3;

  if (extra.convai_conversation_id) {
    sets.push(`convai_conversation_id = $${paramIdx}`);
    params.push(extra.convai_conversation_id);
    paramIdx++;
  }
  if (status === "in_progress") {
    sets.push("started_at = now()");
  }
  if (status === "completed" || status === "failed" || status === "no_answer" || status === "voicemail") {
    sets.push("ended_at = now()");
  }

  await query(
    `UPDATE call_tasks SET ${sets.join(", ")} WHERE id = $1`,
    params,
  );
}

export async function recordOutcome(
  id: string,
  outcome: CallOutcome,
  transcript?: Record<string, unknown>,
  notes?: string,
): Promise<void> {
  await query(
    `UPDATE call_tasks SET
       outcome = $2::call_outcome,
       transcript = COALESCE($3, transcript),
       outcome_notes = COALESCE($4, outcome_notes),
       ended_at = COALESCE(ended_at, now()),
       status = CASE
         WHEN $2 = 'voicemail' THEN 'voicemail'::call_task_status
         WHEN $2 = 'no_answer' THEN 'no_answer'::call_task_status
         WHEN $2 = 'error' THEN 'failed'::call_task_status
         ELSE 'completed'::call_task_status
       END,
       updated_at = now()
     WHERE id = $1`,
    [id, outcome, transcript ? JSON.stringify(transcript) : null, notes || null],
  );
}
