import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { withOrgContext } from "@/lib/db/drizzle";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import * as bpQueries from "@/lib/db/queries/business-profile";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimitRequest(orgId, "business-profile-read", { limit: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const profile = await withOrgContext(orgId, (tx) => bpQueries.getByOrg(tx));
  return NextResponse.json({ profile }, { headers: rateLimitHeaders(rl) });
}

export async function PUT(req: Request) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimitRequest(orgId, "business-profile-write", { limit: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body.profile !== "object" || body.profile === null) {
    return NextResponse.json({ error: "Missing profile object" }, { status: 400 });
  }

  const p = body.profile;

  const dbData: Record<string, unknown> = {};
  if (p.legal_name != null) dbData.companyName = p.legal_name;
  if (p.dba != null) dbData.dba = p.dba;
  if (p.primary_service_type != null) dbData.primaryServiceType = p.primary_service_type;
  if (p.service_subtypes != null) dbData.serviceSubtypes = p.service_subtypes;
  if (p.year_founded != null) dbData.yearFounded = p.year_founded ? Number(p.year_founded) : null;
  if (p.team_size != null) dbData.teamSize = p.team_size ? Number(p.team_size) : null;
  if (p.website_url != null) dbData.website = p.website_url;
  if (p.google_business_url != null) dbData.googleProfileUrl = p.google_business_url;
  if (p.main_phone != null) dbData.mainPhone = p.main_phone;
  if (p.pricing_philosophy != null) {
    const mapping: Record<string, string> = {
      "Premium": "premium", "Mid-market": "mid", "Value": "value", "Insurance-first": "insurance_first",
    };
    dbData.pricingPhilosophy = mapping[p.pricing_philosophy] ?? "mid";
  }
  if (p.usps != null) {
    const usps = Array.isArray(p.usps) ? p.usps : [];
    dbData.usp1 = usps[0] || null;
    dbData.usp2 = usps[1] || null;
    dbData.usp3 = usps[2] || null;
  }
  if (p.warranty_years != null) dbData.warrantyYears = p.warranty_years ? Number(p.warranty_years) : null;
  if (p.certifications != null) dbData.certifications = p.certifications;
  if (p.insurance_claims != null) {
    const mapping: Record<string, string> = {
      "Yes": "some", "No": "none", "Primary focus": "primary_focus",
    };
    dbData.insuranceExperience = mapping[p.insurance_claims] ?? "none";
  }
  if (p.google_review_count != null) dbData.googleReviewsCount = p.google_review_count ? Number(p.google_review_count) : null;
  if (p.google_rating != null) dbData.googleRating = p.google_rating ? Number(p.google_rating) : null;
  if (p.bbb_rating != null) dbData.bbbRating = p.bbb_rating;
  if (p.competitors != null) dbData.competitors = (Array.isArray(p.competitors) ? p.competitors : []).filter(Boolean);
  if (p.customers_love != null) dbData.customerThemes = (Array.isArray(p.customers_love) ? p.customers_love : []).filter(Boolean);
  if (p.google_review_url != null) dbData.googleReviewUrl = p.google_review_url || null;
  if (p.facebook_review_url != null) dbData.facebookReviewUrl = p.facebook_review_url || null;
  if (p.owner_first_name != null) dbData.ownerFirstName = p.owner_first_name;
  if (p.voice_formality != null) dbData.voiceFormalCasual = Number(p.voice_formality);
  if (p.voice_verbosity != null) dbData.voiceConciseDetailed = Number(p.voice_verbosity);
  if (p.voice_warmth != null) dbData.voiceWarmDirect = Number(p.voice_warmth);
  if (p.sample_sentences != null) {
    dbData.sampleSentences = typeof p.sample_sentences === "string"
      ? p.sample_sentences.split("\n").filter(Boolean)
      : Array.isArray(p.sample_sentences) ? p.sample_sentences : [];
  }
  if (p.never_use_phrases != null) dbData.neverUsePhrases = p.never_use_phrases;
  if (p.local_phrases != null) dbData.localPhrases = p.local_phrases;
  if (p.business_hours != null) dbData.businessHours = p.business_hours;
  if (p.timezone != null) dbData.timezone = p.timezone;
  if (p.lunch_window != null) dbData.lunchBreak = p.lunch_window;
  if (p.after_hours_emergency != null) dbData.afterHoursEmergency = Boolean(p.after_hours_emergency);
  if (p.quiet_hours != null) dbData.quietHours = p.quiet_hours;

  if (p.service_area_mode != null || p.service_area_address != null || p.service_area_radius != null || p.service_area_zips != null) {
    dbData.serviceArea = {
      mode: p.service_area_mode,
      address: p.service_area_address,
      radius: p.service_area_radius,
      zips: p.service_area_zips,
    };
  }

  const saved = await withOrgContext(orgId, (tx) => bpQueries.upsert(tx, orgId, dbData));
  return NextResponse.json({ profile: saved }, { headers: rateLimitHeaders(rl) });
}
