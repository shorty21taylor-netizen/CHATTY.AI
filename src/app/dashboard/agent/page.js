export default function AgentSettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div className="t-eyebrow">Agent</div>
        <h1 className="t-h1" style={{ margin: "8px 0 6px" }}>
          Agent settings
        </h1>
        <p className="t-body" style={{ color: "var(--text-muted)", margin: 0 }}>
          Voice, persona, greeting script, and escalation rules.
        </p>
      </div>

      <div className="dark-card" style={{ padding: 30 }}>
        <div className="t-h2" style={{ marginBottom: 6 }}>
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
