#!/usr/bin/env node
// scripts/ops/brief.mjs
//
// Emit a one-shot ops status brief as JSON — last 5 commits on the deploy
// branch, whether the live site is serving, and what the /api/health endpoint
// returned. Designed to be consumed by a Cowork scheduled task.
//
// Usage:  node scripts/ops/brief.mjs
//
// Env (same as verify.mjs):
//   CHATTY_BASE, CHATTY_BRANCH, CHATTY_REPO, GITHUB_TOKEN

const BASE = process.env.CHATTY_BASE || "https://chattyai-production.up.railway.app";
const BRANCH = process.env.CHATTY_BRANCH || "claude/build-chatty-ai-initial-5VZTT";
const REPO = process.env.CHATTY_REPO || "shorty21taylor-netizen/CHATTY.AI";

async function ghRecentCommits(n = 5) {
  const url = `https://api.github.com/repos/${REPO}/commits?sha=${BRANCH}&per_page=${n}`;
  const headers = { "User-Agent": "chatty-ops" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`github api ${res.status}`);
  const commits = await res.json();
  return commits.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split("\n")[0],
    author: c.commit.author?.name ?? "unknown",
    date: c.commit.author?.date ?? null,
  }));
}

async function siteStatus() {
  try {
    const res = await fetch(BASE, { redirect: "follow" });
    const body = await res.text();
    const title = (body.match(/<title>([^<]+)<\/title>/) || [])[1] || null;
    return { ok: res.ok, status: res.status, title };
  } catch (e) {
    return { ok: false, status: 0, error: e.message };
  }
}

async function healthStatus() {
  try {
    const res = await fetch(`${BASE}/api/health`);
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* not json */
    }
    return { ok: res.ok, status: res.status, body: json ?? text.slice(0, 200) };
  } catch (e) {
    return { ok: false, status: 0, error: e.message };
  }
}

async function main() {
  const [commits, site, health] = await Promise.all([
    ghRecentCommits(5).catch((e) => ({ error: e.message })),
    siteStatus(),
    healthStatus(),
  ]);

  console.log(
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        branch: BRANCH,
        commits,
        live_site: site,
        api_health: health,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(`[brief] fatal: ${err.message}`);
  process.exit(1);
});
