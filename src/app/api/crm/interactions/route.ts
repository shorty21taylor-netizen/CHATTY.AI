import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  validateBody,
  interactionCreateSchema,
  ValidationError,
} from "@/lib/utils/validate";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { query } from "@/lib/db";
import { createInteraction, getContactById } from "@/lib/db/queries";
import type {
  Interaction,
  InteractionType,
  InteractionDirection,
} from "@/lib/db/types";

export async function GET(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimitRequest(orgId, "crm-interactions-list", { limit: 300 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const url = new URL(req.url);
    const where: string[] = [`org_id = $1`];
    const params: unknown[] = [orgId];
    let i = 2;

    const contactId = url.searchParams.get("contact_id");
    if (contactId) { where.push(`contact_id = $${i++}`); params.push(contactId); }

    const leadId = url.searchParams.get("lead_id");
    if (leadId) { where.push(`lead_id = $${i++}`); params.push(leadId); }

    const jobId = url.searchParams.get("job_id");
    if (jobId) { where.push(`job_id = $${i++}`); params.push(jobId); }

    const type = url.searchParams.get("type") as InteractionType | null;
    if (type) { where.push(`interaction_type = $${i++}`); params.push(type); }

    const direction = url.searchParams.get("direction") as InteractionDirection | null;
    if (direction) { where.push(`direction = $${i++}`); params.push(direction); }

    const since = url.searchParams.get("since");
    if (since) { where.push(`occurred_at >= $${i++}`); params.push(since); }

    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 200);
    const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
    params.push(limit, offset);

    const result = await query<Interaction>(
      `SELECT * FROM interactions WHERE ${where.join(" AND ")}
       ORDER BY occurred_at DESC
       LIMIT $${i++} OFFSET $${i++}`,
      params
    );

    return NextResponse.json(
      { interactions: result.rows, count: result.rows.length, limit, offset },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("[CRM Interactions GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimitRequest(orgId, "crm-interactions-create", { limit: 240 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const data = validateBody(interactionCreateSchema, body);

    const contact = await getContactById(orgId, data.contact_id);
    if (!contact) {
      return NextResponse.json(
        { error: "contact_id does not exist in this organization" },
        { status: 400 }
      );
    }

    const interaction = await createInteraction(orgId, {
      ...data,
      occurred_at: data.occurred_at ? new Date(data.occurred_at) : undefined,
    });

    return NextResponse.json(
      { interaction },
      { status: 201, headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[CRM Interactions POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
