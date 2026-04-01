FROM node:20-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json tsconfig.json biome.json vitest.config.ts ./
COPY prisma ./prisma

RUN npm ci
RUN npx prisma generate --schema=./prisma/schema.prisma

COPY src ./src

RUN npm run build
RUN npm prune --omit=dev

FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs -m -d /home/nodejs nodejs

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN mkdir -p /app/data && \
    chmod +x /app/docker-entrypoint.sh && \
    chown -R nodejs:nodejs /app /home/nodejs

EXPOSE 8916

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=10 \
    CMD curl -f http://localhost:8916/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
