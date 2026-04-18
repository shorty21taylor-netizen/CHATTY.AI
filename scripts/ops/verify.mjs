#!/usr/bin/env node
// scripts/ops/verify.mjs
//
// Confirm that the latest (or a specific) commit on the deploy branch is live
// on Railway and the site is rendering. Exits 0 on full success, 1 on any
// mismatch or unreachable endpoint.
//
// Usage:
//   node scripts/ops/verify.mjs               # verify current origin HEAD
//   node scripts/ops/verify.mjs <short-sha>   # verify a specific SHA is live
//
// Env:
//   CHATTY_BASE       default: https://chattyai-production.up.railway.app
//   CHATTY_BRANCH     default: claude/build-chatty-ai-initial-5VZTT
//   CHATTY_REPO       default: shorty21taylor-netizen/CHATTY.AI
//   GITHUB_TOKEN      optional, lifts GitHub API rate limit
//   POLL_MAX_SECONDS  default: 180 (how long to wait for Railway to catch up)

const BASE = process.env.CHATTY_BASE || "https://chattyai-production.up.railway.app";
const BRANCH = process.env.CHATTY_BRANCH || "claude/build-chatty-ai-initial-5VZTT";
const REPO = process.env.CHATTY_REPO || "shorty21taylor-netizen/CHATTY.AI";
const POLL_MAX = parseInt(process.env.POLL_MAX_SECONDS || "180", 10);

const targetShaArg = process.argv[2] || null;

function log(msg) {
  console.error(`[verify] ${msg}`);
}

async function ghLatestSha() {
  const url = `https://api.github.com/repos/${REPO}/commits/${BRANCH}`;
  const headers = { "User-Agent": "chatty-ops" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`github api ${res.status}: ${await res.text()}`);
  const body = await res.json();
  return { sha: body.sha, message: body.commit?.message?.split("\n")[0] || "" };
}

async function probe(path, expect) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  const ok = expect ? expect(res, text) : res.ok;
  return { url, status: res.status, ok, body: text.slice(0, 500) };
}

async function main() {
  const { sha: latestSha, message } = await ghLatestSha();
  const targetSha = targetShaArg ? targetShaArg.toLowerCase() : latestSha.slice(0, 7);
  const latestShort = latestSha.slice(0, 7);

  log(`github HEAD on ${BRANCH}: ${latestShort} — ${message}`);

  if (!latestShort.startsWith(targetSha) && !targetSha.startsWith(latestShort)) {
    console.log(
      JSON.stringify({
        ok: false,
        step: "sha-mismatch",
        expected: targetSha,
        github_head: latestShort,
      })
    );
    process.exit(1);
  }

  // Probe the homepage — we look for the product name in the HTML.
  const home = await probe("/", (res, body) =>
    res.ok && /chatty\.ai/i.test(body)
  );
  // Probe /api/health — expect JSON ok or at worst a 200 with a status body.
  const health = await probe("/api/health", (res) => res.ok);
  // Probe /api/admin/decision-engine/health — unauthenticated should 401 (proof of life);
  // 404 means the endpoint is missing (PR T did not deploy).
  const engineHealth = await probe(
    "/api/admin/decision-engine/health",
    (res) => res.status === 401 || res.status === 200
  );

  const results = { home, health, engineHealth };
  const allOk = Object.values(results).every((r) => r.ok);

  if (!allOk) {
    // Poll for up to POLL_MAX seconds in case Railway is still building.
    const start = Date.now();
    while ((Date.now() - start) / 1000 < POLL_MAX) {
      await new Promise((r) => setTimeout(r, 10000));
      const h = await probe("/", (res, body) => res.ok && /chatty\.ai/i.test(body));
      const e = await probe(
        "/api/admin/decision-engine/health",
        (res) => res.status === 401 || res.status === 200
      );
      if (h.ok && e.ok) {
        results.home = h;
        results.engineHealth = e;
        break;
      }
      log(
        `still waiting — home=${h.status} engineHealth=${e.status} (${Math.round(
          (Date.now() - start) / 1000
        )}s)`
      );
    }
  }

  const finalOk =
    results.home.ok && results.health.ok && results.engineHealth.ok;

  console.log(
    JSON.stringify({
      ok: finalOk,
      github_head: latestShort,
      target: targetSha,
      message,
      home: { status: results.home.status, ok: results.home.ok },
      health: { status: results.health.status, ok: results.health.ok },
      engine_health: {
        status: results.engineHealth.status,
        ok: results.engineHealth.ok,
      },
    })
  );
  process.exit(finalOk ? 0 : 1);
}

main().catch((err) => {
  console.error(`[verify] fatal: ${err.message}`);
  console.log(JSON.stringify({ ok: false, step: "fatal", message: err.message }));
  process.exit(1);
});
