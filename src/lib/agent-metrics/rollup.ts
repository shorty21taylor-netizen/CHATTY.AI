import { query as rawQuery } from "@/lib/db";
import { db } from "@/lib/db/drizzle";
import { agentMetrics } from "@/db/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import type { AgentMetric } from "@/db/schema";

export interface RunOutcome {
  success: boolean;
  leadTouched?: boolean;
  leadConverted?: boolean;
  messageSent?: boolean;
  responseSeconds?: number;
}

export async function recordAgentRun(
  orgId: string,
  agentId: string,
  agentType: string,
  outcome: RunOutcome,
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  const successInc = outcome.success ? 1 : 0;
  const failureInc = outcome.success ? 0 : 1;
  const leadTouchedInc = outcome.leadTouched ? 1 : 0;
  const leadConvertedInc = outcome.leadConverted ? 1 : 0;
  const messageSentInc = outcome.messageSent ? 1 : 0;

  // Weighted running average for response seconds
  const avgClause = outcome.responseSeconds != null
    ? `, avg_response_seconds = CASE
         WHEN agent_metrics.avg_response_seconds IS NULL THEN $8
         ELSE (agent_metrics.avg_response_seconds * agent_metrics.runs + $8) / (agent_metrics.runs + 1)
       END`
    : "";

  const params: (string | number)[] = [
    orgId, agentId, agentType, today,
    successInc, failureInc, leadTouchedInc,
  ];
  if (outcome.responseSeconds != null) params.push(outcome.responseSeconds);
  const msgIdx = params.length + 1;
  params.push(messageSentInc);

  await rawQuery(
    `INSERT INTO agent_metrics (org_id, agent_id, agent_type, metric_date, runs, successes, failures, leads_touched, leads_converted, messages_sent${outcome.responseSeconds != null ? ", avg_response_seconds" : ""})
     VALUES ($1, $2, $3, $4, 1, $5, $6, $7, ${leadConvertedInc}, $${msgIdx}${outcome.responseSeconds != null ? ", $8" : ""})
     ON CONFLICT (org_id, agent_id, metric_date)
     DO UPDATE SET
       runs = agent_metrics.runs + 1,
       successes = agent_metrics.successes + $5,
       failures = agent_metrics.failures + $6,
       leads_touched = agent_metrics.leads_touched + $7,
       leads_converted = agent_metrics.leads_converted + ${leadConvertedInc},
       messages_sent = agent_metrics.messages_sent + $${msgIdx}${avgClause},
       updated_at = now()`,
    params,
  );
}

export async function getTopAgents(
  orgId: string,
  date?: string,
  limit = 5,
): Promise<AgentMetric[]> {
  const targetDate = date || new Date().toISOString().split("T")[0];
  return db
    .select()
    .from(agentMetrics)
    .where(
      and(
        eq(agentMetrics.orgId, orgId),
        eq(agentMetrics.metricDate, targetDate),
      ),
    )
    .orderBy(desc(agentMetrics.leadsConverted), desc(agentMetrics.runs))
    .limit(limit);
}

export async function getAgentMetrics(
  orgId: string,
  agentId: string,
  days = 7,
): Promise<AgentMetric[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];

  return db
    .select()
    .from(agentMetrics)
    .where(
      and(
        eq(agentMetrics.orgId, orgId),
        eq(agentMetrics.agentId, agentId),
        gte(agentMetrics.metricDate, sinceStr),
      ),
    )
    .orderBy(agentMetrics.metricDate);
}

export async function getOrgMetricsSummary(
  orgId: string,
  date?: string,
): Promise<{ totalRuns: number; totalConversions: number; topAgent: AgentMetric | null }> {
  const top = await getTopAgents(orgId, date, 1);
  const all = await getTopAgents(orgId, date, 100);
  return {
    totalRuns: all.reduce((s, m) => s + m.runs, 0),
    totalConversions: all.reduce((s, m) => s + m.leadsConverted, 0),
    topAgent: top[0] ?? null,
  };
}
