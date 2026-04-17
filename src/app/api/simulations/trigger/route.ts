import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { agentSimulations } from "@/db/schema";
import { getAgentTypes } from "@/lib/simulations/registry";
import { inngest } from "@/inngest/client";

export async function POST(req: NextRequest) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    agent_type: string;
    scenario_name?: string;
    input_signal: Record<string, unknown>;
    actual_output?: Record<string, unknown>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.agent_type || !body.input_signal) {
    return NextResponse.json(
      { error: "agent_type and input_signal are required" },
      { status: 400 },
    );
  }

  const validTypes = getAgentTypes();
  if (!validTypes.includes(body.agent_type)) {
    return NextResponse.json(
      { error: `Invalid agent_type. Valid: ${validTypes.join(", ")}` },
      { status: 400 },
    );
  }

  const [row] = await db
    .insert(agentSimulations)
    .values({
      orgId,
      agentType: body.agent_type,
      scenarioName: body.scenario_name || null,
      inputSignal: body.input_signal,
      actualOutput: body.actual_output || null,
      status: "pending",
    })
    .returning({ id: agentSimulations.id });

  await inngest.send({
    name: "simulation/run",
    data: {
      orgId,
      agentType: body.agent_type,
      scenarioName: body.scenario_name,
      inputSignal: body.input_signal,
      actualOutput: body.actual_output,
      simulationId: row.id,
    },
  });

  return NextResponse.json({ simulation_id: row.id, status: "queued" });
}
