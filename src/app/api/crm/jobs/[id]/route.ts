import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  validateBody,
  jobUpdateSchema,
  ValidationError,
} from "@/lib/utils/validate";
import {
  getJobById,
  updateJob,
  updateJobStatus,
} from "@/lib/db/queries";
import {
  emitJobStatusChanged,
  emitJobCompleted,
} from "@/lib/signals/adapters/internal-crm";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const job = await getJobById(orgId, id);
    if (!job) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("[CRM Job GET] Error:", error);
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
    const data = validateBody(jobUpdateSchema, body);

    const existing = await getJobById(orgId, id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const keysChanged = Object.keys(data);
    if (keysChanged.length === 1 && keysChanged[0] === "status" && data.status) {
      const job = await updateJobStatus(orgId, id, data.status);

      // Always emit the status change signal so the Decision Engine sees
      // movement through the job lifecycle.
      emitJobStatusChanged(orgId, job, existing.status, data.status).catch(
        (err) => console.error("[emitJobStatusChanged]", err)
      );
      // Emit the richer completed event when we land in `completed`.
      if (data.status === "completed" && existing.status !== "completed") {
        emitJobCompleted(orgId, job).catch((err) =>
          console.error("[emitJobCompleted]", err)
        );
      }

      return NextResponse.json({ job });
    }

    const job = await updateJob(orgId, id, data);

    // Non-status field updates that nonetheless move status need signals too.
    if (data.status && data.status !== existing.status) {
      emitJobStatusChanged(orgId, job, existing.status, data.status).catch(
        (err) => console.error("[emitJobStatusChanged]", err)
      );
      if (data.status === "completed") {
        emitJobCompleted(orgId, job).catch((err) =>
          console.error("[emitJobCompleted]", err)
        );
      }
    }

    return NextResponse.json({ job });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[CRM Job PATCH] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
