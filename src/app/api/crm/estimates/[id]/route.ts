import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  validateBody,
  estimateUpdateSchema,
  ValidationError,
} from "@/lib/utils/validate";
import {
  getEstimateById,
  updateEstimate,
  updateEstimateStatus,
} from "@/lib/db/queries";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const estimate = await getEstimateById(orgId, id);
    if (!estimate) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ estimate });
  } catch (error) {
    console.error("[CRM Estimate GET] Error:", error);
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
    const data = validateBody(estimateUpdateSchema, body);

    const existing = await getEstimateById(orgId, id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Status-only change uses the dedicated query that auto-sets
    // sent_at / responded_at timestamps.
    const keysChanged = Object.keys(data);
    if (keysChanged.length === 1 && keysChanged[0] === "status" && data.status) {
      const estimate = await updateEstimateStatus(orgId, id, data.status);
      return NextResponse.json({ estimate });
    }

    // General update — coerce ISO datetime strings to Date for timestamp fields
    const { sent_at, responded_at, ...rest } = data;
    const estimate = await updateEstimate(orgId, id, {
      ...rest,
      sent_at: sent_at ? new Date(sent_at) : undefined,
      responded_at: responded_at ? new Date(responded_at) : undefined,
    });

    return NextResponse.json({ estimate });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[CRM Estimate PATCH] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
