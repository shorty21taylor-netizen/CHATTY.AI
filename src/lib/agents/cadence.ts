import { withOrgContext } from "@/lib/db/drizzle";
import { eq, and, sql } from "drizzle-orm";
import {
  agentCadences,
  cadenceSteps,
  cadenceRuns,
} from "@/db/schema";
import { inngest } from "@/inngest/client";

interface StartCadenceInput {
  orgId: string;
  cadenceId: string;
  entityType: string;
  entityId: string;
}

export async function startCadence(input: StartCadenceInput) {
  const { orgId, cadenceId, entityType, entityId } = input;

  const run = await withOrgContext(orgId, async (tx) => {
    const [cadence] = await tx
      .select()
      .from(agentCadences)
      .where(eq(agentCadences.id, cadenceId))
      .limit(1);

    if (!cadence || !cadence.isActive) return null;

    const [step0] = await tx
      .select()
      .from(cadenceSteps)
      .where(
        and(
          eq(cadenceSteps.cadenceId, cadenceId),
          eq(cadenceSteps.stepIndex, 0),
        ),
      )
      .limit(1);

    const delaySec = step0?.delaySeconds ?? 0;
    const nextStepAt = delaySec > 0
      ? new Date(Date.now() + delaySec * 1000)
      : new Date();

    const [row] = await tx
      .insert(cadenceRuns)
      .values({
        orgId,
        cadenceId,
        entityType,
        entityId,
        currentStepIndex: 0,
        status: "running",
        startedAt: sql`now()`,
        nextStepAt,
      })
      .returning();

    return { run: row, delaySec };
  });

  if (!run) return null;

  if (run.delaySec <= 0) {
    await inngest.send({
      name: "cadence/step-due",
      data: { runId: run.run.id, orgId },
    });
  } else {
    await inngest.send({
      name: "cadence/step-due",
      data: { runId: run.run.id, orgId },
      ts: Math.floor(Date.now() / 1000) + run.delaySec,
    });
  }

  return run.run;
}

export async function advanceCadence(runId: string, orgId: string) {
  return withOrgContext(orgId, async (tx) => {
    const [run] = await tx
      .select()
      .from(cadenceRuns)
      .where(eq(cadenceRuns.id, runId))
      .limit(1);

    if (!run || run.status !== "running") return null;

    const nextIndex = run.currentStepIndex + 1;

    const [cadence] = await tx
      .select()
      .from(agentCadences)
      .where(eq(agentCadences.id, run.cadenceId))
      .limit(1);

    if (!cadence || nextIndex >= cadence.totalSteps) {
      const [updated] = await tx
        .update(cadenceRuns)
        .set({
          status: "completed",
          completedAt: sql`now()`,
          nextStepAt: null,
        })
        .where(eq(cadenceRuns.id, runId))
        .returning();
      return updated;
    }

    const [nextStep] = await tx
      .select()
      .from(cadenceSteps)
      .where(
        and(
          eq(cadenceSteps.cadenceId, run.cadenceId),
          eq(cadenceSteps.stepIndex, nextIndex),
        ),
      )
      .limit(1);

    const delaySec = nextStep?.delaySeconds ?? 0;
    const nextStepAt = delaySec > 0
      ? new Date(Date.now() + delaySec * 1000)
      : new Date();

    const [updated] = await tx
      .update(cadenceRuns)
      .set({
        currentStepIndex: nextIndex,
        nextStepAt,
      })
      .where(eq(cadenceRuns.id, runId))
      .returning();

    return { updated, delaySec, nextIndex };
  });
}

export async function exitCadence(
  runId: string,
  orgId: string,
  reason: string,
) {
  return withOrgContext(orgId, async (tx) => {
    const [updated] = await tx
      .update(cadenceRuns)
      .set({
        status: "exited",
        exitReason: reason,
        completedAt: sql`now()`,
        nextStepAt: null,
      })
      .where(
        and(
          eq(cadenceRuns.id, runId),
          eq(cadenceRuns.status, "running"),
        ),
      )
      .returning();
    return updated ?? null;
  });
}

export async function exitRunningCadencesForEntity(
  orgId: string,
  entityId: string,
  reason: string,
) {
  return withOrgContext(orgId, async (tx) => {
    const rows = await tx
      .update(cadenceRuns)
      .set({
        status: "exited",
        exitReason: reason,
        completedAt: sql`now()`,
        nextStepAt: null,
      })
      .where(
        and(
          eq(cadenceRuns.entityId, entityId),
          eq(cadenceRuns.status, "running"),
        ),
      )
      .returning();
    return rows.length;
  });
}
