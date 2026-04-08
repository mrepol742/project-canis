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
- Redis/Valkey
- WhatsApp Account
- Chrome browser
- FFMPEG


##  Skip through this long setup and use NPX
If you want to skip the setup and just want to run the bot, you can use NPX to run the bot without cloning the repo or installing dependencies.

```sh
npx project-canis
```

Once you install the bot using NPX, you configure the required environment variables in the `.env.example` using this command
```sh
export PROJECT_CANIS_ALIAS=Canis
# automatically reboot canis, if a potential memory leak has been detected,
# or the memory usage was just way too high
export PROJECT_AUTO_RESTART=false
export PROJECT_THRESHOLD_MEMORY=1024
export PROJECT_MAX_MEMORY=2048 # 2GB
export PROJECT_AUTO_DOWNLOAD_MEDIA=true
export PROJECT_MAX_DOWNLOAD_MEDIA=25 # 25MB
export PROJECT_ENABLE_BOT_FONT=true
# for more configuration, please refer to the .env.example file
```

Alternatively, you can also run the bot using this short command:
```sh
npx canis
```

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

4. **Generate Prisma Client**

   ```sh
   npx prisma generate
   ```

5. **Run Migration**

   ```sh
   npx prisma migrate dev
   ```

6. **Start bot**

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

Copyright 2026 Melvin Jones Repol

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
