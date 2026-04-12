export default function AgentSettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          Agent
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 36,
            fontWeight: 600,
            margin: "6px 0 4px",
            letterSpacing: "-0.02em",
            color: "var(--text-bright)",
          }}
        >
          Agent settings
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Voice, persona, greeting script, and escalation rules.
        </div>
      </div>

      <div className="dark-card" style={{ padding: 30 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            marginBottom: 6,
            color: "var(--text-bright)",
          }}
        >
          Coming soon
        </div>
        <p
          style={{
            color: "var(--text-muted)",
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
