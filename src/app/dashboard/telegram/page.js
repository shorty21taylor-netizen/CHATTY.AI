'use client';

import MacWindow from "@/components/MacWindow";

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
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Telegram EA
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
          Your executive assistant, on Telegram.
        </h1>
        <div style={{ color: "var(--ink-soft)", fontSize: 15 }}>
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
        <div className="mac-card" style={{ padding: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "var(--green)",
              color: "var(--gold)",
              fontSize: 26,
              marginBottom: 18,
            }}
          >
            ✉
          </div>
          <div
            className="font-serif"
            style={{ fontSize: 26, fontWeight: 600, marginBottom: 8 }}
          >
            Connect Telegram
          </div>
          <p
            style={{
              color: "var(--ink-soft)",
              fontSize: 14.5,
              lineHeight: 1.6,
              margin: "0 0 20px",
            }}
          >
            Link your Telegram account to receive call summaries, book
            appointments, and ask questions like{" "}
            <em>"how many calls today?"</em> — all from your pocket.
          </p>
          <button onClick={handleConnect} className="mac-btn">
            Connect Telegram →
          </button>

          <div
            className="soft-divider"
            style={{ margin: "26px 0 20px" }}
          />

          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
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
              color: "var(--ink)",
            }}
          >
            <li>
              <span className="gold-accent" style={{ fontWeight: 700 }}>
                ✓
              </span>{" "}
              "How many calls today?"
            </li>
            <li>
              <span className="gold-accent" style={{ fontWeight: 700 }}>
                ✓
              </span>{" "}
              "What's my next appointment?"
            </li>
            <li>
              <span className="gold-accent" style={{ fontWeight: 700 }}>
                ✓
              </span>{" "}
              "Reschedule Mike to Thursday."
            </li>
            <li>
              <span className="gold-accent" style={{ fontWeight: 700 }}>
                ✓
              </span>{" "}
              "Who missed their appointment today?"
            </li>
          </ul>
        </div>

        {/* Example chat */}
        <MacWindow title="telegram — chatty">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 4,
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
        </MacWindow>
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
          background: isAgent ? "var(--surface-2)" : "var(--green)",
          color: isAgent ? "var(--ink)" : "#fff",
          fontSize: 13.5,
          lineHeight: 1.5,
          borderBottomLeftRadius: isAgent ? 4 : 16,
          borderBottomRightRadius: isAgent ? 16 : 4,
        }}
      >
        {text}
      </div>
    </div>
  );
}
