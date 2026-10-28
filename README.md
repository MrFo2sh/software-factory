# software-factory

A repo any coding agent can load to turn one idea into one shipped product, consistently.

- `AGENTS.md` — the operating manual. Claude Code reads it through `CLAUDE.md`; Codex, Cursor,
  Gemini CLI and others read `AGENTS.md` directly.
- Seven blueprints under `factory/blueprints/`: web app, API service, Python CLI, Python worker,
  Discord bot, AI agent, desktop app.
- `bin/factory.mjs` — five commands, zero dependencies.

## Run a factory cycle

```
node bin/factory.mjs next                 # which idea is next
node bin/factory.mjs new ideas/inbox/001-agent-globe.md
node bin/factory.mjs check agent-globe    # lint, typecheck, test, build, audit
node bin/factory.mjs ship agent-globe     # tag, changelog, ledger
node bin/factory.mjs status
```

Or just open the repo in your agent and say: `run the factory loop in AGENTS.md`.

## Add an idea

Copy `ideas/TEMPLATE.md` to `ideas/inbox/NNN-slug.md` and fill the front matter.

## Machine prerequisites

Required: Node 22+, git, Python 3.12+. Per blueprint: pnpm, uv, Docker, Vercel CLI, Rust stable
with MSVC Build Tools on Windows (desktop apps), `cargo install cargo-audit`.
Missing on this machine as of 2026-10-28: `uv`, `gh`, `vercel`. Rust and MSVC installed.

## Daily cadence

`.github/workflows/daily.yml` opens a "Factory run" issue every weekday with the next idea.
Point any agent integration at that issue, or run the loop locally.
