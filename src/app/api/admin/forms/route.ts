import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

import { db } from "@/lib/db/drizzle";
import { orgFormConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimitRequest(orgId, "admin-forms-read", { limit: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const forms = await db
    .select()
    .from(orgFormConfigs)
    .where(eq(orgFormConfigs.orgId, orgId))
    .orderBy(orgFormConfigs.createdAt);

  return NextResponse.json({ forms }, { headers: rateLimitHeaders(rl) });
}

export async function POST(req: Request) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const slug = nanoid(12);

  const [form] = await db
    .insert(orgFormConfigs)
    .values({
      orgId,
      slug,
      name,
      redirectUrl: typeof body.redirect_url === "string" ? body.redirect_url : null,
      honeypotField: typeof body.honeypot_field === "string" ? body.honeypot_field : "website_url",
      fieldMapping: typeof body.field_mapping === "object" && body.field_mapping ? body.field_mapping : {},
    })
    .returning();

  return NextResponse.json({ form }, { status: 201, headers: rateLimitHeaders(rl) });
}
