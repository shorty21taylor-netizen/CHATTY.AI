export default function AgentSettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Agent
        </div>
        <h1
          className="font-serif"
          style={{
            fontSize: 36,
            fontWeight: 600,
            margin: "6px 0 4px",
            letterSpacing: "-0.02em",
          }}
        >
          Agent settings
        </h1>
        <div style={{ color: "var(--ink-soft)", fontSize: 15 }}>
          Voice, persona, greeting script, and escalation rules.
        </div>
      </div>

      <div className="mac-card" style={{ padding: 30 }}>
        <div
          className="font-serif"
          style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}
        >
          Coming soon
        </div>
        <p
          style={{
            color: "var(--ink-soft)",
            fontSize: 14.5,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Voice selection, greeting script editing, and ElevenLabs integration
          ship in the next prompt.
        </p>
      </div>
    </div>
  );
}
