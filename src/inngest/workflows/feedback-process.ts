import { inngest } from "../client";
import { query } from "@/lib/db";

/**
 * Feedback Process Workflow
 *
 * Runs daily at 6pm. Looks at yesterday's briefs that haven't received
 * operator feedback yet, prompts the operator for outcomes via SMS,
 * and aggregates confidence deltas back into the decision engine.
 *
 * Current implementation is a scaffold — the real feedback SMS prompt
 * + Claude-scored outcome analysis ship in the next pass.
 */
export const feedbackProcess = inngest.createFunction(
  {
    id: "feedback-process",
    name: "Aggregate Operator Feedback",
    retries: 1,
  },
  { cron: "0 18 * * *" },
  async ({ step }) => {
    // Step 1: Collect yesterday's briefs that still need feedback.
    const pending = await step.run("collect-feedback", async () => {
      try {
        const result = await query<{
          id: string;
          org_id: string;
          brief_date: string;
          priority: string | null;
          operator_feedback: Record<string, unknown> | null;
        }>(
          `SELECT b.id, b.org_id, b.brief_date, b.priority, b.operator_feedback
             FROM decision_briefs b
             LEFT JOIN feedback_events f
                    ON f.brief_id = b.id
            WHERE b.brief_date = CURRENT_DATE - INTERVAL '1 day'
              AND f.id IS NULL
            ORDER BY b.created_at DESC`,
          []
        );
        return result.rows;
      } catch (err) {
        console.warn(
          "[FeedbackProcess] Could not query decision_briefs:",
          (err as Error).message
        );
        return [];
      }
    });

    if (pending.length === 0) {
      return { pending: 0, aggregated: 0 };
    }

    // Step 2: Aggregate confidence deltas for briefs that already received
    // in-app feedback today (star ratings stored in operator_feedback JSONB).
    const aggregated = await step.run("aggregate-outcomes", async () => {
      let count = 0;
      for (const brief of pending) {
        const feedback = (brief.operator_feedback ?? {}) as {
          rating?: number;
          recommendation_statuses?: Record<string, string>;
          comment?: string;
        };

        // No in-app feedback captured — leave it for the SMS prompt step.
        if (!feedback.rating && !feedback.recommendation_statuses) continue;

        const rating = feedback.rating ?? null;
        const statuses = feedback.recommendation_statuses ?? {};
        const actedCount = Object.values(statuses).filter(
          (s) => s === "act" || s === "done"
        ).length;
        const skippedCount = Object.values(statuses).filter(
          (s) => s === "skip"
        ).length;

        // Simple first-pass heuristic: rating (1-5) drives confidence delta,
        // adjusted by whether the operator acted on the brief.
        const ratingDelta = rating ? (rating - 3) * 0.05 : 0;
        const actionDelta = (actedCount - skippedCount) * 0.02;
        const confidence_delta = Number(
          (ratingDelta + actionDelta).toFixed(3)
        );

        try {
          await query(
            `INSERT INTO feedback_events
               (org_id, brief_id, feedback_type, feedback_text, confidence_delta, outcome_data)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              brief.org_id,
              brief.id,
              actedCount > skippedCount ? "action_taken" : "action_ignored",
              feedback.comment ?? null,
              confidence_delta,
              JSON.stringify({
                rating,
                acted: actedCount,
                skipped: skippedCount,
                source: "feedback-process",
              }),
            ]
          );
          count += 1;
        } catch (err) {
          console.error(
            "[FeedbackProcess] Failed to insert feedback_event:",
            err
          );
        }
      }
      return count;
    });

    // Step 3: Fan out SMS prompts for briefs that still have no feedback.
    // Stub — real Twilio wiring lives in brief-deliver; reuse that path later.
    await step.run("queue-sms-prompts", () => {
      const needsPrompt = pending.filter((b) => {
        const fb = (b.operator_feedback ?? {}) as { rating?: number };
        return !fb.rating;
      });
      if (needsPrompt.length > 0) {
        console.log(
          `[FeedbackProcess] ${needsPrompt.length} briefs still need SMS prompts`
        );
      }
      return { queued: needsPrompt.length };
    });

    return { pending: pending.length, aggregated };
  }
);
