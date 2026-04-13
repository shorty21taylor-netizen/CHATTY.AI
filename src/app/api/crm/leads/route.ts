import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  validateBody,
  leadCreateSchema,
  ValidationError,
} from "@/lib/utils/validate";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import {
  listLeads,
  createLead,
  getContactById,
} from "@/lib/db/queries";
import { emitLeadCreated } from "@/lib/signals/adapters/internal-crm";
import type {
  LeadListFilter,
  LeadStatus,
  ServiceType,
  LeadPriority,
} from "@/lib/db/types";

export async function GET(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimitRequest(orgId, "crm-leads-list", { limit: 300 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const url = new URL(req.url);
    const filter: LeadListFilter = {};

    const status = url.searchParams.get("status");
    if (status) filter.status = status as LeadStatus;

    const serviceType = url.searchParams.get("service_type");
    if (serviceType) filter.service_type = serviceType as ServiceType;

    const priority = url.searchParams.get("priority");
    if (priority) filter.priority = priority as LeadPriority;

    const assignedTo = url.searchParams.get("assigned_to");
    if (assignedTo) filter.assigned_to = assignedTo;

    if (url.searchParams.get("overdue_only") === "true") {
      filter.overdue_only = true;
    }

    const limit = Number(url.searchParams.get("limit") ?? 50);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    filter.limit = Math.min(Math.max(limit, 1), 200);
    filter.offset = Math.max(offset, 0);

    const result = await listLeads(orgId, filter);

    return NextResponse.json(
      {
        leads: result.rows,
        count: result.rows.length,
        limit: filter.limit,
        offset: filter.offset,
      },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("[CRM Leads GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimitRequest(orgId, "crm-leads-create", { limit: 120 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const data = validateBody(leadCreateSchema, body);

    // Verify contact exists in this org before creating lead
    const contact = await getContactById(orgId, data.contact_id);
    if (!contact) {
      return NextResponse.json(
        { error: "contact_id does not exist in this organization" },
        { status: 400 }
      );
    }

    const lead = await createLead(orgId, {
      ...data,
      appointment_date: data.appointment_date ? new Date(data.appointment_date) : undefined,
    });

    // Fire-and-forget signal emission.
    emitLeadCreated(orgId, lead).catch((err) =>
      console.error("[emitLeadCreated]", err)
    );

    return NextResponse.json(
      { lead },
      { status: 201, headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[CRM Leads POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
