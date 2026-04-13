// ─── Zod Schema Validation ──────────────────────────────────────
import { z } from "zod";

// Signal Ingest Request
export const signalIngestSchema = z.object({
  source_key: z.enum([
    "internal_crm",
    "salesforce", "hubspot", "google_ads", "facebook_ads",
    "gmail", "weather", "custom",
  ]),
  event_type: z.string().min(1).max(100),
  data: z.record(z.string(), z.any()),
  entity_type: z.string().optional(),
  entity_id: z.string().optional(),
});

// Decision Trigger Request
export const decisionTriggerSchema = z.object({
  account_id: z.string().min(1),
  vertical: z.string().optional(),
  operator_name: z.string().optional(),
});

// Feedback Submit Request
export const feedbackSchema = z.object({
  brief_id: z.string().uuid(),
  feedback_type: z.enum(["action_taken", "action_ignored", "outcome", "comment"]),
  feedback_text: z.string().max(2000).optional(),
  confidence_delta: z.number().min(-1).max(1).optional(),
  outcome_data: z.record(z.string(), z.any()).optional(),
});

// Source Registration
export const sourceRegistrationSchema = z.object({
  source_type: z.enum([
    "internal_crm",
    "salesforce", "hubspot", "google_ads", "facebook_ads",
    "gmail", "weather", "custom",
  ]),
  name: z.string().min(1).max(200),
  credentials: z.record(z.string(), z.any()).optional(),
  config: z.record(z.string(), z.any()).optional(),
});

// ============================================================================
// CRM — shared enums
// ============================================================================

export const propertyTypeEnum = z.enum([
  "residential", "commercial", "multi_family", "hoa",
]);

export const contactTypeEnum = z.enum([
  "homeowner", "property_manager", "general_contractor",
  "realtor", "insurance_adjuster", "other",
]);

export const leadSourceEnum = z.enum([
  "manual", "website", "referral", "ad_click", "phone_call",
  "walk_in", "social_media", "home_advisor", "angies_list",
  "google_lsa", "other",
]);

export const contactStatusEnum = z.enum([
  "active", "inactive", "do_not_contact",
]);

export const serviceTypeEnum = z.enum([
  "roofing", "hvac", "solar", "siding", "windows", "gutters",
  "painting", "remodeling", "plumbing", "electrical",
  "landscaping", "other",
]);

export const leadStatusEnum = z.enum([
  "new", "contacted", "appointment_set", "inspected",
  "quoted", "negotiating", "won", "lost", "on_hold",
]);

export const leadPriorityEnum = z.enum(["hot", "high", "medium", "low"]);

export const estimateStatusEnum = z.enum([
  "draft", "sent", "viewed", "accepted",
  "rejected", "expired", "revised",
]);

export const jobStatusEnum = z.enum([
  "scheduled", "materials_ordered", "in_progress", "on_hold",
  "completed", "punch_list", "invoiced", "paid", "warranty",
]);

export const interactionTypeEnum = z.enum([
  "call", "email", "sms", "note", "meeting",
  "site_visit", "voicemail", "follow_up",
]);

export const interactionDirectionEnum = z.enum([
  "inbound", "outbound", "internal",
]);

// ============================================================================
// CRM — contacts
// ============================================================================

export const contactCreateSchema = z.object({
  first_name:    z.string().max(100).optional(),
  last_name:     z.string().max(100).optional(),
  email:         z.string().email().optional(),
  phone:         z.string().max(50).optional(),
  company:       z.string().max(200).optional(),
  address_line1: z.string().max(200).optional(),
  address_line2: z.string().max(200).optional(),
  city:          z.string().max(100).optional(),
  state:         z.string().max(50).optional(),
  zip:           z.string().max(20).optional(),
  property_type: propertyTypeEnum.optional(),
  contact_type:  contactTypeEnum.optional(),
  source:        leadSourceEnum.optional(),
  source_detail: z.string().max(500).optional(),
  status:        contactStatusEnum.optional(),
  tags:          z.array(z.string()).optional(),
  custom_fields: z.record(z.string(), z.any()).optional(),
  notes:         z.string().max(5000).optional(),
}).refine(
  (d) => d.first_name || d.last_name || d.email || d.phone || d.company,
  { message: "Contact must have at least one of: first_name, last_name, email, phone, company" }
);

// Update schema — same fields as create, but every field is optional and we
// drop the "at least one identifier" refine so the patch can touch any subset.
export const contactUpdateSchema = z.object({
  first_name:    z.string().max(100).optional(),
  last_name:     z.string().max(100).optional(),
  email:         z.string().email().optional(),
  phone:         z.string().max(50).optional(),
  company:       z.string().max(200).optional(),
  address_line1: z.string().max(200).optional(),
  address_line2: z.string().max(200).optional(),
  city:          z.string().max(100).optional(),
  state:         z.string().max(50).optional(),
  zip:           z.string().max(20).optional(),
  property_type: propertyTypeEnum.optional(),
  contact_type:  contactTypeEnum.optional(),
  source:        leadSourceEnum.optional(),
  source_detail: z.string().max(500).optional(),
  status:        contactStatusEnum.optional(),
  tags:          z.array(z.string()).optional(),
  custom_fields: z.record(z.string(), z.any()).optional(),
  notes:         z.string().max(5000).optional(),
});

// ============================================================================
// CRM — leads
// ============================================================================

export const leadCreateSchema = z.object({
  contact_id:       z.string().uuid(),
  title:            z.string().min(1).max(300),
  description:      z.string().max(5000).optional(),
  service_type:     serviceTypeEnum.optional(),
  status:           leadStatusEnum.optional(),
  lost_reason:      z.string().max(500).optional(),
  estimated_value:  z.number().nonnegative().optional(),
  assigned_to:      z.string().max(200).optional(),
  priority:         leadPriorityEnum.optional(),
  follow_up_date:   z.string().optional(),           // YYYY-MM-DD
  appointment_date: z.string().datetime().optional(),
  source:           leadSourceEnum.optional(),
  source_detail:    z.string().max(500).optional(),
  tags:             z.array(z.string()).optional(),
  custom_fields:    z.record(z.string(), z.any()).optional(),
  notes:            z.string().max(5000).optional(),
});

export const leadUpdateSchema = z.object({
  action:           z.literal("update_status").optional(),
  contact_id:       z.string().uuid().optional(),
  title:            z.string().min(1).max(300).optional(),
  description:      z.string().max(5000).optional(),
  service_type:     serviceTypeEnum.optional(),
  status:           leadStatusEnum.optional(),
  lost_reason:      z.string().max(500).optional(),
  estimated_value:  z.number().nonnegative().optional(),
  assigned_to:      z.string().max(200).optional(),
  priority:         leadPriorityEnum.optional(),
  follow_up_date:   z.string().optional(),
  appointment_date: z.string().datetime().optional(),
  source:           leadSourceEnum.optional(),
  source_detail:    z.string().max(500).optional(),
  tags:             z.array(z.string()).optional(),
  custom_fields:    z.record(z.string(), z.any()).optional(),
  notes:            z.string().max(5000).optional(),
});

// ============================================================================
// CRM — estimates
// ============================================================================

export const estimateLineItemSchema = z.object({
  description: z.string().min(1).max(500),
  qty:         z.number().nonnegative(),
  unit_price:  z.number(),
  total:       z.number(),
});

export const estimateCreateSchema = z.object({
  contact_id:      z.string().uuid(),
  lead_id:         z.string().uuid().optional(),
  title:           z.string().max(300).optional(),
  line_items:      z.array(estimateLineItemSchema).optional(),
  subtotal:        z.number().optional(),
  tax_rate:        z.number().min(0).max(1).optional(),
  tax_amount:      z.number().optional(),
  discount:        z.number().optional(),
  total:           z.number().optional(),
  status:          estimateStatusEnum.optional(),
  valid_until:     z.string().optional(),
});

export const estimateUpdateSchema = z.object({
  contact_id:      z.string().uuid().optional(),
  lead_id:         z.string().uuid().nullable().optional(),
  estimate_number: z.string().max(100).optional(),
  title:           z.string().max(300).optional(),
  line_items:      z.array(estimateLineItemSchema).optional(),
  subtotal:        z.number().optional(),
  tax_rate:        z.number().min(0).max(1).optional(),
  tax_amount:      z.number().optional(),
  discount:        z.number().optional(),
  total:           z.number().optional(),
  status:          estimateStatusEnum.optional(),
  valid_until:     z.string().optional(),
  sent_at:         z.string().datetime().optional(),
  responded_at:    z.string().datetime().optional(),
});

// ============================================================================
// CRM — jobs
// ============================================================================

export const jobCreateSchema = z.object({
  contact_id:        z.string().uuid(),
  lead_id:           z.string().uuid().optional(),
  estimate_id:       z.string().uuid().optional(),
  title:             z.string().min(1).max(300),
  description:       z.string().max(5000).optional(),
  service_type:      serviceTypeEnum.optional(),
  status:            jobStatusEnum.optional(),
  job_value:         z.number().optional(),
  cost:              z.number().optional(),
  profit_margin:     z.number().optional(),
  start_date:        z.string().optional(),
  end_date:          z.string().optional(),
  job_address_line1: z.string().max(200).optional(),
  job_address_line2: z.string().max(200).optional(),
  job_city:          z.string().max(100).optional(),
  job_state:         z.string().max(50).optional(),
  job_zip:           z.string().max(20).optional(),
  assigned_crew:     z.array(z.any()).optional(),
  tags:              z.array(z.string()).optional(),
  custom_fields:     z.record(z.string(), z.any()).optional(),
  notes:             z.string().max(5000).optional(),
});

export const jobUpdateSchema = jobCreateSchema.partial();

// ============================================================================
// CRM — interactions
// ============================================================================

export const interactionCreateSchema = z.object({
  contact_id:       z.string().uuid(),
  lead_id:          z.string().uuid().optional(),
  job_id:           z.string().uuid().optional(),
  interaction_type: interactionTypeEnum,
  direction:        interactionDirectionEnum.optional(),
  subject:          z.string().max(500).optional(),
  summary:          z.string().max(2000).optional(),
  details:          z.string().max(10000).optional(),
  duration_seconds: z.number().int().nonnegative().optional(),
  outcome:          z.string().max(500).optional(),
  created_by:       z.string().max(200).optional(),
  occurred_at:      z.string().datetime().optional(),
});

/**
 * Validate request body against a Zod schema.
 * Returns parsed data or throws a structured error.
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    throw new ValidationError("Validation failed", errors);
  }
  return result.data;
}

export class ValidationError extends Error {
  public errors: Array<{ field: string; message: string }>;

  constructor(message: string, errors: Array<{ field: string; message: string }>) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }
}
