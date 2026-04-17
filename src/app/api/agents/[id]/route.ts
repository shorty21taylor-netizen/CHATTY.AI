import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

import { withOrgContext } from "@/lib/db/drizzle";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import * as agents from "@/lib/db/queries/agents";
import { AGENT_TYPES } from "@/lib/agents/registry";

const VALID_STATUSES = ["not_configured", "draft", "shadow", "active", "paused"] as const;
type AgentStatus = (typeof VALID_STATUSES)[number];

const SECTION_KEYS = [
  "mission", "triggers", "context", "voice", "templates",
  "knowledge", "tools", "guardrails", "escalation", "simulation", "activation",
];

function computeCompletion(config: Record<string, unknown>): number {
  const completeness = (config?.completeness ?? {}) as Record<string, boolean>;
  const done = SECTION_KEYS.filter((k) => completeness[k]).length;
  return Math.round((done / SECTION_KEYS.length) * 100);
}

function deepMerge(base: any, patch: any): any {
  if (Array.isArray(patch)) return patch;
  if (patch && typeof patch === "object" && base && typeof base === "object" && !Array.isArray(base)) {
    const out = { ...base };
    for (const k of Object.keys(patch)) {
      out[k] = deepMerge(base[k], patch[k]);
    }
    return out;
  }
  return patch ?? base;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!AGENT_TYPES.find((a: any) => a.id === id)) {
    return NextResponse.json({ error: "Unknown agent type" }, { status: 404 });
  }

  const rl = await rateLimitRequest(orgId, "agents-detail", { limit: 120 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const agent = await withOrgContext(orgId, (tx) => agents.getConfig(tx, id));
  return NextResponse.json({ agent }, { headers: rateLimitHeaders(rl) });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const agentType = AGENT_TYPES.find((a: any) => a.id === id);
  if (!agentType) {
    return NextResponse.json({ error: "Unknown agent type" }, { status: 404 });
  }

  const rl = await rateLimitRequest(orgId, "agents-update", { limit: 120 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patchConfig = body.config && typeof body.config === "object" ? body.config : null;
  const patchStatus: AgentStatus | undefined = body.status && VALID_STATUSES.includes(body.status) ? body.status : undefined;

  if (!patchConfig && !patchStatus) {
    return NextResponse.json({ error: "Provide config and/or status" }, { status: 400 });
  }

  const saved = await withOrgContext(orgId, async (tx) => {
    const existing = await agents.getConfig(tx, id);
    const existingConfig = (existing?.config ?? {}) as Record<string, unknown>;
    const mergedConfig = patchConfig ? deepMerge(existingConfig, patchConfig) : existingConfig;
    const completionPct = computeCompletion(mergedConfig);
    const status = patchStatus ?? existing?.status ?? "not_configured";

    return agents.upsertConfig(tx, {
      orgId,
      agentType: id,
      name: (agentType as any).name,
      status,
      config: mergedConfig,
      completenessPct: completionPct,
      activationMode: status === "active" ? "full_auto" : status === "shadow" ? "shadow" : "draft",
    });
  });

  return NextResponse.json({ agent: saved }, { headers: rateLimitHeaders(rl) });
}
