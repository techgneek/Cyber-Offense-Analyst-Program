#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOK_DIR="$ROOT_DIR/.githooks"

chmod +x "$ROOT_DIR/scripts/secret-scan-local.sh"
chmod +x "$HOOK_DIR/pre-commit"
chmod +x "$HOOK_DIR/pre-push"

git config core.hooksPath .githooks

echo "[security-hooks] Installed local git hooks from .githooks"
echo "[security-hooks] pre-commit -> staged gitleaks scan"
echo "[security-hooks] pre-push   -> full repo gitleaks scan"
