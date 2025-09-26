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
   # Configure your AI Provider, models and other necessary preferences.
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
