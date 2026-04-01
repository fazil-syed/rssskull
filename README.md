# RSS Skull Bot

RSS Skull Bot is a TypeScript Telegram bot that monitors RSS, Atom, JSON Feed, Reddit subreddit RSS feeds and converted social sources, then delivers new items through a resilient queue-based pipeline.

## Stack

- Node.js 20+
- TypeScript
- grammY + `@grammyjs/runner`
- Fastify
- Prisma + SQLite
- BullMQ + Redis

## What It Does

- Monitors feeds on recurring schedules with Redis-backed workers
- Supports RSS 2.0, Atom 1.0 and JSON Feed 1.1
- Normalizes Reddit subreddit URLs to the public `/.rss` feed
- Converts or discovers feeds from YouTube and websites
- Applies include/exclude filters per feed
- Uses dedupe, retries, circuit breakers and health monitoring
- Exposes operational endpoints such as `/health`, `/stats`, `/metrics` and `/resilience-stats`

## Quick Start

### Docker

```bash
cp .env.example .env
```

Set `BOT_TOKEN` in `.env`, then run:

```bash
docker compose up -d --build
curl http://localhost:8916/health
```

If `BOT_TOKEN` is missing, Docker Compose now fails fast instead of starting a broken container.

### Local Development

Prerequisites:

- Node.js 20+
- Redis

Run:

```bash
npm install
cp .env.example .env
```

For local development, set at least:

```bash
NODE_ENV=development
DATABASE_URL=file:./dev.db
REDIS_HOST=localhost
BOT_TOKEN=your_real_bot_token
```

Then:

```bash
npm run db:generate
npm run dev
```

## Core Commands

- `/start`
- `/help`
- `/ping`
- `/add <name> <url>`
- `/list`
- `/remove <name>`
- `/enable <name>`
- `/disable <name>`
- `/discover <url>`
- `/status`
- `/filters ...`
- `/template ...`
- `/stats`

## Docs

- [Installation](docs/INSTALLATION.md)
- [Configuration](docs/CONFIGURATION.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Usage](docs/USAGE.md)
- [Operations](docs/OPERATIONS.md)
- [Development](docs/DEVELOPMENT.md)
- [Security](docs/SECURITY.md)

## License

MIT. See [LICENSE](LICENSE).
