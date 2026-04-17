import { NextResponse } from "next/server";
import { validateTwilioSignature } from "@/lib/twilio/client";
import { insertFeedback } from "@/lib/db/queries";
import { query, queryOne } from "@/lib/db";
import { normalizePhone } from "@/lib/utils/phone";
import { inngest } from "@/inngest/client";

const TWIML_EMPTY = `<Response/>`;
const STOP_WORDS = new Set([
  "stop", "unsubscribe", "stop all", "quit", "cancel", "end", "revoke",
]);
const STOP_CONFIRMATION =
  `You've been unsubscribed and will no longer receive messages. Reply START to re-subscribe.`;

function twiml(message?: string): Response {
  const xml = message
    ? `<Response><Message>${escapeXml(message)}</Message></Response>`
    : TWIML_EMPTY;
  return new Response(xml, { headers: { "Content-Type": "text/xml" } });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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

    // Ignore status-callback events (no Body field, has MessageStatus)
    if (params.MessageStatus && !params.Body) {
      return twiml();
    }

    const fromRaw = params.From || "";
    const toRaw = params.To || "";
    const body = (params.Body || "").trim();
    const messageSid = params.MessageSid || "";
    const fromPhone = normalizePhone(fromRaw) || fromRaw;

    // No body → nothing to process
    if (!body) return twiml();

    // Look up contact by phone across all orgs
    const contactRow = await queryOne<{
      id: string;
      org_id: string;
      first_name: string;
      status: string;
    }>(
      `SELECT id, org_id, first_name, status FROM contacts
       WHERE phone = $1 AND status != 'do_not_contact'
       ORDER BY last_activity_at DESC NULLS LAST
       LIMIT 1`,
      [fromPhone],
    );

    if (!contactRow) {
      // Orphan SMS — no matching contact
      await queryOne(
        `INSERT INTO orphan_sms (from_phone, to_phone, body, message_sid)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [fromPhone, normalizePhone(toRaw) || toRaw, body, messageSid],
      );
      return twiml();
    }

    const orgId = contactRow.org_id;
    const contactId = contactRow.id;

    // Check for STOP / opt-out
    const bodyLower = body.toLowerCase().trim();
    if (STOP_WORDS.has(bodyLower)) {
      await queryOne(
        `INSERT INTO contact_suppressions (org_id, contact_id, reason, source)
         VALUES ($1, $2, 'sms_stop', 'twilio_inbound')
         RETURNING id`,
        [orgId, contactId],
      );
      return twiml(STOP_CONFIRMATION);
    }

    // Check if this looks like a feedback reply to a Daily Brief
    if (await tryHandleBriefFeedback(orgId, body, params.Body || "")) {
      return twiml("Got it! Your feedback helps me learn. Have a great day!");
    }

    // Fire Inngest event for the inbound reply router
    await inngest.send({
      name: "agent/inbound-reply",
      data: {
        orgId,
        contactId,
        fromPhone,
        body,
        messageSid,
        receivedAt: new Date().toISOString(),
      },
    });

    return twiml();
  } catch (error) {
    console.error("[Twilio Webhook] Error:", error);
    return twiml();
  }
}

/**
 * If the reply looks like brief feedback (y/n/yes/no/acted/skip),
 * log it and return true. Otherwise return false to continue to agent path.
 */
async function tryHandleBriefFeedback(
  orgId: string,
  bodyLower: string,
  rawBody: string,
): Promise<boolean> {
  const isFeedback =
    bodyLower === "y" ||
    bodyLower === "yes" ||
    bodyLower === "n" ||
    bodyLower === "no" ||
    bodyLower.includes("acted") ||
    bodyLower.includes("skip");

  if (!isFeedback) return false;

  const briefs = await query<{ id: string; org_id: string }>(
    `SELECT id, org_id FROM decision_briefs
     WHERE org_id = $1 AND delivered_at IS NOT NULL
     ORDER BY delivered_at DESC LIMIT 1`,
    [orgId],
  );

  if (briefs.rows.length === 0) return false;

  const brief = briefs.rows[0];
  let feedbackType = "comment";
  if (bodyLower === "y" || bodyLower === "yes" || bodyLower.includes("acted")) {
    feedbackType = "action_taken";
  } else if (bodyLower === "n" || bodyLower === "no" || bodyLower.includes("skip")) {
    feedbackType = "action_ignored";
  }

  await insertFeedback(brief.org_id, {
    brief_id: brief.id,
    feedback_type: feedbackType,
    feedback_text: rawBody,
    confidence_delta: feedbackType === "action_taken" ? 0.1 : -0.05,
  });

  return true;
}
