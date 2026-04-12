'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { devBypass, DEV_BYPASS_ENABLED } from "@/lib/admin";

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  function handleGetStarted(plan) {
    if (DEV_BYPASS_ENABLED) {
      devBypass();
      router.push("/dashboard");
      return;
    }
    router.push(`/checkout?plan=${plan}`);
  }

  // Keyboard shortcut: Cmd/Ctrl + Shift + A → /admin
  useEffect(() => {
    function onKey(e) {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key &&
        e.key.toLowerCase() === "a"
      ) {
        window.location.href = "/admin";
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Sticky nav frost on scroll
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="mesh-bg"
      style={{
        minHeight: "100vh",
        color: "var(--text-bright)",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
      }}
    >
      {/* ============== Section A — Nav ============== */}
      <nav
        className={scrolled ? "nav-scrolled" : ""}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          transition: "all .25s",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "18px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "var(--emerald-bright)",
                boxShadow: "0 0 14px var(--emerald-glow)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "-0.015em",
                color: "var(--text-bright)",
              }}
            >
              Chatty.AI
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
            }}
          >
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#pricing" className="nav-link">
              Pricing
            </a>
            <a href="#telegram" className="nav-link">
              Telegram EA
            </a>
            <a href="#docs" className="nav-link">
              Docs
            </a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/admin" className="cta-ghost" style={{ padding: "10px 18px" }}>
              Sign in
            </Link>
            <button
              onClick={() => handleGetStarted("inbound")}
              className="cta-primary"
              style={{ padding: "10px 20px" }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ============== Section B — Hero ============== */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "80px 40px 120px",
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: 72,
          alignItems: "center",
        }}
      >
        <div>
          <div className="dark-pill" style={{ marginBottom: 28 }}>
            <span className="dot" />
            Live AI receptionist
          </div>

          <h1
            style={{
              fontSize: 68,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              margin: 0,
              fontWeight: 700,
              color: "var(--text-bright)",
            }}
          >
            The AI receptionist
            <br />
            your business never
            <br />
            knew it could{" "}
            <span
              style={{
                background:
                  "linear-gradient(120deg, var(--emerald-bright), #7cf5c4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              afford.
            </span>
          </h1>

          <p
            style={{
              marginTop: 28,
              fontSize: 18,
              lineHeight: 1.6,
              color: "var(--text-muted)",
              maxWidth: 560,
            }}
          >
            Chatty.AI answers every call, qualifies every lead, and books every
            appointment — for less than a single missed sale per month.
          </p>

          <div
            style={{
              marginTop: 38,
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => handleGetStarted("inbound")}
              className="cta-primary"
            >
              Start for $97/mo →
            </button>
            <a href="#features" className="cta-ghost">
              ▶ See it in action
            </a>
          </div>

          {/* Trust row */}
          <div
            style={{
              marginTop: 56,
              borderTop: "1px solid var(--dark-border)",
              paddingTop: 26,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Trusted by 200+ operators
            </div>
            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div className="logo-placeholder">HARBOR</div>
              <div className="logo-placeholder">NORTH&amp;CO</div>
              <div className="logo-placeholder">MERIDIAN</div>
              <div className="logo-placeholder">OAKLINE</div>
              <div className="logo-placeholder">ATLAS</div>
            </div>
          </div>
        </div>

        {/* Hero mockup card */}
        <div style={{ position: "relative" }}>
          <div
            className="dark-card glow-border"
            style={{ overflow: "hidden" }}
          >
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
                chatty.ai — live call feed
              </div>
            </div>

            <div
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <CallRow
                name="Mike Reynolds"
                time="2 min ago"
                meta="Cleaning booking"
                status="Booked"
              />
              <CallRow
                name="Sarah Chen"
                time="8 min ago"
                meta="New patient inquiry"
                status="Qualified"
              />
              <CallRow
                name="Priya Nair"
                time="14 min ago"
                meta="Follow-up appointment"
                status="Qualified"
              />

              <div
                style={{
                  marginTop: 6,
                  padding: "10px 12px",
                  background: "rgba(52,211,153,0.05)",
                  border: "1px dashed rgba(52,211,153,0.25)",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "var(--text-muted)",
                  textAlign: "center",
                }}
              >
                Chatty is online · 14 calls handled today
              </div>
            </div>
          </div>

          {/* Floating notification card */}
          <div
            className="dark-card"
            style={{
              position: "absolute",
              bottom: -36,
              left: -28,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow:
                "0 0 0 1px rgba(52,211,153,0.35), 0 20px 48px rgba(52,211,153,0.25)",
              maxWidth: 290,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background:
                  "linear-gradient(135deg, var(--emerald), var(--emerald-mid))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: "var(--emerald-bright)",
                flexShrink: 0,
              }}
            >
              📞
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-bright)",
                }}
              >
                New appointment booked
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                Mike R. · 2:30pm today
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== Section C — Features ============== */}
      <section
        id="features"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "80px 40px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div className="dark-pill" style={{ marginBottom: 18 }}>
            Built for operators
          </div>
          <h2
            style={{
              fontSize: 48,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              margin: 0,
              fontWeight: 700,
              color: "var(--text-bright)",
              maxWidth: 740,
              marginInline: "auto",
            }}
          >
            Three agents working
            <br />
            while you sleep.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          <FeatureCard
            icon="☎"
            title="Inbound Qualification"
            body="Every call answered in under 1 second. Leads scored, qualified, and routed straight into your calendar."
          />
          <FeatureCard
            icon="↗"
            title="Outbound Outreach"
            body="Wake up to a calendar full of appointments. Your AI dialed all night — follow-ups, cold lists, re-engagement."
          />
          <FeatureCard
            icon="✉"
            title="Telegram EA"
            body="Text your assistant. Get instant answers on calls, closes, and what's next — from anywhere, 24/7."
          />
        </div>
      </section>

      {/* ============== Section D — How it works ============== */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "80px 40px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="dark-pill" style={{ marginBottom: 18 }}>
            How it works
          </div>
          <h2
            style={{
              fontSize: 48,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              margin: 0,
              fontWeight: 700,
              color: "var(--text-bright)",
            }}
          >
            Live in under 10 minutes.
          </h2>
        </div>

        <div style={{ position: "relative" }}>
          {/* connecting line */}
          <div
            style={{
              position: "absolute",
              top: 24,
              left: "16.66%",
              right: "16.66%",
              height: 1,
              background:
                "linear-gradient(90deg, transparent, var(--emerald-mid), transparent)",
              zIndex: 0,
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 28,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Step
              num="01"
              title="Sign up & connect your number"
              body="Pick a plan, link your business phone, and Chatty starts routing your calls in minutes."
            />
            <Step
              num="02"
              title="Train your agent in 5 minutes"
              body="Tell Chatty about your business, upload your FAQ, and choose a voice. That's it."
            />
            <Step
              num="03"
              title="Watch appointments roll in"
              body="Chatty handles every call, books every lead, and keeps your calendar full on autopilot."
            />
          </div>
        </div>
      </section>

      {/* ============== Section E — Pricing ============== */}
      <section
        id="pricing"
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "100px 40px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div className="dark-pill" style={{ marginBottom: 18 }}>
            Simple pricing
          </div>
          <h2
            style={{
              fontSize: 48,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              margin: 0,
              fontWeight: 700,
              color: "var(--text-bright)",
            }}
          >
            Flat-rate. No per-minute games.
          </h2>
          <p
            style={{
              marginTop: 16,
              color: "var(--text-muted)",
              fontSize: 17,
              maxWidth: 540,
              marginInline: "auto",
            }}
          >
            Pick a tier. Unlimited usage. Cancel anytime.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 22,
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
            cta="Start with Inbound"
            onCtaClick={() => handleGetStarted("inbound")}
          />
          <PricingCard
            name="Inbound + Outbound"
            price="157"
            tagline="The complete voice operation."
            features={[
              "Everything in Inbound",
              "Outbound dialing",
              "AI cold outreach",
              "Multi-line scaling",
              "Priority support",
            ]}
            cta="Start with Both"
            onCtaClick={() => handleGetStarted("both")}
            popular
          />
        </div>
      </section>

      {/* ============== Section F — Social proof ============== */}
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "100px 40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, transparent, var(--emerald-mid), transparent)",
            marginBottom: 48,
          }}
        />
        <blockquote
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            fontSize: 34,
            lineHeight: 1.35,
            letterSpacing: "-0.01em",
            color: "var(--text-bright)",
            margin: 0,
            fontWeight: 500,
          }}
        >
          &ldquo;I used to dread the evenings because I knew I was missing
          calls. Now Chatty books them for me while I'm having dinner with my
          kids. It's paid for itself in the first week.&rdquo;
        </blockquote>
        <div
          style={{
            marginTop: 28,
            color: "var(--emerald-bright)",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          — Operator running 4 service businesses
        </div>
        <div
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, transparent, var(--emerald-mid), transparent)",
            marginTop: 48,
          }}
        />
      </section>

      {/* ============== Section G — Final CTA ============== */}
      <section
        style={{
          padding: "60px 40px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "72px 64px",
            borderRadius: 24,
            background:
              "linear-gradient(135deg, var(--emerald) 0%, var(--emerald-mid) 60%, #0a2d20 100%)",
            border: "1px solid rgba(52,211,153,0.3)",
            boxShadow:
              "0 0 0 1px rgba(52,211,153,0.15), 0 40px 120px rgba(15,61,46,0.5)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 0%, rgba(52,211,153,0.25), transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <h2
            style={{
              position: "relative",
              fontSize: 52,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              margin: 0,
              fontWeight: 700,
              color: "var(--text-bright)",
              maxWidth: 820,
              marginInline: "auto",
            }}
          >
            Stop missing calls.
            <br />
            Start booking appointments.
          </h2>
          <div
            style={{
              marginTop: 36,
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => handleGetStarted("inbound")}
              className="cta-primary"
            >
              Get Chatty.AI →
            </button>
          </div>
        </div>
      </section>

      {/* ============== Section H — Footer ============== */}
      <footer
        style={{
          borderTop: "1px solid var(--dark-border)",
          marginTop: 40,
          padding: "60px 40px 40px",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
            gap: 48,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "var(--emerald-bright)",
                  boxShadow: "0 0 12px var(--emerald-glow)",
                }}
              />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  color: "var(--text-bright)",
                }}
              >
                Chatty.AI
              </span>
            </div>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 13.5,
                lineHeight: 1.6,
                margin: 0,
                maxWidth: 300,
              }}
            >
              The always-on AI receptionist for operators who refuse to miss
              another call.
            </p>
          </div>

          <FooterCol
            title="Product"
            links={[
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "Telegram EA", href: "#telegram" },
              { label: "Dashboard", href: "/dashboard" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "About", href: "#" },
              { label: "Blog", href: "#" },
              { label: "Contact", href: "#" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { label: "Terms", href: "#" },
              { label: "Privacy", href: "#" },
              { label: "Security", href: "#" },
            ]}
          />
        </div>
        <div
          style={{
            maxWidth: 1280,
            margin: "40px auto 0",
            paddingTop: 22,
            borderTop: "1px solid var(--dark-border)",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          © 2026 Chatty.AI — Built for operators who hate missed calls.
        </div>
      </footer>
    </div>
  );
}

/* ============== Sub-components ============== */

function CallRow({ name, time, meta, status }) {
  return (
    <div className="call-row">
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, var(--emerald), var(--emerald-mid))",
          color: "var(--emerald-bright)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 13,
          flexShrink: 0,
          border: "1px solid var(--dark-border)",
        }}
      >
        {name
          .split(" ")
          .map((w) => w[0])
          .join("")}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--text-bright)",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "var(--text-muted)",
            marginTop: 1,
          }}
        >
          {meta} · {time}
        </div>
      </div>
      <span
        className={
          status === "Booked"
            ? "status-pill status-booked"
            : "status-pill status-qualified"
        }
      >
        {status}
      </span>
    </div>
  );
}

function FeatureCard({ icon, title, body }) {
  return (
    <div className="dark-card" style={{ padding: 32 }}>
      <div className="feature-icon">{icon}</div>
      <div
        style={{
          fontSize: 21,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          margin: "22px 0 10px",
          color: "var(--text-bright)",
        }}
      >
        {title}
      </div>
      <p
        style={{
          margin: 0,
          color: "var(--text-muted)",
          fontSize: 14.5,
          lineHeight: 1.6,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function Step({ num, title, body }) {
  return (
    <div style={{ textAlign: "left" }}>
      <div className="step-num">{num}</div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          margin: "22px 0 10px",
          color: "var(--text-bright)",
        }}
      >
        {title}
      </div>
      <p
        style={{
          margin: 0,
          color: "var(--text-muted)",
          fontSize: 14.5,
          lineHeight: 1.6,
          maxWidth: 320,
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
  onCtaClick,
  popular,
}) {
  return (
    <div
      className={`dark-card ${popular ? "glow-border" : ""}`}
      style={{
        padding: 40,
        position: "relative",
      }}
    >
      {popular ? (
        <div
          style={{
            position: "absolute",
            top: -14,
            right: 28,
            background: "var(--gold)",
            color: "#1a1f1a",
            fontSize: 10.5,
            fontWeight: 800,
            padding: "6px 14px",
            borderRadius: 999,
            letterSpacing: "0.1em",
            border: "1px solid rgba(201,169,97,0.5)",
            boxShadow: "0 8px 24px rgba(201,169,97,0.25)",
          }}
        >
          ⭐ MOST POPULAR
        </div>
      ) : null}

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {name}
      </div>

      <div
        style={{
          marginTop: 16,
          fontSize: 64,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color: "var(--text-bright)",
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "var(--text-muted)",
          }}
        >
          $
        </span>
        {price}
        <span
          style={{
            fontSize: 16,
            color: "var(--text-muted)",
            fontWeight: 500,
          }}
        >
          {" "}
          / mo
        </span>
      </div>

      <div
        style={{
          marginTop: 10,
          color: "var(--text-muted)",
          fontSize: 14.5,
        }}
      >
        {tagline}
      </div>

      <div
        style={{
          margin: "28px 0",
          borderTop: "1px solid var(--dark-border)",
        }}
      />

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px" }}>
        {features.map((f) => (
          <li key={f} className="pricing-row">
            <span className="check">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onCtaClick}
        className={popular ? "cta-primary" : "cta-ghost"}
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {cta} →
      </button>
    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "var(--text-bright)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      {links.map((l) => (
        <a key={l.label} href={l.href} className="footer-link">
          {l.label}
        </a>
      ))}
    </div>
  );
}
