import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, PASS_3_BRIEF_GENERATION } from "./prompts";
import type { Pass2Result } from "./pass-2-pattern-recognition";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface Pass3Result { brief_text: string; recommendations: Array<{action:string;why:string;expected_impact:string;priority:string;category:string}>; voice_text: string; subject_line: string; priority: string; timestamp: string; }

export async function runPass3(pass2: Pass2Result, operatorName: string, vertical: string, date: string): Promise<Pass3Result> {
  const prompt = PASS_3_BRIEF_GENERATION.replace("{pass2_output}", JSON.stringify(pass2,null,2)).replace("{operator_name}", operatorName).replace("{vertical}", vertical).replace("{date}", date);
  const response = await anthropic.messages.create({ model: "claude-sonnet-4-20250514", max_tokens: 2048, system: SYSTEM_PROMPT, messages: [{ role: "user", content: prompt }] });
  const text = response.content[0].type==="text"?response.content[0].text:"";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in Pass 3 response");
  return JSON.parse(jsonMatch[0]);
}
