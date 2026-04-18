# chatty-ops — mundane ops agents

A small toolkit of "dumb agents" that handle the repetitive plumbing around
shipping Chatty AI: applying patches, pushing to the shared branch, verifying
Railway deploys, and smoke-testing the live site.

Each script is a single-purpose Node CLI (no deps beyond Node 20+ builtins and
what the repo already installs). They're designed to be driven either by a
human from a terminal, by Claude Code, or by Cowork via the `chatty-ops` skill.

## Scripts

### `ship.mjs` — apply a patch, commit, push
Applies a `.patch` file (output of `git format-patch`) to the current repo,
runs `npx tsc --noEmit` as a guard, and pushes to the shared branch.

```bash
node scripts/ops/ship.mjs <path-to-patch-file>
# e.g.
node scripts/ops/ship.mjs "C:/Users/short/Downloads/SALESY.AI/PR-T-pass1-activation.patch"
```

Exits non-zero if typecheck fails or the patch doesn't apply cleanly. On
success, prints the new HEAD SHA and confirms the push.

### `verify.mjs` — confirm a commit is live on Railway
Polls GitHub for the latest SHA on `claude/build-chatty-ai-initial-5VZTT`,
then fetches the live site and a handful of health endpoints. Exits 0 when
everything renders with the expected SHA; exits 1 otherwise.

```bash
node scripts/ops/verify.mjs
# or target a specific SHA
node scripts/ops/verify.mjs 1aa9b83
```

Checks:
- `GET https://github.com/.../commits/<branch>` — latest SHA on branch
- `GET https://chattyai-production.up.railway.app/` — homepage renders
- `GET https://chattyai-production.up.railway.app/api/health` — DB + Redis OK
- `GET https://chattyai-production.up.railway.app/api/admin/decision-engine/health` — Pass 1 observability (requires auth; expects 401 from unauthenticated probe as proof of life)

### `brief.mjs` — generate an ops status brief
One-shot status snapshot for the chat: recent commits, deploy status, live
site title. Useful as a scheduled task trigger from Cowork.

```bash
node scripts/ops/brief.mjs
```

### `probe-engine.mjs` — force a decision run + observe
Triggers `POST /api/decision/trigger` for the current org (requires
`CHATTY_SESSION_COOKIE` or `CHATTY_TEST_ORG_ID` + admin bearer) and polls
`/api/admin/decision-engine/health` until a new brief appears, reporting
`used_mock`, `signal_summary_source`, and `input_events_count`.

```bash
CHATTY_BASE=https://chattyai-production.up.railway.app \
  node scripts/ops/probe-engine.mjs
```

## Conventions

- **Idempotent** — every script is safe to re-run.
- **Exit codes** — 0 = success, 1 = failure; no "unknown" states.
- **Output** — structured (SHA, status, duration). Scripts print a final
  single-line JSON summary so Claude can parse the result cleanly.
- **No secrets in repo** — scripts read credentials from env vars
  (`GITHUB_TOKEN`, `CHATTY_BASE`, etc.), never hardcode.

## Pairing with Cowork

The Cowork skill `chatty-ops` (see `~/.claude/skills/chatty-ops/SKILL.md`)
teaches Cowork's Claude when to invoke these scripts automatically — e.g.
after committing a PR, run `ship.mjs` → then `verify.mjs`, and only report
"shipped" when verification passes.
