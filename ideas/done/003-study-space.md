---
title: Study Space
slug: study-space
type: desktop-app
one_liner: Ask Claude to explain a complex topic and it draws a navigable 3D scene of it in space, step by step, through an MCP server.
priority: 1
status: shipped
push: false
product: products/study-space
shipped: 2026-10-30
version: 0.1.0
---

## Idea
A standalone native app (Rust, Bevy) that shows a dark space scene with an orbit camera. Claude
draws into it through an MCP server: "explain CNN to me" → Claude calls `study_render` with a
declarative scene (layers, nodes, edges, labels, steps) and the app lays it out and renders it in
3D. As Claude explains, it calls `study_step` to highlight parts and move the camera. The user can
fly around, hover any part for its note, and step back and forth on their own.

Prototype for a future Agent Globe "Study mode". It runs separately for now and must not touch
`products/agent-globe`. It is built so integration later is one plugin, not a rebuild.

## Key design rule
Claude describes structure, the app does layout. Claude never sends coordinates or meshes.

## Must have
- Cargo workspace: `spec` (pure data: scene types, validation, layout, no Bevy), `scene`
  (Bevy `StudyPlugin` + local ingest), `app` (thin window binary), `mcp` (stdio MCP server).
- Same Bevy / bevy_egui / panorbit versions as Agent Globe, pinned.
- Templates: `layer_stack` (neural nets, pipelines) and `graph` (force-directed, deterministic).
- Steps: title + text + highlight + focus; next/prev in the UI, `study_step` from Claude.
- Labels readable at any distance, facing the camera.
- MCP tools: `study_render`, `study_step`, `study_focus`, `study_clear`.
- App listens on 127.0.0.1 only, with a per-run token the MCP server reads from a local file.
- The plugin spawns everything under one root entity and owns no window or global camera.

## Success criteria
- "Explain CNN", "explain attention/transformers", "explain the TCP handshake" each give a clear,
  navigable scene in under 5 seconds with no hand-written positions.
- 60 fps on integrated graphics.

## Later (backlog)
- More templates: tensor grid, tree, timeline, sequence diagram.
- Animations (a kernel sliding over the input, packets moving along edges).
- Save/load scenes, history of explanations.
- Integration into Agent Globe as a mode.
