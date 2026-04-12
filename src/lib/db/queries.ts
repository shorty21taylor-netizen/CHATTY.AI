import { query, queryOne } from "./index";

export async function getActiveSourcesByOrg(orgId: string) {
  return query(`SELECT * FROM signal_sources WHERE org_id = $1 AND is_active = true ORDER BY source_type`, [orgId]);
}

export async function getSourceById(orgId: string, sourceId: string) {
  return queryOne(`SELECT * FROM signal_sources WHERE id = $1 AND org_id = $2`, [sourceId, orgId]);
}

export async function insertSignalEvent(orgId: string, event: any) {
  return queryOne(
    `INSERT INTO signal_events (org_id, source_type, source_id, event_type, entity_type, entity_id, data, embedding) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [orgId, event.source_type, event.source_id||null, event.event_type, event.entity_type||null, event.entity_id||null, JSON.stringify(event.data), event.embedding ? `[${event.embedding.join(",")}]` : null]
  );
}

export async function getRecentEvents(orgId: string, limit = 50) {
  return query(`SELECT * FROM signal_events WHERE org_id = $1 ORDER BY created_at DESC LIMIT $2`, [orgId, limit]);
}

export async function getOrCreateContext(orgId: string, date: string) {
  let ctx = await queryOne(`SELECT * FROM unified_context WHERE org_id = $1 AND context_date = $2`, [orgId, date]);
  if (!ctx) { ctx = await queryOne(`INSERT INTO unified_context (org_id, context_date) VALUES ($1, $2) RETURNING *`, [orgId, date]); }
  return ctx;
}

export async function updateContext(contextId: string, data: any) {
  const sets: string[] = []; const params: any[] = []; let idx = 1;
  if (data.signal_summary) { sets.push(`signal_summary = $${idx++}`); params.push(JSON.stringify(data.signal_summary)); }
  if (data.recent_events) { sets.push(`recent_events = $${idx++}`); params.push(JSON.stringify(data.recent_events)); }
  if (data.previous_briefs) { sets.push(`previous_briefs = $${idx++}`); params.push(JSON.stringify(data.previous_briefs)); }
  if (data.external_context) { sets.push(`external_context = $${idx++}`); params.push(JSON.stringify(data.external_context)); }
  params.push(contextId);
  return queryOne(`UPDATE unified_context SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`, params);
}

export async function insertBrief(orgId: string, data: any) {
  return queryOne(
    `INSERT INTO decision_briefs (org_id, brief_date, context_id, decision_engine_trace, recommendations, priority, voice_summary) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [orgId, data.brief_date, data.context_id, JSON.stringify(data.decision_engine_trace), JSON.stringify(data.recommendations), data.priority, data.voice_summary||null]
  );
}

export async function getRecentBriefs(orgId: string, limit = 7) {
  return query(`SELECT * FROM decision_briefs WHERE org_id = $1 ORDER BY brief_date DESC LIMIT $2`, [orgId, limit]);
}

export async function markBriefDelivered(briefId: string, via: string) {
  return queryOne(`UPDATE decision_briefs SET delivered_at = NOW(), delivered_via = $1 WHERE id = $2 RETURNING *`, [via, briefId]);
}

export async function upsertMetric(orgId: string, data: any) {
  return queryOne(
    `INSERT INTO micro_metrics (org_id, metric_date, vertical, metric_name, metric_value, benchmark, trend) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET metric_value = EXCLUDED.metric_value, benchmark = EXCLUDED.benchmark, trend = EXCLUDED.trend RETURNING *`,
    [orgId, data.metric_date, data.vertical||null, data.metric_name, data.metric_value, data.benchmark||null, data.trend||null]
  );
}

export async function insertFeedback(orgId: string, data: any) {
  return queryOne(
    `INSERT INTO feedback_events (org_id, brief_id, feedback_type, feedback_text, confidence_delta, outcome_data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [orgId, data.brief_id, data.feedback_type, data.feedback_text||null, data.confidence_delta||null, JSON.stringify(data.outcome_data||{})]
  );
}
