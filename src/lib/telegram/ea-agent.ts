// Telegram Executive Assistant — command dispatcher + Claude Haiku fallback

import { sendMessage } from "./client";
import { query } from "@/lib/db";
import { db } from "@/lib/db/drizzle";
import { withOrgContext } from "@/lib/db/drizzle";
import * as briefQueries from "@/lib/db/queries/briefs";
import { getDailyActivity, getPipelineSummary } from "@/lib/db/queries";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

interface EAContext {
  orgId: string;
  chatId: number;
  businessName: string;
}

export async function handleCommand(
  command: string,
  text: string,
  ctx: EAContext,
) {
  switch (command) {
    case "/start":
      return;
    case "/brief":
      return handleBrief(ctx);
    case "/metrics":
      return handleMetrics(ctx);
    case "/pipeline":
      return handlePipeline(ctx);
    case "/help":
      return handleHelp(ctx);
    default:
      return handleNaturalLanguage(text, ctx);
  }
}

export async function handleNaturalLanguage(text: string, ctx: EAContext) {
  const metrics = await gatherMetrics(ctx.orgId);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    system: `You are the Chatty AI Executive Assistant for ${ctx.businessName}. Answer concisely using the metrics context provided. Use plain text, no markdown. Keep answers under 3 sentences unless the user asks for detail.\n\nContext:\n${metrics}`,
    messages: [{ role: "user", content: text }],
  });

  const reply =
    response.content[0].type === "text" ? response.content[0].text : "";
  await sendMessage(ctx.chatId, reply, { parseMode: "" });
}

async function handleBrief(ctx: EAContext) {
  const brief = await withOrgContext(ctx.orgId, (tx) =>
    briefQueries.today(tx),
  );

  if (!brief) {
    await sendMessage(
      ctx.chatId,
      "No Daily Brief generated yet today. Check back after 6am.",
    );
    return;
  }

  const recs = Array.isArray(brief.recommendations)
    ? (brief.recommendations as Array<{ action?: string; why?: string }>)
    : [];
  let msg = `<b>Daily Brief — ${brief.briefDate}</b>\n\n`;

  if (recs.length > 0) {
    recs.forEach((r, i) => {
      msg += `${i + 1}. ${r.action || "Action"}`;
      if (r.why) msg += ` — <i>${r.why}</i>`;
      msg += "\n";
    });
  } else {
    msg += "No action items today. Your funnel looks clean.";
  }

  await sendMessage(ctx.chatId, msg);
}

async function handleMetrics(ctx: EAContext) {
  const result = await getDailyActivity(ctx.orgId);
  const rows = result.rows || [];

  if (rows.length === 0) {
    await sendMessage(ctx.chatId, "No activity recorded today yet.");
    return;
  }

  let inbound = 0;
  let outbound = 0;
  let total = 0;
  for (const row of rows) {
    const count = Number(row.interaction_count || 0);
    total += count;
    if (row.direction === "inbound") inbound += count;
    if (row.direction === "outbound") outbound += count;
  }

  const msg =
    `<b>Today's Metrics</b>\n\n` +
    `Inbound: <b>${inbound}</b>\n` +
    `Outbound: <b>${outbound}</b>\n` +
    `Total interactions: <b>${total}</b>`;

  await sendMessage(ctx.chatId, msg);
}

async function handlePipeline(ctx: EAContext) {
  const result = await getPipelineSummary(ctx.orgId);
  const rows = result.rows || [];

  if (rows.length === 0) {
    await sendMessage(ctx.chatId, "No open leads in the pipeline.");
    return;
  }

  let totalValue = 0;
  let totalLeads = 0;
  for (const row of rows) {
    totalValue += Number(row.pipeline_value || 0);
    totalLeads += Number(row.lead_count || 0);
  }

  const topLeads = await query<{
    id: string;
    title: string;
    estimated_value: number;
    status: string;
  }>(
    `SELECT id, title, estimated_value, status FROM leads
     WHERE org_id = $1 AND status NOT IN ('won','lost')
     ORDER BY estimated_value DESC NULLS LAST LIMIT 5`,
    [ctx.orgId],
  );

  let msg =
    `<b>Pipeline Summary</b>\n\n` +
    `Open leads: <b>${totalLeads}</b>\n` +
    `Pipeline value: <b>$${totalValue.toLocaleString()}</b>\n\n` +
    `<b>Top 5 Open Leads:</b>\n`;

  for (const lead of topLeads.rows) {
    const val = lead.estimated_value
      ? `$${Number(lead.estimated_value).toLocaleString()}`
      : "—";
    msg += `• ${lead.title || "Untitled"} — ${val} (${lead.status})\n`;
  }

  await sendMessage(ctx.chatId, msg);
}

function handleHelp(ctx: EAContext) {
  const msg =
    `<b>Chatty AI — Executive Assistant</b>\n\n` +
    `/brief — Today's Daily Brief\n` +
    `/metrics — Today's activity numbers\n` +
    `/pipeline — Pipeline value + top leads\n` +
    `/help — This message\n\n` +
    `Or just type a question in plain English.`;
  return sendMessage(ctx.chatId, msg);
}

async function gatherMetrics(orgId: string): Promise<string> {
  const parts: string[] = [];
  try {
    const activity = await getDailyActivity(orgId);
    if (activity.rows.length > 0) {
      parts.push(
        `Today's interactions: ${JSON.stringify(activity.rows)}`,
      );
    }
  } catch {}
  try {
    const pipeline = await getPipelineSummary(orgId);
    if (pipeline.rows.length > 0) {
      let total = 0;
      let leads = 0;
      for (const r of pipeline.rows) {
        total += Number(r.pipeline_value || 0);
        leads += Number(r.lead_count || 0);
      }
      parts.push(
        `Pipeline: ${leads} open leads, $${total.toLocaleString()} total value`,
      );
    }
  } catch {}
  return parts.join("\n") || "No data available yet.";
}
