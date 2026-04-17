import { db } from "@/lib/db/drizzle";
import { agentSimulations } from "@/db/schema";
import { CANNED_SCENARIOS } from "@/lib/simulations/scenarios";

const DEMO_ORG_ID = process.env.SEED_ORG_ID || "demo-org-000";

export async function seedSimulations() {
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.SEED_SIMULATIONS
  ) {
    console.log("[seed] Skipping simulation seed in production (set SEED_SIMULATIONS=1 to override)");
    return;
  }

  console.log(`[seed] Inserting ${CANNED_SCENARIOS.length} canned simulation scenarios for org ${DEMO_ORG_ID}...`);

  for (const scenario of CANNED_SCENARIOS) {
    await db.insert(agentSimulations).values({
      orgId: DEMO_ORG_ID,
      agentType: scenario.agent_type,
      scenarioName: scenario.scenario_name,
      inputSignal: scenario.input_signal,
      actualOutput: scenario.actual_output,
      status: "pending",
    });
  }

  console.log("[seed] Done seeding simulation scenarios.");
}

if (require.main === module) {
  seedSimulations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[seed] Failed:", err);
      process.exit(1);
    });
}
