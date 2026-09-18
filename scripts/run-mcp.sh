#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f dist/index.js ]]; then
  echo "ParaDOCS Convert: dist/index.js missing. Run npm install && npm run build in the plugin root." >&2
  exit 1
fi

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source <(grep -v '^\s*#' .env.local | grep -v '^\s*$' | sed 's/\r$//')
  set +a
fi

exec node dist/index.js
