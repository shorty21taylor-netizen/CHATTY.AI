import { inngest } from "../client";
import { query } from "@/lib/db";
import { db } from "@/lib/db/drizzle";
import { briefPreferences } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { sendSms } from "@/lib/twilio/client";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://chattyai-production.up.railway.app";

/**
 * Feedback Process Workflow
 *
 * Runs daily at 6pm. Looks at yesterday's briefs that haven't received
 * operator feedback yet, prompts the operator for outcomes via SMS,
 * and aggregates confidence deltas back into the decision engine.
 *
 * Inbound Y/N/acted/skip replies are handled by /api/webhooks/twilio,
 * which looks for briefs with `feedback_prompted_at` set in the last
 * 48h so feedback attaches to yesterday's brief (not today's 6am one).
 */
export const feedbackProcess = inngest.createFunction(
  {
    id: "feedback-process",
    name: "Aggregate Operator Feedback",
    retries: 1,
    concurrency: { limit: 1 },
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
      return { pending: 0, aggregated: 0, prompted: { sent: 0, failed: 0, skipped: 0 } };
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

    // Step 3: Send SMS prompts for briefs that still have no feedback.
    // This is the missing half of the Pass 2 feedback loop — without it,
    // Pass 2's `recent_feedback` block is permanently empty.
    const promptResult = await step.run("send-sms-prompts", async () => {
      const needsPrompt = pending.filter((b) => {
        const fb = (b.operator_feedback ?? {}) as {
          rating?: number;
          feedback_prompted_at?: string;
        };
        // Skip if already rated in-app or if we've already prompted this brief.
        return !fb.rating && !fb.feedback_prompted_at;
      });

      if (needsPrompt.length === 0) {
        return { queued: 0, sent: 0, failed: 0, skipped: 0 };
      }

      // Batch-load brief_preferences for all orgs we're about to prompt.
      const orgIds = Array.from(new Set(needsPrompt.map((b) => b.org_id)));
      const prefsByOrg = new Map<
        string,
        { smsEnabled: boolean; phoneNumber: string | null }
      >();
      try {
        const rows = await db
          .select({
            orgId: briefPreferences.orgId,
            smsEnabled: briefPreferences.smsEnabled,
            phoneNumber: briefPreferences.phoneNumber,
          })
          .from(briefPreferences)
          .where(inArray(briefPreferences.orgId, orgIds));
        for (const row of rows) {
          prefsByOrg.set(row.orgId, {
            smsEnabled: row.smsEnabled,
            phoneNumber: row.phoneNumber,
          });
        }
      } catch (err) {
        console.warn(
          "[FeedbackProcess] Failed to load brief_preferences:",
          (err as Error).message
        );
      }

      let sent = 0;
      let failed = 0;
      let skipped = 0;

      for (const brief of needsPrompt) {
        const prefs = prefsByOrg.get(brief.org_id);
        if (!prefs || !prefs.smsEnabled || !prefs.phoneNumber) {
          skipped += 1;
          continue;
        }

        const msg =
          `Chatty AI check-in: did yesterday's brief help?\n\n` +
          `Reply:\n` +
          `Y = acted on it\n` +
          `N = skipped it\n` +
          `or tell me what happened.\n\n` +
          `Full brief: ${APP_URL}/dashboard/brief`;

        try {
          await sendSms({ to: prefs.phoneNumber, body: msg });
          sent += 1;

          // Mark so the Twilio webhook can route the Y/N reply back to this
          // brief (not to today's 6am brief) and so we don't double-prompt.
          await query(
            `UPDATE decision_briefs
                SET operator_feedback = COALESCE(operator_feedback, '{}'::jsonb)
                                        || jsonb_build_object('feedback_prompted_at', NOW())
              WHERE id = $1`,
            [brief.id]
          );
        } catch (err) {
          failed += 1;
          console.error(
            "[FeedbackProcess] SMS prompt failed for brief",
            brief.id,
            err
          );
        }
      }

      return { queued: needsPrompt.length, sent, failed, skipped };
    });

    return {
      pending: pending.length,
      aggregated,
      prompted: promptResult,
    };
  }
);
