# Blueprints: pick exactly one

| If the idea is… | Blueprint | Stack | Ships as |
|---|---|---|---|
| A website, dashboard, SaaS UI, anything a browser opens | `web-app` | Next.js App Router, TypeScript, Tailwind, shadcn | Vercel deploy |
| An HTTP/JSON backend, webhook receiver, search API, monitoring backend | `api-service` | Hono on Node 24, TypeScript, zod, pino | Vercel or Docker |
| A command-line tool: scanner, analyzer, converter, memory/forensics tool | `cli-py` | Python 3.12, uv, typer, rich, pytest, ruff, mypy | PyPI + single binary |
| A long-running process: monitor, collector, watcher, scheduled scanner | `worker-py` | Python 3.12, asyncio, structlog, healthcheck, Prometheus metrics | Docker image |
| A Discord bot | `discord-bot` | discord.js v14, TypeScript, slash commands | Docker image |
| An AI agent or agent-powered app | `agent` | TypeScript, Anthropic SDK tool runner or Claude Agent SDK, `claude-opus-5-5` | Vercel, Docker, or CLI |
| A native desktop app, especially anything graphical, real-time, or GPU-heavy | `desktop-app` | Rust, Bevy (wgpu), egui, serde, notify | One executable per OS |
| "Gamify" a work domain: a live 3D command center where what needs you lights up and handling it earns XP (SOC, homelab, CI, pentest notes...) | `gamified-env` | Rust, Bevy, egui on the GAE kit (`products/gae`) | One executable per environment |

Tie-breakers:
- "Antivirus" or "memory analysis" = `cli-py` for the engine. If it needs a UI, ship the CLI first and
  add a `desktop-app` or `web-app` product later as a separate idea.
- "Monitoring tool" = `worker-py` for the collector. The dashboard is a separate `web-app` idea.
- "Search tool" = `api-service` if it serves results, `cli-py` if it runs locally.
- Needs 60 fps, 3D, or thousands of live objects = `desktop-app`, never Electron.
- A visual, real-time view of a work domain with a queue of things to handle = `gamified-env`, not
  `desktop-app` from scratch: the kit already has the scene, queue, cards, sounds and game loop.

Each blueprint file has the same sections: When, Stack, Scaffold, Layout, factory.json, Standards,
Scalability, Release. Read only the one you picked.
