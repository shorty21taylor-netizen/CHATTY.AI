// Seed: ~900 signal_events (10/day × 90 days), varied event types.

import { sql } from "drizzle-orm";

import type { OrgTx } from "@/lib/db/drizzle";
import { signalEvents } from "@/db/schema";

import { daysAgo, logStep, pick, range, rng, type DemoContext } from "./util";

const EVENT_TYPES = [
  "lead_received",
  "form_submitted",
  "social_dm_received",
  "ad_click",
  "quote_sent",
  "quote_no_reply_7d",
  "appointment_booked",
  "job_completed",
  "review_received",
  "sms_sent",
  "sms_received",
  "call_inbound",
  "call_outbound",
  "email_opened",
  "no_contact_30d",
];

const SOURCE_TYPES = [
  "internal_crm",
  "google_ads",
  "facebook_ads",
  "twilio_sms",
  "custom",
];

export async function seedSignals(
  tx: OrgTx,
  ctx: DemoContext,
): Promise<void> {
  const [row] = await tx
    .select({ n: sql<number>`count(*)::int` })
    .from(signalEvents);
  if ((row?.n ?? 0) >= 800) {
    logStep("signal_events", `${row.n} exist — skipping`);
    return;
  }

  const rand = rng(333);
  const DAYS = 90;
  const PER_DAY = 10;

  // Build in batches of ~100 to keep the value list manageable.
  const BATCH = 100;
  const all = range(DAYS * PER_DAY);
  let inserted = 0;

  for (let start = 0; start < all.length; start += BATCH) {
    const slice = all.slice(start, start + BATCH);

    const values = slice.map((i) => {
      const dayIdx = Math.floor(i / PER_DAY);
      const date = daysAgo(DAYS - dayIdx);
      date.setHours(7 + Math.floor(rand() * 12), Math.floor(rand() * 60));

      const eventType = pick(rand, EVENT_TYPES);
      const contactIdx = Math.floor(rand() * ctx.contactIds.length);

      return {
        orgId: ctx.orgId,
        sourceType: pick(rand, SOURCE_TYPES),
        sourceId: null as string | null,
        eventType,
        entityType: "contact",
        entityId: ctx.contactIds[contactIdx],
        data: {
          auto_seed: true,
          event_type: eventType,
          contact_idx: contactIdx,
        },
        // No embedding — skipping vector for seed data
        receivedAt: date,
        createdAt: date,
      };
    });

    await tx.insert(signalEvents).values(values);
    inserted += values.length;
  }

  logStep("signal_events", `${inserted} inserted (${DAYS} days × ${PER_DAY}/day)`);
}
