import { inngest } from "../client";
import { query as rawQuery } from "@/lib/db";
import { getPendingTasks, updateTaskStatus } from "@/lib/call-tasks/registry";
import { startOutboundCall } from "@/lib/elevenlabs/outbound";
import { buildCallPrompt, buildFirstMessage } from "@/lib/call-tasks/prompts";
import { getBusinessProfile } from "@/lib/business-profile";

export const outboundCallDispatch = inngest.createFunction(
  {
    id: "outbound-call-dispatch",
    name: "Dispatch Queued Outbound Calls",
    concurrency: { limit: 1 },
  },
  { cron: "*/2 * * * *" },
  async ({ step }) => {
    const orgs = await step.run("list-orgs-with-queued-calls", async () => {
      const result = await rawQuery(
        `SELECT DISTINCT org_id FROM call_tasks
         WHERE status = 'queued' AND scheduled_for <= now()
         LIMIT 100`,
        [],
      );
      return result.rows.map((r: { org_id: string }) => r.org_id);
    });

    let dispatched = 0;

    for (const orgId of orgs) {
      const count = await step.run(`dispatch-${orgId}`, async () => {
        const tasks = await getPendingTasks(orgId, 10);
        if (tasks.length === 0) return 0;

        let profile: { companyName?: string; primaryServiceType?: string; ownerFirstName?: string } | null = null;
        try {
          profile = await getBusinessProfile(orgId);
        } catch {}

        const convaiAgentId = process.env.ELEVENLABS_AGENT_ID;
        if (!convaiAgentId) {
          console.warn("[OutboundDispatch] ELEVENLABS_AGENT_ID not set");
          return 0;
        }

        let count = 0;
        for (const task of tasks) {
          try {
            const prompt = buildCallPrompt(task.call_goal, {
              contactName: task.contact_name || "there",
              industry: profile?.primaryServiceType?.toLowerCase(),
              operatorName: profile?.ownerFirstName,
              companyName: profile?.companyName,
            }, task.custom_prompt || undefined);

            const firstMessage = buildFirstMessage(task.call_goal, {
              contactName: task.contact_name || "there",
              companyName: profile?.companyName,
              industry: profile?.primaryServiceType?.toLowerCase(),
            });

            const result = await startOutboundCall({
              convaiAgentId,
              toNumber: task.contact_phone,
              variables: {
                system_prompt: prompt,
                contact_name: task.contact_name || "",
              },
              firstMessage,
            });

            await updateTaskStatus(task.id, "in_progress", {
              convai_conversation_id: result.conversationId,
            });
            count++;
          } catch (err) {
            console.error(`[OutboundDispatch] Failed to dispatch call ${task.id}:`, err);
            await updateTaskStatus(task.id, "failed");
          }
        }
        return count;
      });
      dispatched += count;
    }

    return { orgsProcessed: orgs.length, dispatched };
  },
);
