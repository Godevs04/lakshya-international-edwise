#!/usr/bin/env bash
# Local production smoke test: build image and run on port 4000
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env.local ]; then
  echo "Create .env.local from .env.example before running."
  exit 1
fi

echo "Building Docker image..."
docker compose build app

echo "Starting app + Redis..."
docker compose up -d

echo "Waiting for health check..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:4000/api/health >/dev/null 2>&1; then
    echo "App is healthy at http://localhost:4000"
    exit 0
  fi
  sleep 2
done

echo "Health check timed out. Run: docker compose logs -f app"
exit 1
