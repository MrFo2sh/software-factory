# Blueprint: agent

## When
An AI agent or agent-powered app: assistants with tools, automations that reason, chat products.

## Stack
TypeScript strict, Node 24. Model: `claude-opus-5-5` by default via the official `@anthropic-ai/sdk`.
- Custom tools you define: the SDK **tool runner** (`client.beta.messages.toolRunner` with `betaZodTool`).
- Filesystem, coding, or bash agents: the **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`).
- Scheduled or hosted agents with a workspace: Managed Agents.
Use adaptive thinking (the default), streaming for long outputs, and server-side refusal fallbacks.
Never use `budget_tokens`, prefill, or forced `tool_choice` on Claude 5 models.
UI, if any: `web-app` blueprint with the Vercel AI SDK through AI Gateway.

## Scaffold
```
pnpm init
pnpm add @anthropic-ai/sdk zod
pnpm add -D typescript tsx vitest eslint prettier @types/node
pnpm tsc --init --target es2022 --module nodenext --strict --outDir dist --rootDir src
```

## Layout
```
src/index.ts        entry
src/agent.ts        system prompt, tool list, runner
src/tools/          one file per tool: zod schema + handler, pure and testable
src/lib/            domain logic
src/__tests__/      tool handlers tested without the model; one recorded end-to-end run
```

## factory.json commands
Same as `discord-bot`. `run` = `pnpm tsx src/index.ts`.

## Standards
System prompt in one file, versioned. Every tool validates its input and returns a short result.
Tool errors go back to the model as `is_error`, never thrown. Token usage logged per run.
A `--dry-run` that prints the plan without calling the API. Prompt caching on the stable prefix.

## Scalability
Stateless runs keyed by a run id. Long conversations use compaction. Fan-out work goes to
subagents or Managed Agents workflows, not loops in one context.

## Release
CLI (npm package), Docker, or Vercel for the HTTP surface. API key only from env.
