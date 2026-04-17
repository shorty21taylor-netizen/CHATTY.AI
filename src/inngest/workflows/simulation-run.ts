import { inngest } from "../client";
import { runSimulation } from "@/lib/simulations/runner";

export const simulationRunWorkflow = inngest.createFunction(
  {
    id: "simulation-run",
    name: "Run Agent Simulation",
    retries: 1,
    concurrency: {
      limit: 10,
      key: "event.data.orgId",
    },
  },
  { event: "simulation/run" },
  async ({ event, step }) => {
    const { orgId, agentType, scenarioName, inputSignal, actualOutput, simulationId } =
      event.data as {
        orgId: string;
        agentType: string;
        scenarioName?: string;
        inputSignal: Record<string, unknown>;
        actualOutput?: Record<string, unknown>;
        simulationId: string;
      };

    await step.run("execute-simulation", async () => {
      await runSimulation({
        orgId,
        agentType,
        scenarioName,
        inputSignal,
        actualOutput,
        simulationId,
      });
    });

    await step.sendEvent("simulation-completed", {
      name: "simulation/completed",
      data: { orgId, simulationId, agentType },
    });

    return { simulationId, status: "completed" };
  },
);
