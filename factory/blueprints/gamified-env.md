# Blueprint: gamified-env (a GAE environment)

## When
The idea turns a work domain into something to watch and play: "gamify my SOC / homelab / CI /
bug bounty / pentest engagement / support queue", a live command center where things that need
the user light up and handling them earns progress. Real-time 3D, a queue of what needs you,
XP and streaks. If the idea is only a chart dashboard, it is `web-app`; if it is only a
collector, it is `worker-py` feeding a gamified env later.

## Stack (fixed: performance is the point)
- **GAE kit** at `products/gae`: `gae-core` (events, world, layout, game, sources, bridge) and
  `gae-engine` (Bevy 0.20 + bevy_egui 0.43 scene, camera, UI, cards, sounds). Read
  `products/gae/AGENTS.md` fully before writing code; it is the playbook for this blueprint.
- Rust 2024, the exact Bevy / bevy_egui / bevy_panorbit_camera versions the kit pins.
- Reference implementation and lessons: `products/agent-globe/AGENTS.md`.
- Never a browser, Electron or Python UI. Never fork the engine: extend it in `products/gae`.

## Scaffold
Two options. Prefer the first unless the idea says the environment ships on its own.

1. **Inside the kit** (fastest): from `products/gae`,
   `powershell -NoProfile -File tools/new-env.ps1 -Slug <slug> -Title "<Title>"`.
   The environment ships with the kit's next release; `factory.json` of `gae` already checks it.
2. **Own product**: `node bin/factory.mjs new ideas/inbox/<file>.md`, then copy
   `products/gae/envs/_template/{Cargo.toml,src}` into `products/<slug>/` and turn it into a
   standalone crate:
   ```toml
   [package]
   name = "<slug>"
   version = "0.1.0"
   edition = "2024"
   license = "MIT"
   [dependencies]
   gae-engine = { path = "../gae/crates/gae-engine" }
   serde_json = "1"
   clap = { version = "4", features = ["derive"] }
   [profile.dev]
   opt-level = 1
   [profile.dev.package."*"]
   opt-level = 3
   [profile.release]
   lto = "thin"
   codegen-units = 1
   strip = true
   ```
   Copy `products/gae/rustfmt.toml` too.

## Layout
```
src/main.rs      flags (--demo, feed paths, --port, --no-http) → gae_engine::run
src/domain.rs    the Spec: nouns, kinds, palette, XP rules, achievements (+ worksheet comment)
src/source.rs    map_line for the feed (pure, tested) and the demo Replay
src/<format>.rs  one module per input format when there are several
```
Rule: mappers are pure functions from a line or record to `Vec<Event>`; the engine never parses.

## factory.json commands (own-product option)
```json
"install":   "cargo fetch",
"lint":      "cargo fmt --check && cargo clippy --all-targets -- -D warnings",
"typecheck": "cargo check --all-targets",
"test":      "cargo test",
"build":     "cargo build --release",
"audit":     "cargo audit",
"run":       "cargo run --release -- --demo",
"release":   "cargo build --release"
```

## Standards
- The domain worksheet is answered in `domain.rs`: unit, grouping, action, signal, resolve vs
  dismiss. No signals, no game: find the moment that needs the human.
- `Spec::validate()` is empty (a test). Signal ids are stable (`<rule>:<unit>`) so repeats aggregate.
- Mapper tests use real sample lines of the feed format, including one malformed line.
- `--demo` shows every kind and every severity within a minute, then leaves time to triage.
- Verify like agent-globe: `GAE_SHOT=shot.png GAE_SHOT_AT=30` for a self-screenshot and
  `GET /state` for what the user sees. Never drive the user's mouse or keyboard.
- Defensive only: a red-team environment organizes an authorized engagement's scope, notes and
  tool output; it does not launch attacks, keep captured credentials, or evade detection.

## Scalability
The kit bounds everything (units, actions, open and closed signals, logs, HTTP bodies, the
channel). Sources run on their own threads; a slow feed never blocks a frame. Keep it that way:
no unbounded `Vec` in a source, paginate any list you add to the UI.

## Release
One executable per environment (`cargo build --release`). Windows: copy it to
`%LOCALAPPDATA%\Programs\<slug>` in the `release` command, as `gae` and `agent-globe` do.
