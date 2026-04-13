import Anthropic from "@anthropic-ai/sdk";
import { PASS_1_SYSTEM, buildPass1Prompt } from "./prompts";

export interface Pass1Input {
  orgId: string;
  signalSummary: Record<string, unknown>;
  recentEvents: Record<string, unknown>[];
  externalContext?: Record<string, unknown>;
  orgVertical?: string;
}

export interface SignalPattern {
  type: "opportunity" | "risk" | "trend" | "anomaly";
  signal: string;
  confidence: number;
  data_points: string[];
}

export interface Pass1RiskFlag {
  risk: string;
  severity: "critical" | "high" | "medium" | "low";
  mitigation: string;
}

export interface Pass1Anomaly {
  metric: string;
  expected: number | string;
  actual: number | string;
  significance: string;
}

export interface Pass1Output {
  patterns: SignalPattern[];
  risk_flags?: Pass1RiskFlag[];
  anomalies?: Pass1Anomaly[];
  signal_quality_score: number;
  summary: string;
  raw_response?: string;
  duration_ms: number;
  used_mock: boolean;
}

/**
 * Mock pass-1 output — 3 realistic roofing patterns, 1 risk, 1 anomaly.
 * Used when ANTHROPIC_API_KEY is absent (local dev / pre-wiring) or the
 * real Claude call throws. The shape matches the schema in PASS_1_SYSTEM.
 */
function mockPass1Output(): Omit<Pass1Output, "duration_ms" | "used_mock"> {
  return {
    patterns: [
      {
        type: "opportunity",
        signal:
          "Google LSA inbound lead velocity is +28% WoW, concentrated on storm-damage roof inquiries",
        confidence: 0.86,
        data_points: [
          "11 new LSA leads in last 24h vs 7-day avg of 8.6",
          "9 of 11 tagged 'storm damage' in intake notes",
          "Avg response time: 47m (baseline 15m) — speed-to-lead is the unlock",
        ],
      },
      {
        type: "trend",
        signal:
          "Facebook storm-season creative CPL dropped 22% — buying window is open for 4-6 days",
        confidence: 0.78,
        data_points: [
          "CPL $42 vs 7-day avg $54",
          "CTR 6.8% (baseline 4.1%)",
          "Impression share up 41% on 'storm damage roofing' keywords",
        ],
      },
      {
        type: "trend",
        signal:
          "Roofing estimates are taking longer to move from draft → sent (median 3.4d, up from 1.8d)",
        confidence: 0.72,
        data_points: [
          "6 estimates currently in 'draft' >48h",
          "2 estimates in 'quoted' >72h with no interaction",
          "Weighted pipeline at risk: ~$38k",
        ],
      },
    ],
    risk_flags: [
      {
        risk: "NWS severe thunderstorm watch crossing service area tomorrow 2-4pm",
        severity: "high",
        mitigation:
          "Reroute Thompson and Patel tear-offs; notify crew by 7am",
      },
    ],
    anomalies: [
      {
        metric: "inbound_response_time_minutes",
        expected: 15,
        actual: 47,
        significance: "3x baseline — likely the single biggest conversion leak",
      },
    ],
    signal_quality_score: 0.83,
    summary:
      "Inbound lead flow is strong but speed-to-lead has regressed sharply; estimates are stalling and weather is a near-term revenue risk.",
  };
}

/**
 * Run Pass 1: Signal Analysis.
 *
 * TODO (Thursday): When `ANTHROPIC_API_KEY` is wired in Railway, the live
 * Claude path below runs. Until then we log the prompt and return a realistic
 * mock so downstream passes, the Inngest workflow, and Mission Control all
 * render useful data.
 */
export async function runPass1(input: Pass1Input): Promise<Pass1Output> {
  const startTime = Date.now();

  const prompt = buildPass1Prompt({
    signalSummary: input.signalSummary,
    recentEvents: input.recentEvents,
    orgVertical: input.orgVertical ?? "home_services",
    externalContext: input.externalContext,
  });

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      `[Pass1] Mock mode (no ANTHROPIC_API_KEY). Prompt size: ${prompt.length} chars`
    );
    return {
      ...mockPass1Output(),
      duration_ms: Date.now() - startTime,
      used_mock: true,
    };
  }

  // TODO (Thursday): verify claude-sonnet-4-6 model name on production key,
  //                  stream responses for faster first-token, and move the
  //                  Anthropic client into src/lib/ai/anthropic.ts so all
  //                  passes share one instance with tracing middleware.
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const userMessage = prompt.split("\n\n---\n\n")[1] ?? prompt;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: PASS_1_SYSTEM,
      messages: [{ role: "user", content: userMessage }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in Claude response");
    const parsed = JSON.parse(jsonMatch[0]) as Omit<
      Pass1Output,
      "duration_ms" | "used_mock" | "raw_response"
    >;

    return {
      ...parsed,
      raw_response: text,
      duration_ms: Date.now() - startTime,
      used_mock: false,
    };
  } catch (err) {
    console.error("[Pass1] Claude call failed, falling back to mock:", err);
    return {
      ...mockPass1Output(),
      duration_ms: Date.now() - startTime,
      used_mock: true,
    };
  }
}
