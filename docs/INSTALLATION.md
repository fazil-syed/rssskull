# Installation Guide

This project now runs only on the TypeScript/Node.js stack.

## Prerequisites

- Node.js 20+
- npm
- Redis 7+
- Telegram bot token from [@BotFather](https://t.me/botfather)

For Docker deployment you only need Docker and Docker Compose.

## Docker Installation

1. Clone the repository.
2. Copy the environment template.

```bash
cp .env.example .env
```

3. Edit `.env` and set at least `BOT_TOKEN`.
4. Start the stack.

```bash
docker compose up -d --build
```

5. Verify the service.

```bash
docker compose ps
curl http://localhost:8916/health
```

The app container runs Prisma migrations on startup and stores SQLite data in `/app/data`.

## Local Installation

1. Install dependencies.

```bash
npm install
```

2. Copy the environment template.

```bash
cp .env.example .env
```

3. For local development, update these values:

```bash
NODE_ENV=development
DATABASE_URL=file:./dev.db
REDIS_HOST=localhost
BOT_TOKEN=your_real_token
```

4. Start Redis locally, for example:

```bash
docker run --name rss-skull-redis -p 6379:6379 redis:7-alpine
```

5. Generate Prisma client and start the app.

```bash
npm run db:generate
npm run dev
```

## First Checks

- `curl http://localhost:8916/health`
- `curl http://localhost:8916/stats`
- send `/start` to the bot on Telegram

## Common Issues

### `BOT_TOKEN` missing or invalid

The app exits during startup or fails to initialize the bot.

### Redis unavailable

BullMQ workers depend on Redis. Verify `REDIS_HOST`, `REDIS_PORT` and container status.

### Prisma client missing

Run:

```bash
npm run db:generate
```

### Old webhook or second bot instance

The bot clears webhook state during startup, but a concurrent process with the same token can still cause `409 Conflict`.
