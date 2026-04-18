import { query } from "@/lib/db";
import { createPlaybook, type PlaybookStep } from "./registry";

interface SignalSequence {
  event_types: string[];
  entity_id: string;
  signal_ids: string[];
  outcome: string;
}

export async function derivePlaybooksFromHistory(
  orgId: string,
): Promise<{ proposed: number; created: string[] }> {
  const sequences = await findSuccessfulSequences(orgId);
  const patterns = groupByPattern(sequences);

  const created: string[] = [];

  for (const [pattern, instances] of Object.entries(patterns)) {
    if (instances.length < 2) continue;

    const steps = patternToSteps(instances[0].event_types);
    const signalIds = instances.flatMap((i) => i.signal_ids);

    const name = `Auto: ${pattern}`;
    const description = `Derived from ${instances.length} successful sequences over the past 30 days. Pattern: ${instances[0].event_types.join(" → ")}`;

    const id = await createPlaybook(
      orgId,
      name,
      description,
      { event_type: instances[0].event_types[0] },
      steps,
      signalIds,
    );
    created.push(id);
  }

  return { proposed: Object.keys(patterns).length, created };
}

async function findSuccessfulSequences(orgId: string): Promise<SignalSequence[]> {
  const result = await query<{
    entity_id: string;
    event_types: string[];
    signal_ids: string[];
  }>(
    `WITH entity_events AS (
       SELECT entity_id,
              array_agg(event_type ORDER BY created_at) AS event_types,
              array_agg(id::text ORDER BY created_at) AS signal_ids
       FROM signal_events
       WHERE org_id = $1
         AND created_at > NOW() - INTERVAL '30 days'
         AND entity_id IS NOT NULL
       GROUP BY entity_id
       HAVING COUNT(*) >= 3
     )
     SELECT entity_id, event_types, signal_ids
     FROM entity_events
     WHERE event_types @> ARRAY['lead_created']
       AND (event_types @> ARRAY['estimate_accepted']
            OR event_types @> ARRAY['job_completed']
            OR event_types @> ARRAY['lead_status_changed'])`,
    [orgId],
  );

  return result.rows.map((r) => ({
    entity_id: r.entity_id,
    event_types: r.event_types,
    signal_ids: r.signal_ids,
    outcome: r.event_types.includes("job_completed")
      ? "job_completed"
      : r.event_types.includes("estimate_accepted")
        ? "estimate_accepted"
        : "lead_converted",
  }));
}

function groupByPattern(
  sequences: SignalSequence[],
): Record<string, SignalSequence[]> {
  const groups: Record<string, SignalSequence[]> = {};

  for (const seq of sequences) {
    const key = seq.event_types.slice(0, 4).join(" → ");
    if (!groups[key]) groups[key] = [];
    groups[key].push(seq);
  }

  return groups;
}

function patternToSteps(eventTypes: string[]): PlaybookStep[] {
  const agentMap: Record<string, string> = {
    lead_created: "instant_lead_response",
    contact_created: "instant_lead_response",
    interaction_logged: "follow_up_nurture",
    estimate_sent: "follow_up_nurture",
    lead_status_changed: "follow_up_nurture",
    estimate_accepted: "review_request",
    job_completed: "review_request",
  };

  return eventTypes
    .filter((et) => agentMap[et])
    .map((et, i) => ({
      stepIndex: i,
      agentType: agentMap[et],
      action: et,
      delaySeconds: i === 0 ? 0 : 3600 * i,
      config: {},
    }));
}
