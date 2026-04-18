import type { CallGoal } from "./registry";

export interface PromptContext {
  contactName: string;
  industry?: string;
  operatorName?: string;
  companyName?: string;
  appointmentDate?: string;
  quoteAmount?: string;
}

const TEMPLATES: Record<CallGoal, string> = {
  reengage_lead: `You are calling {{contactName}} on behalf of {{companyName}}, a {{industry}} contractor. The purpose of this call is to re-engage them as a lead. They previously showed interest but haven't responded recently. Be warm, professional, and brief. Ask if they're still interested in getting a quote or scheduling an inspection. If they are, offer to book a time. If they're not, thank them and ask if there's a better time to follow up.`,

  confirm_appointment: `You are calling {{contactName}} on behalf of {{companyName}} to confirm their upcoming appointment on {{appointmentDate}}. Be friendly and efficient. Confirm the date, time, and address. Ask if they have any questions or special instructions for the crew. If they need to reschedule, offer the next available slot.`,

  followup_quote: `You are calling {{contactName}} on behalf of {{companyName}}. They received a quote for {{industry}} work recently{{quoteAmount}}. Check if they had a chance to review it, answer any questions, and see if they're ready to move forward. If they have concerns about pricing, listen carefully and note them. Don't offer discounts unless instructed.`,

  custom: `You are calling {{contactName}} on behalf of {{companyName}}. Follow the operator's instructions carefully.`,
};

export function buildCallPrompt(
  goal: CallGoal,
  context: PromptContext,
  customPrompt?: string,
): string {
  if (goal === "custom" && customPrompt) {
    return interpolate(customPrompt, context);
  }

  const template = TEMPLATES[goal];
  return interpolate(template, context);
}

export function buildFirstMessage(
  goal: CallGoal,
  context: PromptContext,
): string {
  const name = context.contactName || "there";

  switch (goal) {
    case "reengage_lead":
      return `Hi ${name}, this is calling from ${context.companyName || "your contractor"}. I wanted to follow up on your recent inquiry about ${context.industry || "home services"} work. Do you have a quick moment?`;
    case "confirm_appointment":
      return `Hi ${name}, this is calling from ${context.companyName || "your contractor"} to confirm your appointment${context.appointmentDate ? ` on ${context.appointmentDate}` : ""}. Is this still a good time for you?`;
    case "followup_quote":
      return `Hi ${name}, this is calling from ${context.companyName || "your contractor"}. I wanted to check in about the estimate we sent over. Did you get a chance to take a look?`;
    case "custom":
      return `Hi ${name}, this is calling from ${context.companyName || "your contractor"}. How are you today?`;
  }
}

function interpolate(template: string, ctx: PromptContext): string {
  return template
    .replace(/\{\{contactName\}\}/g, ctx.contactName || "the customer")
    .replace(/\{\{industry\}\}/g, ctx.industry || "home services")
    .replace(/\{\{operatorName\}\}/g, ctx.operatorName || "the team")
    .replace(/\{\{companyName\}\}/g, ctx.companyName || "our company")
    .replace(/\{\{appointmentDate\}\}/g, ctx.appointmentDate || "the scheduled date")
    .replace(/\{\{quoteAmount\}\}/g, ctx.quoteAmount ? ` for $${ctx.quoteAmount}` : "");
}
