// ─── Twilio Client — SMS for Chatty AI ──────────────────────────

import { db } from "@/lib/db/drizzle";
import { businessProfile } from "@/db/schema";
import { eq } from "drizzle-orm";

const TWILIO_BASE_URL = "https://api.twilio.com/2010-04-01";

// Per-org sending-number resolution cache. Tenants rarely change their number
// day-to-day, but we still cap TTL low enough that a swap reflects in a brief
// delivery cycle. 5 min matches brief-scheduler's eligibility window.
const PHONE_CACHE_TTL_MS = 5 * 60 * 1000;
const phoneCache = new Map<string, { value: string | null; expires: number }>();

async function resolveOrgSendingNumber(orgId: string): Promise<string | null> {
  const cached = phoneCache.get(orgId);
  if (cached && cached.expires > Date.now()) return cached.value;
  try {
    const [row] = await db
      .select({ twilioPhoneNumber: businessProfile.twilioPhoneNumber })
      .from(businessProfile)
      .where(eq(businessProfile.orgId, orgId as unknown as never))
      .limit(1);
    const value = row?.twilioPhoneNumber || null;
    phoneCache.set(orgId, { value, expires: Date.now() + PHONE_CACHE_TTL_MS });
    return value;
  } catch (err) {
    console.error("[Twilio] resolveOrgSendingNumber failed", orgId, err);
    return null;
  }
}

function getAuth(): string {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required");
  }
  return Buffer.from(`${sid}:${token}`).toString("base64");
}

function getAccountSid(): string {
  return process.env.TWILIO_ACCOUNT_SID!;
}

export interface SendSmsOptions {
  to: string;
  body: string;
  /**
   * Explicit from-number. If omitted, resolution order is:
   *   1. orgId → businessProfile.twilio_phone_number
   *   2. env TWILIO_PHONE_NUMBER (shared fallback)
   * Providing `from` always wins.
   */
  from?: string;
  /**
   * Clerk org id for per-tenant sending-number lookup. Strongly recommended —
   * without it, SMS goes from the shared pool number which conflates all
   * tenants on a single long code (deliverability + branding risk).
   */
  orgId?: string;
  statusCallback?: string;
}

export interface SmsResult {
  sid: string;
  status: string;
  to: string;
  from: string;
  body: string;
  date_created: string;
}

/**
 * Send an SMS via Twilio. Automatically chunks messages over 1600 chars.
 */
export async function sendSms(options: SendSmsOptions): Promise<SmsResult[]> {
  let from = options.from;
  if (!from && options.orgId) {
    from = (await resolveOrgSendingNumber(options.orgId)) ?? undefined;
  }
  if (!from) from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) throw new Error("TWILIO_PHONE_NUMBER is required");

  const chunks = chunkMessage(options.body, 1600);
  const results: SmsResult[] = [];

  for (const chunk of chunks) {
    const params = new URLSearchParams({
      To: options.to,
      From: from,
      Body: chunk,
    });

    if (options.statusCallback) {
      params.append("StatusCallback", options.statusCallback);
    }

    const response = await fetch(
      `${TWILIO_BASE_URL}/Accounts/${getAccountSid()}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${getAuth()}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twilio SMS failed (${response.status}): ${error}`);
    }

    results.push(await response.json());
  }

  return results;
}

/**
 * Validate a Twilio webhook signature for incoming SMS/calls.
 */
export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const crypto = require("crypto");
  const token = process.env.TWILIO_AUTH_TOKEN!;

  // Build data string: URL + sorted params
  const data = url + Object.keys(params).sort().reduce((acc, key) => acc + key + params[key], "");
  const computed = crypto.createHmac("sha1", token).update(data).digest("base64");

  return signature === computed;
}

/**
 * Chunk a long message into SMS-safe pieces.
 */
function chunkMessage(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    // Find a good break point (sentence or word boundary)
    let breakAt = remaining.lastIndexOf(". ", maxLength);
    if (breakAt === -1 || breakAt < maxLength * 0.5) {
      breakAt = remaining.lastIndexOf(" ", maxLength);
    }
    if (breakAt === -1) {
      breakAt = maxLength;
    }

    chunks.push(remaining.slice(0, breakAt + 1).trim());
    remaining = remaining.slice(breakAt + 1).trim();
  }

  return chunks;
}
