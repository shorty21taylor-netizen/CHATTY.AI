import { inngest } from "../client";
import { query, queryOne } from "@/lib/db";
import { db } from "@/lib/db/drizzle";
import { briefPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendSms } from "@/lib/twilio/client";
import { sendEmail, formatBriefEmail } from "@/lib/email/client";

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

    // Voice "generation" step. Historically this called ElevenLabs TTS
    // and threw away the returned ArrayBuffer — burning credits on audio
    // the dashboard/SMS path never delivers. The decision_briefs schema
    // has a `voice_summary_url` column waiting for an audio URL, but no
    // code populates it because no blob storage is wired yet.
    //
    // Until a storage layer exists (S3/R2 + signed URL flow), we:
    //   • skip the textToSpeech call entirely (no wasted credits),
    //   • still persist voice_summary_text so Mission Control / future
    //     client-side TTS can render it,
    //   • report `sent: false, reason: "audio_storage_not_configured"`
    //     so delivery telemetry is honest about what shipped.
    //
    // `sent` is declared optional because step.run() wraps returns in
    // Inngest's Jsonify — which makes required fields optional on the
    // memoized result. Treat absent as false at call sites.
    type DeliveryResult = { sent?: boolean; reason?: string; sid?: string };
    let voiceResult: DeliveryResult = { sent: false, reason: "not_requested" };
    if (prefs?.voiceEnabled && brief.voice_summary) {
      voiceResult = await step.run("generate-voice-summary", async (): Promise<DeliveryResult> => {
        try {
          await query(
            `UPDATE decision_briefs SET voice_summary_text = $2 WHERE id = $1`,
            [briefId, brief.voice_summary],
          );
        } catch (e) {
          console.error("[BriefDeliver] Failed to persist voice_summary_text:", e);
        }
        // TODO: when blob storage is wired, call textToSpeech + upload
        //       + update voice_summary_url, and only then return sent: true.
        return { sent: false, reason: "audio_storage_not_configured" };
      });
    }
    const voiceGenerated = !!voiceResult.sent;

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
    const smsDelivered = !!smsResult.sent;

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
    const emailDelivered = !!emailResult.sent;

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
