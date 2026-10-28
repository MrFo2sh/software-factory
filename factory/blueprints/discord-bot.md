# Blueprint: discord-bot

## When
Discord bots: moderation, alerts, utilities, games, bridges to other systems.

## Stack
discord.js v14, TypeScript strict, Node 24, zod for config, pino logs, vitest.
Long-lived gateway process, so Docker, not Vercel.

## Scaffold
```
pnpm init
pnpm add discord.js zod pino dotenv
pnpm add -D typescript tsx vitest eslint prettier @types/node
pnpm tsc --init --target es2022 --module nodenext --strict --outDir dist --rootDir src
```

## Layout
```
src/index.ts          login, register handlers
src/commands/         one file per slash command: { data, execute }
src/events/           one file per gateway event
src/lib/              pure logic
scripts/deploy-commands.ts   registers slash commands (guild in dev, global in prod)
```

## factory.json commands
```json
"install":   "pnpm install --frozen-lockfile",
"lint":      "pnpm eslint . && pnpm prettier --check .",
"typecheck": "pnpm tsc --noEmit",
"test":      "pnpm vitest run",
"build":     "pnpm tsc",
"audit":     "pnpm audit --audit-level=high",
"run":       "pnpm tsx watch src/index.ts",
"release":   "docker build -t <slug>:latest ."
```

## Standards
Slash commands only. Every command defers the reply if work takes over 2 seconds. Permissions
declared on the command. Minimal gateway intents. Token only from env. Errors reply ephemerally
to the user and log with the interaction id.

## Scalability
Stateless handlers; state in a store, not memory. Sharding note in README for 2500+ guilds.
Rate-limit awareness: use discord.js queues, never raw fetch to Discord.

## Release
Docker image, `docker-compose.yml`, deploy guide for Fly.io or Railway in README.
