# Blueprint: web-app

## When
Anything a browser opens: dashboards, SaaS UIs, landing pages, admin panels, tools with forms.

## Stack
Next.js (App Router, TypeScript strict), Tailwind, shadcn/ui, zod for validation, Vercel for deploy.
Database only if the spec needs persistence: Neon Postgres via Vercel Marketplace with Drizzle.
Auth only if the spec needs accounts: Clerk via Vercel Marketplace.

## Scaffold
```
pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --use-pnpm --yes
pnpm dlx shadcn@latest init -d
pnpm add zod
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

## Layout
```
src/app/            routes, layouts, server actions
src/components/     ui (shadcn) and feature components
src/lib/            pure logic, validators, data access
src/lib/__tests__/  vitest
```
Server Components by default. `"use client"` only for interactivity. Node runtime, never edge.

## factory.json commands
```json
"install":   "pnpm install --frozen-lockfile",
"lint":      "pnpm eslint . && pnpm prettier --check .",
"typecheck": "pnpm tsc --noEmit",
"test":      "pnpm vitest run",
"build":     "pnpm next build",
"audit":     "pnpm audit --audit-level=high",
"run":       "pnpm next dev",
"release":   "vercel deploy --prod --yes"
```

## Standards
Every form validates with zod on the server. Every list paginates. Loading and error states for
every async boundary. Lighthouse performance 90+ on the main page. No secrets in client bundles.

## Scalability
Stateless routes. Cache with `use cache` where data allows. Images through `next/image`.
Heavy work in server actions or an `api-service` product, not in the request path of a page.

## Release
`vercel deploy --prod`. Env vars through `vercel env`. Preview deploy on every PR via Vercel Git.
