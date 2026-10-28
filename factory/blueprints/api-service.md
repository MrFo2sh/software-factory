# Blueprint: api-service

## When
HTTP/JSON backends: search APIs, webhook receivers, monitoring ingestion, anything another program
calls. If a human opens it in a browser, use `web-app` instead.

## Stack
Hono on Node 24, TypeScript strict, zod (`@hono/zod-validator`), pino logs, vitest.
Storage if needed: Neon Postgres (Drizzle) or Upstash Redis via Vercel Marketplace.

## Scaffold
```
pnpm create hono@latest . --template nodejs --pm pnpm
pnpm add zod @hono/zod-validator pino
pnpm add -D vitest tsx typescript @types/node eslint prettier
```

## Layout
```
src/index.ts        server bootstrap only
src/app.ts          Hono app, exported for tests
src/routes/         one file per resource
src/lib/            pure logic
src/__tests__/      vitest using app.request()
```

## factory.json commands
```json
"install":   "pnpm install --frozen-lockfile",
"lint":      "pnpm eslint . && pnpm prettier --check .",
"typecheck": "pnpm tsc --noEmit",
"test":      "pnpm vitest run",
"build":     "pnpm tsc -p tsconfig.build.json",
"audit":     "pnpm audit --audit-level=high",
"run":       "pnpm tsx watch src/index.ts",
"release":   "docker build -t <slug>:latest ."
```

## Standards
Every route: zod-validated input, typed output, structured error `{ error: { code, message } }`.
`GET /healthz` and `GET /readyz`. Request id on every log line. Rate limit on public routes.
OpenAPI spec generated from the routes if the API is public.

## Scalability
Stateless. Idempotency keys on writes. Pagination by cursor. Background work to Vercel Queues
or a `worker-py` product. Timeouts on every outbound call.

## Release
Dockerfile (multi-stage, distroless) or Vercel. Image tagged with the version.
