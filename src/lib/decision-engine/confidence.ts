import { query } from "@/lib/db";

export interface CategoryAccuracy {
  category: string;
  totalFeedback: number;
  helpfulPct: number;
  harmfulPct: number;
  noopPct: number;
}

export async function getCategoryConfidence(
  orgId: string,
  lookbackDays = 90,
): Promise<CategoryAccuracy[]> {
  try {
    const result = await query<{
      action_category: string;
      total: number;
      helpful: number;
      harmful: number;
      noop: number;
    }>(
      `WITH categorized AS (
         SELECT
           brf.outcome,
           COALESCE(
             (db.recommendations::jsonb -> brf.recommendation_index ->> 'action'),
             'unknown'
           ) AS action_text
         FROM brief_recommendation_feedback brf
         JOIN decision_briefs db ON db.id = brf.brief_id AND db.org_id = brf.org_id
         WHERE brf.org_id = $1
           AND brf.created_at > now() - ($2 || ' days')::interval
       ),
       classified AS (
         SELECT
           outcome,
           CASE
             WHEN action_text ILIKE '%call%' THEN 'call_lead'
             WHEN action_text ILIKE '%sms%' OR action_text ILIKE '%text%' THEN 'sms_nurture'
             WHEN action_text ILIKE '%estimate%' OR action_text ILIKE '%quote%' THEN 'push_estimate'
             WHEN action_text ILIKE '%spend%' OR action_text ILIKE '%budget%' OR action_text ILIKE '%ad%' THEN 'reallocate_spend'
             WHEN action_text ILIKE '%schedul%' OR action_text ILIKE '%book%' THEN 'schedule_action'
             WHEN action_text ILIKE '%review%' THEN 'request_review'
             ELSE 'other'
           END AS action_category
         FROM categorized
       )
       SELECT
         action_category,
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE outcome = 'helpful')::int AS helpful,
         COUNT(*) FILTER (WHERE outcome = 'harmful')::int AS harmful,
         COUNT(*) FILTER (WHERE outcome = 'noop')::int AS noop
       FROM classified
       GROUP BY action_category
       ORDER BY total DESC`,
      [orgId, lookbackDays.toString()],
    );

    return result.rows.map((r) => ({
      category: r.action_category,
      totalFeedback: r.total,
      helpfulPct: r.total > 0 ? Math.round((r.helpful / r.total) * 100) : 0,
      harmfulPct: r.total > 0 ? Math.round((r.harmful / r.total) * 100) : 0,
      noopPct: r.total > 0 ? Math.round((r.noop / r.total) * 100) : 0,
    }));
  } catch {
    return [];
  }
}

export function formatConfidenceContext(categories: CategoryAccuracy[]): string {
  if (categories.length === 0) return "";

  const lines = categories
    .filter((c) => c.totalFeedback >= 3)
    .map((c) => `- "${c.category}": ${c.helpfulPct}% helpful, ${c.harmfulPct}% harmful (${c.totalFeedback} samples)`);

  if (lines.length === 0) return "";

  return `\n\nHistorical confidence per action type (past 90 days):\n${lines.join("\n")}\nWeight recommendations toward high-confidence categories. Flag low-confidence categories as experimental.`;
}
