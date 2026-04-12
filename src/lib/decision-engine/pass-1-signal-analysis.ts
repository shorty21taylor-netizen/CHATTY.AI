import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, PASS_1_SIGNAL_ANALYSIS } from "./prompts";
import type { UnifiedContext } from "../db/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface Pass1Result { patterns: Array<{category:string;description:string;confidence:number;supporting_signals:string[];severity:string}>; overall_signal_health: string; total_signals_analyzed: number; timestamp: string; }

export async function runPass1(context: UnifiedContext): Promise<Pass1Result> {
  const prompt = PASS_1_SIGNAL_ANALYSIS.replace("{signal_summary}", JSON.stringify(context.signal_summary,null,2)).replace("{recent_events}", JSON.stringify(context.recent_events,null,2)).replace("{external_context}", JSON.stringify(context.external_context,null,2));
  const response = await anthropic.messages.create({ model: "claude-sonnet-4-20250514", max_tokens: 4096, system: SYSTEM_PROMPT, messages: [{ role: "user", content: prompt }] });
  const text = response.content[0].type==="text"?response.content[0].text:"";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in Pass 1 response");
  return JSON.parse(jsonMatch[0]);
}
