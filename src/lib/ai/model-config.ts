/**
 * Central registry for Claude model IDs.
 *
 * All Anthropic API calls in Chatty AI MUST import from this file instead of
 * hardcoding model strings. When Anthropic ships a new generation, update the
 * constants here and every call site picks it up on the next deploy.
 *
 * Why this exists:
 * - Model IDs drift. Before PR T, Pass 1 of the decision engine was pinned to
 *   an older Sonnet string and silently fell back to a different model at
 *   runtime. Centralizing eliminates that class of bug.
 * - Different surfaces need different tiers (Sonnet for reasoning, Haiku for
 *   high-volume I/O). Naming those tiers once here keeps call sites readable.
 */

/**
 * Raw model IDs, grouped by tier. Prefer the semantic aliases below at call
 * sites unless you explicitly need a specific tier.
 */
export const CLAUDE_MODELS = {
  /** Primary reasoning model. Used for decision engine, agent replies, cadence steps. */
  SONNET: "claude-sonnet-4-6",
  /** High-volume / low-latency model. Used for EA agent, notification fan-out. */
  HAIKU: "claude-haiku-4-5-20251001",
  /** Reserved for high-stakes deliberation. Not currently in the hot path. */
  OPUS: "claude-opus-4-6",
} as const;

export type ClaudeModel = (typeof CLAUDE_MODELS)[keyof typeof CLAUDE_MODELS];

/**
 * Semantic aliases. Prefer these at call sites so the purpose of each call is
 * visible from the imports alone.
 */

/** Decision engine 3-pass chain (signal analysis → pattern recognition → brief). */
export const DECISION_ENGINE_MODEL: ClaudeModel = CLAUDE_MODELS.SONNET;

/** Inbound reply drafting by outbound/inbound agents. */
export const AGENT_REPLY_MODEL: ClaudeModel = CLAUDE_MODELS.SONNET;

/** Agent run — full conversation turns with tool use. */
export const AGENT_RUN_MODEL: ClaudeModel = CLAUDE_MODELS.SONNET;

/** Cadence step execution — scheduled outbound touches inside a cadence. */
export const CADENCE_STEP_MODEL: ClaudeModel = CLAUDE_MODELS.SONNET;

/** Executive Assistant (Telegram) agent — high-volume, low-latency. */
export const EA_AGENT_MODEL: ClaudeModel = CLAUDE_MODELS.HAIKU;
