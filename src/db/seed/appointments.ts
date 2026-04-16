// Seed: 20 appointments — mix of past and upcoming, various statuses.

import { sql } from "drizzle-orm";

import type { OrgTx } from "@/lib/db/drizzle";
import { appointments } from "@/db/schema";

import { daysAgo, logStep, pick, rng, type DemoContext } from "./util";

const TYPES = [
  "roof_inspection",
  "insurance_walk",
  "estimate_presentation",
  "follow_up_visit",
  "material_selection",
];

const AZ_ADDRESSES = [
  "4821 E Indian School Rd, Phoenix, AZ 85018",
  "7202 N Scottsdale Rd, Scottsdale, AZ 85253",
  "1650 S Priest Dr, Tempe, AZ 85281",
  "2034 E Broadway Rd, Mesa, AZ 85204",
  "3102 W Chandler Blvd, Chandler, AZ 85224",
];

export async function seedAppointments(
  tx: OrgTx,
  ctx: DemoContext,
): Promise<void> {
  const [row] = await tx
    .select({ n: sql<number>`count(*)::int` })
    .from(appointments);
  if ((row?.n ?? 0) >= 20) {
    logStep("appointments", `${row.n} exist — skipping`);
    return;
  }

  const rand = rng(101);
  const setterAgentId = ctx.agentIdByType["appointment_setter"] ?? null;

  const values = Array.from({ length: 20 }, (_, i) => {
    const daysOffset = i < 8 ? -(i + 1) * 3 : (i - 7) * 2; // past or future
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + daysOffset);
    scheduledDate.setHours(8 + Math.floor(rand() * 9), rand() > 0.5 ? 0 : 30, 0, 0);

    const isPast = daysOffset < 0;
    const status = isPast
      ? pick(rand, ["completed", "completed", "cancelled"] as const)
      : pick(rand, ["confirmed", "pending", "rescheduled"] as const);

    const bookedBy = rand() > 0.4 ? "ai_agent" : "manual";

    return {
      orgId: ctx.orgId,
      contactId: ctx.contactIds[i % ctx.contactIds.length],
      scheduledAt: scheduledDate,
      durationMinutes: pick(rand, [30, 45, 60, 60, 90]),
      appointmentType: pick(rand, TYPES),
      address: pick(rand, AZ_ADDRESSES),
      status: status as "confirmed" | "pending" | "rescheduled" | "cancelled" | "completed",
      bookedBy: bookedBy as "ai_agent" | "manual",
      agentId: bookedBy === "ai_agent" ? setterAgentId : null,
      notes: isPast
        ? `Completed — ${pick(rand, ["went well", "needs follow-up", "customer signed"])}`
        : null,
    };
  });

  await tx.insert(appointments).values(values);
  logStep("appointments", "20 inserted");
}
