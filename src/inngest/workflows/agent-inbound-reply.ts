import { inngest } from "../client";
import { withOrgContext } from "@/lib/db/drizzle";
import {
  agentRuns,
  agentActivity,
  agentConfigs,
  agentEscalations,
  contactSuppressions,
  contacts,
  businessProfile,
} from "@/db/schema";
import { eq, and, desc, gte, sql, inArray } from "drizzle-orm";
import {
  buildContinuationPrompt,
  buildAgentSystemPrompt,
  type ConversationMessage,
} from "@/lib/agents/prompt-builder";
import { sendSms } from "@/lib/twilio/client";
import { exitRunningCadencesForEntity } from "@/lib/agents/cadence";
import { AGENT_REPLY_MODEL } from "@/lib/ai/model-config";

const PROHIBITED_PATTERNS = [
  /\$\d/i,
  /\bfree\s+estimate\b/i,
  /\bguarantee\b/i,
  /\bwarranty\s+extension\b/i,
  /\bwithin\s+\d+\s+(day|hour|week)/i,
];

function applyGuardrails(body: string, config: Record<string, any>): string {
  let cleaned = body;
  const guardrails = config.guardrails ?? {};
  const prohibited = guardrails.prohibited_promises ?? {};

  if (prohibited.no_pricing || prohibited.no_timeline || prohibited.no_warranty_extension) {
    for (const pat of PROHIBITED_PATTERNS) {
      cleaned = cleaned.replace(pat, "…");
    }
  }

  if (guardrails.required_sms_disclosure) {
    const stopText = "Reply STOP to opt out.";
    if (!cleaned.includes("STOP")) {
      cleaned = cleaned.trimEnd();
      if (!cleaned.endsWith(".") && !cleaned.endsWith("!") && !cleaned.endsWith("?")) {
        cleaned += ".";
      }
      cleaned += ` ${stopText}`;
    }
  }

  return cleaned;
}

type IntentType =
  | "continue"
  | "objection"
  | "book_appointment"
  | "request_human"
  | "not_interested"
  | "out_of_scope";

const CLASSIFY_SYSTEM = `You are an intent classifier for an SMS conversation between a home service contractor's AI agent and a customer.
Given the customer's latest message and conversation context, classify their intent as exactly one of:
- continue: They want to keep talking, ask questions, or provide info
- objection: They have a concern or pushback about price, timeline, quality, etc.
- book_appointment: They want to schedule an inspection, consultation, or meeting
- request_human: They explicitly ask to talk to a real person, manager, or owner
- not_interested: They say they're not interested, already hired someone, or don't need the service
- out_of_scope: The message is unrelated to the business (wrong number, spam, etc.)

Respond with ONLY the classification word. No explanation.`;

export const agentInboundReply = inngest.createFunction(
  {
    id: "agent-inbound-reply",
    name: "Inbound SMS Reply Router",
    retries: 2,
    concurrency: {
      limit: 20,
      key: "event.data.orgId",
    },
  },
  { event: "agent/inbound-reply" },
  async ({ event, step }) => {
    const { orgId, contactId, fromPhone, body, messageSid, receivedAt } =
      event.data;

    const startTime = Date.now();

    // Step 1: Find the most recent agent run for this contact (conversation thread)
    const existingRun = await step.run("find-conversation", async () => {
      return withOrgContext(orgId, async (tx) => {
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const [run] = await tx
          .select()
          .from(agentRuns)
          .where(
            and(
              eq(agentRuns.contactId, contactId),
              inArray(agentRuns.status, ["success", "skipped"]),
              gte(agentRuns.createdAt, fourteenDaysAgo),
            ),
          )
          .orderBy(desc(agentRuns.createdAt))
          .limit(1);
        return run ?? null;
      });
    });

    // If no recent conversation, dispatch as cold inbound
    if (!existingRun) {
      await step.run("dispatch-cold-sms", async () => {
        await inngest.send({
          name: "agent/run",
          data: {
            orgId,
            agentConfigId: null,
            agentTypeId: "instant-lead-response",
            eventType: "inbound_cold_sms",
            entityType: "contact",
            entityId: contactId,
            signalData: {
              contact_id: contactId,
              from_phone: fromPhone,
              body,
              message_sid: messageSid,
            },
          },
        });
      });
      return { status: "dispatched_cold", contactId };
    }

    const runId = existingRun.id;
    const agentConfigId = existingRun.agentId;

    // Step 2: Log the received SMS as activity
    await step.run("log-receive", async () => {
      return withOrgContext(orgId, async (tx) => {
        await tx.insert(agentActivity).values({
          orgId,
          agentRunId: runId,
          actionType: "receive_sms",
          actionPayload: { from: fromPhone, body, messageSid },
          result: { status: "received" },
        });
      });
    });

    // Exit any running cadences for this contact (reply received = exit condition)
    await step.run("exit-cadences-on-reply", async () => {
      await exitRunningCadencesForEntity(orgId, contactId, "reply_received");
    });

    // Step 3: Load conversation history
    const conversationHistory = await step.run("load-conversation", async () => {
      return withOrgContext(orgId, async (tx) => {
        const activities = await tx
          .select()
          .from(agentActivity)
          .where(eq(agentActivity.agentRunId, runId))
          .orderBy(agentActivity.createdAt);

        const messages: ConversationMessage[] = [];
        for (const act of activities) {
          const payload = (act.actionPayload ?? {}) as Record<string, any>;
          if (act.actionType === "send_sms" && payload.body) {
            messages.push({ role: "assistant", content: payload.body });
          } else if (act.actionType === "receive_sms" && payload.body) {
            messages.push({ role: "user", content: payload.body });
          }
        }
        return messages;
      });
    });

    // Step 4: Load agent config + business profile
    const { agentConfig, bp } = await step.run("load-config", async () => {
      return withOrgContext(orgId, async (tx) => {
        const [ac] = await tx
          .select()
          .from(agentConfigs)
          .where(eq(agentConfigs.id, agentConfigId))
          .limit(1);

        const [bpRow] = await tx
          .select()
          .from(businessProfile)
          .where(
            eq(
              businessProfile.orgId,
              sql`current_setting('app.current_org_id')::uuid`,
            ),
          )
          .limit(1);

        return { agentConfig: ac ?? null, bp: bpRow ?? null };
      });
    });

    const agentMeta = {
      id: (agentConfig as any)?.agentType ?? "instant-lead-response",
      name: (agentConfig as any)?.name ?? "Instant Lead Response",
      description: "",
      missionDefault:
        "Respond to every new lead with a personalized SMS within 60 seconds.",
    };

    // Step 5: Classify intent
    const intent = await step.run("classify-intent", async () => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) return "continue" as IntentType;

      try {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: AGENT_REPLY_MODEL,
            max_tokens: 20,
            temperature: 0,
            system: CLASSIFY_SYSTEM,
            messages: [
              {
                role: "user",
                content: `Conversation so far:\n${conversationHistory
                  .map((m) => `${m.role === "assistant" ? "Agent" : "Customer"}: ${m.content}`)
                  .join("\n")}\n\nClassify the customer's latest message.`,
              },
            ],
          }),
        });

        if (resp.ok) {
          const result = await resp.json();
          const text = (result.content?.[0]?.text || "continue")
            .trim()
            .toLowerCase();
          const valid: IntentType[] = [
            "continue",
            "objection",
            "book_appointment",
            "request_human",
            "not_interested",
            "out_of_scope",
          ];
          return (valid.includes(text as IntentType) ? text : "continue") as IntentType;
        }
      } catch (err) {
        console.warn("[inbound-reply] classify failed:", err);
      }
      return "continue" as IntentType;
    });

    // Step 6: Handle escalation intents
    if (
      intent === "request_human" ||
      intent === "out_of_scope"
    ) {
      await step.run("escalate", async () => {
        return withOrgContext(orgId, async (tx) => {
          await tx.insert(agentEscalations).values({
            orgId,
            runId,
            contactId,
            reason: intent === "request_human"
              ? "Customer requested a human"
              : "Out of scope message",
          });
          await tx.insert(agentActivity).values({
            orgId,
            agentRunId: runId,
            actionType: "escalate_to_human",
            actionPayload: { reason: intent, inbound_body: body },
            result: { status: "escalated" },
          });
        });
      });
      return { status: "escalated", intent, runId, contactId };
    }

    // Check if objection should escalate
    if (intent === "objection") {
      const shouldEscalate = await step.run("check-objection-escalation", async () => {
        if (!agentConfig) return false;
        const cfg = ((agentConfig as any).config ?? {}) as Record<string, any>;
        const triggers = cfg.escalation?.triggers ?? {};
        const bodyLower = body.toLowerCase();
        if (triggers.legal_threats && /\b(lawyer|attorney|sue|legal)\b/i.test(bodyLower)) return true;
        if (triggers.anger_or_complaint && /\b(terrible|awful|worst|scam|rip.?off|bbb)\b/i.test(bodyLower)) return true;
        if (triggers.refund_request && /\b(refund|money back)\b/i.test(bodyLower)) return true;
        return false;
      });

      if (shouldEscalate) {
        await step.run("escalate-objection", async () => {
          return withOrgContext(orgId, async (tx) => {
            await tx.insert(agentEscalations).values({
              orgId,
              runId,
              contactId,
              reason: "Objection with escalation trigger detected",
            });
            await tx.insert(agentActivity).values({
              orgId,
              agentRunId: runId,
              actionType: "escalate_to_human",
              actionPayload: { reason: "objection_escalated", inbound_body: body },
              result: { status: "escalated" },
            });
          });
        });
        return { status: "escalated", intent: "objection_escalated", runId, contactId };
      }
    }

    // Step 7: Handle not_interested
    if (intent === "not_interested") {
      await step.run("mark-not-interested", async () => {
        return withOrgContext(orgId, async (tx) => {
          await tx
            .update(agentRuns)
            .set({ status: "failed" as any, durationMs: Date.now() - startTime })
            .where(eq(agentRuns.id, runId));
          await tx.insert(agentActivity).values({
            orgId,
            agentRunId: runId,
            actionType: "marked_not_interested",
            actionPayload: { inbound_body: body },
            result: { status: "completed" },
          });
          await tx.insert(contactSuppressions).values({
            orgId,
            contactId,
            reason: "not_interested",
            source: "agent_inbound_reply",
          });
        });
      });
      await step.run("exit-cadences-not-interested", async () => {
        await exitRunningCadencesForEntity(orgId, contactId, "opted_out");
      });
      return { status: "not_interested", runId, contactId };
    }

    // Step 8: Generate reply for continue / book_appointment / objection (non-escalating)
    const replyBody = await step.run("generate-reply", async () => {
      const contact = await withOrgContext(orgId, async (tx) => {
        const [row] = await tx
          .select()
          .from(contacts)
          .where(eq(contacts.id, contactId))
          .limit(1);
        return row ?? null;
      });

      const contactName = (contact as any)?.firstName || "there";

      const history = (conversationHistory as ConversationMessage[]) ?? [];
      const { system, messages } = buildContinuationPrompt(
        agentConfig ?? {},
        bp,
        agentMeta,
        history,
      );

      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (apiKey) {
        try {
          const resp = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              model: AGENT_REPLY_MODEL,
              max_tokens: 400,
              temperature: 0.4,
              system,
              messages,
            }),
          });

          if (resp.ok) {
            const result = await resp.json();
            const text = result.content?.[0]?.text;
            if (text) return text;
          }
        } catch (err) {
          console.warn("[inbound-reply] Claude reply failed:", err);
        }
      }

      // Fallback
      if (intent === "book_appointment") {
        return `Thanks ${contactName}! I'd love to get you on the calendar. Would any of these work?\n\n• Tomorrow morning\n• Tomorrow afternoon\n• Later this week\n\nJust let me know what's best for you.`;
      }
      return `Thanks for your reply, ${contactName}! Let me look into that and get back to you shortly. - ${(bp as any)?.companyName || "Our team"}`;
    });

    // Apply guardrails
    const smsBody = await step.run("apply-guardrails", async () => {
      const cfg = ((agentConfig as any)?.config ?? {}) as Record<string, any>;
      return applyGuardrails(replyBody, cfg);
    });

    // Step 9: Send reply via Twilio
    const sendResult = await step.run("send-reply", async () => {
      const hasTwilio =
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER;

      if (!hasTwilio) {
        return { status: "send_skipped_no_twilio" as const, sid: null };
      }

      try {
        const results = await sendSms({ to: fromPhone, body: smsBody, orgId });
        return { status: "sent" as const, sid: results[0]?.sid ?? null };
      } catch (err: any) {
        return { status: "failed" as const, sid: null, error: err.message };
      }
    });

    // Log send activity
    await step.run("log-send", async () => {
      return withOrgContext(orgId, async (tx) => {
        await tx.insert(agentActivity).values({
          orgId,
          agentRunId: runId,
          actionType: "send_sms",
          actionPayload: { to: fromPhone, body: smsBody },
          result: {
            status: sendResult.status,
            twilio_sid: sendResult.sid,
            error: (sendResult as any).error ?? null,
          },
        });

        await tx
          .update(agentConfigs)
          .set({ lastRunAt: sql`now()`, updatedAt: sql`now()` })
          .where(eq(agentConfigs.id, agentConfigId));
      });
    });

    return {
      status: sendResult.status === "sent" ? "replied" : sendResult.status,
      intent,
      runId,
      contactId,
      durationMs: Date.now() - startTime,
    };
  },
);
