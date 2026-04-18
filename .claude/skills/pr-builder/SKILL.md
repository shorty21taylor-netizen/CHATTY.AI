---
name: pr-builder
description: Author a production PR for Chatty AI — branch discipline, commit structure, typecheck gate, patch emission, and the "ship live not sandboxed" rule. Invoke whenever you're about to modify code in the CHATTY.AI repo and want it to land on origin/claude/build-chatty-ai-initial-5VZTT. Triggers: "build PR", "write a commit", "start on PR", "next PR", "ship this change", any time you touch src/** intending to deploy.
---

# pr-builder — Chatty AI PR authoring contract

Rules for every code change that reaches the Chatty AI deploy branch. Read this before you edit a single file in the repo.

## Branch discipline (NON-NEGOTIABLE)

- **All commits land on `claude/build-chatty-ai-initial-5VZTT`.** Never create a new branch. Never branch off main. "PR A/B/T/etc." refers to *commits on that branch*, not GitHub PRs.
- Before editing, confirm you're on the right branch:
  ```
  cd ~/CHATTY.AI
  git branch --show-current     # must print: claude/build-chatty-ai-initial-5VZTT
  git fetch origin && git pull --ff-only origin claude/build-chatty-ai-initial-5VZTT
  ```

## Code boundary rules

1. **Voice = ElevenLabs only.** If you see `vapi`, `Vapi`, or `VAPI_` anywhere in code you touch, remove it.
2. **No CRM positioning.** Chatty is standalone. Never add code that says "runs on top of ServiceTitan/HubSpot/Salesforce/JobNimbus" — Salesforce/HubSpot adapters *can* exist as optional signal sources, but product copy never positions Chatty as a CRM add-on.
3. **Multi-tenant always.** Every new table gets RLS + `org_id`. Every new query goes through `withOrgContext()`. Scale target is 500–1000 tenants — no O(all-orgs) scans in request handlers.
4. **TypeScript backend / JavaScript frontend.** API routes and `src/lib/**` are `.ts`; UI components in `src/app/**/page.js` stay `.js` unless already typed.
5. **Model IDs** — use `claude-sonnet-4-6` for the Decision Engine and cadence runs, `claude-haiku-4-5-20251001` only where latency/cost demands it. Never hardcode the pre-4.6 ID `claude-sonnet-4-20250514`.

## Commit message format

```
feat(<area>): <short imperative>  — PR <letter>

<1-2 sentence what + why>

- bullet of most significant change
- bullet of observable effect
```

Examples:
- `feat(decision-engine): PR T — activate Pass 1 against real signal_events`
- `feat(ops): chatty-ops toolkit — mundane task agents for ship/verify/probe`

## Pre-commit checklist

Run every time:

```
npx tsc --noEmit            # must pass with zero errors
npm run lint   2>/dev/null || true   # informational
```

If `tsc` fails, fix before committing. Do not `SKIP_TYPECHECK=1` unless you have a tracked reason.

## Ship live, not sandboxed

Per user mandate on 2026-04-18: every meaningful change must land on origin + Railway. Sandbox-only work does not count.

Three paths, in order of preference:
1. **User runs `ship.mjs`** on their Windows machine — fastest feedback loop.
2. **Claude Code handoff** — write a `.patch` to `SALESY.AI/`, emit a 5-line Claude Code prompt that applies it and pushes.
3. **GITHUB_TOKEN in sandbox** — only if Anthony has provided one; otherwise path 1 or 2.

**Never** declare a PR shipped until `verify.mjs` confirms:
- Latest SHA on origin matches your local HEAD
- Railway rebuild completed
- Live site serves 200
- If the PR added an admin route, `verify.mjs` sees the correct 401 on that route

## Patch emission

When handing off to Claude Code, use `git format-patch` not `git diff`:

```
git format-patch HEAD~N --stdout > /mnt/c/Users/short/Downloads/SALESY.AI/PR-<letter>-<slug>.patch
```

- `N` = number of commits in this PR
- Patch goes into SALESY.AI so the user can access it on their Windows desktop
- Also emit a short `.md` with apply instructions + a paste-ready Claude Code prompt in `.txt`

## Acceptance before you say "shipped"

```
[  ] tsc --noEmit passes on the commit SHA
[  ] branch is claude/build-chatty-ai-initial-5VZTT
[  ] commit is pushed (verified by git log on origin)
[  ] Railway rebuilt (verify.mjs or Railway dashboard)
[  ] Live URL serves 200
[  ] If new admin route: curl without auth returns 401 (not 404, not 500)
[  ] If decision-engine change: probe-engine.mjs shows used_mock=false
[  ] Memory updated if anything non-obvious was learned
```

## Anti-patterns (learned the hard way)

- **Don't** write specs for Claude Code when you can build it yourself in the cloned sandbox — Anthony corrected this on 2026-04-18.
- **Don't** put operational code in `SALESY.AI/ops/` — it lives in `scripts/ops/` in the repo so it ships with the deploy.
- **Don't** commit and stop. Commit → push → verify → brief. A commit in the sandbox is not a shipped PR.
- **Don't** skip typecheck because "it's a small change." PR T caught a real bug in the storeBrief signature via tsc.

## Source of truth

- Project contract: `/mnt/c/Users/short/Downloads/SALESY.AI/CLAUDE.md`
- Ops toolkit: `scripts/ops/`
- This skill: `.claude/skills/pr-builder/SKILL.md`
