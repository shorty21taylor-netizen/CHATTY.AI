// Seed: one business_profile row for the Summit Roofing demo org.

import { eq } from "drizzle-orm";

import type { OrgTx } from "@/lib/db/drizzle";
import { businessProfile } from "@/db/schema";

import { logStep, type DemoContext } from "./util";

const STANDARD_HOURS = {
  mon: { open: "07:00", close: "18:00", closed: false },
  tue: { open: "07:00", close: "18:00", closed: false },
  wed: { open: "07:00", close: "18:00", closed: false },
  thu: { open: "07:00", close: "18:00", closed: false },
  fri: { open: "07:00", close: "18:00", closed: false },
  sat: { open: "08:00", close: "14:00", closed: false },
  sun: { open: "", close: "", closed: true },
};

export async function seedBusinessProfile(
  tx: OrgTx,
  ctx: DemoContext,
): Promise<void> {
  const [existing] = await tx
    .select({ id: businessProfile.id })
    .from(businessProfile)
    .where(eq(businessProfile.orgId, ctx.orgId))
    .limit(1);

  if (existing) {
    logStep("business_profile", "exists — skipping");
    return;
  }

  await tx.insert(businessProfile).values({
    orgId: ctx.orgId,
    companyName: "Summit Roofing",
    dba: "Summit Roofing & Exteriors",
    primaryServiceType: "roofing",
    serviceSubtypes: [
      "asphalt_shingle",
      "metal_roofing",
      "tile_roofing",
      "roof_repair",
      "insurance_claims",
    ],
    yearFounded: 2011,
    teamSize: 18,
    serviceArea: {
      type: "radius",
      address: "4821 E Indian School Rd, Phoenix, AZ 85018",
      miles: 35,
    },
    website: "https://summitroofingaz.com",
    googleProfileUrl:
      "https://www.google.com/maps/place/summit-roofing-phoenix",
    mainPhone: "+14805550142",
    billingAddress: {
      line1: "4821 E Indian School Rd",
      city: "Phoenix",
      state: "AZ",
      zip: "85018",
    },
    pricingPhilosophy: "mid",
    usp1: "24-hr emergency tarp + drone inspection on every estimate",
    usp2: "Lifetime workmanship warranty transferable to buyers",
    usp3: "Arizona-licensed, 4.9★ Google, insurance claim specialists",
    warrantyYears: 25,
    certifications: [
      "GAF Master Elite",
      "Owens Corning Platinum Preferred",
      "HAAG Certified Inspector",
    ],
    insuranceExperience: "primary_focus",
    googleReviewsCount: 412,
    googleRating: 4.9,
    bbbRating: "A+",
    competitors: [
      "Desert Peak Roofing",
      "Canyon State Roofing",
      "Valley Premier Exteriors",
    ],
    customerThemes: [
      "fast response",
      "clean jobsite",
      "transparent pricing",
      "handled the insurance company for us",
    ],
    ownerFirstName: "Anthony",
    voiceFormalCasual: 6,
    voiceConciseDetailed: 4,
    voiceWarmDirect: 7,
    sampleSentences: [
      "Hey — thanks for reaching out. I saw your message about the storm damage.",
      "Quick question before I swing by: is the leak showing up inside the house yet?",
      "We'll knock it out this week. I'll text you a tight window tomorrow morning.",
    ],
    neverUsePhrases: [
      "at your earliest convenience",
      "reach out",
      "touch base",
    ],
    localPhrases: ["monsoon season", "haboob", "snowbird season"],
    businessHours: STANDARD_HOURS,
    timezone: "America/Phoenix",
    lunchBreak: { enabled: false, start: "12:00", end: "13:00" },
    afterHoursEmergency: true,
    quietHours: { start: "21:00", end: "07:00" },
  });

  logStep("business_profile", "1 row inserted");
}
