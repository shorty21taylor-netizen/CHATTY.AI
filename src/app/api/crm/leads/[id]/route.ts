import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  validateBody,
  leadUpdateSchema,
  ValidationError,
} from "@/lib/utils/validate";
import {
  getLeadById,
  getContactById,
  updateLead,
  updateLeadStatus,
  getInteractionsByLead,
  createInteraction,
} from "@/lib/db/queries";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const lead = await getLeadById(orgId, id);
    if (!lead) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [contact, interactionsResult] = await Promise.all([
      getContactById(orgId, lead.contact_id),
      getInteractionsByLead(orgId, id, 50),
    ]);

    return NextResponse.json({
      lead,
      contact,
      interactions: interactionsResult.rows,
    });
  } catch (error) {
    console.error("[CRM Lead GET] Error:", error);
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
    const data = validateBody(leadUpdateSchema, body);

    const existing = await getLeadById(orgId, id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Dedicated status-change action: update + log as interaction
    if (data.action === "update_status") {
      if (!data.status) {
        return NextResponse.json(
          { error: "status required when action=update_status" },
          { status: 400 }
        );
      }

      const updated = await updateLeadStatus(
        orgId,
        id,
        data.status,
        data.lost_reason ?? null
      );

      // Log the transition as an interaction for audit trail
      await createInteraction(orgId, {
        contact_id: existing.contact_id,
        lead_id: id,
        interaction_type: "note",
        direction: "internal",
        subject: `Lead status: ${existing.status} → ${data.status}`,
        summary:
          data.status === "lost" && data.lost_reason
            ? `Marked lost. Reason: ${data.lost_reason}`
            : `Status changed to ${data.status}`,
        outcome: data.status,
        created_by: data.assigned_to ?? null,
      });

      return NextResponse.json({ lead: updated });
    }

    // Standard field update
    const { action: _action, appointment_date, ...rest } = data;
    const lead = await updateLead(orgId, id, {
      ...rest,
      appointment_date: appointment_date ? new Date(appointment_date) : undefined,
    });
    return NextResponse.json({ lead });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[CRM Lead PATCH] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
