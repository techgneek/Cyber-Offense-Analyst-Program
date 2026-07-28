#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-staged}"
GITLEAKS_BIN="gitleaks"
GITLEAKS_VERSION="8.24.2"

if [[ "${SKIP:-}" == "secret-scan" ]]; then
  echo "[secret-scan] Bypass active via SKIP=secret-scan (emergency use only)."
  exit 0
fi

ensure_gitleaks() {
  if command -v gitleaks >/dev/null 2>&1; then
    GITLEAKS_BIN="gitleaks"
    return 0
  fi

  local os arch archive_name url bin_dir tar_path
  os="$(uname -s)"
  arch="$(uname -m)"

  case "$os" in
    Darwin) os="darwin" ;;
    Linux) os="linux" ;;
    *)
      echo "[secret-scan] Unsupported OS: $os"
      echo "Install gitleaks manually: https://github.com/gitleaks/gitleaks"
      exit 1
      ;;
  esac

  case "$arch" in
    arm64|aarch64) arch="arm64" ;;
    x86_64|amd64) arch="x64" ;;
    *)
      echo "[secret-scan] Unsupported architecture: $arch"
      echo "Install gitleaks manually: https://github.com/gitleaks/gitleaks"
      exit 1
      ;;
  esac

  archive_name="gitleaks_${GITLEAKS_VERSION}_${os}_${arch}.tar.gz"
  url="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/${archive_name}"
  bin_dir="/tmp/gitleaks-${GITLEAKS_VERSION}-${os}-${arch}"
  tar_path="${bin_dir}.tar.gz"

  mkdir -p "$bin_dir"
  echo "[secret-scan] gitleaks not found, downloading v${GITLEAKS_VERSION}..."
  curl -sSL "$url" -o "$tar_path"
  tar -xzf "$tar_path" -C "$bin_dir" gitleaks
  chmod +x "$bin_dir/gitleaks"
  GITLEAKS_BIN="$bin_dir/gitleaks"
}

ensure_gitleaks

if [[ "$MODE" == "staged" ]]; then
  echo "[secret-scan] Running staged secret scan (pre-commit)..."
  "$GITLEAKS_BIN" protect --staged --redact --verbose
  exit 0
fi

if [[ "$MODE" == "full" ]]; then
  echo "[secret-scan] Running repository secret scan (pre-push)..."
  "$GITLEAKS_BIN" detect --source . --redact --verbose
  exit 0
fi

echo "[secret-scan] Unknown mode: $MODE"
echo "Usage: scripts/secret-scan-local.sh [staged|full]"
exit 2
