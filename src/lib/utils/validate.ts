// ─── Zod Schema Validation ──────────────────────────────────────
import { z } from "zod";

// Signal Ingest Request
export const signalIngestSchema = z.object({
  source_key: z.enum([
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
    "salesforce", "hubspot", "google_ads", "facebook_ads",
    "gmail", "weather", "custom",
  ]),
  name: z.string().min(1).max(200),
  credentials: z.record(z.string(), z.any()).optional(),
  config: z.record(z.string(), z.any()).optional(),
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
