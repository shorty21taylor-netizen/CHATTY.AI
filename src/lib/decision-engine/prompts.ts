// Decision Engine Prompts — 3-Pass Claude Chain

export const SYSTEM_PROMPT = `You are the Decision Engine for Chatty AI, an AI Operating System for home service contractors (roofing, HVAC, solar, exteriors, remodeling). Your job is to analyze business signals and produce actionable daily intelligence. You think like a world-class business strategist.`;

export const PASS_1_SIGNAL_ANALYSIS = `## Pass 1: Signal Analysis
Analyze business signals from the past 24h. Identify inbound opportunities, quality indicators, risk signals, anomalies, and pipeline status. Assign confidence scores (0.0–1.0).

Signals: {signal_summary}
Recent Events: {recent_events}
External: {external_context}

Respond with JSON: {"patterns":[{"category":"...","description":"...","confidence":0.0,"supporting_signals":[],"severity":"..."}],"overall_signal_health":"...","total_signals_analyzed":0,"timestamp":"..."}`;

export const PASS_2_PATTERN_RECOGNITION = `## Pass 2: Pattern Recognition
Given Pass 1 analysis, reason about what patterns mean and what highest-ROI actions to take.

Pass 1: {pass1_output}
History: {previous_briefs}
Vertical: {vertical}

Respond with JSON: {"decisions":[{"action":"...","rationale":"...","expected_impact":"...","priority":"...","category":"...","confidence":0.0}],"bottleneck_analysis":"...","trend_summary":"...","confidence":0.0,"timestamp":"..."}`;

export const PASS_3_BRIEF_GENERATION = `## Pass 3: Daily Brief Generation
Draft a concise Daily Brief for a {vertical} contractor. Delivered via SMS at 6am. Max 3-5 bullets, each: ACTION + WHY + IMPACT.

Decisions: {pass2_output}
Operator: {operator_name}
Date: {date}

Respond with JSON: {"brief_text":"...","recommendations":[{"action":"...","why":"...","expected_impact":"...","priority":"...","category":"..."}],"voice_text":"...","subject_line":"...","priority":"...","timestamp":"..."}`;
