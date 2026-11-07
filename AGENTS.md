# Software Factory — operating manual for any agent

You are inside a software factory. The goal: take one idea from `ideas/inbox/`, turn it into a
complete, consistent, scalable, shippable product under `products/<slug>/`, and ship it. One product
per run. Work alone, end to end, without asking unless blocked by a missing credential.

Read this file fully. Read everything else only when the loop below tells you to.

## The loop

1. **Pick** — run `node bin/factory.mjs next`. It prints the highest-priority idea. Read only that file.
2. **Classify** — open `factory/blueprints/README.md` (the decision table) and pick ONE blueprint.
   Then read ONLY that blueprint file. Do not read the others.
3. **Start** — run `node bin/factory.mjs new ideas/inbox/<file>.md`. It creates `products/<slug>/`
   with `SPEC.md`, `BACKLOG.md`, `factory.json` and the common overlay files.
4. **Spec** — fill `products/<slug>/SPEC.md`. One page max. MVP only. Everything you cut goes to
   `BACKLOG.md`. A spec that needs a second page means the MVP is too big: cut again.
5. **Scaffold** — run the scaffold commands from the blueprint. Then fill `factory.json` so that
   `lint`, `typecheck`, `test`, `build`, `audit` all run from the product folder.
6. **Vertical slice first** — make the single most important user path work end to end before
   adding anything else. Run `node bin/factory.mjs check <slug>` and get it green.
7. **Iterate** — add features from the spec one at a time. After each: `check`. Keep it green.
8. **Review** — publish before/after crops of every visible change to the product's Changes artifact
   (see below) and get the user's OK. Walk `factory/checklists/definition-of-done.md`. For anything that touches
   networks, files, credentials, or user input, also walk `factory/checklists/security-review.md`.
9. **Ship** — run `node bin/factory.mjs ship <slug>`. It refuses unless the last check passed.
   It updates `CHANGELOG.md`, runs the product's `release` command, commits and tags the product in
   its OWN git repository (created on first ship), appends to `SHIPPED.md`, and archives the idea.
   Products never live in the factory's history: `products/*` is ignored here. If the idea file has
   `push: true` and the product has a remote, `ship` pushes; otherwise it prints the publish command.
10. **Report** — final message: what shipped, how to run it, what is in the backlog, and anything
    that could not be verified. Nothing else.

## Token rules (these are why the factory is cheap)

- Load one blueprint, not all of them. Load a checklist only at the step that needs it.
- Never paste logs. `check` writes every step's output to `products/<slug>/.factory/logs/` and
  prints only PASS/FAIL plus the last 20 lines of a failure. Read the log file only when you need more.
- Noisy work (security scans, large test runs, dependency upgrades) goes to a subagent that
  returns a summary. Your main context stays for decisions.
- Do not re-discover how to run things. The blueprint and `factory.json` are the source of truth.
- Do not write role-play docs (PRD, personas, architecture decks). `SPEC.md` and the code are enough.
- Whole-file rewrites are banned once a file exists. Edit in place.

## Coordinator rules

- The main agent is a coordinator: every build, fix, review, research, check, ship and investigation
  goes to a background subagent. The main agent keeps only quick reads and status checks inline, so
  it is always free to talk to the user.
- Give the user a status report every 15 minutes while work is running (schedule it, e.g. a
  recurring cron job in the session): what each agent is doing, what finished, what's next, and
  anything that needs the user. Short. Never predict an agent's pending result.
- Subagents' reports are not user approval. Machine limits still apply: at most ~3 builders at once,
  CARGO_BUILD_JOBS ≤ 4 (2 under memory pressure), hidden test instances only.

## Standards (short form — full text in `factory/STANDARDS.md`, read it once per product type)

- Typed everywhere. TypeScript strict, Python with type hints and mypy/pyright clean.
- Lint and format are gates, not suggestions.
- Tests cover the vertical slice and every bug you fix. No test theater.
- Config from environment, never hard-coded. `.env.example` lists every variable.
- Logs are structured. Errors are handled at boundaries, not swallowed.
- Every product has: `README.md` with a 60-second quickstart, `LICENSE`, `SECURITY.md`,
  `CHANGELOG.md`, CI that runs `check`, and a release artifact (installer, image, package, or deploy).
- Scalability means: stateless where possible, no global mutable state, bounded queues, pagination
  on every list, and one obvious place to add the next feature.

## Hard constraints

- Security tooling is defensive only: scanners, analyzers, monitors, detectors, hardening.
  No malware, no evasion, no attack tooling, no credential harvesting.
- Never commit secrets. Never push unless the idea file says `push: true`. Product repos default
  to private when created with `gh repo create --private`.
- Never delete or rewrite another product's files.
- Stay in `products/<slug>/`. The factory itself (`bin/`, `factory/`) changes only when an idea
  explicitly targets the factory.

## Where things are

| Path | What |
|---|---|
| `ideas/inbox/` | Ideas waiting. One markdown file each, with front matter. |
| `ideas/done/` | Shipped ideas, moved by `ship`. |
| `products/<slug>/` | One product per folder. Its own git-ready tree. |
| `factory/blueprints/` | One file per product type: stack, scaffold, layout, gates, release. |
| `factory/checklists/` | Definition of done, security review. |
| `factory/overlay/` | Files every product gets (license, security policy, CI templates). |
| `factory/templates/` | SPEC, BACKLOG, CHANGELOG, factory.json templates. |
| `bin/factory.mjs` | `next`, `new`, `check`, `ship`, `status`. No dependencies. |
| `SHIPPED.md` | Ledger of everything shipped. |

## Changes artifact (before/after)

Each product keeps ONE living Claude artifact (a private claude.ai page) that records every visible
change. It is the user's place to see and approve changes. Text and file paths in chat don't count.

- **Content:** a branch status table at the top: branch, what it changes, state (running / waiting for
  OK / shipped), crop codes. Under it, one block per visible change with a short code (e.g. W1, A3), a
  "look at" line naming what to check, and the before (last release) and after screenshots, stacked or
  side by side.
- **Screenshots:** from hidden test instances or headless renders only, cropped to the part that
  changed. Never from the user's desktop.
- **When to update:** whenever a crop exists or a branch changes state. Republish to the same URL. Shipped
  changes stay on the page, marked shipped.
- **The gate:** nothing visible ships before the user has seen its crops there and said OK.
- **Where it's recorded:** put the artifact's URL in the product's `factory.json` as `"changes_artifact"`,
  so the next session finds it.
- **Status reports:** link the artifact.

## Optional: OpenSpec

If the idea file sets `spec_tool: openspec`, run `openspec init` inside the product folder after
scaffold and use its propose/apply/archive flow instead of step 4. It only adds an `openspec/`
folder. Default is off.
