#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

CURRENT_BRANCH="$(git branch --show-current 2>/dev/null || true)"
if [[ "$CURRENT_BRANCH" == codex/* ]]; then
  echo "Release gate refused branch '$CURRENT_BRANCH'. Use feature/*, fix/*, or docs/*." >&2
  exit 1
fi

if [[ ! -x scripts/backup-blog-db.sh ]]; then
  echo "Missing executable backup helper: scripts/backup-blog-db.sh" >&2
  exit 1
fi

echo "==> Checking public files for private-path and workflow leaks"
LEAK_PATTERN='/Users/cash|codex|Codex|assistant|prompt|GH_ACTION|algorithm_assistant_deploy|db_profiles|amazonaws|bk_crm|34_80'
if rg -n "$LEAK_PATTERN" src docs --glob '!src/problemBank.ts'; then
  echo "Release gate found public-file leak candidates. Remove or justify them before release." >&2
  exit 1
fi

echo "==> npm run lint"
npm run lint

echo "==> npm run check:platform-exports"
npm run check:platform-exports

echo "==> npm run check:tracks"
npm run check:tracks

echo "==> npm run test"
npm run test

echo "==> npm run build"
npm run build

echo "==> npm run build:api"
npm run build:api

echo "Release gate passed. Deploy manually only when this is a coherent production slice."
