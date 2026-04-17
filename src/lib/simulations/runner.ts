import { db } from "@/lib/db/drizzle";
import { agentSimulations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getHandler } from "./registry";
import { computeComparisonScore } from "./scoring";

interface RunInput {
  orgId: string;
  agentType: string;
  scenarioName?: string;
  inputSignal: Record<string, unknown>;
  actualOutput?: Record<string, unknown>;
  simulationId: string;
}

export async function runSimulation(input: RunInput): Promise<void> {
  const { orgId, agentType, inputSignal, actualOutput, simulationId } = input;

  await db
    .update(agentSimulations)
    .set({ status: "running" })
    .where(eq(agentSimulations.id, simulationId));

  const start = Date.now();

  try {
    const handler = getHandler(agentType);
    if (!handler) {
      throw new Error(`No dry-run handler registered for agent type: ${agentType}`);
    }

    const result = await handler(inputSignal, orgId);
    const durationMs = Date.now() - start;

    const simulatedOutput = result as unknown as Record<string, unknown>;
    const comparisonScore = actualOutput
      ? computeComparisonScore(simulatedOutput, actualOutput)
      : null;

    await db
      .update(agentSimulations)
      .set({
        status: "completed",
        simulatedOutput,
        comparisonScore: comparisonScore !== null ? String(comparisonScore) : null,
        durationMs,
        completedAt: new Date(),
      })
      .where(eq(agentSimulations.id, simulationId));
  } catch (err) {
    const durationMs = Date.now() - start;
    await db
      .update(agentSimulations)
      .set({
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
        durationMs,
        completedAt: new Date(),
      })
      .where(eq(agentSimulations.id, simulationId));
  }
}
