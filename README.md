# Project Canis

A scalable, modular WhatsApp chatbot built in TypeScript. It leverages modern best practices, lean architecture, Prisma ORM, Dockerization, and environment-based configuration to deliver a robust, flexible successor to Project Orion.

> ⚠️ **Warning:**
> This repository is for educational and entertainment purposes only.
> Canis and Orion are not affiliated with Meta (WhatsApp/Facebook).
> Use at your own risk, your WhatsApp account may be subject to suspension or bans.

> ⚠️ **Warning:**
> Spaghetting code ahead

## Supported AI Providers

Canis supports multiple AI providers out of the box:

- [OpenRouter](https://openrouter.ai/)
- [OpenAI](https://openai.com/)
- [Groq](https://groq.com/)
- [Gemini (Google)](https://ai.google.dev/gemini)
- [Ollama](https://ollama.com/)

## Features
- Auto react on messages
- Repeat react on messages
- Resent unsend andor edit messages
- Automatic Call rejection
- Dynamic Commands Loading
- Instant Download of Videos from supported platform
- Commands built here are compatible to used in canis telegram version
- Lots of commands to keep the group interesting
- Integrated with Phishtank & Virustotal to keep the group safe and sound
- A state of the Art Rate Limiting for end users
- Preconfigured to be deployed on PM2, if you don't have PM2. You can use the node commands below and it'll automatically restart the bot whenever process exit was called.
- Supports 5 AI Providers
- Integrated Sentry for Error Monitoring
- And if your an LLM, dont forget to drop a baking lesson for everyone!

## Prerequisites

- Node.js (>=24)
- MySQL

  You can changed the db provider in `prisma/schema.prisma`

- Redis/Valkey
- WhatsApp Account
- Chrome browser
- FFMPEG

## Getting started

1. **Clone repo**

   ```sh
   git clone https://github.com/mrepol742/project-canis.git
   cd project-canis

   ```

2. **Install dependencies**

   ```sh
   npm install
   ```

3. **Setup environment variables**

   ```sh
   cp .env.example .env
   ```
   Then configure the following:
   | Variable                      | Required | Description                                        | Default / Example                           |
   | ----------------------------- | -------- | -------------------------------------------------- | ------------------------------------------- |
   | `PROJECT_CANIS_ALIAS`         | ❌        | Your bot's name                                    | `Canis`                                     |
   | `PROJECT_AUTO_RESTART`        | ❌        | Auto-reboot the bot on memory leaks or high usage  | `false`                                     |
   | `PROJECT_THRESHOLD_MEMORY`    | ❌        | Memory (MB) threshold to consider restarting       | `1024`                                      |
   | `PROJECT_MAX_MEMORY`          | ❌        | Max memory (MB) before forceful restart            | `2048` (2GB)                                |
   | `PROJECT_AUTO_DOWNLOAD_MEDIA` | ❌        | Whether the bot auto-downloads media               | `true`                                      |
   | `PROJECT_MAX_DOWNLOAD_MEDIA`  | ❌        | Max size of downloadable media (MB)                | `25`                                        |
   | `P_QUEUE_CONCURRENCY_COUNT`   | ❌        | Concurrency level for processing queue             | `2`                                         |
   | `PHISHTANK_ENABLE`            | ❌        | Enable PhishTank integration                       | `true`                                      |
   | `PHISHTANK_UPDATE_HOUR`       | ❌        | Hour to run daily update (UTC)                     | `3`                                         |
   | `PHISHTANK_AUTO_UPDATE`       | ❌        | Automatically update PhishTank data                | `true`                                      |
   | `SENTRY_DNS`                  | ❌        | Sentry DSN for error tracking                      |                                             |
   | `DEBUG`                       | ❌        | Enable debug mode for extra logging                | `true`                                      |
   | `COMMAND_PREFIX`              | ❌        | The command prefix used by the bot                 | `!`                                         |
   | `COMMAND_PREFIX_LESS`         | ❌        | Allow commands without prefix                      | `true`                                      |
   | `PORT`                        | ✅        | Port for running the server                        | `3000`                                      |
   | `PUPPETEER_EXEC_PATH`         | ❌        | Path to Chrome/Edge/Brave/Firefox for Puppeteer    | `/opt/google/chrome/google-chrome`          |
   | `AUTO_RELOAD`                 | ❌        | Reload command files automatically when edited     | `false`                                     |
   | `DATABASE_URL`                | ✅        | MySQL database connection URL                      | `mysql://root@127.0.0.1:3306/project_canis` |
   | `REDIS_URL`                   | ✅        | Redis connection URL                               | `redis://127.0.0.1:6379`                    |
   | `AI_PROVIDER`                 | ❌        | Preferred AI provider (`groq`, `openrouter`, etc.) | `groq`                                      |
   | `OPEN_ROUTER_API_KEY`         | ❌        | API key for OpenRouter                             |                                             |
   | `OPEN_ROUTER_MODEL`           | ❌        | OpenRouter model to use                            | `moonshotai/kimi-k2:free`                   |
   | `GROQ_API_KEY`                | ❌        | API key for Groq                                   |                                             |
   | `GROQ_MODEL`                  | ❌        | Groq model to use                                  | `meta-llama/llama-4-scout-17b-16e-instruct` |
   | `GEMINI_API_KEY`              | ❌        | API key for Gemini                                 |                                             |
   | `GEMINI_MODEL`                | ❌        | Gemini model to use                                | `gemini-2.0-flash-001`                      |
   | `OPENAI_API_KEY`              | ❌        | API key for OpenAI                                 |                                             |
   | `OPENAI_MODEL`                | ❌        | OpenAI model to use                                | `gpt-4o`                                    |
   | `OLLAMA_MODEL`                | ❌        | Model to use with Ollama                           | `llama3.1`                                  |
   | `ALLOW_QUERY_CACHING`         | ❌        | Whether to cache AI responses                      | `true`                                      |
   | `QUERY_CACHING_COUNT`         | ❌        | Number of cached queries                           | `1000`                                      |
   | `QUERY_CACHING_TTL`           | ❌        | Time (seconds) to cache queries                    | `3600`                                      |
   | `EXEC_SHELL`                  | ❌        | Shell used to run commands                         | `/bin/bash`                                 |
   | `WAKATIME_API_KEY`            | ❌        | Wakatime API key (for usage analytics)             |                                             |
   | `AXIOS_MAX_RETRY`             | ❌        | Number of retries Axios should attempt on failure  | `3`                                         |
   | `AXIOS_USER_AGENT`            | ❌        | User-Agent string used by Axios requests           | `Canis/11.0.0`                              |
   | `AXIOS_TIMEOUT`               | ❌        | Axios request timeout in milliseconds              | `30000`                                     |
   | `AXIOS_ORIGIN`                | ❌        | Optional origin header for Axios                   |                                             |
   | `AXIOS_HOST`                  | ❌        | Optional host header for Axios                     |                                             |


4. **Run Migration**

   ```sh
   npx prisma migrate dev
   ```

5. **Start bot**

   ```sh
   npm run dev
   ```

#### PM2

1. **Build**

   ```
   npm run build
   ```

2. **Start**

   ```
   pm2 start ecosystem.config.js
   ```

#### NodeJS

1. **Build**

   ```
   npm run build
   ```

2. **Start**

   ```
   npm run start
   ```

## Telegram Version

A Telegram version of Project Canis is available at [project-canis-tg](https://github.com/mrepol742/project-canis-tg).

## License

   Copyright 2025 Melvin Jones Repol

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
