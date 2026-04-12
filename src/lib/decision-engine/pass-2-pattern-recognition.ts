import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, PASS_2_PATTERN_RECOGNITION } from "./prompts";
import type { DecisionBrief } from "../db/types";
import type { Pass1Result } from "./pass-1-signal-analysis";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface Pass2Result { decisions: Array<{action:string;rationale:string;expected_impact:string;priority:string;category:string;confidence:number}>; bottleneck_analysis: string; trend_summary: string; confidence: number; timestamp: string; }

export async function runPass2(pass1: Pass1Result, previousBriefs: DecisionBrief[], vertical: string): Promise<Pass2Result> {
  const prompt = PASS_2_PATTERN_RECOGNITION.replace("{pass1_output}", JSON.stringify(pass1,null,2)).replace("{previous_briefs}", JSON.stringify(previousBriefs.map(b=>({date:b.brief_date,recommendations:b.recommendations,priority:b.priority,feedback:b.operator_feedback})),null,2)).replace("{vertical}", vertical);
  const response = await anthropic.messages.create({ model: "claude-sonnet-4-20250514", max_tokens: 4096, system: SYSTEM_PROMPT, messages: [{ role: "user", content: prompt }] });
  const text = response.content[0].type==="text"?response.content[0].text:"";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in Pass 2 response");
  return JSON.parse(jsonMatch[0]);
}
