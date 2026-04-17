import { withOrgContext } from "@/lib/db/drizzle";
import { eq, and, sql, inArray, gte } from "drizzle-orm";
import { agentConfigs, agentRuns, businessProfile } from "@/db/schema";
import { inngest } from "@/inngest/client";

interface DispatchInput {
  orgId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  data: Record<string, any>;
}

interface DispatchResult {
  dispatched: number;
  skipped: string[];
}

export async function dispatchAgentsForEvent(
  input: DispatchInput,
): Promise<DispatchResult> {
  const { orgId, eventType, entityType, entityId, data } = input;
  const skipped: string[] = [];
  let dispatched = 0;

  try {
    const candidates = await withOrgContext(orgId, async (tx) => {
      const rows = await tx
        .select()
        .from(agentConfigs)
        .where(
          and(
            inArray(agentConfigs.status, ["shadow", "active"]),
          ),
        );
      return rows.filter((r) => {
        const cfg = (r.config ?? {}) as Record<string, any>;
        return cfg.triggers?.event_type === eventType;
      });
    });

    if (candidates.length === 0) {
      return { dispatched: 0, skipped: ["no_matching_agents"] };
    }

    const bp = await withOrgContext(orgId, async (tx) => {
      const [row] = await tx
        .select()
        .from(businessProfile)
        .where(eq(businessProfile.orgId, sql`current_setting('app.current_org_id')::uuid`))
        .limit(1);
      return row ?? null;
    });

    for (const agent of candidates) {
      try {
        const cfg = (agent.config ?? {}) as Record<string, any>;

        if (!isWithinTimeWindow(cfg.triggers?.time_window, cfg.triggers?.custom_window, bp)) {
          skipped.push(`${agent.agentType}:outside_time_window`);
          continue;
        }

        const cooldownMs = parseCooldown(cfg.triggers?.cooldown);
        if (cooldownMs > 0) {
          const withinCooldown = await withOrgContext(orgId, async (tx) => {
            const since = new Date(Date.now() - cooldownMs);
            const [recent] = await tx
              .select({ id: agentRuns.id })
              .from(agentRuns)
              .where(
                and(
                  eq(agentRuns.agentId, agent.id),
                  eq(agentRuns.contactId, entityId),
                  gte(agentRuns.createdAt, since),
                ),
              )
              .limit(1);
            return !!recent;
          });
          if (withinCooldown) {
            skipped.push(`${agent.agentType}:cooldown`);
            continue;
          }
        }

        await inngest.send({
          name: "agent/run",
          data: {
            orgId,
            agentConfigId: agent.id,
            agentTypeId: agent.agentType,
            eventType,
            entityType,
            entityId,
            signalData: data,
          },
        });
        dispatched++;
      } catch (err) {
        console.error(`[dispatcher] failed for agent ${agent.agentType}:`, err);
        skipped.push(`${agent.agentType}:dispatch_error`);
      }
    }
  } catch (err) {
    console.error("[dispatcher] top-level error:", err);
    return { dispatched: 0, skipped: ["dispatcher_error"] };
  }

  return { dispatched, skipped };
}

function isWithinTimeWindow(
  window: string | undefined,
  customWindow: { start?: string; end?: string } | undefined,
  bp: { businessHours?: any; timezone?: string | null } | null,
): boolean {
  if (!window || window === "anytime") return true;

  const tz = bp?.timezone || "America/Phoenix";
  let now: Date;
  try {
    now = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  } catch {
    now = new Date();
  }

  const hhmm = now.getHours() * 100 + now.getMinutes();
  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const dayKey = dayNames[now.getDay()];

  if (window === "business_hours") {
    const hours = (bp?.businessHours ?? {}) as Record<
      string,
      { open?: string; close?: string; closed?: boolean }
    >;
    const today = hours[dayKey];
    if (!today || today.closed) return false;
    const openVal = parseHhmm(today.open ?? "07:00");
    const closeVal = parseHhmm(today.close ?? "18:00");
    return hhmm >= openVal && hhmm <= closeVal;
  }

  if (window === "custom" && customWindow) {
    const startVal = parseHhmm(customWindow.start ?? "07:00");
    const endVal = parseHhmm(customWindow.end ?? "20:00");
    return hhmm >= startVal && hhmm <= endVal;
  }

  return true;
}

function parseHhmm(str: string): number {
  const [h, m] = str.split(":").map(Number);
  return (h || 0) * 100 + (m || 0);
}

function parseCooldown(
  cooldown: { value?: number; unit?: string } | undefined,
): number {
  if (!cooldown?.value) return 0;
  const v = cooldown.value;
  switch (cooldown.unit) {
    case "minutes":
      return v * 60 * 1000;
    case "hours":
      return v * 60 * 60 * 1000;
    case "days":
      return v * 24 * 60 * 60 * 1000;
    default:
      return v * 60 * 60 * 1000;
  }
}
