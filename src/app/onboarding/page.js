'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Home,
  Wrench,
  Flame,
  Droplet,
  Plug,
  Sun,
  MoreHorizontal,
} from "lucide-react";
import MacWindow from "@/components/MacWindow";

const TRADES = [
  { id: "general-contractor", label: "General Contractor", Icon: Building2 },
  { id: "remodeler", label: "Home Remodeler", Icon: Home },
  { id: "roofer", label: "Roofer", Icon: Wrench },
  { id: "hvac", label: "HVAC", Icon: Flame },
  { id: "plumber", label: "Plumber", Icon: Droplet },
  { id: "electrician", label: "Electrician", Icon: Plug },
  { id: "solar", label: "Solar", Icon: Sun },
  { id: "other", label: "Other", Icon: MoreHorizontal },
];

const VOICES = [
  { id: "ava-warm", label: "Ava — Warm & Professional (Female, American)" },
  { id: "miles-calm", label: "Miles — Calm & Confident (Male, American)" },
  { id: "clara-bright", label: "Clara — Bright & Friendly (Female, British)" },
  { id: "theo-deep", label: "Theo — Deep & Reassuring (Male, British)" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = trade, 2 = workspace
  const [trade, setTrade] = useState(null);
  const [form, setForm] = useState({
    businessName: "",
    phoneNumber: "",
    agentName: "Chatty",
    voice: "ava-warm",
    greeting:
      "Hi, thanks for calling [Business Name]. This is Chatty — how can I help you today?",
  });

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  function pickTrade(id) {
    setTrade(id);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("chatty_industry", id);
      } catch (e) {
        // ignore storage errors
      }
    }
    setStep(2);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("[stub] Create workspace:", { trade, ...form });
    router.push("/dashboard");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div style={{ width: "100%", maxWidth: 760 }}>
        <Link
          href="/"
          style={{
            fontSize: 13,
            color: "var(--ink-soft)",
            fontWeight: 500,
          }}
        >
          ← Back to home
        </Link>

        {step === 1 ? (
          <TradeSelector onPick={pickTrade} />
        ) : (
          <WorkspaceForm
            trade={trade}
            form={form}
            update={update}
            onSubmit={handleSubmit}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </main>
  );
}

function TradeSelector({ onPick }) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--ink-soft)",
          marginTop: 24,
        }}
      >
        Step 1 of 2
      </div>
      <h1
        style={{
          fontSize: 40,
          fontWeight: 700,
          marginTop: 10,
          marginBottom: 8,
          letterSpacing: "-0.02em",
        }}
      >
        What&apos;s your trade?
      </h1>
      <p
        style={{
          color: "var(--ink-soft)",
          marginBottom: 28,
          fontSize: 15,
        }}
      >
        So Chatty can load the right scripts, objections, and follow-up cadence.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        {TRADES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            style={{
              padding: "22px 16px",
              borderRadius: 14,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              textAlign: "center",
              transition: "all .15s",
              color: "var(--ink)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--green)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,58,46,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "var(--surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={20} style={{ color: "var(--green)" }} />
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function WorkspaceForm({ trade, form, update, onSubmit, onBack }) {
  const tradeLabel = TRADES.find((t) => t.id === trade)?.label || "business";
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--ink-soft)",
          marginTop: 24,
        }}
      >
        Step 2 of 2
      </div>
      <h1
        style={{
          fontSize: 40,
          fontWeight: 700,
          marginTop: 10,
          marginBottom: 8,
          letterSpacing: "-0.02em",
        }}
      >
        Create your workspace
      </h1>
      <p
        style={{
          color: "var(--ink-soft)",
          marginBottom: 16,
          fontSize: 15,
        }}
      >
        Tell Chatty about your {tradeLabel.toLowerCase()} business. She&apos;ll be ready to answer calls in under a minute.
      </p>
      <button
        type="button"
        onClick={onBack}
        style={{
          fontSize: 13,
          color: "var(--ink-soft)",
          fontWeight: 500,
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        ← Change trade
      </button>

      <MacWindow title="new workspace">
        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          <div>
            <label className="label-mac">Business Name</label>
            <input
              type="text"
              className="input-mac"
              placeholder="Harbor Roofing"
              value={form.businessName}
              onChange={update("businessName")}
              required
            />
          </div>

          <div>
            <label className="label-mac">Business Phone Number</label>
            <input
              type="tel"
              className="input-mac"
              placeholder="+1 (415) 555-0100"
              value={form.phoneNumber}
              onChange={update("phoneNumber")}
              required
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.3fr",
              gap: 14,
            }}
          >
            <div>
              <label className="label-mac">Agent Name</label>
              <input
                type="text"
                className="input-mac"
                value={form.agentName}
                onChange={update("agentName")}
                required
              />
            </div>
            <div>
              <label className="label-mac">Agent Voice</label>
              <select
                className="input-mac"
                value={form.voice}
                onChange={update("voice")}
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-mac">Greeting Script</label>
            <textarea
              className="input-mac"
              rows={4}
              value={form.greeting}
              onChange={update("greeting")}
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
            <div
              style={{
                fontSize: 12,
                color: "var(--ink-soft)",
                marginTop: 6,
              }}
            >
              This is the first thing callers will hear.
            </div>
          </div>

          <button
            type="submit"
            className="mac-btn"
            style={{ width: "100%", marginTop: 6, fontSize: 15 }}
          >
            Create Workspace →
          </button>
        </form>
      </MacWindow>
    </div>
  );
}
