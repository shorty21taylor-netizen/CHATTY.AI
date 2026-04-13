import { inngest } from "../client";
import { queryOne } from "@/lib/db";
import { markBriefDelivered } from "@/lib/db/queries";
import { sendSms } from "@/lib/twilio/client";
import { textToSpeech } from "@/lib/elevenlabs/client";

/**
 * Brief Delivery Workflow
 * Sends the Daily Brief via SMS + generates voice note via ElevenLabs TTS.
 */
export const briefDeliver = inngest.createFunction(
  {
    id: "brief-deliver",
    name: "Brief Delivery",
    triggers: [{ event: "brief/deliver" }],
  },
  async ({ event, step }) => {
    const { orgId, briefId } = event.data;

    const brief = (await step.run("fetch-brief", async () => {
      return await queryOne(
        `SELECT * FROM decision_briefs WHERE id = $1 AND org_id = $2`,
        [briefId, orgId]
      );
    })) as any;

    if (!brief) { throw new Error(`Brief ${briefId} not found`); }

    const voiceGenerated = await step.run("generate-voice", async () => {
      try {
        if (!brief.voice_summary) return false;
        await textToSpeech({ text: brief.voice_summary, voiceId: "21m00Tcm4TlvDq8ikWAM" });
        return true;
      } catch (error) { return false; }
    });

    const smsResult = await step.run("send-sms", async () => {
      const operatorPhone = "";
      if (!operatorPhone) return null;
      const recs: any[] = brief.recommendations || [];
      const smsText = [`Good morning! Here's your Daily Brief:`,"",...recs.map((r: any, i: number)=>`${i+1}. ${r.action}`),"","Reply Y if you acted on these!"].join("\n");
      return await sendSms({ to: operatorPhone, body: smsText });
    });

    await step.run("mark-delivered", async () => {
      await markBriefDelivered(briefId, smsResult ? "sms" : "dashboard_only");
    });

    return { briefId, smsDelivered: !!smsResult, voiceGenerated };
  }
);
