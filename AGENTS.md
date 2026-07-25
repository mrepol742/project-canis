# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Project Canis is a multi-account WhatsApp chatbot built in TypeScript. It uses `whatsapp-web.js` (Puppeteer/Chrome automation) to connect to WhatsApp Web, dynamically loads commands, and integrates with MariaDB (via Prisma), Redis, multiple AI providers, and Sentry.

## Commands

```bash
# Development (runs via ts-node, auto-restarts on exit)
npm run dev

# Build TypeScript to dist/ (also runs prisma generate)
npm run build

# Production (runs compiled JS, auto-restarts on exit)
npm run start

# PM2 production
npm run build && pm2 start

# Database migrations
npx prisma migrate dev

# Regenerate Prisma client (after schema changes)
npx prisma generate

# Test Sentry integration
npm run test:sentry
```

There are no unit tests. `npm run build:clean` rebuilds without incremental cache.

## Architecture

### Boot sequence

`runner.ts` → spawns `index.ts` as a child process and restarts it on exit → `index.ts` initializes PhishTank, cron jobs, memory monitor, all WhatsApp accounts, then loads commands.

### Multi-account support

`src/components/client.ts` maintains a `Map<string, Client>` of active WhatsApp clients. Each account has a `clientId` (string) and an `isRoot` flag. Accounts are persisted in the `Account` Prisma model and loaded on startup via `getClientIds()`. New accounts can be added at runtime via the `connect` command which calls `addAccount()`.

### Command system

Commands live in `src/commands/` (and optionally `src/commands/private/` for private commands not tracked in git). Each command file must export:

```typescript
export const info = {
  command: "name",       // trigger keyword
  description: "...",
  usage: "name [args]",
  example: "name foo",
  role: "user",          // "user" | "admin" | "super-admin"
  cooldown: 5000,        // ms
  optOutAI?: boolean,    // prevent AI from handling this trigger
  dependencies?: [{ name: "pkg", version: "1.0.0" }], // auto-installed on load
};

export default async function (msg: Message): Promise<void> { ... }
```

The loader (`src/components/utils/cmd/loader.ts`) scans both directories, dynamically `require()`s each file, and registers matching exports into the `commands` record. When `AUTO_RELOAD=true`, a file watcher hot-reloads commands on save.

### Message flow

`message_create` / `message_edit` events → `src/components/events/message.ts`:
1. Filters (age, gif, status, broadcast, forwarded, bot senders)
2. Checks block list and `paused` setting (from Redis/DB via `getSetting`)
3. Normalizes message body (NFKC, strips diacritics/zero-width chars)
4. Strips command prefix (`COMMAND_PREFIX`, default `!`)
5. Looks up command handler; if none found → runs quiz/riddle checks, InstantDownloader, auto-react, and AI on @mentions
6. Rate limiting via `rateLimiter` (Redis-backed)
7. Role check (`user` / `admin` / `super-admin`)
8. Overrides `msg.reply()` to apply bot font and log latency
9. Calls `handler.exec(msg)`

### Key components

| Path | Purpose |
|---|---|
| `src/components/client.ts` | WhatsApp client lifecycle, event wiring |
| `src/components/events/message.ts` | Core message dispatch and middleware |
| `src/components/utils/cmd/loader.ts` | Dynamic command loading |
| `src/components/services/` | DB access layer (user, group, message, log, settings, account) |
| `src/components/utils/rateLimiter.ts` | Redis-backed per-user rate limiting |
| `src/components/utils/instantdl/` | YouTube/Facebook instant download |
| `src/components/ai/` | AI provider adapters (Groq, Gemini, OpenAI, OpenRouter, Ollama) |
| `src/components/phishtank.ts` | Phishing URL detection via PhishTank dataset |
| `src/components/redis.ts` | Shared Redis client |
| `src/components/prisma.ts` | Shared Prisma client |
| `src/cron.ts` | Cron job registry (add new jobs here) |
| `src/config.ts` | All env-var config with defaults |
| `src/generated/` | Auto-generated Prisma client — do not edit |

### Database (Prisma)

Schema at `prisma/schema.prisma`. Models: `User`, `Group`, `Message`, `Log`, `Account`. Default provider is `mysql` (MariaDB). Change the provider in the schema if needed, then re-run `prisma generate` and `prisma migrate dev`.

### Settings

Bot behaviour (e.g., `paused`, `auto_react`) is stored as key-value rows accessed via `getSetting(key)` / `setSetting(key, value)` in `src/components/services/settings.ts`, cached in Redis.

## Environment Setup

Copy `.env.example` to `.env`. Critical variables:

- `PUPPETEER_EXEC_PATH` — path to Chrome/Chromium/Edge/Firefox/Brave binary
- `DATABASE_URL` + `PRISMA_MARIA_DB_*` — MariaDB connection
- `REDIS_URL` — Redis/Valkey connection
- `AI_PROVIDER` — one of `openrouter | groq | gemini | openai | ollama`
- Corresponding `*_API_KEY` and `*_MODEL` for the chosen provider

## Adding a Cron Job

1. Create `src/jobs/yourjob.ts` — export `info: CronJobInfo` and a default async function.
2. Register it in `src/cron.ts` by importing and adding to the `jobs` array.

## Agent system

One unified agent — **Mj** — handles all AI interactions. The old personality commands (obi, naij, chad, sim) have been removed. `mj` and `ai` are both entry points to the same agent.

### Activation (no prefix required)

Three ways to trigger Mj in a chat:

1. **Direct command** — `mj <query>` or `ai <query>`
2. **Name mention** — any message containing "mj" as a word (e.g. "hey mj what's up")
3. **@mention** — @mention the bot in a group

Once activated, Mj continues replying to **that user in that chat** for 10 minutes of idle time — no need to re-trigger on every message. Session is tracked per-user-per-chat in Redis (`agent:session:{chatId}:{lid}`, 10 min TTL, refreshed on every reply).

### Thread storage

`src/components/ai/thread.ts` stores conversation history per user per chat in Redis:

- Key: `agent:thread:{lid}:{chatId}`
- Value: `ThreadMessage[]` — only `user` and `assistant` turns
- TTL: `AGENT_THREAD_TTL` (default 3600 s); refreshed on every append
- Oldest messages dropped when `AGENT_MAX_HISTORY` is exceeded

### Tools

`src/components/ai/tools/` — each file exports a typed `AgentTool` definition. `tools/index.ts` is the registry.

| Tool | File | Purpose |
|---|---|---|
| `web_search` | `tools/webSearch.ts` | DuckDuckGo search, returns top 5 results |
| `browse_page` | `tools/browsePage.ts` | Headless Chrome page text extraction |
| `shell` | `tools/shell.ts` | Shell execution (`AGENT_SHELL_ENABLED=true`, default on) |
| `send_file` | `tools/sendFile.ts` | Send a local file to the WhatsApp chat |
| `run_command` | `tools/botCommand.ts` | Execute a bot command by name |
| `list_commands` | `tools/listCommands.ts` | Discover available bot commands |
| `get_user` | `tools/userInfo.ts` | WhatsApp user info lookup |
| `get_group` | `tools/groupInfo.ts` | WhatsApp group info lookup |
| `bot_stats` | `tools/botStats.ts` | Memory / uptime / connected accounts |

`run_command` and `send_file` are **intercepted** in `agentRunner.ts` before tool execution — they set a result field in `AgentResult` and break the loop. `personalityHandler.ts` handles the result.

### File creation workflow

Agent creates files via `shell` (writes to `/tmp/mj-workspace/`), then calls `send_file` to deliver them to the user over WhatsApp. Multi-file projects get zipped first.

### Agentic loop

`src/components/ai/agentRunner.ts` runs the tool-calling loop for each provider:

- OpenAI, Groq, OpenRouter → shared `runOpenAILike()` helper
- Gemini → `runGemini()` using `functionDeclarations` / `functionResponse`
- Ollama → `runOllama()`

Loop cap: `AGENT_MAX_TOOL_ITERATIONS` (default 5).

### Adding a tool

1. Create `src/components/ai/tools/myTool.ts` — export an `AgentTool` const and optionally a `runMyTool()` function.
2. In `tools/index.ts`: import, add to `getTools()`, add a `case` to `executeTool()`.

### Key env vars

```
AGENT_THREAD_TTL=3600
AGENT_MAX_HISTORY=20
AGENT_MAX_TOOL_ITERATIONS=5
AGENT_SHELL_ENABLED=true
```
