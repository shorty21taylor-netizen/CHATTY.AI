import type { SignalAdapter, AdapterConfig, NormalizedEvent } from "../adapter";
import type {
  Contact, Lead, Estimate, Job, Interaction, LeadStatus, JobStatus,
} from "@/lib/db/types";
import { insertSignalEvent } from "@/lib/db/queries";
import { generateEmbedding, eventToEmbeddingText } from "@/lib/utils/embedding";

/**
 * Internal CRM Signal Adapter
 *
 * Unlike external adapters that poll third-party APIs on a cron, this adapter
 * is *push-driven* — the CRM API routes call the `emit*` helpers below the
 * instant a user action happens (new lead, status change, etc.). Each emit
 * builds a NormalizedEvent, generates a Voyage embedding, and persists a
 * signal_events row so the Decision Engine can reason over it.
 *
 * fetchNewEvents() is a no-op so this adapter can still be registered in the
 * signal registry alongside the external ones (weather, custom-webhook).
 */
export class InternalCrmAdapter implements SignalAdapter {
  readonly sourceType = "internal_crm";

  async fetchNewEvents(_config: AdapterConfig): Promise<NormalizedEvent[]> {
    return [];
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    return { ok: true };
  }
}

// ============================================================================
// Core helper — build NormalizedEvent, generate embedding, persist row
// ============================================================================

async function persistSignal(
  orgId: string,
  event: NormalizedEvent
): Promise<unknown> {
  const embeddingText = eventToEmbeddingText({
    event_type: event.event_type,
    entity_type: event.entity_type,
    data: event.data,
  });
  const embedding = await generateEmbedding(embeddingText);

  return insertSignalEvent(orgId, {
    source_type: "internal_crm",
    event_type: event.event_type,
    entity_type: event.entity_type,
    entity_id: event.entity_id,
    data: event.data,
    embedding: embedding.length > 0 ? embedding : undefined,
  });
}

// ============================================================================
// Emit helpers — called fire-and-forget from CRM API routes
// ============================================================================

export async function emitContactCreated(orgId: string, contact: Contact) {
  return persistSignal(orgId, {
    event_type: "contact_created",
    entity_type: "contact",
    entity_id: contact.id,
    data: {
      contact_id: contact.id,
      contact_type: contact.contact_type,
      property_type: contact.property_type,
      source: contact.source,
      source_detail: contact.source_detail,
      city: contact.city,
      state: contact.state,
      zip: contact.zip,
      status: contact.status,
      has_email: !!contact.email,
      has_phone: !!contact.phone,
    },
    source_id: contact.id,
    timestamp: new Date().toISOString(),
  });
}

export async function emitLeadCreated(orgId: string, lead: Lead) {
  return persistSignal(orgId, {
    event_type: "lead_created",
    entity_type: "lead",
    entity_id: lead.id,
    data: {
      lead_id: lead.id,
      contact_id: lead.contact_id,
      title: lead.title,
      service_type: lead.service_type,
      status: lead.status,
      priority: lead.priority,
      estimated_value: lead.estimated_value,
      assigned_to: lead.assigned_to,
      source: lead.source,
      source_detail: lead.source_detail,
      follow_up_date: lead.follow_up_date,
      appointment_date: lead.appointment_date,
    },
    source_id: lead.id,
    timestamp: new Date().toISOString(),
  });
}

export async function emitLeadStatusChanged(
  orgId: string,
  lead: Lead,
  oldStatus: LeadStatus,
  newStatus: LeadStatus
) {
  return persistSignal(orgId, {
    event_type: "lead_status_changed",
    entity_type: "lead",
    entity_id: lead.id,
    data: {
      lead_id: lead.id,
      contact_id: lead.contact_id,
      old_status: oldStatus,
      new_status: newStatus,
      is_won: newStatus === "won",
      is_lost: newStatus === "lost",
      lost_reason: newStatus === "lost" ? lead.lost_reason : null,
      service_type: lead.service_type,
      priority: lead.priority,
      estimated_value: lead.estimated_value,
      assigned_to: lead.assigned_to,
    },
    source_id: lead.id,
    timestamp: new Date().toISOString(),
  });
}

export async function emitEstimateSent(orgId: string, estimate: Estimate) {
  return persistSignal(orgId, {
    event_type: "estimate_sent",
    entity_type: "estimate",
    entity_id: estimate.id,
    data: {
      estimate_id: estimate.id,
      estimate_number: estimate.estimate_number,
      contact_id: estimate.contact_id,
      lead_id: estimate.lead_id,
      total: estimate.total,
      line_item_count: Array.isArray(estimate.line_items) ? estimate.line_items.length : 0,
      valid_until: estimate.valid_until,
      sent_at: estimate.sent_at,
    },
    source_id: estimate.id,
    timestamp: new Date().toISOString(),
  });
}

export async function emitEstimateAccepted(orgId: string, estimate: Estimate) {
  return persistSignal(orgId, {
    event_type: "estimate_accepted",
    entity_type: "estimate",
    entity_id: estimate.id,
    data: {
      estimate_id: estimate.id,
      estimate_number: estimate.estimate_number,
      contact_id: estimate.contact_id,
      lead_id: estimate.lead_id,
      total: estimate.total,
      responded_at: estimate.responded_at,
      days_to_respond:
        estimate.sent_at && estimate.responded_at
          ? Math.round(
              (new Date(estimate.responded_at).getTime() -
                new Date(estimate.sent_at).getTime()) /
                86_400_000
            )
          : null,
    },
    source_id: estimate.id,
    timestamp: new Date().toISOString(),
  });
}

export async function emitJobStatusChanged(
  orgId: string,
  job: Job,
  oldStatus: JobStatus,
  newStatus: JobStatus
) {
  return persistSignal(orgId, {
    event_type: "job_status_changed",
    entity_type: "job",
    entity_id: job.id,
    data: {
      job_id: job.id,
      contact_id: job.contact_id,
      lead_id: job.lead_id,
      estimate_id: job.estimate_id,
      old_status: oldStatus,
      new_status: newStatus,
      service_type: job.service_type,
      job_value: job.job_value,
      cost: job.cost,
      profit_margin: job.profit_margin,
      start_date: job.start_date,
      end_date: job.end_date,
    },
    source_id: job.id,
    timestamp: new Date().toISOString(),
  });
}

export async function emitJobCompleted(orgId: string, job: Job) {
  return persistSignal(orgId, {
    event_type: "job_completed",
    entity_type: "job",
    entity_id: job.id,
    data: {
      job_id: job.id,
      contact_id: job.contact_id,
      lead_id: job.lead_id,
      estimate_id: job.estimate_id,
      service_type: job.service_type,
      job_value: job.job_value,
      cost: job.cost,
      profit_margin: job.profit_margin,
      start_date: job.start_date,
      end_date: job.end_date,
      completed_at: job.completed_at,
      duration_days:
        job.start_date && job.completed_at
          ? Math.round(
              (new Date(job.completed_at).getTime() -
                new Date(job.start_date).getTime()) /
                86_400_000
            )
          : null,
    },
    source_id: job.id,
    timestamp: new Date().toISOString(),
  });
}

export async function emitInteractionLogged(
  orgId: string,
  interaction: Interaction
) {
  return persistSignal(orgId, {
    event_type: "interaction_logged",
    entity_type: "interaction",
    entity_id: interaction.id,
    data: {
      interaction_id: interaction.id,
      interaction_type: interaction.interaction_type,
      direction: interaction.direction,
      contact_id: interaction.contact_id,
      lead_id: interaction.lead_id,
      job_id: interaction.job_id,
      duration_seconds: interaction.duration_seconds,
      outcome: interaction.outcome,
      subject: interaction.subject,
      occurred_at: interaction.occurred_at,
    },
    source_id: interaction.id,
    timestamp: new Date().toISOString(),
  });
}
