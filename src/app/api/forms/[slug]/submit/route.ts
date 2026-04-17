import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db/drizzle";
import { orgFormConfigs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createContact, createLead } from "@/lib/db/queries";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { dispatchAgentsForEvent } from "@/lib/agents/dispatcher";
import { persistSignal } from "@/lib/signals/adapters/internal-crm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const [formConfig] = await db
    .select()
    .from(orgFormConfigs)
    .where(and(eq(orgFormConfigs.slug, slug), eq(orgFormConfigs.isActive, true)))
    .limit(1);

  if (!formConfig) {
    return NextResponse.json({ ok: true });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const honeypot = formConfig.honeypotField || "website_url";
  if (body[honeypot]) {
    return NextResponse.json({ ok: true });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const rlKey = `form-submit:${slug}:${ip}`;
  const rl = await checkRateLimit(rlKey, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ ok: true });
  }

  const mapping = (formConfig.fieldMapping || {}) as Record<string, string>;

  const resolve = (fieldName: string): string => {
    const mapped = mapping[fieldName];
    if (mapped && typeof body[mapped] === "string") return body[mapped] as string;
    if (typeof body[fieldName] === "string") return body[fieldName] as string;
    return "";
  };

  const orgId = formConfig.orgId;

  const contactData = {
    first_name: resolve("first_name") || resolve("name")?.split(" ")[0] || null,
    last_name: resolve("last_name") || resolve("name")?.split(" ").slice(1).join(" ") || null,
    email: resolve("email") || null,
    phone: resolve("phone") || resolve("telephone") || null,
    source: "website" as const,
    source_detail: `form:${slug}`,
  };

  const contact = await createContact(orgId, contactData);
  if (!contact) {
    return NextResponse.json({ ok: true });
  }

  const lead = await createLead(orgId, {
    contact_id: contact.id,
    title: resolve("service") || resolve("subject") || "Website Form Submission",
    description: resolve("message") || resolve("details") || null,
    service_type: (resolve("service_type") || null) as import("@/lib/db/types").ServiceType | null,
    status: "new",
    priority: "medium",
    source: "website",
    source_detail: `form:${slug}`,
  });

  const signalData = {
    contact_id: contact.id,
    lead_id: lead?.id,
    form_slug: slug,
    form_name: formConfig.name,
    submitted_fields: Object.keys(body).filter((k) => k !== honeypot),
  };

  persistSignal(orgId, {
    event_type: "form_submitted",
    entity_type: "lead",
    entity_id: lead?.id || contact.id,
    data: signalData,
    source_id: lead?.id || contact.id,
    timestamp: new Date().toISOString(),
  }).catch((err) => console.error("[form-submit] signal persist failed:", err));

  dispatchAgentsForEvent({
    orgId,
    eventType: "form_submitted",
    entityType: "lead",
    entityId: lead?.id || contact.id,
    data: signalData,
  }).catch((err) => console.error("[form-submit] dispatch failed:", err));

  if (formConfig.redirectUrl) {
    return NextResponse.redirect(formConfig.redirectUrl, 302);
  }

  return NextResponse.json({ ok: true });
}
