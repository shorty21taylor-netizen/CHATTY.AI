import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  validateBody,
  jobCreateSchema,
  ValidationError,
} from "@/lib/utils/validate";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { query } from "@/lib/db";
import { createJob, getContactById } from "@/lib/db/queries";
import type { Job, JobStatus, ServiceType } from "@/lib/db/types";

export async function GET(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimitRequest(orgId, "crm-jobs-list", { limit: 300 });
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

    const status = url.searchParams.get("status") as JobStatus | null;
    if (status) { where.push(`status = $${i++}`); params.push(status); }

    const serviceType = url.searchParams.get("service_type") as ServiceType | null;
    if (serviceType) { where.push(`service_type = $${i++}`); params.push(serviceType); }

    // Date range on scheduled start_date
    const startFrom = url.searchParams.get("start_date_from");
    if (startFrom) { where.push(`start_date >= $${i++}`); params.push(startFrom); }

    const startTo = url.searchParams.get("start_date_to");
    if (startTo) { where.push(`start_date <= $${i++}`); params.push(startTo); }

    const endFrom = url.searchParams.get("end_date_from");
    if (endFrom) { where.push(`end_date >= $${i++}`); params.push(endFrom); }

    const endTo = url.searchParams.get("end_date_to");
    if (endTo) { where.push(`end_date <= $${i++}`); params.push(endTo); }

    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 200);
    const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
    params.push(limit, offset);

    const result = await query<Job>(
      `SELECT * FROM jobs WHERE ${where.join(" AND ")}
       ORDER BY start_date ASC NULLS LAST, created_at DESC
       LIMIT $${i++} OFFSET $${i++}`,
      params
    );

    return NextResponse.json(
      { jobs: result.rows, count: result.rows.length, limit, offset },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("[CRM Jobs GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimitRequest(orgId, "crm-jobs-create", { limit: 120 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const data = validateBody(jobCreateSchema, body);

    const contact = await getContactById(orgId, data.contact_id);
    if (!contact) {
      return NextResponse.json(
        { error: "contact_id does not exist in this organization" },
        { status: 400 }
      );
    }

    const job = await createJob(orgId, data);

    return NextResponse.json(
      { job },
      { status: 201, headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[CRM Jobs POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
