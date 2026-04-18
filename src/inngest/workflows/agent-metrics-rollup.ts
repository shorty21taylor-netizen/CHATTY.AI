import { inngest } from "../client";
import { query as rawQuery } from "@/lib/db";

export const agentMetricsRollup = inngest.createFunction(
  {
    id: "agent-metrics-rollup",
    name: "Hourly Agent Metrics Rollup",
    concurrency: { limit: 1 },
  },
  { cron: "0 * * * *" },
  async ({ step }) => {
    const today = new Date().toISOString().split("T")[0];

    const counts = await step.run("rollup-from-agent-runs", async () => {
      const result = await rawQuery(
        `INSERT INTO agent_metrics (org_id, agent_id, agent_type, metric_date, runs, successes, failures, messages_sent)
         SELECT
           ar.org_id,
           ar.agent_id::text,
           COALESCE(ac.agent_type, 'unknown'),
           $1::date,
           COUNT(*)::int,
           COUNT(*) FILTER (WHERE ar.status = 'success')::int,
           COUNT(*) FILTER (WHERE ar.status = 'failed')::int,
           COUNT(*) FILTER (WHERE ar.status = 'success' AND ar.reasoning_trace->>'sendStatus' = 'sent')::int
         FROM agent_runs ar
         LEFT JOIN agent_configs ac ON ac.id = ar.agent_id
         WHERE ar.created_at >= $1::date
           AND ar.created_at < ($1::date + INTERVAL '1 day')
         GROUP BY ar.org_id, ar.agent_id, ac.agent_type
         ON CONFLICT (org_id, agent_id, metric_date)
         DO UPDATE SET
           runs = EXCLUDED.runs,
           successes = EXCLUDED.successes,
           failures = EXCLUDED.failures,
           messages_sent = EXCLUDED.messages_sent,
           updated_at = now()
         RETURNING org_id`,
        [today],
      );
      return { rowsUpserted: result.rows.length };
    });

    return { date: today, ...counts };
  },
);
