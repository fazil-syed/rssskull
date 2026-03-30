# Operations Manual

## Service Endpoints

### `GET /health`

Main health signal. Used by Docker health checks.

### `GET /stats`

Runtime overview including queue, cache, memory and resilience information.

### `GET /metrics`

Detailed resilience metrics when available.

### `GET /cache-stats`
### `GET /cbstats`
### `GET /resilience-stats`

Operational support endpoints for cache, circuit breaker and Telegram resilience inspection.

## Docker Operations

Start:

```bash
docker compose up -d --build
```

Stop:

```bash
docker compose down
```

Full reset including Redis and SQLite volume data:

```bash
docker compose down -v
```

Logs:

```bash
docker compose logs -f rss-skull-bot
docker compose logs -f redis
```

## Database Notes

- Docker stores SQLite at `/app/data/production.db`
- local development typically uses `file:./dev.db`
- Prisma migrations are applied on container startup through `docker-entrypoint.sh`

## Redis Notes

BullMQ workers require Redis. If Redis is unhealthy, feed checks and message delivery will degrade immediately.

Useful checks:

```bash
docker compose ps
docker compose logs redis --tail=100
```

## Manual Backup

The repository includes a Node backup helper:

```bash
node scripts/backup-database.js backup
```

Restore:

```bash
node scripts/backup-database.js restore <backup-file>
```

## Common Failure Modes

### Telegram startup conflict

Usually caused by another process using the same bot token.

### Redis unavailable

Queue workers cannot schedule or process feed jobs.

### Migration drift

If Prisma migration deployment fails, inspect container logs first. The current entrypoint tolerates migration failure so the app can still expose diagnostics.

### Missing feeds in queue

Use the bot `/status` command and inspect `/stats` to verify recurring jobs and feed state.
