# Project Canis

[![Build](https://github.com/mrepol742/project-canis/actions/workflows/build.yml/badge.svg)](https://github.com/mrepol742/project-canis/actions/workflows/build.yml) [![Docker CI](https://github.com/mrepol742/project-canis/actions/workflows/docker.yml/badge.svg)](https://github.com/mrepol742/project-canis/actions/workflows/docker.yml)

A scalable, modular WhatsApp chatbot built in TypeScript. It leverages modern best practices, lean architecture, Prisma ORM, Dockerization, and environment-based configuration to deliver a robust, flexible successor to Project Orion.

## Prerequisites

- Node.js (>=24)
- WhatsApp

## Getting started

1. **Clone repo**  

   ```bash
   git clone https://github.com/mrepol742/project-canis.git
   cd project-canis

2. **Install dependencies**

   ```
   npm install
   ```

3. **Setup environment variables**

   ```
   cp .env.example .env
   ```
   Edit .env with your WhatsApp credentials, DB connection, and other keys.

4. **Run**
   
   ```
   npm run start
   ```

#### Docker & Production

1. **Build image**

   ```
   docker build -t project-canis .
   ```

2. **Run with Docker Compose**
  
   ```
   docker-compose up -d
   ```

3. **Run with expose port**
  
   ```
   docker run -d -p 3000:3000 project-canis
   ```

#### PM2

1. **Build**
   ```
   npm run build
   ```

2. **Start**
 
   ```
   cd dist
   pm2 start ecosystem.config.js
   ```

#### NodeJS

1. **Build**

   ```
   npm run build
   ```

2. **Start**

   ```
   cd dist
   npm run start
   ```
