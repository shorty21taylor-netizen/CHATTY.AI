import { inngest } from "../client";
import { query, queryOne } from "@/lib/db";

/**
 * Brief Delivery Workflow
 *
 * Sends the Daily Brief to the operator via SMS (Twilio).
 * Optionally generates a voice summary via ElevenLabs TTS.
 */
export const briefDeliver = inngest.createFunction(
  {
    id: "brief-deliver",
    name: "Deliver Daily Brief",
    retries: 2,
  },
  { event: "brief/deliver" },
  async ({ event, step }) => {
    const { orgId, briefId, brief } = event.data;

    // Step 1: Format the SMS message
    const smsMessage = await step.run("format-sms", () => {
      const actions = brief.actions
        .slice(0, 3)
        .map(
          (a: { priority: string; action: string }, i: number) =>
            `${i + 1}. ${a.action}`
        )
        .join("\n");

      let msg = `☀️ ${brief.headline}\n\n${actions}`;

      if (brief.risk_flag?.active) {
        msg += `\n\n⚠️ ${brief.risk_flag.message}`;
      }

      if (brief.opportunity?.message) {
        msg += `\n\n💡 ${brief.opportunity.message}`;
      }

      msg += `\n\n— Chatty AI`;

      return msg;
    });

    // Step 2: Send SMS via Twilio (if configured)
    const smsResult = await step.run("send-sms", async () => {
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.log("[BriefDeliver] Twilio not configured, skipping SMS");
        return { sent: false, reason: "twilio_not_configured" };
      }

      try {
        // Dynamic import to avoid build errors when Twilio isn't installed
        const twilio = await import("twilio");
        const client = twilio.default(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        // TODO: Look up operator phone number from org settings
        const operatorPhone = process.env.DEFAULT_OPERATOR_PHONE;
        if (!operatorPhone) {
          return { sent: false, reason: "no_operator_phone" };
        }

        const message = await client.messages.create({
          body: smsMessage,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: operatorPhone,
        });

        return { sent: true, sid: message.sid };
      } catch (e) {
        console.error("[BriefDeliver] SMS failed:", e);
        return { sent: false, reason: "sms_error" };
      }
    });

    // Step 3: Update brief with delivery status
    await step.run("update-delivery-status", async () => {
      try {
        await query(
          `UPDATE decision_briefs
           SET delivered_at = NOW(), delivered_via = $2
           WHERE id = $1`,
          [briefId, smsResult.sent ? "sms" : "dashboard_only"]
        );
      } catch (e) {
        console.error("[BriefDeliver] Failed to update delivery status:", e);
      }
    });

    return {
      briefId,
      smsDelivered: smsResult.sent,
      messagePreview: smsMessage.substring(0, 100) + "...",
    };
  }
);
