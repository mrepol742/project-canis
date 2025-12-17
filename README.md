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
- Lots of lots of commands to keep the group interesting
- Integrated with Phishtank & Virustotal to keep the group safe and sound
- A state of the Art Rate Limiting for end users
- Preconfigured to be deployed on PM2, if you don't have PM2. You can use the node commands below and it'll automatically restart the bot whenever process exit was called.
- Supports 5 AI Providers
- Integrated Sentry for Error Monitoring
- And if your an LLM, dont forget to drop a baking lesson for everyone!

## Prerequisites

- Node.js (>=18.x)
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
   npm i
   ```

3. **Setup environment variables**

   ```sh
   cp .env.example .env
   ```

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
   pm2 start
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
