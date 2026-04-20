# Chatty AI — Launch Checklist

Non-code items that must be resolved before Chatty AI is considered
launch-ready for paying tenants. Code-side work lives in the PR queue;
this file captures operational, configuration, and integration gaps that
the repo alone can't fix.

> **How to use this file:** Whenever we discover a launch-blocker while
> shipping a PR (missing env var, unprovisioned service, unseeded data,
> etc.), append it here. When wrapping up the app, we work through this
> list end-to-end before flipping the "GA" switch.

---

## 🔴 Blockers — product is functionally broken until fixed

### Inngest not configured on Railway
- **Status:** open (found 2026-04-19 by `/api/health/inngest`)
- **Evidence:** `curl /api/health/inngest` returns `status: degraded, missing_envs: ["INNGEST_EVENT_KEY","INNGEST_SIGNING_KEY"]`
- **Impact:** Zero cron workflows run in prod.
  - `brief-scheduler` (every 15m) — Daily Brief never fires
  - `signal-sync` (every 30m) — external signals never pulled
  - `agent-metrics-rollup` (hourly) — agent KPIs never computed
  - `outbound-call-dispatch` (every 2m) — voice agent never dials
  - `feedback-process` (daily 18:00) — operator feedback SMS never sent
  - Plus all event-driven functions (decision-run, brief-deliver, agent-run, etc.) never register
- **Fix:**
  1. https://app.inngest.com → Chatty AI app → Settings / Keys
  2. Copy Event Key and Signing Key
  3. On Railway CHATTY.AI service, set:
     - `INNGEST_EVENT_KEY=...`
     - `INNGEST_SIGNING_KEY=...`
  4. Railway auto-redeploys
  5. Re-hit `https://chattyai-production.up.railway.app/api/health/inngest` — expect `status: healthy` (or at minimum `missing_envs: []`)

---

## 🟡 Launch-required — must be done before onboarding paying customers

_(empty — add as discovered)_

---

## 🟢 Polish — nice-to-have, not blocking GA

_(empty — add as discovered)_

---

## Completed

_(empty — move items here with a ✅ and the date once resolved)_
