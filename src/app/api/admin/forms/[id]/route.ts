import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db/drizzle";
import { orgFormConfigs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const rl = await rateLimitRequest(orgId, "admin-forms-write", { limit: 30 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.name === "string") updates.name = body.name.trim();
  if (typeof body.is_active === "boolean") updates.isActive = body.is_active;
  if (typeof body.redirect_url === "string") updates.redirectUrl = body.redirect_url;
  if (typeof body.honeypot_field === "string") updates.honeypotField = body.honeypot_field;
  if (typeof body.field_mapping === "object" && body.field_mapping) updates.fieldMapping = body.field_mapping;

  const [updated] = await db
    .update(orgFormConfigs)
    .set(updates)
    .where(and(eq(orgFormConfigs.id, id), eq(orgFormConfigs.orgId, orgId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ form: updated }, { headers: rateLimitHeaders(rl) });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const rl = await rateLimitRequest(orgId, "admin-forms-write", { limit: 30 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const [deactivated] = await db
    .update(orgFormConfigs)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(orgFormConfigs.id, id), eq(orgFormConfigs.orgId, orgId)))
    .returning();

  if (!deactivated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true }, { headers: rateLimitHeaders(rl) });
}
