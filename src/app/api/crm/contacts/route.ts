import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  validateBody,
  contactCreateSchema,
  ValidationError,
} from "@/lib/utils/validate";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { listContacts, createContact } from "@/lib/db/queries";
import type {
  ContactListFilter,
  ContactStatus,
  ContactType,
  LeadSource,
} from "@/lib/db/types";

export async function GET(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimitRequest(orgId, "crm-contacts-list", { limit: 300 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const url = new URL(req.url);
    const filter: ContactListFilter = {};

    const q = url.searchParams.get("q");
    if (q) filter.search = q;

    const status = url.searchParams.get("status");
    if (status) filter.status = status as ContactStatus;

    const contactType = url.searchParams.get("contact_type");
    if (contactType) filter.contact_type = contactType as ContactType;

    const source = url.searchParams.get("source");
    if (source) filter.source = source as LeadSource;

    const limit = Number(url.searchParams.get("limit") ?? 50);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    filter.limit = Math.min(Math.max(limit, 1), 200);
    filter.offset = Math.max(offset, 0);

    const result = await listContacts(orgId, filter);

    return NextResponse.json(
      {
        contacts: result.rows,
        count: result.rows.length,
        limit: filter.limit,
        offset: filter.offset,
      },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("[CRM Contacts GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimitRequest(orgId, "crm-contacts-create", { limit: 120 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const data = validateBody(contactCreateSchema, body);

    const contact = await createContact(orgId, data);

    return NextResponse.json(
      { contact },
      { status: 201, headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[CRM Contacts POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
