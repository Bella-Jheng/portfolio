#!/bin/bash
# 雲端 Claude Code session 啟動時安裝依賴，讓 lint / typecheck / test / commitlint 可以直接執行
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# 用 npm install 而非 npm ci：可沿用快取的 node_modules，重跑時比較快；
# --no-save 避免改動 package-lock.json，不讓每次開 session 都產生未提交的變更
npm install --no-save --no-audit --no-fund
