'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MacWindow from "@/components/MacWindow";

const VOICES = [
  { id: "ava-warm", label: "Ava — Warm & Professional (Female, American)" },
  { id: "miles-calm", label: "Miles — Calm & Confident (Male, American)" },
  { id: "clara-bright", label: "Clara — Bright & Friendly (Female, British)" },
  { id: "theo-deep", label: "Theo — Deep & Reassuring (Male, British)" },
];

const INDUSTRIES = [
  "Dental / Medical",
  "Legal Services",
  "Real Estate",
  "Home Services",
  "Automotive",
  "Financial Services",
  "Beauty & Wellness",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "",
    industry: "Dental / Medical",
    phoneNumber: "",
    agentName: "Chatty",
    voice: "ava-warm",
    greeting:
      "Hi, thanks for calling [Business Name]. This is Chatty — how can I help you today?",
  });

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("[stub] Create workspace:", form);
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
      <div style={{ width: "100%", maxWidth: 640 }}>
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

        <h1
          className="font-serif"
          style={{
            fontSize: 40,
            fontWeight: 600,
            marginTop: 20,
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          Create your workspace
        </h1>
        <p
          style={{
            color: "var(--ink-soft)",
            marginBottom: 28,
            fontSize: 15,
          }}
        >
          Tell Chatty about your business. She'll be ready to answer calls in
          under a minute.
        </p>

        <MacWindow title="new workspace">
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            <div>
              <label className="label-mac">Business Name</label>
              <input
                type="text"
                className="input-mac"
                placeholder="Harbor Dental"
                value={form.businessName}
                onChange={update("businessName")}
                required
              />
            </div>

            <div>
              <label className="label-mac">Industry</label>
              <select
                className="input-mac"
                value={form.industry}
                onChange={update("industry")}
              >
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
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
    </main>
  );
}
