---
name: chatty-ops
description: Mundane operator tasks for Chatty AI — ship a patch to origin, verify Railway rebuilt, emit a status brief, probe the Decision Engine end-to-end. Invoke whenever a PR has been authored locally and needs to reach production, or when you need to confirm live state without hand-rolling curls. Triggers: "ship PR", "push this commit", "verify the deploy", "is Railway building", "status brief", "engine health", "run decision engine probe".
---

# chatty-ops — Ship, Verify, Brief, Probe

Small, repeatable ops for the Chatty AI deploy loop. Every recurring operator task that previously required bespoke bash + curl + git ritual is encapsulated here. Use these instead of re-inventing the commands every time.

## When to use

| Situation | Command |
|---|---|
| A `.patch` exists in SALESY.AI and needs to reach `origin/claude/build-chatty-ai-initial-5VZTT` | `ship.mjs` |
| Just pushed — need to confirm Railway rebuilt and live site is serving the new SHA | `verify.mjs` |
| Scheduled morning/evening status report | `brief.mjs` |
| Need to confirm Pass 1 of the Decision Engine is calling Claude for real (not mock) | `probe-engine.mjs` |

## The toolkit lives at `scripts/ops/` in the repo

Always cd into the clone before invoking:

```
cd ~/CHATTY.AI              # user's Windows path: C:\Users\short\CHATTY.AI
node scripts/ops/<tool>.mjs
```

## 1. `ship.mjs` — apply a patch and push to the deploy branch

**Purpose:** Turn a `PR-*.patch` file into a real commit on `claude/build-chatty-ai-initial-5VZTT`, then push it so Railway rebuilds.

**Happy path:**
```
PATCH=/mnt/c/Users/short/Downloads/SALESY.AI/PR-T-pass1-activation.patch \
node scripts/ops/ship.mjs
```

**Env:**
- `PATCH` (required) — absolute path to the patch file
- `CHATTY_BRANCH` — default `claude/build-chatty-ai-initial-5VZTT`. Never override unless explicitly told.
- `SKIP_TYPECHECK=1` — skip `npx tsc --noEmit` (use sparingly — typecheck gates bad ships)
- `SKIP_PUSH=1` — do everything but the `git push`
- `COMMIT_MESSAGE` — override if `git am` falls back to `git apply` + synthesized commit

**Output:** single-line JSON: `{"ok":true,"sha":"abc1234","branch":"...","pushed":true}`

**Gotchas:**
- `git am --3way` requires the patch to have proper `From:` headers (output of `git format-patch`). If you only have a diff, the script falls back to `git apply` + `git add -A && git commit`.
- If typecheck fails, **don't** rerun with `SKIP_TYPECHECK=1` without understanding why — fix the types instead.
- Push requires credentials. In Cowork sandbox there are no creds; run on the user's Windows machine where `gh auth` is live, or from a Claude Code terminal.

## 2. `verify.mjs` — confirm the deploy is live

**Purpose:** After a push, confirm Railway rebuilt + the new SHA is serving.

**Happy path:**
```
node scripts/ops/verify.mjs
```

**Env:**
- `CHATTY_BASE` — default `https://chattyai-production.up.railway.app`
- `CHATTY_BRANCH` — default `claude/build-chatty-ai-initial-5VZTT`
- `CHATTY_REPO` — default `shorty21taylor-netizen/CHATTY.AI`
- `GITHUB_TOKEN` — raises rate limits when querying GitHub
- `POLL_MAX_SECONDS` — default 180 (3 min). Railway usually takes 60–120s.
- `EXPECTED_SHA` — if set, fail unless the live deploy serves this SHA (not yet wired — placeholder)

**What it checks:**
1. Latest commit SHA on the target branch via GitHub API.
2. `GET /` returns 200 and HTML shell parses (finds `<title>`).
3. `GET /api/health` returns `{ok:true}`.
4. `GET /api/admin/decision-engine/health` returns **401** unauthenticated (proves the route exists and Clerk gate is intact).

**Output:** JSON summary with all four checks + elapsed time.

**Gotcha:** Railway may 404 briefly during rebuild. The script polls; don't spam it. If it times out, check Railway dashboard directly.

## 3. `brief.mjs` — scheduled status brief

**Purpose:** A one-shot JSON brief used by the Cowork scheduled task (10am/daily).

**Happy path:**
```
node scripts/ops/brief.mjs
```

**Env:** same as `verify.mjs` (reuses GitHub + base URL).

**Output:** `{generated_at, branch, commits:[last 5], live_site, api_health}`. Designed to be piped into a Cowork summary or posted to Slack.

## 4. `probe-engine.mjs` — does Pass 1 actually call Claude?

**Purpose:** End-to-end smoke test of the Decision Engine. Triggers a new run, polls `/api/admin/decision-engine/health`, and reports whether `pass1.used_mock` is false (= Claude is live).

**Auth required.** Two modes:
- `CHATTY_SESSION_COOKIE` — paste the raw `Cookie:` header from a signed-in browser tab.
- `CHATTY_ADMIN_BEARER` — bearer token if admin API is ever opened up.

**Happy path:**
```
CHATTY_SESSION_COOKIE="__session=eyJ..." \
node scripts/ops/probe-engine.mjs
```

**Env:**
- `CHATTY_BASE`, `PROBE_TIMEOUT_SEC` (default 120)

**Output:**
```json
{
  "ok": true,
  "new_brief": "uuid...",
  "pass1": { "used_mock": false, "claude_live": true, "signal_summary_source": "signal_events.live", "input_events_count": 42 },
  "pass3_headline": "...",
  "environment": { "anthropic_api_key_present": true, "node_env": "production" },
  "events_last_24h": 42,
  "elapsed_seconds": 37
}
```

**Exit codes:** `0` if Pass 1 is live (claude_live=true), `1` otherwise.

**Gotchas:**
- If `anthropic_api_key_present: false` in the response, **set the key in Railway and retry**. Pass 1 code path is correct; the lock is the env var.
- `input_events_count: 0` means there are no signal events in the last 24h — seed some via `/api/forms/[slug]/submit` or `/api/signal/ingest` first, else the probe is meaningless.

## Delegation pattern — pass this skill to subagents

When spawning an agent to do a ship-and-verify loop, reference this skill explicitly:

```
Agent prompt:
  Read /sessions/.../chatty/.claude/skills/chatty-ops/SKILL.md first. Then:
    1. Apply the patch at <path>
    2. Push to origin
    3. Verify the deploy
  Report the final JSON from verify.mjs.
```

## Feedback loop

Every run that surfaces a new failure mode should update this file:
- Add a **Gotcha** line if the error is reproducible.
- Add a new script if you catch yourself hand-rolling the same curl twice.
- Tighten acceptance checks in `verify.mjs` as the production surface grows (next: check voice webhook health, check Inngest dashboard).

## Source files

- `scripts/ops/ship.mjs`
- `scripts/ops/verify.mjs`
- `scripts/ops/brief.mjs`
- `scripts/ops/probe-engine.mjs`
- `scripts/ops/README.md` (human-readable usage)
