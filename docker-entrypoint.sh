#!/bin/sh
set -eu

echo "🚀 Starting RSS Skull Bot..."

mkdir -p /app/data

: "${DATABASE_URL:=file:/app/data/production.db}"
export DATABASE_URL

if [ "$DATABASE_URL" = "file:/app/data/production.db" ] && [ ! -f /app/data/production.db ]; then
    touch /app/data/production.db
fi

echo "📋 Applying Prisma migrations..."
if ! npx prisma migrate deploy --schema=./prisma/schema.prisma; then
    echo "⚠️ Prisma migrate deploy failed, continuing with current database state..."
fi

echo "🎯 Starting RSS Skull Bot..."
exec node dist/main.js
