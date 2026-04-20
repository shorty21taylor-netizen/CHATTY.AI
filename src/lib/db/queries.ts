import { query, queryOne } from "./index";
import type {
  Contact, Lead, Estimate, EstimateWithContact, Job, Interaction,
  ContactListFilter, LeadListFilter, JobListFilter, InteractionListFilter,
  LeadStatus, EstimateStatus, JobStatus,
  PipelineSummaryRow, DailyActivityRow,
} from "./types";

// =============================================================================
// Existing queries (signals / briefs / feedback)
// =============================================================================

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

/**
 * Pull the most recent feedback events with the brief_date they belong to.
 * Used by the Decision Engine to feed the operator outcome signal into
 * Pass 2 pattern recognition so the LLM can see what's been landing.
 */
export async function getRecentFeedback(
  orgId: string,
  limit = 10
): Promise<
  Array<{
    brief_date: string | null;
    feedback_type: string;
    feedback_text: string | null;
    confidence_delta: number | null;
    outcome_data: Record<string, unknown> | null;
    created_at: string;
  }>
> {
  const res = await query<{
    brief_date: string | null;
    feedback_type: string;
    feedback_text: string | null;
    confidence_delta: number | null;
    outcome_data: Record<string, unknown> | null;
    created_at: string;
  }>(
    `SELECT
       db.brief_date::text AS brief_date,
       fe.feedback_type,
       fe.feedback_text,
       fe.confidence_delta,
       fe.outcome_data,
       fe.created_at::text AS created_at
     FROM feedback_events fe
     LEFT JOIN decision_briefs db ON db.id = fe.brief_id
     WHERE fe.org_id = $1
     ORDER BY fe.created_at DESC
     LIMIT $2`,
    [orgId, limit]
  );
  return res.rows;
}

// =============================================================================
// CRM — contacts
// =============================================================================

type ContactInsert = Partial<Omit<Contact, "id" | "org_id" | "created_at" | "updated_at">>;

export async function listContacts(orgId: string, filter: ContactListFilter = {}) {
  const where: string[] = [`org_id = $1`];
  const params: any[] = [orgId];
  let i = 2;

  if (filter.search) {
    where.push(`(
      first_name ILIKE $${i} OR last_name ILIKE $${i} OR email ILIKE $${i}
      OR phone ILIKE $${i} OR company ILIKE $${i}
    )`);
    params.push(`%${filter.search}%`);
    i++;
  }
  if (filter.status)       { where.push(`status = $${i++}`);       params.push(filter.status); }
  if (filter.contact_type) { where.push(`contact_type = $${i++}`); params.push(filter.contact_type); }
  if (filter.source)       { where.push(`source = $${i++}`);       params.push(filter.source); }

  const limit = filter.limit ?? 50;
  const offset = filter.offset ?? 0;
  params.push(limit, offset);

  return query<Contact>(
    `SELECT * FROM contacts WHERE ${where.join(" AND ")}
     ORDER BY created_at DESC
     LIMIT $${i++} OFFSET $${i++}`,
    params
  );
}

export async function getContactById(orgId: string, id: string) {
  return queryOne<Contact>(
    `SELECT * FROM contacts WHERE id = $1 AND org_id = $2`,
    [id, orgId]
  );
}

export async function createContact(orgId: string, data: ContactInsert) {
  return queryOne<Contact>(
    `INSERT INTO contacts (
      org_id, first_name, last_name, email, phone, company,
      address_line1, address_line2, city, state, zip,
      property_type, contact_type, source, source_detail, status,
      tags, custom_fields, notes
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
    RETURNING *`,
    [
      orgId,
      data.first_name ?? null, data.last_name ?? null, data.email ?? null,
      data.phone ?? null, data.company ?? null,
      data.address_line1 ?? null, data.address_line2 ?? null,
      data.city ?? null, data.state ?? null, data.zip ?? null,
      data.property_type ?? null, data.contact_type ?? null,
      data.source ?? null, data.source_detail ?? null,
      data.status ?? "active",
      JSON.stringify(data.tags ?? []),
      JSON.stringify(data.custom_fields ?? {}),
      data.notes ?? null,
    ]
  );
}

export async function updateContact(orgId: string, id: string, data: ContactInsert) {
  const fields: string[] = [];
  const params: any[] = [];
  let i = 1;

  const simple: (keyof ContactInsert)[] = [
    "first_name","last_name","email","phone","company",
    "address_line1","address_line2","city","state","zip",
    "property_type","contact_type","source","source_detail",
    "status","notes",
  ];
  for (const k of simple) {
    if (data[k] !== undefined) { fields.push(`${k} = $${i++}`); params.push(data[k]); }
  }
  if (data.tags !== undefined)          { fields.push(`tags = $${i++}`);          params.push(JSON.stringify(data.tags)); }
  if (data.custom_fields !== undefined) { fields.push(`custom_fields = $${i++}`); params.push(JSON.stringify(data.custom_fields)); }

  if (fields.length === 0) return getContactById(orgId, id);

  params.push(id, orgId);
  return queryOne<Contact>(
    `UPDATE contacts SET ${fields.join(", ")}
     WHERE id = $${i++} AND org_id = $${i++}
     RETURNING *`,
    params
  );
}

export async function deleteContact(orgId: string, id: string) {
  return queryOne<{ id: string }>(
    `DELETE FROM contacts WHERE id = $1 AND org_id = $2 RETURNING id`,
    [id, orgId]
  );
}

// =============================================================================
// CRM — leads
// =============================================================================

type LeadInsert = Partial<Omit<Lead, "id" | "org_id" | "created_at" | "updated_at">> & {
  contact_id: string;
  title: string;
};

export async function listLeads(orgId: string, filter: LeadListFilter = {}) {
  const where: string[] = [`org_id = $1`];
  const params: any[] = [orgId];
  let i = 2;

  if (filter.status)       { where.push(`status = $${i++}`);       params.push(filter.status); }
  if (filter.service_type) { where.push(`service_type = $${i++}`); params.push(filter.service_type); }
  if (filter.priority)     { where.push(`priority = $${i++}`);     params.push(filter.priority); }
  if (filter.assigned_to)  { where.push(`assigned_to = $${i++}`);  params.push(filter.assigned_to); }
  if (filter.overdue_only) {
    where.push(`follow_up_date <= CURRENT_DATE AND status NOT IN ('won', 'lost')`);
  }

  const limit = filter.limit ?? 50;
  const offset = filter.offset ?? 0;
  params.push(limit, offset);

  return query<Lead>(
    `SELECT * FROM leads WHERE ${where.join(" AND ")}
     ORDER BY
       CASE priority WHEN 'hot' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
       created_at DESC
     LIMIT $${i++} OFFSET $${i++}`,
    params
  );
}

export async function getLeadById(orgId: string, id: string) {
  return queryOne<Lead>(
    `SELECT * FROM leads WHERE id = $1 AND org_id = $2`,
    [id, orgId]
  );
}

export async function getLeadsByContact(orgId: string, contactId: string) {
  return query<Lead>(
    `SELECT * FROM leads WHERE org_id = $1 AND contact_id = $2 ORDER BY created_at DESC`,
    [orgId, contactId]
  );
}

export async function createLead(orgId: string, data: LeadInsert) {
  return queryOne<Lead>(
    `INSERT INTO leads (
      org_id, contact_id, title, description, service_type,
      status, lost_reason, estimated_value, assigned_to, priority,
      follow_up_date, appointment_date, source, source_detail,
      tags, custom_fields, notes
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
    RETURNING *`,
    [
      orgId, data.contact_id, data.title,
      data.description ?? null, data.service_type ?? null,
      data.status ?? "new", data.lost_reason ?? null,
      data.estimated_value ?? null, data.assigned_to ?? null,
      data.priority ?? "medium",
      data.follow_up_date ?? null, data.appointment_date ?? null,
      data.source ?? null, data.source_detail ?? null,
      JSON.stringify(data.tags ?? []),
      JSON.stringify(data.custom_fields ?? {}),
      data.notes ?? null,
    ]
  );
}

export async function updateLead(orgId: string, id: string, data: Partial<LeadInsert>) {
  const fields: string[] = [];
  const params: any[] = [];
  let i = 1;

  const simple: (keyof LeadInsert)[] = [
    "contact_id","title","description","service_type","status",
    "lost_reason","estimated_value","assigned_to","priority",
    "follow_up_date","appointment_date","source","source_detail","notes",
    "closed_at",
  ];
  for (const k of simple) {
    if (data[k] !== undefined) { fields.push(`${k} = $${i++}`); params.push(data[k]); }
  }
  if (data.tags !== undefined)          { fields.push(`tags = $${i++}`);          params.push(JSON.stringify(data.tags)); }
  if (data.custom_fields !== undefined) { fields.push(`custom_fields = $${i++}`); params.push(JSON.stringify(data.custom_fields)); }

  if (fields.length === 0) return getLeadById(orgId, id);

  params.push(id, orgId);
  return queryOne<Lead>(
    `UPDATE leads SET ${fields.join(", ")}
     WHERE id = $${i++} AND org_id = $${i++}
     RETURNING *`,
    params
  );
}

export async function updateLeadStatus(
  orgId: string,
  id: string,
  status: LeadStatus,
  lostReason: string | null = null
) {
  const closed = status === "won" || status === "lost" ? "NOW()" : "NULL";
  return queryOne<Lead>(
    `UPDATE leads
     SET status = $1,
         lost_reason = $2,
         closed_at = ${closed}
     WHERE id = $3 AND org_id = $4
     RETURNING *`,
    [status, lostReason, id, orgId]
  );
}

// =============================================================================
// CRM — estimates
// =============================================================================

type EstimateInsert = Partial<Omit<Estimate, "id" | "org_id" | "created_at" | "updated_at">> & {
  contact_id: string;
};

export async function listEstimates(orgId: string, opts: { status?: EstimateStatus; limit?: number; offset?: number } = {}) {
  // LEFT JOIN keeps rows visible even if a contact has been deleted — the
  // dashboard falls back to "Unknown contact" in that case rather than
  // hiding the estimate entirely (which would break KPI counts).
  const where: string[] = [`e.org_id = $1`];
  const params: any[] = [orgId];
  let i = 2;

  if (opts.status) { where.push(`e.status = $${i++}`); params.push(opts.status); }

  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;
  params.push(limit, offset);

  return query<EstimateWithContact>(
    `SELECT
       e.*,
       c.first_name    AS contact_first_name,
       c.last_name     AS contact_last_name,
       c.company       AS contact_company,
       c.address_line1 AS contact_address_line1,
       c.city          AS contact_city,
       c.state         AS contact_state
     FROM estimates e
     LEFT JOIN contacts c ON c.id = e.contact_id AND c.org_id = e.org_id
     WHERE ${where.join(" AND ")}
     ORDER BY e.created_at DESC
     LIMIT $${i++} OFFSET $${i++}`,
    params
  );
}

export async function getEstimateById(orgId: string, id: string) {
  return queryOne<Estimate>(
    `SELECT * FROM estimates WHERE id = $1 AND org_id = $2`,
    [id, orgId]
  );
}

export async function getEstimatesByLead(orgId: string, leadId: string) {
  return query<Estimate>(
    `SELECT * FROM estimates WHERE org_id = $1 AND lead_id = $2 ORDER BY created_at DESC`,
    [orgId, leadId]
  );
}

export async function createEstimate(orgId: string, data: EstimateInsert) {
  return queryOne<Estimate>(
    `INSERT INTO estimates (
      org_id, contact_id, lead_id, estimate_number, title,
      line_items, subtotal, tax_rate, tax_amount, discount, total,
      status, valid_until, sent_at, responded_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    RETURNING *`,
    [
      orgId, data.contact_id, data.lead_id ?? null,
      data.estimate_number ?? null, data.title ?? null,
      JSON.stringify(data.line_items ?? []),
      data.subtotal ?? 0, data.tax_rate ?? 0, data.tax_amount ?? 0,
      data.discount ?? 0, data.total ?? 0,
      data.status ?? "draft",
      data.valid_until ?? null, data.sent_at ?? null, data.responded_at ?? null,
    ]
  );
}

export async function updateEstimate(orgId: string, id: string, data: Partial<EstimateInsert>) {
  const fields: string[] = [];
  const params: any[] = [];
  let i = 1;

  const simple: (keyof EstimateInsert)[] = [
    "contact_id","lead_id","estimate_number","title",
    "subtotal","tax_rate","tax_amount","discount","total",
    "status","valid_until","sent_at","responded_at",
  ];
  for (const k of simple) {
    if (data[k] !== undefined) { fields.push(`${k} = $${i++}`); params.push(data[k]); }
  }
  if (data.line_items !== undefined) { fields.push(`line_items = $${i++}`); params.push(JSON.stringify(data.line_items)); }

  if (fields.length === 0) return getEstimateById(orgId, id);

  params.push(id, orgId);
  return queryOne<Estimate>(
    `UPDATE estimates SET ${fields.join(", ")}
     WHERE id = $${i++} AND org_id = $${i++}
     RETURNING *`,
    params
  );
}

export async function updateEstimateStatus(orgId: string, id: string, status: EstimateStatus) {
  const timestamps: string[] = [`status = $1`];
  if (status === "sent")     timestamps.push(`sent_at = COALESCE(sent_at, NOW())`);
  if (status === "accepted" || status === "rejected") {
    timestamps.push(`responded_at = COALESCE(responded_at, NOW())`);
  }
  return queryOne<Estimate>(
    `UPDATE estimates SET ${timestamps.join(", ")}
     WHERE id = $2 AND org_id = $3
     RETURNING *`,
    [status, id, orgId]
  );
}

// =============================================================================
// CRM — jobs
// =============================================================================

type JobInsert = Partial<Omit<Job, "id" | "org_id" | "created_at" | "updated_at">> & {
  contact_id: string;
  title: string;
};

export async function listJobs(orgId: string, filter: JobListFilter = {}) {
  const where: string[] = [`org_id = $1`];
  const params: any[] = [orgId];
  let i = 2;

  if (filter.status)       { where.push(`status = $${i++}`);       params.push(filter.status); }
  if (filter.service_type) { where.push(`service_type = $${i++}`); params.push(filter.service_type); }

  const limit = filter.limit ?? 50;
  const offset = filter.offset ?? 0;
  params.push(limit, offset);

  return query<Job>(
    `SELECT * FROM jobs WHERE ${where.join(" AND ")}
     ORDER BY start_date ASC NULLS LAST, created_at DESC
     LIMIT $${i++} OFFSET $${i++}`,
    params
  );
}

export async function getJobById(orgId: string, id: string) {
  return queryOne<Job>(
    `SELECT * FROM jobs WHERE id = $1 AND org_id = $2`,
    [id, orgId]
  );
}

export async function getJobsByContact(orgId: string, contactId: string) {
  return query<Job>(
    `SELECT * FROM jobs WHERE org_id = $1 AND contact_id = $2 ORDER BY created_at DESC`,
    [orgId, contactId]
  );
}

export async function createJob(orgId: string, data: JobInsert) {
  return queryOne<Job>(
    `INSERT INTO jobs (
      org_id, contact_id, lead_id, estimate_id, title, description,
      service_type, status, job_value, cost, profit_margin,
      start_date, end_date,
      job_address_line1, job_address_line2, job_city, job_state, job_zip,
      assigned_crew, tags, custom_fields, notes, completed_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
    RETURNING *`,
    [
      orgId, data.contact_id, data.lead_id ?? null, data.estimate_id ?? null,
      data.title, data.description ?? null,
      data.service_type ?? null, data.status ?? "scheduled",
      data.job_value ?? null, data.cost ?? null, data.profit_margin ?? null,
      data.start_date ?? null, data.end_date ?? null,
      data.job_address_line1 ?? null, data.job_address_line2 ?? null,
      data.job_city ?? null, data.job_state ?? null, data.job_zip ?? null,
      JSON.stringify(data.assigned_crew ?? []),
      JSON.stringify(data.tags ?? []),
      JSON.stringify(data.custom_fields ?? {}),
      data.notes ?? null,
      data.completed_at ?? null,
    ]
  );
}

export async function updateJob(orgId: string, id: string, data: Partial<JobInsert>) {
  const fields: string[] = [];
  const params: any[] = [];
  let i = 1;

  const simple: (keyof JobInsert)[] = [
    "contact_id","lead_id","estimate_id","title","description",
    "service_type","status","job_value","cost","profit_margin",
    "start_date","end_date",
    "job_address_line1","job_address_line2","job_city","job_state","job_zip",
    "notes","completed_at",
  ];
  for (const k of simple) {
    if (data[k] !== undefined) { fields.push(`${k} = $${i++}`); params.push(data[k]); }
  }
  if (data.assigned_crew !== undefined) { fields.push(`assigned_crew = $${i++}`); params.push(JSON.stringify(data.assigned_crew)); }
  if (data.tags !== undefined)          { fields.push(`tags = $${i++}`);          params.push(JSON.stringify(data.tags)); }
  if (data.custom_fields !== undefined) { fields.push(`custom_fields = $${i++}`); params.push(JSON.stringify(data.custom_fields)); }

  if (fields.length === 0) return getJobById(orgId, id);

  params.push(id, orgId);
  return queryOne<Job>(
    `UPDATE jobs SET ${fields.join(", ")}
     WHERE id = $${i++} AND org_id = $${i++}
     RETURNING *`,
    params
  );
}

export async function updateJobStatus(orgId: string, id: string, status: JobStatus) {
  const completed = status === "completed" ? "COALESCE(completed_at, NOW())" : "completed_at";
  return queryOne<Job>(
    `UPDATE jobs SET status = $1, completed_at = ${completed}
     WHERE id = $2 AND org_id = $3
     RETURNING *`,
    [status, id, orgId]
  );
}

// =============================================================================
// CRM — interactions
// =============================================================================

type InteractionInsert = Partial<Omit<Interaction, "id" | "org_id" | "created_at">> & {
  contact_id: string;
  interaction_type: Interaction["interaction_type"];
};

export async function listInteractions(orgId: string, filter: InteractionListFilter = {}) {
  const where: string[] = [`org_id = $1`];
  const params: any[] = [orgId];
  let i = 2;

  if (filter.interaction_type) { where.push(`interaction_type = $${i++}`); params.push(filter.interaction_type); }
  if (filter.direction)        { where.push(`direction = $${i++}`);        params.push(filter.direction); }
  if (filter.since)            { where.push(`occurred_at >= $${i++}`);     params.push(filter.since); }

  const limit = filter.limit ?? 50;
  const offset = filter.offset ?? 0;
  params.push(limit, offset);

  return query<Interaction>(
    `SELECT * FROM interactions WHERE ${where.join(" AND ")}
     ORDER BY occurred_at DESC
     LIMIT $${i++} OFFSET $${i++}`,
    params
  );
}

export async function createInteraction(orgId: string, data: InteractionInsert) {
  return queryOne<Interaction>(
    `INSERT INTO interactions (
      org_id, contact_id, lead_id, job_id,
      interaction_type, direction,
      subject, summary, details, duration_seconds, outcome, created_by,
      occurred_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,COALESCE($13, NOW()))
    RETURNING *`,
    [
      orgId, data.contact_id, data.lead_id ?? null, data.job_id ?? null,
      data.interaction_type, data.direction ?? null,
      data.subject ?? null, data.summary ?? null, data.details ?? null,
      data.duration_seconds ?? null, data.outcome ?? null, data.created_by ?? null,
      data.occurred_at ?? null,
    ]
  );
}

export async function getInteractionsByContact(orgId: string, contactId: string, limit = 50) {
  return query<Interaction>(
    `SELECT * FROM interactions
     WHERE org_id = $1 AND contact_id = $2
     ORDER BY occurred_at DESC LIMIT $3`,
    [orgId, contactId, limit]
  );
}

export async function getInteractionsByLead(orgId: string, leadId: string, limit = 50) {
  return query<Interaction>(
    `SELECT * FROM interactions
     WHERE org_id = $1 AND lead_id = $2
     ORDER BY occurred_at DESC LIMIT $3`,
    [orgId, leadId, limit]
  );
}

export async function getInteractionsByJob(orgId: string, jobId: string, limit = 50) {
  return query<Interaction>(
    `SELECT * FROM interactions
     WHERE org_id = $1 AND job_id = $2
     ORDER BY occurred_at DESC LIMIT $3`,
    [orgId, jobId, limit]
  );
}

// =============================================================================
// CRM — pipeline / activity / follow-up queries
// =============================================================================

export async function getPipelineSummary(orgId: string) {
  return query<PipelineSummaryRow>(
    `SELECT * FROM crm_pipeline_summary WHERE org_id = $1
     ORDER BY service_type NULLS LAST, status`,
    [orgId]
  );
}

export async function getDailyActivity(orgId: string) {
  return query<DailyActivityRow>(
    `SELECT * FROM crm_daily_activity WHERE org_id = $1
     ORDER BY interaction_type, direction`,
    [orgId]
  );
}

export async function getOverdueFollowUps(orgId: string, limit = 50) {
  return query<Lead>(
    `SELECT * FROM leads
     WHERE org_id = $1
       AND follow_up_date <= CURRENT_DATE
       AND status NOT IN ('won', 'lost')
     ORDER BY follow_up_date ASC, created_at DESC
     LIMIT $2`,
    [orgId, limit]
  );
}
