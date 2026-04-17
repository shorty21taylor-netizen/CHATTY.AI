import { inngest } from "../client";
import { db } from "@/lib/db/drizzle";
import { briefPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";

function currentTimeInTz(tz: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const hour = parts.find((p) => p.type === "hour")?.value || "00";
    const minute = parts.find((p) => p.type === "minute")?.value || "00";
    return `${hour}:${minute}`;
  } catch {
    return "99:99";
  }
}

function floorTo15Min(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const floored = Math.floor(m / 15) * 15;
  return `${String(h).padStart(2, "0")}:${String(floored).padStart(2, "0")}`;
}

export const briefScheduler = inngest.createFunction(
  {
    id: "brief-scheduler",
    name: "Brief Delivery Scheduler",
    concurrency: { limit: 1 },
  },
  { cron: "*/15 * * * *" },
  async ({ step }) => {
    const prefs = await step.run("get-enabled-prefs", async () => {
      return db
        .select()
        .from(briefPreferences)
        .where(eq(briefPreferences.enabled, true));
    });

    if (prefs.length === 0) {
      return { checked: 0, triggered: 0 };
    }

    const toTrigger: { name: "brief/run"; data: { orgId: string } }[] = [];

    for (const pref of prefs) {
      const currentTime = currentTimeInTz(pref.timezone);
      const floored = floorTo15Min(currentTime);
      if (floored === pref.deliveryTime) {
        toTrigger.push({
          name: "brief/run" as const,
          data: { orgId: pref.orgId },
        });
      }
    }

    if (toTrigger.length > 0) {
      await step.sendEvent("fan-out-brief-runs", toTrigger);
    }

    return { checked: prefs.length, triggered: toTrigger.length };
  },
);
