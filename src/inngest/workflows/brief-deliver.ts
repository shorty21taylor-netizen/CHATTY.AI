import { inngest } from "../client";
import { query, queryOne } from "@/lib/db";
import { db } from "@/lib/db/drizzle";
import { briefPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendSms } from "@/lib/twilio/client";
import { textToSpeech } from "@/lib/elevenlabs/client";
import { sendEmail, formatBriefEmail } from "@/lib/email/client";

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://chattyai-production.up.railway.app";

export const briefDeliver = inngest.createFunction(
  {
    id: "brief-deliver",
    name: "Deliver Daily Brief",
    concurrency: {
      limit: 25,
      key: "event.data.orgId",
    },
    retries: 2,
  },
  { event: "brief/deliver" },
  async ({ event, step }) => {
    const { orgId, briefId, brief } = event.data;

    const prefs = await step.run("load-preferences", async () => {
      const [row] = await db
        .select()
        .from(briefPreferences)
        .where(eq(briefPreferences.orgId, orgId))
        .limit(1);
      return row || null;
    });

    const smsMessage = await step.run("format-sms", () => {
      const priorityEmoji =
        brief.actions?.[0]?.priority === "high" ? "🔴" :
        brief.actions?.[0]?.priority === "low" ? "🟢" : "🟡";

      const actions = (brief.actions || [])
        .slice(0, 3)
        .map(
          (a: { action: string }, i: number) =>
            `${i + 1}. ${a.action}`,
        )
        .join("\n");

      let msg = `${priorityEmoji} ${brief.headline}\n\n${actions}`;

      if (brief.risk_flag?.active) {
        msg += `\n\n⚠️ ${brief.risk_flag.message}`;
      }

      if (brief.opportunity?.message) {
        msg += `\n\n💡 ${brief.opportunity.message}`;
      }

      msg += `\n\n📊 ${APP_URL}/dashboard/brief`;
      msg += `\n— Chatty AI`;

      return msg;
    });

    // Voice generation. Return the result from the step (Inngest memoizes
    // step results across retries; mutating a closure var doesn't survive
    // re-entry, which is why `voiceGenerated` was silently resetting before).
    type DeliveryResult = { sent: boolean; reason?: string; sid?: string };
    let voiceResult: DeliveryResult = { sent: false, reason: "not_requested" };
    if (prefs?.voiceEnabled && brief.voice_summary) {
      voiceResult = await step.run("generate-voice-summary", async (): Promise<DeliveryResult> => {
        if (!process.env.ELEVENLABS_API_KEY) {
          console.log("[BriefDeliver] ElevenLabs not configured, skipping voice");
          return { sent: false, reason: "elevenlabs_not_configured" };
        }

        try {
          const voiceId = prefs.voiceId || DEFAULT_VOICE_ID;
          await textToSpeech({
            text: brief.voice_summary,
            voiceId,
          });

          await query(
            `UPDATE decision_briefs SET voice_summary_text = $2 WHERE id = $1`,
            [briefId, brief.voice_summary],
          );
          return { sent: true };
        } catch (e) {
          console.error("[BriefDeliver] Voice generation failed:", e);
          return { sent: false, reason: String(e) };
        }
      });
    }
    const voiceGenerated = voiceResult.sent;

    let smsResult: DeliveryResult = { sent: false, reason: "not_requested" };
    if (prefs?.smsEnabled && prefs?.phoneNumber) {
      smsResult = await step.run("send-sms", async (): Promise<DeliveryResult> => {
        try {
          const results = await sendSms({
            to: prefs.phoneNumber!,
            body: smsMessage,
          });
          return { sent: true, sid: results[0]?.sid };
        } catch (e) {
          console.error("[BriefDeliver] SMS failed:", e);
          return { sent: false, reason: String(e) };
        }
      });
    }
    const smsDelivered = smsResult.sent;

    let emailResult: DeliveryResult = { sent: false, reason: "not_requested" };
    if ((prefs as Record<string, unknown>)?.emailEnabled && (prefs as Record<string, unknown>)?.emailAddress) {
      emailResult = await step.run("send-email", async (): Promise<DeliveryResult> => {
        try {
          const html = formatBriefEmail(brief);
          const priorityLabel =
            brief.actions?.[0]?.priority === "high" ? "[Priority]" :
            brief.actions?.[0]?.priority === "low" ? "[Low]" : "";
          const subject = `${priorityLabel} ${brief.headline}`.trim();

          await sendEmail({
            to: (prefs as Record<string, unknown>).emailAddress as string,
            subject,
            html,
          });
          return { sent: true };
        } catch (e) {
          console.error("[BriefDeliver] Email failed:", e);
          return { sent: false, reason: String(e) };
        }
      });
    }
    const emailDelivered = emailResult.sent;

    await step.run("update-delivery-status", async () => {
      const channels: string[] = [];
      if (smsDelivered) channels.push("sms");
      if (emailDelivered) channels.push("email");
      if (voiceGenerated) channels.push("voice");
      const via = channels.length > 0 ? channels.join("+") : "dashboard_only";

      // Per-channel telemetry: merged into decision_engine_trace.delivery so
      // ops can measure adoption + failure rates without a new column.
      const delivery = {
        at: new Date().toISOString(),
        channels,
        sms: smsResult,
        email: emailResult,
        voice: voiceResult,
      };

      await query(
        `UPDATE decision_briefs
           SET delivered_at = NOW(),
               delivered_via = $2,
               decision_engine_trace = COALESCE(decision_engine_trace, '{}'::jsonb)
                                       || jsonb_build_object('delivery', $3::jsonb)
         WHERE id = $1`,
        [briefId, via, JSON.stringify(delivery)],
      );
    });

    await step.sleepUntil(
      "wait-for-feedback-window",
      new Date(Date.now() + 24 * 60 * 60 * 1000),
    );

    await step.sendEvent("schedule-feedback", {
      name: "feedback/process",
      data: { orgId, briefId },
    });

    return {
      briefId,
      smsDelivered,
      emailDelivered,
      voiceGenerated,
      messagePreview: smsMessage.substring(0, 100) + "...",
    };
  },
);
