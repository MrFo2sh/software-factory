# Blueprint: worker-py

## When
Long-running processes: monitors, collectors, watchers, scheduled scanners, log tailers, alerters.
No UI. The dashboard, if any, is a separate `web-app` idea reading the same store.

## Stack
Python 3.12, uv, asyncio, structlog, pydantic-settings (config), prometheus-client (metrics),
httpx (outbound), pytest + pytest-asyncio. Storage: SQLite via `aiosqlite` for single-node,
Postgres for multi-node.

## Scaffold
```
uv init --package --python 3.12 .
uv add structlog pydantic-settings prometheus-client httpx aiosqlite
uv add --dev pytest pytest-asyncio ruff mypy bandit
```

## Layout
```
src/<pkg>/__main__.py   entry: load settings, start loops, serve /healthz and /metrics
src/<pkg>/settings.py   pydantic-settings, every var in .env.example
src/<pkg>/collectors/   one async loop per source
src/<pkg>/sinks/        where results go (db, webhook, stdout)
src/<pkg>/core/         pure logic
tests/
```

## factory.json commands
Same as `cli-py`, with `"run": "uv run python -m <pkg>"` and `"release": "docker build -t <slug>:latest ."`.

## Standards
Graceful shutdown on SIGTERM. Backoff with jitter on every retry. Bounded queues between
collectors and sinks. `/healthz`, `/metrics`. Structured JSON logs with a run id.
Alert rules in config, not code.

## Scalability
Each collector is independent and restartable. Partition by source so N workers can split the load.
Idempotent writes. Dedup window on alerts.

## Release
Dockerfile (python slim, non-root user), `docker-compose.yml` for local, image tagged with version.
