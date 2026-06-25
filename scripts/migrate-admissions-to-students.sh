#!/usr/bin/env bash
# One-time migration: move Admission menu records into Students menu.
#
# What it does:
#   Updates MongoDB students where recordType = "lead" ? recordType = "student"
#   Keeps every other field (contact, university, admissionRevenue, notes, etc.)
#
# Usage:
#   bash scripts/migrate-admissions-to-students.sh              # preview (dry run)
#   bash scripts/migrate-admissions-to-students.sh --confirm    # apply migration
#   SKIP_BACKUP=1 bash scripts/migrate-admissions-to-students.sh --confirm
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

MODE="--dry-run"
if [ "${1:-}" = "--confirm" ]; then
  MODE="--confirm"
elif [ -n "${1:-}" ]; then
  echo "Unknown option: $1"
  echo "Usage: bash scripts/migrate-admissions-to-students.sh [--confirm]"
  exit 1
fi

if [ "$MODE" = "--confirm" ]; then
  if [ "${SKIP_BACKUP:-}" != "1" ]; then
    echo "Creating MongoDB backup before migration..."
    if bash "$SCRIPT_DIR/backup-mongodb.sh"; then
      echo ""
    else
      echo "Backup failed or mongodump not installed."
      echo "Fix backup, or run with SKIP_BACKUP=1 to skip (not recommended)."
      exit 1
    fi
  fi

  echo "This will move ALL admission leads (recordType=lead) into the Students list."
  read -r -p "Type YES to continue: " CONFIRM
  if [ "$CONFIRM" != "YES" ]; then
    echo "Aborted."
    exit 1
  fi
fi

echo "Running migration ($MODE)..."
npx tsx scripts/migrate-admissions-to-students.ts "$MODE"
