# Development Guide

## Requirements

- Node.js 20+
- npm
- Redis

## Setup

```bash
npm install
cp .env.example .env
```

Recommended local values:

```bash
NODE_ENV=development
DATABASE_URL=file:./dev.db
REDIS_HOST=localhost
BOT_TOKEN=your_real_bot_token
```

Generate the Prisma client:

```bash
npm run db:generate
```

Start development mode:

```bash
npm run dev
```

## Useful Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:deploy`
- `npm run lint`
- `npm run lint:fix`
- `npm test`

## Repository Layout

```text
src/
  bot/         Telegram bot, middleware and commands
  config/      environment and feed-domain configuration
  database/    Prisma service and repositories
  jobs/        BullMQ queues and processors
  providers/   provider bridge integrations
  resilience/  Telegram recovery and health subsystems
  services/    application services
  utils/       parsing, security, filters, cache, rate limiting
prisma/
  schema.prisma
  migrations/
```

## Working Rules

- Prisma schema changes go in `prisma/schema.prisma` and migrations.
- Feed polling behavior is centralized in [`src/config/feed.config.ts`](../src/config/feed.config.ts).
- Command behavior lives under [`src/bot/commands`](../src/bot/commands).
- Queue orchestration belongs in [`src/jobs`](../src/jobs).

## Testing and Validation

Run:

```bash
npm run build
npm test
```

`npm test` is configured with `--passWithNoTests`, so build validation is currently the most important gate.

## Notes

- Redis is not optional in the current runtime because BullMQ workers depend on it.
- Docker startup runs `prisma migrate deploy` automatically.
- The repository has been cleaned to the TypeScript runtime only; do not reintroduce Python entrypoints or docs.
