import Anthropic from "@anthropic-ai/sdk";
import { DECISION_ENGINE_MODEL } from "@/lib/ai/model-config";
import { PASS_3_SYSTEM, buildPass3Prompt } from "./prompts";
import type { Pass2Output } from "./pass-2-pattern-recognition";
import { getTemplatesForBrief, mapServiceTypeToIndustry } from "@/lib/industry-prompts/registry";
import { getCategoryConfidence, formatConfidenceContext } from "./confidence";

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
  priority?: "high" | "medium" | "low";
}

export interface Pass3Output {
  brief: DailyBrief;
  raw_response?: string;
  duration_ms: number;
  used_mock: boolean;
}

function mockBrief(operatorName: string): DailyBrief {
  return {
    headline: `${operatorName}, speed-to-lead is the single biggest lever today.`,
    priority: "high",
    actions: [
      {
        priority: "high",
        action: "Call back the 3 oldest LSA leads within the hour",
        why: "Each is >4h old; conversion drops 35% per extra hour.",
        expected_impact: "+$12.4k pipeline",
      },
      {
        priority: "high",
        action: "Push the Miller roof estimate from draft to sent",
        why: "Stalled 5 days; customer actively shopping competitors.",
        expected_impact: "Recover $18.7k job at ~45% margin",
      },
      {
        priority: "high",
        action: "Reroute tomorrow's 2-4pm outdoor jobs around the storm cell",
        why: "NWS severe thunderstorm watch overlaps Thompson + Patel tear-offs.",
        expected_impact: "Avoid ~$4k rework",
      },
      {
        priority: "medium",
        action: "Enable the storm-season Facebook creative",
        why: "CPL -22% and tailwinds persist 4-6 days.",
        expected_impact: "~8 qualified leads at <$48 CPL",
      },
    ],
    risk_flag: {
      active: true,
      message:
        "Severe thunderstorm watch crossing the southern service area tomorrow 2-4pm.",
    },
    opportunity: {
      message: "Four accepted estimates not yet scheduled as jobs.",
      potential_value: "$54,200",
    },
    metric_of_the_day: {
      name: "Speed-to-lead",
      value: "47m",
      trend: "down",
      context:
        "Response time is 3x baseline. Historically this operator wins 62% of <15m responses.",
    },
    voice_summary: `Good morning ${operatorName}. The biggest win today is speed-to-lead: three LSA inquiries are sitting more than four hours without a callback, and every extra hour cuts close probability by about a third. Second, push the Miller roof estimate from draft to sent before lunch — it's been sitting five days and they're shopping around. Third, keep an eye on tomorrow afternoon's storm cell; Thompson and Patel's tear-offs need a reschedule. You've got four accepted estimates waiting to turn into scheduled jobs — that's about fifty-four thousand in revenue sitting idle. Handle the callback sprint first, then the Miller quote. You've got this.`,
  };
}

/**
 * Run Pass 3: Brief Generation.
 *
 * TODO (Thursday): When ANTHROPIC_API_KEY is set, the live Claude path
 * produces the 6am SMS brief + voice summary. Until then we return a
 * polished mock so Mission Control and the SMS preview both look real.
 */
export async function runPass3(
  pass2Output: Pass2Output,
  operatorName = "Operator",
  vertical?: string,
  orgId?: string,
): Promise<Pass3Output> {
  const startTime = Date.now();

  let industryTemplates: Record<string, string> = {};
  try {
    const industry = mapServiceTypeToIndustry(vertical ?? "roofing");
    industryTemplates = await getTemplatesForBrief(industry);
  } catch (err) {
    console.warn("[Pass3] Could not load industry templates:", err);
  }

  let confidenceCtx = "";
  if (orgId) {
    try {
      const categories = await getCategoryConfidence(orgId);
      confidenceCtx = formatConfidenceContext(categories);
    } catch {}
  }

  const prompt = buildPass3Prompt(
    pass2Output as unknown as Record<string, unknown>,
    operatorName,
    industryTemplates,
    confidenceCtx,
  );

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      `[Pass3] Mock mode (no ANTHROPIC_API_KEY). Vertical=${vertical ?? "home_services"}. Prompt size: ${prompt.length} chars`
    );
    return {
      brief: mockBrief(operatorName),
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
      model: DECISION_ENGINE_MODEL,
      max_tokens: 2000,
      system: PASS_3_SYSTEM,
      messages: [{ role: "user", content: userMessage }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in Claude response");
    const parsed = JSON.parse(jsonMatch[0]) as DailyBrief;

    return {
      brief: parsed,
      raw_response: text,
      duration_ms: Date.now() - startTime,
      used_mock: false,
    };
  } catch (err) {
    console.error("[Pass3] Claude call failed, falling back to mock:", err);
    return {
      brief: mockBrief(operatorName),
      duration_ms: Date.now() - startTime,
      used_mock: true,
    };
  }
}
