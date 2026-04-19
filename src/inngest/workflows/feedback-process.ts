import { inngest } from "../client";
import { query, queryOne } from "@/lib/db";
import { db } from "@/lib/db/drizzle";
import { briefPreferences } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { sendSms } from "@/lib/twilio/client";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://chattyai-production.up.railway.app";

interface BriefRow {
  id: string;
  org_id: string;
  brief_date: string;
  priority: string | null;
  operator_feedback: Record<string, unknown> | null;
}

interface AggregatedBriefFeedback {
  rating?: number;
  recommendation_statuses?: Record<string, string>;
  comment?: string;
  feedback_prompted_at?: string;
}

function buildPromptMessage(): string {
  return (
    `Chatty AI check-in: did yesterday's brief help?\n\n` +
    `Reply:\n` +
    `Y = acted on it\n` +
    `N = skipped it\n` +
    `or tell me what happened.\n\n` +
    `Full brief: ${APP_URL}/dashboard/brief`
  );
}

/**
 * Aggregate in-app feedback for a single brief into a feedback_events row.
 * Returns true if a row was inserted. Idempotent — no-op on briefs that
 * already have a feedback_events row (caller should skip before calling).
 */
async function aggregateInAppFeedback(brief: BriefRow): Promise<boolean> {
  const feedback = (brief.operator_feedback ?? {}) as AggregatedBriefFeedback;
  if (!feedback.rating && !feedback.recommendation_statuses) return false;

  const rating = feedback.rating ?? null;
  const statuses = feedback.recommendation_statuses ?? {};
  const actedCount = Object.values(statuses).filter(
    (s) => s === "act" || s === "done"
  ).length;
  const skippedCount = Object.values(statuses).filter(
    (s) => s === "skip"
  ).length;

  const ratingDelta = rating ? (rating - 3) * 0.05 : 0;
  const actionDelta = (actedCount - skippedCount) * 0.02;
  const confidence_delta = Number((ratingDelta + actionDelta).toFixed(3));

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
    return true;
  } catch (err) {
    console.error("[FeedbackProcess] Failed to insert feedback_event:", err);
    return false;
  }
}

/**
 * Send the "did yesterday's brief help?" SMS prompt for a single brief,
 * stamping operator_feedback.feedback_prompted_at on success so the Twilio
 * webhook routes the Y/N reply back to this brief (not today's 6am brief).
 * Returns "sent" | "failed" | "skipped" (no phone / sms disabled / no prefs).
 */
async function promptForFeedback(
  brief: BriefRow
): Promise<"sent" | "failed" | "skipped"> {
  let prefs: { smsEnabled: boolean; phoneNumber: string | null } | null = null;
  try {
    const [row] = await db
      .select({
        smsEnabled: briefPreferences.smsEnabled,
        phoneNumber: briefPreferences.phoneNumber,
      })
      .from(briefPreferences)
      .where(eq(briefPreferences.orgId, brief.org_id))
      .limit(1);
    prefs = row ?? null;
  } catch (err) {
    console.warn(
      "[FeedbackProcess] Failed to load brief_preferences for org",
      brief.org_id,
      (err as Error).message
    );
  }

  if (!prefs || !prefs.smsEnabled || !prefs.phoneNumber) return "skipped";

  try {
    await sendSms({ to: prefs.phoneNumber, body: buildPromptMessage() });
    await query(
      `UPDATE decision_briefs
          SET operator_feedback = COALESCE(operator_feedback, '{}'::jsonb)
                                  || jsonb_build_object('feedback_prompted_at', NOW())
        WHERE id = $1`,
      [brief.id]
    );
    return "sent";
  } catch (err) {
    console.error(
      "[FeedbackProcess] SMS prompt failed for brief",
      brief.id,
      err
    );
    return "failed";
  }
}

/**
 * Feedback Process Workflow — daily cron.
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
    name: "Aggregate Operator Feedback (daily cron)",
    retries: 1,
    concurrency: { limit: 1 },
  },
  { cron: "0 18 * * *" },
  async ({ step }) => {
    const pending = await step.run("collect-feedback", async () => {
      try {
        const result = await query<BriefRow>(
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
      return {
        pending: 0,
        aggregated: 0,
        prompted: { sent: 0, failed: 0, skipped: 0 },
      };
    }

    const aggregated = await step.run("aggregate-outcomes", async () => {
      let count = 0;
      for (const brief of pending) {
        // step.run serializes returns through Inngest's Jsonify, which
        // widens required fields to optional. Re-assert the shape here —
        // we trust the SELECT above to always include id/org_id.
        const ok = await aggregateInAppFeedback(brief as BriefRow);
        if (ok) count += 1;
      }
      return count;
    });

    const promptResult = await step.run("send-sms-prompts", async () => {
      const needsPrompt = pending.filter((b) => {
        const fb = (b.operator_feedback ?? {}) as AggregatedBriefFeedback;
        // Skip if already rated in-app or already prompted.
        return !fb.rating && !fb.feedback_prompted_at;
      });

      if (needsPrompt.length === 0) {
        return { queued: 0, sent: 0, failed: 0, skipped: 0 };
      }

      // Batch-load brief_preferences so we don't hit the DB once per brief.
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
          "[FeedbackProcess] Failed to batch-load brief_preferences:",
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
        try {
          await sendSms({ to: prefs.phoneNumber, body: buildPromptMessage() });
          sent += 1;
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

/**
 * Feedback Process Brief — per-brief event handler.
 *
 * Triggered by `feedback/process` events emitted from `brief-deliver.ts` after
 * the 24h `sleepUntil` window. This is the per-brief complement to the daily
 * cron: it catches briefs that aren't in yesterday's window (e.g. ones with
 * custom delivery times via brief-scheduler) and processes them immediately
 * once the 24h feedback window elapses, rather than waiting for the next 6pm
 * cron slot.
 *
 * Behavior:
 *   1. Skip if a feedback_events row already exists for this brief.
 *   2. If in-app feedback (rating/recommendation_statuses) is present,
 *      aggregate it into a feedback_events row.
 *   3. If not yet prompted, send the Y/N SMS prompt.
 *
 * Idempotent — safe to re-trigger. The aggregate step no-ops if a
 * feedback_events row exists; the prompt step no-ops if already sent.
 */
export const feedbackProcessBrief = inngest.createFunction(
  {
    id: "feedback-process-brief",
    name: "Process Feedback for a Single Brief",
    retries: 2,
    concurrency: { limit: 10, key: "event.data.orgId" },
  },
  { event: "feedback/process" },
  async ({ event, step }) => {
    const { orgId, briefId } = event.data as {
      orgId?: string;
      briefId?: string;
    };

    if (!orgId || !briefId) {
      return { skipped: true, reason: "missing orgId or briefId" };
    }

    // Step 1: load the brief + guard against double-processing.
    const ctx = await step.run("load-brief", async () => {
      const brief = await queryOne<BriefRow>(
        `SELECT b.id, b.org_id, b.brief_date::text AS brief_date,
                b.priority, b.operator_feedback
           FROM decision_briefs b
          WHERE b.id = $1 AND b.org_id = $2`,
        [briefId, orgId]
      );
      if (!brief) return { brief: null, alreadyAggregated: false };

      const existing = await queryOne<{ id: string }>(
        `SELECT id FROM feedback_events WHERE brief_id = $1 LIMIT 1`,
        [briefId]
      );
      return { brief, alreadyAggregated: !!existing };
    });

    if (!ctx.brief) {
      return { skipped: true, reason: "brief not found" };
    }

    // Step 2: aggregate in-app feedback if captured + not yet aggregated.
    // `ctx.brief` is widened to an all-optional shape by Inngest's Jsonify
    // on step.run return; cast back to BriefRow since the SELECT above
    // always includes the required fields.
    const briefRow = ctx.brief as BriefRow;
    let aggregated = false;
    if (!ctx.alreadyAggregated) {
      aggregated = await step.run("aggregate-in-app", async () =>
        aggregateInAppFeedback(briefRow)
      );
    }

    // If in-app feedback was aggregated, no prompt is needed — they've
    // already told us what they thought.
    if (aggregated) {
      return { briefId, aggregated: true, prompted: "not_needed" };
    }

    // Step 3: send SMS prompt if we haven't already done so.
    const fb = (ctx.brief.operator_feedback ?? {}) as AggregatedBriefFeedback;
    if (fb.feedback_prompted_at) {
      return { briefId, aggregated: false, prompted: "already_sent" };
    }

    const promptResult = await step.run("prompt-operator", async () =>
      promptForFeedback(briefRow)
    );

    return { briefId, aggregated: false, prompted: promptResult };
  }
);
