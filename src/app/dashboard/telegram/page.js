'use client';

export default function TelegramPage() {
  const handleConnect = () => {
    console.log("[stub] Connect Telegram clicked");
    alert("Telegram integration comes in the next prompt. (Stub)");
  };

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
          Telegram EA
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
          Your executive assistant, on Telegram.
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Ask Chatty anything from your phone. She replies in plain English.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          gap: 22,
        }}
      >
        {/* Setup Card */}
        <div className="dark-card" style={{ padding: 28 }}>
          <div className="feature-icon" style={{ marginBottom: 18 }}>
            ✉
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              marginBottom: 8,
              color: "var(--text-bright)",
            }}
          >
            Connect Telegram
          </div>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: 14.5,
              lineHeight: 1.6,
              margin: "0 0 20px",
            }}
          >
            Link your Telegram account to receive call summaries, book
            appointments, and ask questions like{" "}
            <em>&quot;how many calls today?&quot;</em> — all from your pocket.
          </p>
          <button onClick={handleConnect} className="cta-primary">
            Connect Telegram →
          </button>

          <div
            style={{
              borderTop: "1px solid var(--dark-border)",
              margin: "26px 0 20px",
            }}
          />

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 14,
            }}
          >
            What you can ask
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontSize: 14,
              color: "var(--text-bright)",
            }}
          >
            <li>
              <span
                style={{
                  color: "var(--emerald-bright)",
                  fontWeight: 700,
                }}
              >
                ✓
              </span>{" "}
              &quot;How many calls today?&quot;
            </li>
            <li>
              <span
                style={{
                  color: "var(--emerald-bright)",
                  fontWeight: 700,
                }}
              >
                ✓
              </span>{" "}
              &quot;What&apos;s my next appointment?&quot;
            </li>
            <li>
              <span
                style={{
                  color: "var(--emerald-bright)",
                  fontWeight: 700,
                }}
              >
                ✓
              </span>{" "}
              &quot;Reschedule Mike to Thursday.&quot;
            </li>
            <li>
              <span
                style={{
                  color: "var(--emerald-bright)",
                  fontWeight: 700,
                }}
              >
                ✓
              </span>{" "}
              &quot;Who missed their appointment today?&quot;
            </li>
          </ul>
        </div>

        {/* Example chat — dark window chrome */}
        <div className="dark-card glow-border" style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "12px 16px",
              borderBottom: "1px solid var(--dark-border)",
              background: "rgba(10,15,13,0.5)",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#ff5f57",
                display: "inline-block",
              }}
            />
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#febc2e",
                display: "inline-block",
              }}
            />
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#28c840",
                display: "inline-block",
              }}
            />
            <div
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
                marginRight: 48,
              }}
            >
              telegram — chatty
            </div>
          </div>

          <div
            style={{
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <Bubble who="user" text="How many calls today?" />
            <Bubble
              who="agent"
              text="You've had 14 inbound calls and 6 booked appointments. Your next appointment is at 2:30pm with Mike Reynolds."
            />
            <Bubble who="user" text="Any no-shows?" />
            <Bubble
              who="agent"
              text="One — James Walker didn't complete qualification this morning. Want me to call him back?"
            />
            <Bubble who="user" text="Yes please." />
            <Bubble
              who="agent"
              text="Queued. I'll call James at 3:15pm and let you know what happens."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ who, text }) {
  const isAgent = who === "agent";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isAgent ? "flex-start" : "flex-end",
      }}
    >
      <div
        style={{
          maxWidth: "82%",
          padding: "10px 14px",
          borderRadius: 16,
          background: isAgent
            ? "var(--dark-surface-2)"
            : "rgba(52,211,153,0.15)",
          color: isAgent ? "var(--text-bright)" : "var(--text-bright)",
          fontSize: 13.5,
          lineHeight: 1.5,
          borderBottomLeftRadius: isAgent ? 4 : 16,
          borderBottomRightRadius: isAgent ? 16 : 4,
          borderLeft: isAgent
            ? "2px solid var(--emerald-bright)"
            : "none",
          border: isAgent
            ? undefined
            : "1px solid rgba(52,211,153,0.25)",
        }}
      >
        {text}
      </div>
    </div>
  );
}
