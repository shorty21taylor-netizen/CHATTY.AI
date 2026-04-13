import Anthropic from "@anthropic-ai/sdk";
import { PASS_3_SYSTEM } from "./prompts";
import type { Pass2Output } from "./pass-2-pattern-recognition";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface BriefAction {
  priority: "high" | "medium" | "low";
  action: string;
  why: string;
  expected_impact: string;
}

export interface DailyBrief {
  headline: string;
  actions: BriefAction[];
  risk_flag: {
    active: boolean;
    message: string | null;
  };
  opportunity: {
    message: string;
    potential_value: string;
  };
  metric_of_the_day: {
    name: string;
    value: string;
    trend: "up" | "down" | "flat";
    context: string;
  };
  voice_summary: string;
}

export interface Pass3Output {
  brief: DailyBrief;
  raw_response?: string;
  duration_ms: number;
}

export async function runPass3(
  pass2Output: Pass2Output,
  operatorName?: string,
  vertical?: string
): Promise<Pass3Output> {
  const startTime = Date.now();

  const userMessage = `Generate the Daily Brief for ${operatorName || "the operator"} (${vertical || "home services"} contractor).

## Strategic Analysis
Bottleneck: ${pass2Output.diagnosis.primary_bottleneck} (${pass2Output.diagnosis.bottleneck_severity})
Explanation: ${pass2Output.diagnosis.explanation}

## Top Recommendations
${JSON.stringify(pass2Output.recommendations.slice(0, 5), null, 2)}

## Risk Flags
${JSON.stringify(pass2Output.risk_flags, null, 2)}

## Opportunities
${JSON.stringify(pass2Output.opportunities, null, 2)}

Write a brief that this contractor reads at 6am. Make it count. Return valid JSON only.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: PASS_3_SYSTEM,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  let parsed: DailyBrief;

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("[Pass3] Failed to parse Claude response:", e);
    parsed = {
      headline: "Your daily brief could not be generated",
      actions: [
        {
          priority: "high",
          action: "Check your signal sources",
          why: "Brief generation encountered an error",
          expected_impact: "Resume normal daily intelligence",
        },
      ],
      risk_flag: { active: false, message: null },
      opportunity: {
        message: "Review your pipeline manually today",
        potential_value: "N/A",
      },
      metric_of_the_day: {
        name: "System Status",
        value: "Degraded",
        trend: "flat",
        context: "Brief generation needs attention",
      },
      voice_summary:
        "Good morning. There was an issue generating your brief today. Please check your dashboard for details.",
    };
  }

  return {
    brief: parsed,
    raw_response: text,
    duration_ms: Date.now() - startTime,
  };
}
