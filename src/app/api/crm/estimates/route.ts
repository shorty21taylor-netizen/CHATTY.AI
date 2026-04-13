import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  validateBody,
  estimateCreateSchema,
  ValidationError,
} from "@/lib/utils/validate";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { queryOne } from "@/lib/db";
import {
  listEstimates,
  createEstimate,
  getContactById,
} from "@/lib/db/queries";
import type { EstimateStatus } from "@/lib/db/types";

// EST-YYYY-NNNN — scoped to org + calendar year. Padded 4-digit sequence.
async function nextEstimateNumber(orgId: string): Promise<string> {
  const year = new Date().getUTCFullYear();
  const result = await queryOne<{ next_seq: string }>(
    `SELECT COUNT(*) + 1 AS next_seq
     FROM estimates
     WHERE org_id = $1
       AND EXTRACT(YEAR FROM created_at AT TIME ZONE 'UTC') = $2`,
    [orgId, year]
  );
  const seq = Number(result?.next_seq ?? 1);
  return `EST-${year}-${String(seq).padStart(4, "0")}`;
}

export async function GET(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimitRequest(orgId, "crm-estimates-list", { limit: 300 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") as EstimateStatus | null;
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 200);
    const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);

    const result = await listEstimates(orgId, {
      status: status ?? undefined,
      limit,
      offset,
    });

    return NextResponse.json(
      { estimates: result.rows, count: result.rows.length, limit, offset },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("[CRM Estimates GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimitRequest(orgId, "crm-estimates-create", { limit: 120 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const data = validateBody(estimateCreateSchema, body);

    const contact = await getContactById(orgId, data.contact_id);
    if (!contact) {
      return NextResponse.json(
        { error: "contact_id does not exist in this organization" },
        { status: 400 }
      );
    }

    // Auto-derive totals if line_items provided and no subtotal/total given
    const lineItems = data.line_items ?? [];
    const derivedSubtotal = data.subtotal ?? lineItems.reduce((s, li) => s + (li.total ?? 0), 0);
    const taxRate = data.tax_rate ?? 0;
    const derivedTaxAmount = data.tax_amount ?? Number((derivedSubtotal * taxRate).toFixed(2));
    const discount = data.discount ?? 0;
    const derivedTotal = data.total ?? Number((derivedSubtotal + derivedTaxAmount - discount).toFixed(2));

    const estimateNumber = await nextEstimateNumber(orgId);

    const estimate = await createEstimate(orgId, {
      ...data,
      estimate_number: estimateNumber,
      line_items: lineItems,
      subtotal: derivedSubtotal,
      tax_rate: taxRate,
      tax_amount: derivedTaxAmount,
      discount,
      total: derivedTotal,
    });

    return NextResponse.json(
      { estimate },
      { status: 201, headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[CRM Estimates POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
