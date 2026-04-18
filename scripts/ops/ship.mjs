#!/usr/bin/env node
// scripts/ops/ship.mjs
//
// Apply a .patch file, typecheck the result, commit (via `git am`) and push
// to the shared deploy branch. Exits 0 on a clean push, 1 on any failure.
//
// Usage:
//   node scripts/ops/ship.mjs <patch-path>
//
// Env:
//   CHATTY_BRANCH     default: claude/build-chatty-ai-initial-5VZTT
//   SKIP_TYPECHECK    if "1", skip `npx tsc --noEmit` before push
//   SKIP_PUSH         if "1", stop after commit (dry run)
//
// Output: single-line JSON result to stdout on success/failure.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const BRANCH = process.env.CHATTY_BRANCH || "claude/build-chatty-ai-initial-5VZTT";
const patchArg = process.argv[2];

function die(message, extra = {}) {
  const result = { ok: false, step: extra.step || "unknown", message, ...extra };
  console.error(`[ship] ${message}`);
  console.log(JSON.stringify(result));
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: "pipe", encoding: "utf8", ...opts });
  return {
    code: res.status ?? 1,
    stdout: (res.stdout || "").trim(),
    stderr: (res.stderr || "").trim(),
  };
}

function requireZero(step, res) {
  if (res.code !== 0) {
    die(`${step} failed: ${res.stderr || res.stdout}`, { step, code: res.code });
  }
  return res;
}

if (!patchArg) die("usage: node scripts/ops/ship.mjs <patch-path>", { step: "args" });
const patchPath = resolve(patchArg);
if (!existsSync(patchPath)) die(`patch not found: ${patchPath}`, { step: "args" });

// 1. Confirm we're in a git repo
requireZero("git-status", run("git", ["rev-parse", "--git-dir"]));

// 2. Make sure we're on the deploy branch (fetch + checkout + fast-forward)
requireZero("git-fetch", run("git", ["fetch", "origin", BRANCH]));
const cur = requireZero("git-current-branch", run("git", ["rev-parse", "--abbrev-ref", "HEAD"])).stdout;
if (cur !== BRANCH) {
  requireZero("git-checkout", run("git", ["checkout", BRANCH]));
}
requireZero("git-pull", run("git", ["pull", "--ff-only", "origin", BRANCH]));

// 3. Try `git am` first (preserves author + message), fall back to `git apply` + synthesized commit
const subjectMatch = readFileSync(patchPath, "utf8").match(/^Subject: \[PATCH[^\]]*\]\s*(.+)$/m);
const commitMessage = subjectMatch ? subjectMatch[1].trim() : `apply ${patchArg}`;

const amRes = run("git", ["am", "--3way", patchPath]);
if (amRes.code !== 0) {
  // Abort the failed `am` so the working tree is clean, then try `apply`.
  run("git", ["am", "--abort"]);
  requireZero("git-apply", run("git", ["apply", "--3way", patchPath]));
  requireZero("git-add", run("git", ["add", "-A"]));
  requireZero("git-commit", run("git", ["commit", "-m", commitMessage]));
}

const afterSha = requireZero("git-head", run("git", ["rev-parse", "HEAD"])).stdout;

// 4. Typecheck (skip with SKIP_TYPECHECK=1)
if (process.env.SKIP_TYPECHECK !== "1") {
  const tc = run("npx", ["tsc", "--noEmit"], { shell: process.platform === "win32" });
  if (tc.code !== 0) {
    die(`typecheck failed:\n${tc.stdout}\n${tc.stderr}`, {
      step: "typecheck",
      sha: afterSha,
    });
  }
}

// 5. Push (skip with SKIP_PUSH=1)
if (process.env.SKIP_PUSH === "1") {
  console.log(JSON.stringify({ ok: true, sha: afterSha, pushed: false, branch: BRANCH }));
  process.exit(0);
}

const push = run("git", ["push", "origin", BRANCH]);
if (push.code !== 0) {
  die(`git push failed: ${push.stderr || push.stdout}`, {
    step: "git-push",
    sha: afterSha,
    hint: "Does the current shell have GitHub credentials? Try `gh auth status` or set GITHUB_TOKEN.",
  });
}

console.log(
  JSON.stringify({
    ok: true,
    sha: afterSha,
    pushed: true,
    branch: BRANCH,
    commit_message: commitMessage,
  })
);
