# Configuration Reference

Configuration is environment-driven. Copy `.env.example` to `.env` and adjust values for your environment.

## Required

### `BOT_TOKEN`

Telegram token from `@BotFather`.

## Runtime

### `NODE_ENV`

- `production`
- `development`
- `test`

Used by the config loader and some security/runtime branches.

### `LOG_LEVEL`

- `debug`
- `info`
- `warn`
- `error`

### `PORT`

HTTP port for Fastify. Default: `8916`.

### `HOST`

Bind address. Default: `0.0.0.0`.

## Persistence

### `DATABASE_URL`

Prisma SQLite URL.

Examples:

```bash
DATABASE_URL=file:/app/data/production.db
DATABASE_URL=file:./dev.db
```

## Redis

Redis is required for BullMQ workers.

### `REDIS_HOST`
### `REDIS_PORT`
### `REDIS_PASSWORD`
### `REDIS_DB`

Defaults come from `.env.example`.

## Access Control

### `ALLOWED_USER_ID`

When set, blocks interactions from other Telegram users.

## Reddit

There are no Reddit-specific environment variables.

When you add a Reddit subreddit URL, the bot normalizes it to the public feed endpoint:

```text
https://www.reddit.com/r/<subreddit>/.rss
```

## Optional Providers

### `FEATURE_INSTAGRAM`

Feature flag for Instagram support.

### `RSS_BRIDGE_HOST`

Bridge host used by provider integrations. Default in Docker is `http://rss-bridge:80`.

## Telegram Resilience

### `TELEGRAM_RESILIENCE_ENABLED`
### `TELEGRAM_MAX_RETRIES`
### `TELEGRAM_BASE_DELAY`
### `TELEGRAM_MAX_DELAY`
### `TELEGRAM_CIRCUIT_BREAKER_THRESHOLD`
### `TELEGRAM_CIRCUIT_BREAKER_TIMEOUT`

These drive the Telegram recovery layer under [`src/resilience`](../src/resilience/README.md).

## Message Queue

### `MESSAGE_QUEUE_ENABLED`
### `MESSAGE_QUEUE_MAX_SIZE`
### `MESSAGE_QUEUE_BATCH_SIZE`
### `MESSAGE_QUEUE_PROCESSING_INTERVAL`
### `MESSAGE_QUEUE_MESSAGE_TTL`

Controls the persistent retry queue used when Telegram delivery fails.

## Health Monitoring

### `HEALTH_CHECK_INTERVAL`
### `ALERT_THRESHOLD_ERROR_RATE`
### `ALERT_THRESHOLD_DOWNTIME_MINUTES`
### `ALERT_THRESHOLD_QUEUE_SIZE`

## Cleanup

### `JOB_CLEANUP_ENABLED`
### `JOB_CLEANUP_INTERVAL_MINUTES`
### `JOB_CLEANUP_THOROUGH_INTERVAL_HOURS`
### `JOB_CLEANUP_ORPHANED_THRESHOLD`

These settings tune orphaned BullMQ job cleanup and recurring maintenance.

## Anti-Blocking

### `ANTI_BLOCK_ENABLED`
### `ANTI_BLOCK_MIN_DELAY`
### `ANTI_BLOCK_MAX_DELAY`
### `ANTI_BLOCK_CIRCUIT_BREAKER_THRESHOLD`

These values complement the domain rules in [`src/config/feed.config.ts`](../src/config/feed.config.ts).
