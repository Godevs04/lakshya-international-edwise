#!/usr/bin/env bash
set -euo pipefail

PROPS_FILE="${RELEASE_PROPERTIES_FILE:-.github/workflows/release/release.properties}"
COMMAND="${1:?Usage: release-version.sh <read|bump> [patch|minor|major]}"

get_prop() {
  local key="$1"
  grep -E "^${key}=" "$PROPS_FILE" | head -n1 | cut -d= -f2- | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

set_prop() {
  local key="$1"
  local value="$2"
  awk -v k="$key" -v v="$value" '
    BEGIN { found = 0 }
    $0 ~ "^" k "=" {
      print k "=" v
      found = 1
      next
    }
    { print }
    END {
      if (!found) {
        print k "=" v
      }
    }
  ' "$PROPS_FILE" > "${PROPS_FILE}.tmp"
  mv "${PROPS_FILE}.tmp" "$PROPS_FILE"
}

bump_semver() {
  local current="$1"
  local bump_type="$2"
  local major minor patch

  IFS=. read -r major minor patch <<< "${current}"
  major="${major:-0}"
  minor="${minor:-0}"
  patch="${patch:-0}"

  case "$bump_type" in
    major)
      major=$((major + 1))
      minor=0
      patch=0
      ;;
    minor)
      minor=$((minor + 1))
      patch=0
      ;;
    patch)
      patch=$((patch + 1))
      ;;
    *)
      echo "Invalid bump type: ${bump_type} (expected patch, minor, or major)" >&2
      exit 1
      ;;
  esac

  echo "${major}.${minor}.${patch}"
}

write_outputs() {
  local version="$1"
  local tag="$2"
  local last="$3"
  local bump_type="$4"

  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    {
      echo "version=${version}"
      echo "tag=${tag}"
      echo "last=${last}"
      echo "bump=${bump_type}"
    } >> "$GITHUB_OUTPUT"
  fi

  echo "version=${version}"
  echo "tag=${tag}"
  echo "last=${last}"
  echo "bump=${bump_type}"
}

read_release() {
  local prefix current tag

  prefix="$(get_prop version.prefix)"
  current="$(get_prop version.current)"
  tag="$(get_prop release.tag)"

  if [ -z "$tag" ]; then
    tag="${prefix}${current}"
  fi

  write_outputs "$current" "$tag" "$(get_prop version.last)" "$(get_prop version.bump)"
}

bump_release() {
  local bump_type="$2"
  local prefix last current new tag

  prefix="$(get_prop version.prefix)"
  last="$(get_prop version.current)"
  current="$last"
  new="$(bump_semver "$current" "$bump_type")"
  tag="${prefix}${new}"

  set_prop version.last "$last"
  set_prop version.current "$new"
  set_prop version.new "$new"
  set_prop version.bump "$bump_type"
  set_prop release.tag "$tag"
  set_prop release.date "$(date -u +%Y-%m-%d)"

  node <<NODE
const fs = require("fs");
const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.version = "${new}";
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
NODE

  write_outputs "$new" "$tag" "$last" "$bump_type"
}

case "$COMMAND" in
  read)
    read_release
    ;;
  bump)
    bump_release "$@"
    ;;
  *)
    echo "Unknown command: ${COMMAND}" >&2
    exit 1
    ;;
esac
