---
title: Agent Globe
slug: agent-globe
type: desktop-app
one_liner: A GPU-rendered 3D constellation of every coding-agent session, its subagents, and their terminal executions, live. Click any node to inspect it.
priority: 1
status: shipped
push: false
product: products/agent-globe
shipped: 2026-10-28
version: 0.1.0
---

## Idea
A native desktop app, written in Rust and rendered on the GPU, that visualizes what coding agents
are doing. Any local agent tool (Claude Code, Codex, others) feeds it. It shows each session's agent
tree as a rotating globe: root agent at the pole, each subagent depth on a latitude ring, spawn order
along longitude, spawn links as arcs. Nodes glow while active and dim when finished. Drag to rotate,
scroll to zoom, click a node to open its panel: the prompt it was given, every tool call in order,
Bash commands with their real stdout and stderr, files it touched, tokens, duration. Live: the globe
updates as agents work. Futuristic dark UI.

## How agents feed it (no MCP needed)
One event schema, several sources:
1. **File tail (zero config).** Claude Code: `~/.claude/projects/<proj>/<session>.jsonl` plus
   `<session>/subagents/agent-*.jsonl` and `.meta.json` (the meta's `toolUseId` links a subagent to
   the spawn call in its parent). Codex: `~/.codex/sessions/**/rollout-*.jsonl` (later).
2. **Local HTTP ingest** on `127.0.0.1:4711`: any agent's hooks POST JSON events
   (`session_start`, `agent_spawn`, `tool_start`, `tool_end`, `message`, `agent_end`). Ship a
   ready-made Claude Code hooks snippet.
3. **OpenTelemetry receiver** (later) for agents that export OTLP.
4. **MCP adapter** (optional, later) for agents with none of the above: a `report` tool.

## Must have
- Discover all projects and sessions under the Claude config dir; pick a session from a list.
- Build the agent tree from the session transcript and its subagents folder.
- 3D globe layout with orbit camera, shared node mesh, arc links, hover highlight, click select.
- Node panel with tool-call timeline and a terminal-style view of Bash calls and outputs.
- Live tail: watch files, parse only appended bytes, update the scene without frame hitches.
- HTTP ingest endpoint with the event schema, and the Claude Code hooks snippet in README.
- 60 fps on the MVP scene; verify on the integrated GPU as well as the discrete one.

## Nice to have
- Codex file source. Time scrubber to replay a session.
- Multiple sessions as multiple globes; cost per agent; file-conflict warnings.
- OTLP receiver. MCP adapter.

## Constraints
- Rust only. GPU rendering (wgpu via Bevy). No Electron, no web view.
- Read-only on transcripts. Never modifies anything under `~/.claude`.
- Data layer compiles and tests without the renderer.
