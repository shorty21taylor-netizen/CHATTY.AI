import Anthropic from "@anthropic-ai/sdk";
import { PASS_2_SYSTEM, buildPass2Prompt } from "./prompts";
import type { Pass1Output } from "./pass-1-signal-analysis";

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

export interface TopROIAction {
  action: string;
  estimated_value: string;
  timeframe: string;
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
  top_roi_action?: TopROIAction;
  market_condition?: string;
  raw_response?: string;
  duration_ms: number;
  used_mock: boolean;
}

function mockPass2Output(): Omit<Pass2Output, "duration_ms" | "used_mock"> {
  return {
    diagnosis: {
      primary_bottleneck: "Speed-to-lead on inbound Google LSA calls",
      bottleneck_severity: "high",
      explanation:
        "Average response time has tripled to 47m. Historically this operator wins 62% of <15m responses vs. 19% of >4h. The funnel is not the problem — conversion of existing inbound is.",
    },
    recommendations: [
      {
        action: "Run a 1-hour callback sprint on today's 3 oldest LSA leads",
        why: "Those leads have been sitting >4h; each additional hour drops close probability ~35%.",
        expected_impact: "+$12.4k pipeline, 1-2 booked site visits",
        priority: "high",
        effort: "quick_win",
      },
      {
        action: "Move Miller roof estimate from draft → sent today",
        why: "Draft for 5 days; customer is actively shopping competitors on HomeAdvisor.",
        expected_impact: "Recover $18.7k job at ~45% margin",
        priority: "high",
        effort: "quick_win",
      },
      {
        action:
          "Reroute Thompson and Patel tear-offs around the 2-4pm storm cell tomorrow",
        why: "NWS severe thunderstorm watch overlaps both scheduled outdoor jobs.",
        expected_impact: "Avoid ~$4k rework cost and one negative review",
        priority: "high",
        effort: "half_day",
      },
      {
        action: "Enable the Facebook 'storm-season' creative for 5 days",
        why: "CPL has dropped 22% and weather tailwinds persist 4-6 days.",
        expected_impact: "~8 qualified leads at <$48 CPL",
        priority: "medium",
        effort: "quick_win",
      },
    ],
    risk_flags: [
      {
        risk: "Two estimates aging past 72h in 'quoted' status",
        severity: "medium",
        mitigation: "Schedule follow-up interactions today; decay curve steepens at day 4.",
      },
    ],
    opportunities: [
      {
        opportunity: "Four accepted estimates not yet converted to jobs",
        potential_value: "$54,200",
        action_required:
          "Schedule crews and move each to 'scheduled' in the CRM by EOD.",
      },
    ],
    top_roi_action: {
      action: "Callback sprint on stale LSA leads",
      estimated_value: "$12,400",
      timeframe: "next 60 minutes",
    },
    market_condition:
      "Storm-season tailwind across the southern service area is driving unusually low Facebook CPL and a spike in 'storm damage' search intent.",
  };
}

/**
 * Run Pass 2: Pattern Recognition.
 *
 * TODO (Thursday): Same wiring as Pass 1 — mock is used until
 * ANTHROPIC_API_KEY is present. Revisit model name + tool-use structure
 * once we move to Anthropic SDK's JSON mode.
 */
export async function runPass2(
  pass1Output: Pass1Output,
  previousBriefs: Record<string, unknown>[] = [],
  profileContext?: string,
): Promise<Pass2Output> {
  const startTime = Date.now();

  const prompt = buildPass2Prompt(
    pass1Output as unknown as Record<string, unknown>,
    previousBriefs,
    profileContext,
  );

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      `[Pass2] Mock mode (no ANTHROPIC_API_KEY). Prompt size: ${prompt.length} chars`
    );
    return {
      ...mockPass2Output(),
      duration_ms: Date.now() - startTime,
      used_mock: true,
    };
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    const userMessage = prompt.split("\n\n---\n\n")[1] ?? prompt;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      system: PASS_2_SYSTEM,
      messages: [{ role: "user", content: userMessage }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in Claude response");
    const parsed = JSON.parse(jsonMatch[0]) as Omit<
      Pass2Output,
      "duration_ms" | "used_mock" | "raw_response"
    >;

    return {
      ...parsed,
      raw_response: text,
      duration_ms: Date.now() - startTime,
      used_mock: false,
    };
  } catch (err) {
    console.error("[Pass2] Claude call failed, falling back to mock:", err);
    return {
      ...mockPass2Output(),
      duration_ms: Date.now() - startTime,
      used_mock: true,
    };
  }
}
