import { inngest } from "../client";
import { withOrgContext } from "@/lib/db/drizzle";
import {
  agentConfigs,
  agentRuns,
  agentActivity,
  contacts,
  businessProfile,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { buildAgentSystemPrompt } from "@/lib/agents/prompt-builder";
import { sendSms } from "@/lib/twilio/client";
import { getLeadById } from "@/lib/db/queries";

const AGENT_META: Record<string, { id: string; name: string; description: string; missionDefault: string }> = {
  "instant-lead-response": {
    id: "instant-lead-response",
    name: "Instant Lead Response",
    description: "Responds to new leads in under 60 seconds via SMS",
    missionDefault: "Respond to every new lead with a personalized SMS within 60 seconds, confirm the service they need, and book them onto the calendar.",
  },
};

function getAgentMeta(agentTypeId: string) {
  return AGENT_META[agentTypeId] ?? {
    id: agentTypeId,
    name: agentTypeId,
    description: "",
    missionDefault: "",
  };
}

const PROHIBITED_PATTERNS = [
  /\$\d/i,
  /\bfree\s+estimate\b/i,
  /\bguarantee\b/i,
  /\bwarranty\s+extension\b/i,
  /\bwithin\s+\d+\s+(day|hour|week)/i,
];

function applyGuardrails(
  body: string,
  config: Record<string, any>,
): string {
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

export const agentRunWorkflow = inngest.createFunction(
  {
    id: "agent-run",
    name: "Run Agent",
    retries: 2,
  },
  { event: "agent/run" },
  async ({ event, step }) => {
    const {
      orgId,
      agentConfigId,
      agentTypeId,
      eventType,
      entityType,
      entityId,
      signalData,
    } = event.data;

    const startTime = Date.now();

    // Step 1: Create agent_runs row
    const run = await step.run("create-run", async () => {
      return withOrgContext(orgId, async (tx) => {
        const [row] = await tx
          .insert(agentRuns)
          .values({
            orgId,
            agentId: agentConfigId,
            contactId: signalData?.contact_id || entityId,
            status: "success",
            reasoningTrace: { eventType, entityType, entityId, startedAt: new Date().toISOString() },
          })
          .returning();
        return row;
      });
    });

    // Step 2: Load agent config + business profile
    const { agentConfig, bp, shadowMode } = await step.run("load-config", async () => {
      return withOrgContext(orgId, async (tx) => {
        const [ac] = await tx
          .select()
          .from(agentConfigs)
          .where(eq(agentConfigs.id, agentConfigId))
          .limit(1);

        const [bpRow] = await tx
          .select()
          .from(businessProfile)
          .where(eq(businessProfile.orgId, sql`current_setting('app.current_org_id')::uuid`))
          .limit(1);

        return {
          agentConfig: ac ?? null,
          bp: bpRow ?? null,
          shadowMode: ac?.status === "shadow",
        };
      });
    });

    if (!agentConfig) {
      await step.run("mark-failed-no-config", async () => {
        return withOrgContext(orgId, async (tx) => {
          await tx
            .update(agentRuns)
            .set({ status: "failed", reasoningTrace: { error: "agent_config_not_found" }, durationMs: Date.now() - startTime })
            .where(eq(agentRuns.id, run.id));
        });
      });
      return { runId: run.id, status: "failed", reason: "agent_config_not_found" };
    }

    // Step 3: Build system prompt
    const systemPrompt = await step.run("build-prompt", async () => {
      return buildAgentSystemPrompt(agentConfig, bp, getAgentMeta(agentTypeId));
    });

    // Step 4: Fetch triggering entity
    const entityContext = await step.run("fetch-entity", async () => {
      const contactId = signalData?.contact_id || entityId;
      let contact: any = null;

      try {
        contact = await withOrgContext(orgId, async (tx) => {
          const [row] = await tx
            .select()
            .from(contacts)
            .where(eq(contacts.id, contactId))
            .limit(1);
          return row ?? null;
        });
      } catch {
        // contact lookup failed — proceed with signal data only
      }

      let lead: any = null;
      if (eventType === "lead_created" || eventType === "lead_received") {
        const leadId = signalData?.lead_id || entityId;
        try {
          lead = await getLeadById(orgId, leadId);
        } catch {
          // lead lookup optional
        }
      }

      return { contact, lead };
    });

    // Step 5: Generate SMS via Claude (or fallback template)
    const rawSmsBody = await step.run("generate-sms", async () => {
      const { contact, lead } = entityContext;

      const contactName = contact?.firstName || "there";
      const serviceType = lead?.service_type || signalData?.service_type || "your project";
      const source = lead?.source || signalData?.source || "your inquiry";

      const userPrompt = [
        `A new lead just came in. Compose a single SMS response.`,
        ``,
        `Contact: ${contactName}${contact?.lastName ? " " + contact.lastName : ""}`,
        contact?.phone ? `Phone: ${contact.phone}` : null,
        `Service needed: ${serviceType}`,
        `Lead source: ${source}`,
        lead?.title ? `Lead title: ${lead.title}` : null,
        lead?.description ? `Details: ${lead.description}` : null,
        lead?.estimated_value ? `Estimated value: $${lead.estimated_value}` : null,
      ]
        .filter(Boolean)
        .join("\n");

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
              model: "claude-sonnet-4-20250514",
              max_tokens: 400,
              temperature: 0.4,
              system: systemPrompt,
              messages: [{ role: "user", content: userPrompt }],
            }),
          });

          if (resp.ok) {
            const result = await resp.json();
            const text = result.content?.[0]?.text;
            if (text) return text;
          }
        } catch (err) {
          console.warn("[agent-run] Claude call failed, using template:", err);
        }
      }

      // Fallback template
      const cfg = (agentConfig.config ?? {}) as Record<string, any>;
      const templates = cfg.templates?.variants ?? [];
      const templateA = templates.find((t: any) => t.id === "A" && t.body);
      if (templateA?.body) {
        return templateA.body
          .replace(/\{name\}/gi, contactName)
          .replace(/\{service\}/gi, serviceType)
          .replace(/\{company\}/gi, bp?.companyName || "our team");
      }

      return `Hi ${contactName}! Thanks for reaching out about ${serviceType}. We'd love to help. When's a good time for a quick call to discuss your project? - ${bp?.companyName || "Our team"}`;
    });

    // Step 6: Apply guardrails
    const smsBody = await step.run("guardrails", async () => {
      const cfg = (agentConfig.config ?? {}) as Record<string, any>;
      return applyGuardrails(rawSmsBody, cfg);
    });

    // Step 7: Log activity as pending
    const activity = await step.run("log-activity", async () => {
      const { contact } = entityContext;
      return withOrgContext(orgId, async (tx) => {
        const [row] = await tx
          .insert(agentActivity)
          .values({
            orgId,
            agentRunId: run.id,
            actionType: "send_sms",
            actionPayload: { to: contact?.phone || "unknown", body: smsBody },
            result: { status: "pending" },
          })
          .returning();
        return row;
      });
    });

    // Step 8: Send SMS (or shadow-skip)
    const sendResult = await step.run("send-sms", async () => {
      const { contact } = entityContext;

      if (shadowMode) {
        return { status: "shadow_skipped" as const, sid: null };
      }

      if (!contact?.phone) {
        return { status: "skipped_no_phone" as const, sid: null };
      }

      const hasTwilio =
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER;

      if (!hasTwilio) {
        return { status: "send_skipped_no_twilio" as const, sid: null };
      }

      try {
        const results = await sendSms({ to: contact.phone, body: smsBody });
        return { status: "sent" as const, sid: results[0]?.sid ?? null };
      } catch (err: any) {
        return { status: "failed" as const, sid: null, error: err.message };
      }
    });

    // Step 9: Update activity with result
    await step.run("update-activity", async () => {
      return withOrgContext(orgId, async (tx) => {
        await tx
          .update(agentActivity)
          .set({
            result: {
              status: sendResult.status,
              twilio_sid: sendResult.sid,
              error: (sendResult as any).error ?? null,
            },
          })
          .where(eq(agentActivity.id, activity.id));
      });
    });

    // Step 10: Update run status
    const finalStatus =
      sendResult.status === "sent" || sendResult.status === "shadow_skipped" || sendResult.status === "send_skipped_no_twilio" || sendResult.status === "skipped_no_phone"
        ? "success"
        : "failed";

    await step.run("finalize-run", async () => {
      return withOrgContext(orgId, async (tx) => {
        await tx
          .update(agentRuns)
          .set({
            status: finalStatus as any,
            durationMs: Date.now() - startTime,
            reasoningTrace: {
              eventType,
              entityType,
              entityId,
              smsBody,
              sendStatus: sendResult.status,
              shadowMode,
              startedAt: (run.reasoningTrace as any)?.startedAt,
              completedAt: new Date().toISOString(),
            },
          })
          .where(eq(agentRuns.id, run.id));

        await tx
          .update(agentConfigs)
          .set({ lastRunAt: sql`now()`, updatedAt: sql`now()` })
          .where(eq(agentConfigs.id, agentConfigId));
      });
    });

    return {
      runId: run.id,
      status: finalStatus,
      sendStatus: sendResult.status,
      shadowMode,
      durationMs: Date.now() - startTime,
    };
  },
);
