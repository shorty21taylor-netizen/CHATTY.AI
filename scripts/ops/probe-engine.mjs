#!/usr/bin/env node
// scripts/ops/probe-engine.mjs
//
// Smoke-test the Decision Engine end-to-end:
//   1. POST /api/decision/trigger  (async → Inngest → runs 3-pass chain)
//   2. Poll /api/admin/decision-engine/health until a new brief appears
//   3. Report pass1.used_mock, signal_summary_source, input_events_count,
//      and the generated headline.
//
// Requires an authenticated session. Two auth modes:
//   a) CHATTY_SESSION_COOKIE — raw Cookie header value from a signed-in browser
//   b) CHATTY_ADMIN_BEARER   — a bearer token if admin API is opened up
//
// Usage:
//   CHATTY_SESSION_COOKIE="__session=..." node scripts/ops/probe-engine.mjs

const BASE = process.env.CHATTY_BASE || "https://chattyai-production.up.railway.app";
const COOKIE = process.env.CHATTY_SESSION_COOKIE;
const BEARER = process.env.CHATTY_ADMIN_BEARER;
const TIMEOUT_SEC = parseInt(process.env.PROBE_TIMEOUT_SEC || "120", 10);

if (!COOKIE && !BEARER) {
  console.error(
    "[probe-engine] set CHATTY_SESSION_COOKIE or CHATTY_ADMIN_BEARER to authenticate"
  );
  process.exit(2);
}

function authHeaders() {
  const h = { "User-Agent": "chatty-ops", "Content-Type": "application/json" };
  if (COOKIE) h.Cookie = COOKIE;
  if (BEARER) h.Authorization = `Bearer ${BEARER}`;
  return h;
}

async function trigger() {
  const res = await fetch(`${BASE}/api/decision/trigger`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({}),
  });
  if (!res.ok && res.status !== 202) {
    throw new Error(`trigger failed: ${res.status} ${await res.text()}`);
  }
  return await res.json();
}

async function health() {
  const res = await fetch(`${BASE}/api/admin/decision-engine/health`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`health ${res.status}: ${await res.text()}`);
  return await res.json();
}

async function main() {
  const baselineHealth = await health().catch(() => null);
  const baselineBriefId = baselineHealth?.brief_id || null;

  console.error(`[probe-engine] baseline brief_id=${baselineBriefId}`);
  const dispatch = await trigger();
  console.error(`[probe-engine] dispatched: ${JSON.stringify(dispatch)}`);

  const start = Date.now();
  while ((Date.now() - start) / 1000 < TIMEOUT_SEC) {
    await new Promise((r) => setTimeout(r, 5000));
    try {
      const h = await health();
      if (h.brief_id && h.brief_id !== baselineBriefId) {
        console.log(
          JSON.stringify(
            {
              ok: true,
              new_brief: h.brief_id,
              pass1: h.pass1,
              pass3_headline: h.pass3?.headline,
              environment: h.environment,
              events_last_24h: h.events_last_24h,
              elapsed_seconds: Math.round((Date.now() - start) / 1000),
            },
            null,
            2
          )
        );
        process.exit(h.pass1?.claude_live ? 0 : 1);
      }
    } catch (e) {
      console.error(`[probe-engine] health error: ${e.message}`);
    }
  }

  console.log(
    JSON.stringify({ ok: false, error: "timed out waiting for new brief" })
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(`[probe-engine] fatal: ${err.message}`);
  process.exit(1);
});
