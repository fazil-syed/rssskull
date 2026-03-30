# System Architecture

RSS Skull Bot is organized around a queue-driven TypeScript runtime.

## Main Entry Point

[`src/main.ts`](../src/main.ts) bootstraps:

- Prisma database connection
- Fastify HTTP server
- BullMQ queues and workers
- memory/error recovery services
- Telegram bot initialization and polling

## Main Components

### Bot Layer

[`src/bot/bot.service.ts`](../src/bot/bot.service.ts)

- initializes grammY
- registers middleware and commands
- handles startup, polling, command routing and resilience integration
- loads saved feeds and schedules recurring checks

### HTTP Layer

Fastify endpoints are declared in [`src/main.ts`](../src/main.ts).

Important endpoints:

- `/health`
- `/stats`
- `/metrics`
- `/cache-stats`
- `/cbstats`
- `/resilience-stats`

### Persistence

Prisma models live in [`prisma/schema.prisma`](../prisma/schema.prisma).

Core entities:

- `Chat`
- `Feed`
- `ChatSettings`
- `FeedFilter`
- `Statistic`
- `ItemDedupe`
- `ConnectionState`
- `HealthMetric`
- `QueuedMessage`
- `BlockingStats`

### Feed Management

[`src/services/feed.service.ts`](../src/services/feed.service.ts)

- validates user input
- prevents duplicate names and URLs
- converts or discovers feeds
- stores feed metadata
- schedules recurring BullMQ jobs

### Feed Fetching and Parsing

[`src/services/rss.service.ts`](../src/services/rss.service.ts)

- detects and normalizes Reddit routes to `/.rss`
- fetches feeds with retries
- supports RSS, Atom and JSON Feed
- uses cache, rate limiting, user-agent rotation and circuit breakers

Related pieces:

- [`src/services/reddit.service.ts`](../src/services/reddit.service.ts)
- [`src/services/parser.service.ts`](../src/services/parser.service.ts)
- [`src/utils/feed-discovery.ts`](../src/utils/feed-discovery.ts)
- [`src/utils/feed-type-detector.ts`](../src/utils/feed-type-detector.ts)

### Queue Processing

[`src/jobs/feed-queue.service.ts`](../src/jobs/feed-queue.service.ts)

- owns `feed-check` and `message-send` queues
- creates parallel workers
- schedules recurring checks
- cleans orphaned jobs

Processors:

- [`src/jobs/processors/feed-checker.processor.ts`](../src/jobs/processors/feed-checker.processor.ts)
- [`src/jobs/processors/message-sender.processor.ts`](../src/jobs/processors/message-sender.processor.ts)

### Notification Delivery

[`src/services/notification.service.ts`](../src/services/notification.service.ts)

- formats RSS items
- chunks messages to Telegram limits
- rate limits outgoing sends
- queues failed sends when resilience is enabled

### Resilience

[`src/resilience`](../src/resilience/README.md)

The resilience layer provides:

- retry with backoff
- Telegram circuit breaker
- persistent retry queue
- health metrics
- recovery management

## High-Level Flow

1. A user adds a feed through Telegram.
2. `FeedService` validates, converts or discovers the feed URL.
3. The feed is stored in SQLite through Prisma.
4. `FeedQueueService` registers a recurring BullMQ job.
5. The feed-check worker fetches and parses the feed.
6. New items are deduped and filtered.
7. A message-send job is enqueued.
8. `NotificationService` sends the final Telegram messages.

## Anti-Blocking Strategy

The project uses several layers together:

- per-domain rate limiting
- user-agent rotation
- request caching
- circuit breakers
- Reddit-specific RSS normalization
- domain-specific interval configuration in [`src/config/feed.config.ts`](../src/config/feed.config.ts)

## Operational Note

The repository has been consolidated onto the TypeScript runtime. Legacy Python services and docs are no longer part of the active architecture.
