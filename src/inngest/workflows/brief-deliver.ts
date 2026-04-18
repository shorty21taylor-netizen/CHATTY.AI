import { inngest } from "../client";
import { query, queryOne } from "@/lib/db";
import { db } from "@/lib/db/drizzle";
import { briefPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendSms } from "@/lib/twilio/client";
import { textToSpeech } from "@/lib/elevenlabs/client";

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

    let voiceGenerated = false;
    if (prefs?.voiceEnabled && brief.voice_summary) {
      await step.run("generate-voice-summary", async () => {
        if (!process.env.ELEVENLABS_API_KEY) {
          console.log("[BriefDeliver] ElevenLabs not configured, skipping voice");
          return;
        }

        try {
          const voiceId = prefs.voiceId || DEFAULT_VOICE_ID;
          await textToSpeech({
            text: brief.voice_summary,
            voiceId,
          });
          voiceGenerated = true;

          await query(
            `UPDATE decision_briefs SET voice_summary_text = $2 WHERE id = $1`,
            [briefId, brief.voice_summary],
          );
        } catch (e) {
          console.error("[BriefDeliver] Voice generation failed:", e);
        }
      });
    }

    let smsDelivered = false;
    if (prefs?.smsEnabled && prefs?.phoneNumber) {
      const smsResult = await step.run("send-sms", async () => {
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
      smsDelivered = smsResult.sent;
    }

    await step.run("update-delivery-status", async () => {
      const via = smsDelivered ? "sms" : "dashboard_only";
      await query(
        `UPDATE decision_briefs
         SET delivered_at = NOW(), delivered_via = $2
         WHERE id = $1`,
        [briefId, via],
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
      voiceGenerated,
      messagePreview: smsMessage.substring(0, 100) + "...",
    };
  },
);
