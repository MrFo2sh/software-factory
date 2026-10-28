# Standards (all products)

Read once per product type. The blueprint adds type-specific rules on top.

## Code
- Typed, strict. No `any`, no untyped dict payloads crossing module boundaries.
- Small modules with one job. Pure logic separated from IO so it is testable without mocks.
- Names say what things are. No abbreviations that need a comment.
- No dead code, no commented-out code, no TODOs without a backlog line.
- Formatter and linter clean. These are gates in `check`.

## Tests
- The vertical slice has an end-to-end test. Every bug fix adds a regression test.
- Fixtures are real samples, trimmed, in `tests/fixtures/`. Never generated on the fly in a test.
- Tests run in under 60 seconds locally. Slow tests get a marker and run in CI only.

## Config and secrets
- Every setting from environment. `.env.example` lists all with a comment. Defaults are safe.
- Secrets never in code, logs, error messages, or test fixtures.

## Errors and logs
- Fail loudly at startup for bad config. Fail gracefully at runtime for bad input.
- Structured logs (JSON in prod, pretty in dev). One correlation id per request or run.
- User-facing errors say what happened and what to do. Internal errors carry context.

## Security (defensive posture, every product)
- Validate every input at the boundary. Encode every output for its context.
- Least privilege: minimal permissions, intents, scopes, file access.
- Dependencies pinned via lockfile. `audit` step runs in `check`.
- No eval, no shell string concatenation, no path joins from user input without normalization.
- Products that read untrusted files treat them as data: parse, never execute.

## Scalability
- Stateless where possible; state in one well-named store.
- Bounded everything: queues, batch sizes, retries, timeouts, result pages.
- Hot paths measured before optimized. Keep a `PERF.md` note if you tuned something.
- One obvious place to add the next feature. If a feature touches five files, the structure is wrong.

## Docs
- `README.md`: what it is, 60-second quickstart, config table, how to run `check`, license.
- `CHANGELOG.md` kept by `ship`. `SECURITY.md` from the overlay. `LICENSE` MIT unless the idea says otherwise.
