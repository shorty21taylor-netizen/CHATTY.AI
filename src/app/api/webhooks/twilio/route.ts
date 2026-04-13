import { NextResponse } from "next/server";
import { validateTwilioSignature } from "@/lib/twilio/client";
import { insertFeedback } from "@/lib/db/queries";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const url = req.url;
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    // Validate Twilio signature
    const signature = req.headers.get("x-twilio-signature") || "";
    if (process.env.NODE_ENV === "production") {
      const isValid = validateTwilioSignature(signature, url, params);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    const from = params.From;
    const body = (params.Body || "").trim().toLowerCase();

    // Look up org by phone number (from operator's reply)
    const briefs = await query<{ id: string; org_id: string }>(
      `SELECT db.*, db.org_id FROM decision_briefs db
       WHERE db.delivered_at IS NOT NULL
       ORDER BY db.delivered_at DESC LIMIT 1`
    );

    if (briefs.rows.length === 0) {
      return new Response(
        `<Response><Message>Thanks! No active brief found.</Message></Response>`,
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    const brief = briefs.rows[0];

    // Parse feedback from SMS reply
    let feedbackType = "comment";
    if (body === "y" || body === "yes" || body.includes("acted")) {
      feedbackType = "action_taken";
    } else if (body === "n" || body === "no" || body.includes("skip")) {
      feedbackType = "action_ignored";
    }

    await insertFeedback(brief.org_id, {
      brief_id: brief.id,
      feedback_type: feedbackType,
      feedback_text: params.Body,
      confidence_delta: feedbackType === "action_taken" ? 0.1 : -0.05,
    });

    return new Response(
      `<Response><Message>Got it! Your feedback helps me learn. Have a great day!</Message></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  } catch (error) {
    console.error("[Twilio Webhook] Error:", error);
    return new Response(
      `<Response><Message>Something went wrong. We'll look into it.</Message></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  }
}
