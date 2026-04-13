import Anthropic from "@anthropic-ai/sdk";
import { PASS_2_SYSTEM } from "./prompts";
import type { Pass1Output } from "./pass-1-signal-analysis";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface Recommendation {
  action: string;
  why: string;
  expected_impact: string;
  priority: "high" | "medium" | "low";
  effort: "quick_win" | "half_day" | "multi_day";
}

export interface RiskFlag {
  risk: string;
  severity: "critical" | "high" | "medium" | "low";
  mitigation: string;
}

export interface Opportunity {
  opportunity: string;
  potential_value: string;
  action_required: string;
}

export interface Pass2Output {
  diagnosis: {
    primary_bottleneck: string;
    bottleneck_severity: "critical" | "high" | "medium" | "low";
    explanation: string;
  };
  recommendations: Recommendation[];
  risk_flags: RiskFlag[];
  opportunities: Opportunity[];
  raw_response?: string;
  duration_ms: number;
}

export async function runPass2(
  pass1Output: Pass1Output,
  previousBriefs?: Record<string, unknown>[]
): Promise<Pass2Output> {
  const startTime = Date.now();

  const userMessage = `Based on the signal analysis below, provide strategic recommendations.

## Signal Analysis Results
Patterns found: ${pass1Output.patterns.length}
Signal quality: ${pass1Output.signal_quality_score}/1.0
Summary: ${pass1Output.summary}

## Detailed Patterns
${JSON.stringify(pass1Output.patterns, null, 2)}

## Previous Briefs (last 7 days context)
${JSON.stringify(previousBriefs?.slice(0, 7) || [], null, 2)}

What should the contractor do today? Return valid JSON only.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2500,
    system: PASS_2_SYSTEM,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  let parsed: Omit<Pass2Output, "raw_response" | "duration_ms">;

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("[Pass2] Failed to parse Claude response:", e);
    parsed = {
      diagnosis: {
        primary_bottleneck: "Unable to determine",
        bottleneck_severity: "medium",
        explanation: "Signal analysis could not be processed",
      },
      recommendations: [],
      risk_flags: [],
      opportunities: [],
    };
  }

  return {
    ...parsed,
    raw_response: text,
    duration_ms: Date.now() - startTime,
  };
}
