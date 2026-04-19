import { inngest } from "../client";
import { withOrgContext } from "@/lib/db/drizzle";
import {
  cadenceRuns,
  cadenceSteps,
  agentCadences,
  agentConfigs,
  agentActivity,
  agentRuns,
  contacts,
  contactSuppressions,
  businessProfile,
} from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { buildAgentSystemPrompt } from "@/lib/agents/prompt-builder";
import { sendSms } from "@/lib/twilio/client";
import { advanceCadence, exitCadence } from "@/lib/agents/cadence";
import { recordAgentRun } from "@/lib/agent-metrics/rollup";
import { CADENCE_STEP_MODEL } from "@/lib/ai/model-config";

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
    if (!cleaned.includes("STOP")) {
      cleaned = cleaned.trimEnd();
      if (!cleaned.endsWith(".") && !cleaned.endsWith("!") && !cleaned.endsWith("?")) {
        cleaned += ".";
      }
      cleaned += " Reply STOP to opt out.";
    }
  }

  return cleaned;
}

export const cadenceStepExecuteWorkflow = inngest.createFunction(
  {
    id: "cadence-step-execute",
    name: "Execute Cadence Step",
    retries: 2,
    concurrency: {
      limit: 50,
      key: "event.data.orgId",
    },
  },
  { event: "cadence/step-due" },
  async ({ event, step }) => {
    const { runId, orgId } = event.data;
    const startTime = Date.now();

    // (a) Load cadence_run + verify org
    const cadenceRun = await step.run("load-run", async () => {
      return withOrgContext(orgId, async (tx) => {
        const [run] = await tx
          .select()
          .from(cadenceRuns)
          .where(eq(cadenceRuns.id, runId))
          .limit(1);
        return run ?? null;
      });
    });

    if (!cadenceRun || cadenceRun.status !== "running") {
      return { status: "skipped", reason: "run_not_found_or_not_running" };
    }

    // (b) Check exit conditions
    const shouldExit = await step.run("check-exit-conditions", async () => {
      return withOrgContext(orgId, async (tx) => {
        const [cadence] = await tx
          .select()
          .from(agentCadences)
          .where(eq(agentCadences.id, cadenceRun.cadenceId))
          .limit(1);

        if (!cadence) return { exit: true, reason: "cadence_not_found" };

        const exitConds = (cadence.exitConditions ?? {}) as Record<string, boolean>;
        const entityId = cadenceRun.entityId;

        // Check for suppression (opted_out)
        if (exitConds.opted_out) {
          const [suppression] = await tx
            .select({ id: contactSuppressions.id })
            .from(contactSuppressions)
            .where(eq(contactSuppressions.contactId, entityId))
            .limit(1);
          if (suppression) return { exit: true, reason: "opted_out" };
        }

        // Check for reply_received — look for receive_sms activity on any run for this entity
        if (exitConds.reply_received) {
          const runs = await tx
            .select({ id: agentRuns.id })
            .from(agentRuns)
            .where(eq(agentRuns.contactId, entityId))
            .limit(50);

          if (runs.length > 0) {
            for (const r of runs) {
              const [replyAct] = await tx
                .select({ id: agentActivity.id })
                .from(agentActivity)
                .where(
                  and(
                    eq(agentActivity.agentRunId, r.id),
                    eq(agentActivity.actionType, "receive_sms"),
                  ),
                )
                .limit(1);
              if (replyAct) return { exit: true, reason: "reply_received" };
            }
          }
        }

        // Check for booked — look for book_appointment activity
        if (exitConds.booked) {
          const runs = await tx
            .select({ id: agentRuns.id })
            .from(agentRuns)
            .where(eq(agentRuns.contactId, entityId))
            .limit(50);

          for (const r of runs) {
            const [bookAct] = await tx
              .select({ id: agentActivity.id })
              .from(agentActivity)
              .where(
                and(
                  eq(agentActivity.agentRunId, r.id),
                  eq(agentActivity.actionType, "book_appointment"),
                ),
              )
              .limit(1);
            if (bookAct) return { exit: true, reason: "booked" };
          }
        }

        return { exit: false, reason: null };
      });
    });

    if (shouldExit.exit) {
      await step.run("exit-cadence", async () => {
        await exitCadence(runId, orgId, shouldExit.reason!);
      });
      return { status: "exited", reason: shouldExit.reason };
    }

    // (c) Load the cadence step for current index
    const stepDef = await step.run("load-step", async () => {
      return withOrgContext(orgId, async (tx) => {
        const [s] = await tx
          .select()
          .from(cadenceSteps)
          .where(
            and(
              eq(cadenceSteps.cadenceId, cadenceRun.cadenceId),
              eq(cadenceSteps.stepIndex, cadenceRun.currentStepIndex),
            ),
          )
          .limit(1);
        return s ?? null;
      });
    });

    if (!stepDef) {
      await step.run("exit-no-step", async () => {
        await exitCadence(runId, orgId, "step_definition_missing");
      });
      return { status: "failed", reason: "step_definition_missing" };
    }

    // (d) Load agent config + business profile + contact
    const context = await step.run("load-context", async () => {
      return withOrgContext(orgId, async (tx) => {
        const [cadence] = await tx
          .select()
          .from(agentCadences)
          .where(eq(agentCadences.id, cadenceRun.cadenceId))
          .limit(1);

        let ac: any = null;
        if (cadence) {
          const [row] = await tx
            .select()
            .from(agentConfigs)
            .where(eq(agentConfigs.id, cadence.agentConfigId))
            .limit(1);
          ac = row;
        }

        const [bp] = await tx
          .select()
          .from(businessProfile)
          .where(eq(businessProfile.orgId, sql`current_setting('app.current_org_id')::uuid`))
          .limit(1);

        const [contact] = await tx
          .select()
          .from(contacts)
          .where(eq(contacts.id, cadenceRun.entityId))
          .limit(1);

        return { agentConfig: ac, bp: bp ?? null, contact: contact ?? null };
      });
    });

    // (e) Generate SMS
    const smsBody = await step.run("generate-sms", async () => {
      const { agentConfig, bp, contact } = context;
      const contactName = (contact as any)?.firstName || "there";
      const cfg = ((agentConfig as any)?.config ?? {}) as Record<string, any>;

      const agentMeta = {
        id: (agentConfig as any)?.agentType ?? "unknown",
        name: (agentConfig as any)?.name ?? "Agent",
        description: "",
        missionDefault: "",
      };

      // Build prompt override or use system prompt
      let systemPrompt: string;
      if (stepDef.promptOverride) {
        systemPrompt = stepDef.promptOverride;
      } else {
        systemPrompt = buildAgentSystemPrompt(agentConfig ?? {}, bp, agentMeta);
      }

      const stepContext = `This is step ${cadenceRun.currentStepIndex + 1} of a multi-step follow-up cadence. Compose a follow-up SMS message.`;
      const userPrompt = [
        stepContext,
        `Contact: ${contactName}`,
        (contact as any)?.phone ? `Phone: ${(contact as any).phone}` : null,
        stepDef.templateSnippet ? `Use this template as a starting point: ${stepDef.templateSnippet}` : null,
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
              model: CADENCE_STEP_MODEL,
              max_tokens: 400,
              temperature: 0.4,
              system: systemPrompt,
              messages: [{ role: "user", content: userPrompt }],
            }),
          });

          if (resp.ok) {
            const result = await resp.json();
            const text = result.content?.[0]?.text;
            if (text) return applyGuardrails(text, cfg);
          }
        } catch (err) {
          console.warn("[cadence-step] Claude call failed:", err);
        }
      }

      // Template fallback
      if (stepDef.templateSnippet) {
        const filled = stepDef.templateSnippet
          .replace(/\{name\}/gi, contactName)
          .replace(/\{company\}/gi, (bp as any)?.companyName || "our team");
        return applyGuardrails(filled, cfg);
      }

      const fallback = `Hi ${contactName}, just following up on our earlier conversation. Any questions I can help with? - ${(bp as any)?.companyName || "Our team"}`;
      return applyGuardrails(fallback, cfg);
    });

    // Create an agent_run to track this cadence step execution
    const agentRun = await step.run("create-agent-run", async () => {
      return withOrgContext(orgId, async (tx) => {
        const [cadence] = await tx
          .select()
          .from(agentCadences)
          .where(eq(agentCadences.id, cadenceRun.cadenceId))
          .limit(1);

        const [run] = await tx
          .insert(agentRuns)
          .values({
            orgId,
            agentId: cadence!.agentConfigId,
            contactId: cadenceRun.entityId,
            status: "success",
            reasoningTrace: {
              cadenceRunId: runId,
              stepIndex: cadenceRun.currentStepIndex,
              channel: stepDef.channel,
            },
          })
          .returning();
        return run;
      });
    });

    // Send SMS (respect shadow mode + no-twilio)
    const sendResult = await step.run("send-sms", async () => {
      const { agentConfig, contact } = context;
      const shadowMode = (agentConfig as any)?.status === "shadow";

      if (shadowMode) {
        return { status: "shadow_skipped" as const, sid: null };
      }

      if (!(contact as any)?.phone) {
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
        const results = await sendSms({
          to: (contact as any).phone,
          body: smsBody,
        });
        return { status: "sent" as const, sid: results[0]?.sid ?? null };
      } catch (err: any) {
        return { status: "failed" as const, sid: null, error: err.message };
      }
    });

    // Log activity
    await step.run("log-activity", async () => {
      return withOrgContext(orgId, async (tx) => {
        await tx.insert(agentActivity).values({
          orgId,
          agentRunId: agentRun.id,
          actionType: "send_sms",
          actionPayload: {
            to: (context.contact as any)?.phone || "unknown",
            body: smsBody,
            cadence_step: cadenceRun.currentStepIndex,
          },
          result: {
            status: sendResult.status,
            twilio_sid: sendResult.sid,
            error: (sendResult as any).error ?? null,
          },
        });
      });
    });

    // (f) Advance cadence
    const advanceResult = await step.run("advance-cadence", async () => {
      return advanceCadence(runId, orgId);
    });

    // (g) Schedule next step if cadence still running
    if (advanceResult && typeof advanceResult === "object" && "delaySec" in advanceResult) {
      const { delaySec } = advanceResult as { delaySec: number };

      if (delaySec > 0) {
        await step.sleep("wait-for-next-step", `${delaySec}s`);
      }

      await step.run("fire-next-step", async () => {
        await inngest.send({
          name: "cadence/step-due",
          data: { runId, orgId },
        });
      });
    }

    await step.run("record-metrics", async () => {
      const agentConfigId = (context as any)?.agentConfig?.id || "cadence";
      await recordAgentRun(orgId, agentConfigId, "cadence", {
        success: sendResult.status === "sent",
        leadTouched: true,
        messageSent: sendResult.status === "sent",
        responseSeconds: Math.round((Date.now() - startTime) / 1000),
      }).catch((err) => console.error("[Cadence] metrics recording failed:", err));
    });

    return {
      status: sendResult.status,
      stepIndex: cadenceRun.currentStepIndex,
      durationMs: Date.now() - startTime,
    };
  },
);
