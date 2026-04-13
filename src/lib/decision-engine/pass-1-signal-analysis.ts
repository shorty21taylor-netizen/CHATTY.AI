import Anthropic from "@anthropic-ai/sdk";
import { PASS_1_SYSTEM } from "./prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface Pass1Input {
  orgId: string;
  signalSummary: Record<string, unknown>;
  recentEvents: Record<string, unknown>[];
  externalContext?: Record<string, unknown>;
}

export interface SignalPattern {
  type: "opportunity" | "risk" | "trend" | "anomaly";
  signal: string;
  confidence: number;
  data_points: string[];
}

export interface Pass1Output {
  patterns: SignalPattern[];
  signal_quality_score: number;
  summary: string;
  raw_response?: string;
  duration_ms: number;
}

export async function runPass1(input: Pass1Input): Promise<Pass1Output> {
  const startTime = Date.now();

  const userMessage = `Analyze these signals for org ${input.orgId}:

## Signal Summary (last 24h)
${JSON.stringify(input.signalSummary, null, 2)}

## Recent Events (top signals)
${JSON.stringify(input.recentEvents.slice(0, 20), null, 2)}

## External Context
${JSON.stringify(input.externalContext || {}, null, 2)}

Identify all patterns, anomalies, and signal quality. Return valid JSON only.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: PASS_1_SYSTEM,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  let parsed: { patterns: SignalPattern[]; signal_quality_score: number; summary: string };

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("[Pass1] Failed to parse Claude response:", e);
    parsed = {
      patterns: [],
      signal_quality_score: 0.5,
      summary: "Unable to analyze signals — raw response logged",
    };
  }

  return {
    ...parsed,
    raw_response: text,
    duration_ms: Date.now() - startTime,
  };
}
