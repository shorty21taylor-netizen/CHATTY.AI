import { db } from "@/lib/db/drizzle";
import { briefPreferences } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * Idempotent seeding for a new organization.
 *
 * Called from the first user-driven entry points after org creation
 * (onboarding `PUT /api/business-profile`, `POST /api/stripe/create-session`).
 *
 * Historically an org only got a `brief_preferences` row when the operator
 * clicked Save on /dashboard/brief/preferences. That meant the 6am scheduler
 * (brief-scheduler Inngest cron) had nothing to read for brand-new orgs, so
 * new signups silently missed their first daily brief until they happened
 * to visit the preferences page.
 *
 * This helper writes defaults on first contact so the scheduler picks them
 * up on the next 15-minute tick. It must stay safe to call repeatedly —
 * `ON CONFLICT DO NOTHING` so an operator who has already tuned their prefs
 * is never overwritten.
 *
 * Note: `brief_preferences.org_id` is TEXT (stores Clerk orgId as-is) — no
 * `withOrgContext` needed. Same pattern the preferences API uses already.
 *
 * Voice defaults match PR AL: `voiceEnabled: false` until audio blob
 * storage is wired (see brief-deliver.ts voice branch returning
 * `audio_storage_not_configured`).
 */
export async function seedOrgDefaults(orgId: string): Promise<void> {
  if (!orgId) return;

  try {
    await db
      .insert(briefPreferences)
      .values({
        orgId,
        enabled: true,
        deliveryTime: "06:00",
        timezone: "America/New_York",
        smsEnabled: true,
        voiceEnabled: false,
        emailEnabled: false,
        phoneNumber: null,
        emailAddress: null,
        voiceId: null,
        updatedAt: sql`now()`,
      })
      .onConflictDoNothing({ target: briefPreferences.orgId });
  } catch (err) {
    // Fail-soft. Seeding is best-effort plumbing — we should never block
    // the user's actual request (profile save, checkout) on a seed failure.
    // The operator can always click Save on /dashboard/brief/preferences
    // to create the row manually. Log for observability.
    console.error("[seedOrgDefaults] failed for org", orgId, err);
  }
}
