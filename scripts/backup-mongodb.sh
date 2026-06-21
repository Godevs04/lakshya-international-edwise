#!/usr/bin/env bash
# MongoDB Atlas / self-hosted backup helper
# Loads MONGODB_URI from .env.local in the project root when not set in the shell.
# Usage: bash scripts/backup-mongodb.sh [output-dir]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_DIR="${1:-$ROOT_DIR/backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_PATH="${OUTPUT_DIR}/nandhini-crm-${TIMESTAMP}"

read_env_value() {
  local key="$1"
  local file="$2"
  if [ ! -f "$file" ]; then
    return 1
  fi
  grep -E "^${key}=" "$file" | tail -n 1 | cut -d'=' -f2- | sed 's/^["'\''"]//; s/["'\''"]$//' | tr -d '\r'
}

if [ -z "${MONGODB_URI:-}" ]; then
  MONGODB_URI="$(read_env_value "MONGODB_URI" "$ROOT_DIR/.env.local" || true)"
fi

if [ -z "${MONGODB_URI:-}" ]; then
  MONGODB_URI="$(read_env_value "MONGODB_URI" "$ROOT_DIR/.env" || true)"
fi

if [ -z "${MONGODB_URI:-}" ]; then
  echo "MONGODB_URI not found."
  echo "Set it in the environment or in $ROOT_DIR/.env.local"
  exit 1
fi

if ! command -v mongodump >/dev/null 2>&1; then
  echo "mongodump not found. Install MongoDB Database Tools:"
  echo "https://www.mongodb.com/docs/database-tools/installation/"
  echo ""
  echo "macOS (Homebrew): brew install mongodb-database-tools"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"
echo "Backing up to ${BACKUP_PATH} ..."
mongodump --uri="$MONGODB_URI" --out="$BACKUP_PATH"
echo "Backup complete: ${BACKUP_PATH}"
