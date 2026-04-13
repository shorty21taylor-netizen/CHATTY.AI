import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  validateBody,
  contactUpdateSchema,
  ValidationError,
} from "@/lib/utils/validate";
import { query, queryOne } from "@/lib/db";
import {
  getContactById,
  updateContact,
  getLeadsByContact,
} from "@/lib/db/queries";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const contact = await getContactById(orgId, id);
    if (!contact) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Recent leads (last 10) + interactions count (for dashboard header)
    const leadsResult = await getLeadsByContact(orgId, id);
    const recentLeads = leadsResult.rows.slice(0, 10);

    const countResult = await queryOne<{ interactions_count: string }>(
      `SELECT COUNT(*)::TEXT AS interactions_count
       FROM interactions
       WHERE org_id = $1 AND contact_id = $2`,
      [orgId, id]
    );

    return NextResponse.json({
      contact,
      recent_leads: recentLeads,
      interactions_count: Number(countResult?.interactions_count ?? 0),
    });
  } catch (error) {
    console.error("[CRM Contact GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const body = await req.json();
    const data = validateBody(contactUpdateSchema, body);

    const existing = await getContactById(orgId, id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const contact = await updateContact(orgId, id, data);
    return NextResponse.json({ contact });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[CRM Contact PATCH] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Soft delete → mark inactive (preserves downstream leads/jobs/interactions)
export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const result = await query(
      `UPDATE contacts SET status = 'inactive'
       WHERE id = $1 AND org_id = $2
       RETURNING id`,
      [id, orgId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id, status: "inactive" });
  } catch (error) {
    console.error("[CRM Contact DELETE] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
