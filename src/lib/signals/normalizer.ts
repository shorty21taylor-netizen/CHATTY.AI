import type { NormalizedEvent } from "./adapter";

export function normalizeEvent(sourceType: string, raw: Record<string, any>): NormalizedEvent {
  switch (sourceType) {
    case "salesforce": return { event_type: raw.type==="Lead"?"lead_received":"salesforce_event", entity_type: "lead", entity_id: raw.Id, data: { name: raw.Name, company: raw.Company, email: raw.Email, status: raw.Status, source: raw.LeadSource, value: raw.Amount }, source_id: raw.Id };
    case "hubspot": return { event_type: raw.eventType || "contact_updated", entity_type: raw.objectType || "contact", entity_id: raw.objectId?.toString(), data: { properties: raw.properties, changes: raw.propertyChanges }, source_id: raw.eventId?.toString() };
    case "google_ads": return { event_type: "ad_performance", entity_type: "campaign", entity_id: raw.campaign?.id?.toString(), data: { campaign_name: raw.campaign?.name, impressions: raw.metrics?.impressions, clicks: raw.metrics?.clicks, cost: raw.metrics?.cost_micros ? raw.metrics.cost_micros/1e6 : 0 }, source_id: raw.campaign?.id?.toString() };
    case "facebook_ads": return { event_type: "ad_performance", entity_type: "campaign", entity_id: raw.campaign_id, data: { campaign_name: raw.campaign_name, impressions: parseInt(raw.impressions||"0"), clicks: parseInt(raw.clicks||"0"), spend: parseFloat(raw.spend||"0") }, source_id: raw.campaign_id };
    case "gmail": return { event_type: "email_received", entity_type: "email", entity_id: raw.id, data: { from: raw.from, subject: raw.subject, snippet: raw.snippet }, source_id: raw.id };
    default: return { event_type: raw.event_type || "unknown", entity_type: raw.entity_type, entity_id: raw.entity_id, data: raw };
  }
}
