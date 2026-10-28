# Blueprint: desktop-app (Rust, GPU-rendered)

## When
Native desktop apps that must be fast: real-time visualization, 3D, large datasets, anything where
a browser shell would be too slow or too heavy. Also tools that must run offline with a tiny footprint.

## Stack
- Rust stable, edition 2021. MSVC toolchain on Windows.
- **Bevy** for the app shell, rendering (wgpu: Vulkan/DX12/Metal), 3D scene, camera, picking, ECS.
- **bevy_egui** for every 2D panel: inspectors, lists, text, menus. Do not hand-roll UI.
- **serde + serde_json** for data. **notify** for file watching. **crossbeam-channel** to move data
  from worker threads into the ECS without blocking the frame.
- **anyhow** for app errors, **thiserror** for library errors, **tracing** for logs.
- Tests: `cargo test` over the data layer (parsers, graph building). Rendering is not unit tested.

## Scaffold
```
cargo new <slug> --bin
cd <slug>
cargo add bevy
cargo add bevy_egui
cargo add serde --features derive
cargo add serde_json notify crossbeam-channel anyhow thiserror tracing tracing-subscriber dirs
```
Pin the Bevy version you get and make sure `bevy_egui` matches it (check its README matrix).
Put the data layer in `src/data/` with no Bevy imports so it compiles and tests without the renderer.

Add to `Cargo.toml` for fast dev builds:
```toml
[profile.dev]
opt-level = 1
[profile.dev.package."*"]
opt-level = 3
[profile.release]
lto = "thin"
codegen-units = 1
strip = true
```

## Layout
```
src/
  main.rs          App::new().add_plugins(...). Nothing else.
  app/             Bevy plugins, one file per concern (scene, camera, ui, input)
  data/            Pure Rust, no Bevy imports: parsers, models, graph building
  bridge.rs        channel from data threads to ECS resources/events
assets/            fonts, textures, shaders
tests/             integration tests over data/ with fixtures under tests/fixtures/
```
Rule: `data/` never imports Bevy. `app/` never parses files. The bridge is the only seam.

## factory.json commands
```json
"install":   "cargo fetch",
"lint":      "cargo fmt --check && cargo clippy --all-targets -- -D warnings",
"typecheck": "cargo check --all-targets",
"test":      "cargo test",
"build":     "cargo build --release",
"audit":     "cargo audit",
"run":       "cargo run",
"release":   "cargo build --release"
```
`cargo audit` needs `cargo install cargo-audit` once per machine.

## Standards
- 60 fps on integrated graphics for the MVP scene. Measure with Bevy's FrameTimeDiagnosticsPlugin.
- Never block the main thread: file IO, parsing, network run on threads and send over channels.
- Every clickable entity has a picking observer. Selection lives in one `Resource`.
- Camera: orbit controls (drag rotate, scroll zoom, right-drag pan). Smooth, damped.
- Dark theme default. Colors as constants in one module.
- Errors from the data layer surface in the UI (a status strip), never only in logs.

## Scalability
- Entities are cheap; prefer many small entities over one dynamic mesh until profiling says otherwise.
- Share one mesh and material handle across identical nodes so the renderer batches them.
- Incremental data: parse only appended bytes on file change, keep per-file offsets.
- Keep models in `data/` serializable so a session can be saved and replayed.

## Release
- `cargo build --release` produces one executable. Package: Windows zip or `cargo wix`,
  macOS `cargo bundle`, Linux tarball or AppImage.
- CI: `dtolnay/rust-toolchain@stable` and `Swatinem/rust-cache`.
- Version in `Cargo.toml` is the source of truth; mirror it in `factory.json`.
