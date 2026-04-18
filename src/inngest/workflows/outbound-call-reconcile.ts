import { inngest } from "../client";
import { query as rawQuery } from "@/lib/db";
import { recordOutcome } from "@/lib/call-tasks/registry";
import { fetchTranscript } from "@/lib/elevenlabs/outbound";

export const outboundCallReconcile = inngest.createFunction(
  {
    id: "outbound-call-reconcile",
    name: "Reconcile Outbound Call Results",
    concurrency: { limit: 1 },
  },
  { cron: "*/5 * * * *" },
  async ({ step }) => {
    const inProgress = await step.run("fetch-in-progress-calls", async () => {
      const result = await rawQuery(
        `SELECT id, org_id, convai_conversation_id, call_goal, contact_name, started_at
         FROM call_tasks
         WHERE status = 'in_progress'
           AND convai_conversation_id IS NOT NULL
           AND started_at < now() - interval '30 seconds'
         ORDER BY started_at ASC
         LIMIT 50`,
        [],
      );
      return result.rows as {
        id: string;
        org_id: string;
        convai_conversation_id: string;
        call_goal: string;
        contact_name: string;
        started_at: string;
      }[];
    });

    let reconciled = 0;

    for (const call of inProgress) {
      await step.run(`reconcile-${call.id}`, async () => {
        try {
          const transcript = await fetchTranscript(call.convai_conversation_id);

          if (transcript.status === "in_progress" || transcript.status === "processing") {
            return;
          }

          const outcome = inferOutcome(transcript);

          await recordOutcome(
            call.id,
            outcome,
            {
              turns: transcript.turns,
              duration_seconds: transcript.duration_seconds,
              status: transcript.status,
            },
            `Auto-inferred: ${outcome}`,
          );

          try {
            await rawQuery(
              `INSERT INTO feedback_events (org_id, brief_id, feedback_type, feedback_text, outcome_data)
               SELECT $1, ct.brief_id, 'outcome', $3, $4
               FROM call_tasks ct
               WHERE ct.id = $2 AND ct.brief_id IS NOT NULL`,
              [
                call.org_id,
                call.id,
                `Outbound call to ${call.contact_name || "contact"}: ${outcome}`,
                JSON.stringify({ call_id: call.id, outcome, goal: call.call_goal }),
              ],
            );
          } catch {}

          reconciled++;
        } catch (err) {
          const elapsed = Date.now() - new Date(call.started_at).getTime();
          if (elapsed > 10 * 60 * 1000) {
            await recordOutcome(call.id, "no_answer", undefined, "Timed out after 10 minutes");
            reconciled++;
          }
        }
      });
    }

    return { checked: inProgress.length, reconciled };
  },
);

function inferOutcome(
  transcript: { turns: { role: string; text: string }[]; status: string },
): "booked" | "interested" | "not_interested" | "callback_requested" | "voicemail" | "no_answer" | "error" {
  const allText = transcript.turns.map((t) => t.text.toLowerCase()).join(" ");

  if (transcript.status === "failed" || transcript.status === "error") return "error";
  if (transcript.turns.length === 0) return "no_answer";
  if (transcript.turns.length <= 1 && allText.includes("voicemail")) return "voicemail";

  if (allText.includes("book") || allText.includes("schedule") || allText.includes("appointment set"))
    return "booked";
  if (allText.includes("call me back") || allText.includes("callback") || allText.includes("call later"))
    return "callback_requested";
  if (allText.includes("not interested") || allText.includes("no thanks") || allText.includes("remove me"))
    return "not_interested";
  if (allText.includes("interested") || allText.includes("tell me more") || allText.includes("sounds good"))
    return "interested";

  return transcript.turns.length > 2 ? "interested" : "no_answer";
}
