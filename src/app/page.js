import Link from "next/link";
import MacWindow from "@/components/MacWindow";

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh" }}>
      {/* Top Nav */}
      <header
        style={{
          padding: "22px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 1240,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "var(--green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--gold)",
              fontWeight: 800,
              fontSize: 18,
              fontFamily: "Playfair Display, Georgia, serif",
            }}
          >
            C
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: 19,
              letterSpacing: "-0.01em",
            }}
          >
            Chatty<span className="gold-accent">.AI</span>
          </span>
        </div>
        <nav
          style={{
            display: "flex",
            gap: 28,
            alignItems: "center",
            fontSize: 14,
            color: "var(--ink-soft)",
            fontWeight: 500,
          }}
        >
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/checkout?plan=inbound" className="mac-btn">
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "40px 40px 80px",
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          gap: 48,
          alignItems: "center",
        }}
      >
        <div>
          <div
            className="pill pill-gold"
            style={{ marginBottom: 18 }}
          >
            Powered by ElevenLabs · Voice-first AI
          </div>
          <h1
            className="font-serif"
            style={{
              fontSize: 64,
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              margin: 0,
              color: "var(--ink)",
              fontWeight: 600,
            }}
          >
            Your AI Receptionist.
            <br />
            <span className="gold-accent">Always On.</span>
          </h1>
          <p
            style={{
              marginTop: 24,
              fontSize: 18,
              lineHeight: 1.6,
              color: "var(--ink-soft)",
              maxWidth: 540,
            }}
          >
            Chatty.AI answers every call, qualifies every lead, and books every
            appointment — starting at <strong>$97/month</strong>. No more missed
            calls. No more wasted evenings. Just booked revenue, on autopilot.
          </p>
          <div
            style={{ marginTop: 34, display: "flex", gap: 14, flexWrap: "wrap" }}
          >
            <Link href="/checkout?plan=inbound" className="mac-btn">
              Start Inbound — $97/mo
            </Link>
            <Link href="/checkout?plan=both" className="mac-btn-outline">
              Inbound + Outbound — $157/mo
            </Link>
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 13,
              color: "var(--ink-soft)",
              display: "flex",
              gap: 22,
              flexWrap: "wrap",
            }}
          >
            <span>✓ 7-day setup</span>
            <span>✓ No contracts</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>

        {/* Hero mockup — macOS window */}
        <MacWindow title="chatty.ai — live call">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                background: "var(--surface-2)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "var(--green)",
                  color: "var(--gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                AI
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  Incoming call · +1 (415) 555-0132
                </div>
                <div
                  style={{ fontSize: 12, color: "var(--ink-soft)" }}
                >
                  00:42 · Qualifying lead…
                </div>
              </div>
              <div className="pill pill-green">LIVE</div>
            </div>

            <div style={{ padding: "4px 4px" }}>
              <Bubble who="agent" text="Hi, thanks for calling Harbor Dental. This is Chatty — how can I help you today?" />
              <Bubble who="user" text="I'd like to book a cleaning." />
              <Bubble who="agent" text="Absolutely. Are you a new or returning patient?" />
              <Bubble who="user" text="New patient." />
              <Bubble
                who="agent"
                text="Perfect. I have Tuesday 2:30pm or Thursday 10am. Which works better?"
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                paddingTop: 8,
                borderTop: "1px solid var(--border)",
                marginTop: 4,
              }}
            >
              <div className="pill pill-gold">Appointment booked</div>
              <div className="pill">Synced to calendar</div>
            </div>
          </div>
        </MacWindow>
      </section>

      {/* Features */}
      <section
        id="features"
        style={{
          background: "var(--surface-2)",
          padding: "80px 40px",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="pill pill-green">What Chatty does</div>
            <h2
              className="font-serif"
              style={{
                fontSize: 44,
                margin: "16px 0 12px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Three agents. One flat price.
            </h2>
            <p
              style={{
                color: "var(--ink-soft)",
                fontSize: 17,
                maxWidth: 620,
                margin: "0 auto",
              }}
            >
              Every Chatty workspace ships with a voice receptionist, an
              outbound closer, and a Telegram executive assistant.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 22,
            }}
          >
            <FeatureCard
              icon="☎"
              title="Inbound Qualification"
              body="Every call answered in under one ring. Chatty asks the right questions, qualifies the caller, and books them straight into your calendar."
            />
            <FeatureCard
              icon="↗"
              title="Outbound Outreach"
              body="Feed Chatty a list, she calls it. Dials leads, follows up on no-shows, and re-engages old contacts with natural, human-sounding voice."
            />
            <FeatureCard
              icon="✦"
              title="Telegram EA"
              body="Ask 'how many calls today?' from your phone. Chatty replies in plain English — your executive assistant, 24/7 in your pocket."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "90px 40px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 54 }}>
            <div className="pill pill-gold">Pricing</div>
            <h2
              className="font-serif"
              style={{
                fontSize: 44,
                margin: "16px 0 12px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Simple. Flat. Old-money honest.
            </h2>
            <p
              style={{
                color: "var(--ink-soft)",
                fontSize: 17,
                maxWidth: 560,
                margin: "0 auto",
              }}
            >
              No per-minute fees. No usage caps. Pick the plan that fits your
              operation.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
            }}
          >
            <PricingCard
              name="Inbound"
              price="97"
              tagline="The always-on receptionist."
              features={[
                "Unlimited inbound calls",
                "Lead qualification",
                "Calendar booking",
                "Call recordings & transcripts",
                "Telegram EA included",
              ]}
              cta="Start Inbound"
              ctaHref="/checkout?plan=inbound"
            />
            <PricingCard
              name="Inbound + Outbound"
              price="157"
              tagline="The complete voice operation."
              features={[
                "Everything in Inbound",
                "Outbound dialer",
                "Lead list uploads",
                "Follow-up sequences",
                "Priority support",
              ]}
              cta="Start Full Suite"
              ctaHref="/checkout?plan=both"
              recommended
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "40px",
          borderTop: "1px solid var(--border)",
          background: "var(--surface-2)",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 13,
            color: "var(--ink-soft)",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            © {new Date().getFullYear()} Chatty.AI · Built for operators who
            hate missed calls.
          </div>
          <div style={{ display: "flex", gap: 22 }}>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <Link href="/dashboard">Dashboard</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Bubble({ who, text }) {
  const isAgent = who === "agent";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isAgent ? "flex-start" : "flex-end",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          padding: "9px 13px",
          borderRadius: 14,
          background: isAgent ? "var(--surface-2)" : "var(--green)",
          color: isAgent ? "var(--ink)" : "#fff",
          fontSize: 13.5,
          lineHeight: 1.45,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, body }) {
  return (
    <div className="mac-card" style={{ padding: 28 }}>
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: "var(--green)",
          color: "var(--gold)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          marginBottom: 18,
        }}
      >
        {icon}
      </div>
      <div
        className="font-serif"
        style={{ fontSize: 24, fontWeight: 600, marginBottom: 10 }}
      >
        {title}
      </div>
      <p
        style={{
          color: "var(--ink-soft)",
          fontSize: 14.5,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  tagline,
  features,
  cta,
  ctaHref,
  recommended,
}) {
  return (
    <div
      className={`mac-card ${recommended ? "gold-border" : ""}`}
      style={{
        padding: 36,
        position: "relative",
      }}
    >
      {recommended ? (
        <div
          style={{
            position: "absolute",
            top: -12,
            right: 24,
            background: "var(--gold)",
            color: "var(--green-deep)",
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 12px",
            borderRadius: 999,
            letterSpacing: "0.06em",
          }}
        >
          RECOMMENDED
        </div>
      ) : null}
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--ink-soft)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {name}
      </div>
      <div
        className="font-serif"
        style={{
          marginTop: 14,
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        <span style={{ fontSize: 28, color: "var(--ink-soft)" }}>$</span>
        {price}
        <span
          style={{
            fontSize: 16,
            color: "var(--ink-soft)",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
          }}
        >
          {" "}
          / mo
        </span>
      </div>
      <div
        style={{
          marginTop: 8,
          color: "var(--ink-soft)",
          fontSize: 15,
        }}
      >
        {tagline}
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "26px 0 30px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {features.map((f) => (
          <li
            key={f}
            style={{
              display: "flex",
              gap: 10,
              fontSize: 14.5,
              color: "var(--ink)",
            }}
          >
            <span className="gold-accent" style={{ fontWeight: 700 }}>
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className="mac-btn"
        style={{ display: "block", textAlign: "center" }}
      >
        {cta}
      </Link>
    </div>
  );
}
