#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <lab-hostname-or-ip>"
  exit 1
fi

TARGET="$1"
TARGET_URL="${TARGET%/}"
TARGET_SCHEME=""
if [[ "$TARGET_URL" == http://* ]]; then
  TARGET_SCHEME="http"
elif [[ "$TARGET_URL" == https://* ]]; then
  TARGET_SCHEME="https"
fi

TARGET_URL="${TARGET_URL#http://}"
TARGET_URL="${TARGET_URL#https://}"
TARGET_URL="${TARGET_URL%%/*}"

TARGET_HOST="${TARGET_URL%%:*}"
TARGET_PORT="${TARGET_URL##*:}"
if [[ "$TARGET_URL" == "$TARGET_HOST" ]]; then
  TARGET_PORT="3000"
fi

if [[ -z "$TARGET_SCHEME" ]]; then
  if [[ "$TARGET_HOST" == "localhost" || "$TARGET_HOST" == "127.0.0.1" || "$TARGET_PORT" == "3000" ]]; then
    TARGET_SCHEME="http"
  else
    TARGET_SCHEME="https"
  fi
fi

if [[ "$TARGET_SCHEME" == "http" ]]; then
  FALLBACK_SCHEME="https"
else
  FALLBACK_SCHEME="http"
fi

echo "[phase6] Checking root headers..."
curl -I "${TARGET_SCHEME}://${TARGET_URL}" || curl -I "${FALLBACK_SCHEME}://${TARGET_URL}"

echo
echo "[phase6] Checking health endpoint..."
curl -i "${TARGET_SCHEME}://${TARGET_URL}/api/health" || curl -i "${FALLBACK_SCHEME}://${TARGET_URL}/api/health"

echo
echo "[phase6] Checking scenarios endpoint..."
curl -i "${TARGET_SCHEME}://${TARGET_URL}/api/scenarios" || curl -i "${FALLBACK_SCHEME}://${TARGET_URL}/api/scenarios"

if command -v nmap >/dev/null 2>&1; then
  echo
  echo "[phase6] Running safe service detection..."
  nmap -sV -Pn -p "$TARGET_PORT" "$TARGET_HOST" || true
else
  echo "[phase6] nmap is not installed on this workstation."
fi
