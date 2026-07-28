#!/usr/bin/env bash
set -euo pipefail

LAB_ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LAB_TF_DIR="$LAB_ROOT_DIR/infrastructure/environments/lab"
LAB_PLAN_FILE="${LAB_PLAN_FILE:-}"

USER_PYTHON_BIN="$HOME/Library/Python/3.13/bin"
if [[ -d "$USER_PYTHON_BIN" && ":$PATH:" != *":$USER_PYTHON_BIN:"* ]]; then
  PATH="$USER_PYTHON_BIN:$PATH"
  export PATH
fi

require_command() {
  local command_name="$1"
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "[lab] Missing required command: $command_name"
    exit 1
  fi
}

require_commands() {
  for command_name in "$@"; do
    require_command "$command_name"
  done
}

require_terraform_scaffold() {
  if [[ ! -d "$LAB_TF_DIR" ]]; then
    echo "[lab] Terraform directory not found: $LAB_TF_DIR"
    echo "[lab] Add the Phase 2 infrastructure scaffold before running lifecycle commands."
    exit 1
  fi

  if ! find "$LAB_TF_DIR" -maxdepth 1 -name '*.tf' -print -quit >/dev/null 2>&1; then
    echo "[lab] No Terraform files found in: $LAB_TF_DIR"
    echo "[lab] Add the Phase 2 infrastructure scaffold before running lifecycle commands."
    exit 1
  fi
}

infer_default_container_image() {
  local repository_slug="${GITHUB_REPOSITORY:-}"
  local remote_url=""
  local remote_path=""
  local repo_owner=""
  local repo_name=""

  if [[ -n "$repository_slug" && "$repository_slug" == */* ]]; then
    printf 'cyberoffenselabjd4des.azurecr.io/aetos-ai-security-mentor:lab-latest'
    return 0
  fi

  remote_url="$(git -C "$LAB_ROOT_DIR" remote get-url origin 2>/dev/null || true)"
  if [[ -z "$remote_url" ]]; then
    return 0
  fi

  if [[ "$remote_url" == *github.com:* ]]; then
    remote_path="${remote_url#*github.com:}"
  elif [[ "$remote_url" == *github.com/* ]]; then
    remote_path="${remote_url#*github.com/}"
  else
    return 0
  fi

  remote_path="${remote_path%.git}"
  repo_owner="${remote_path%%/*}"
  repo_name="${remote_path#*/}"

  if [[ -z "$repo_owner" || -z "$repo_name" || "$repo_name" == "$remote_path" ]]; then
    return 0
  fi

  printf 'ghcr.io/%s/%s:lab-latest' "$repo_owner" "$repo_name"
}

require_container_image_input() {
  if [[ -n "${TF_VAR_container_image:-}" ]]; then
    return 0
  fi

  if [[ -f "$LAB_TF_DIR/terraform.tfvars" || -f "$LAB_TF_DIR/terraform.tfvars.json" ]]; then
    return 0
  fi

  local inferred_container_image=""
  inferred_container_image="$(infer_default_container_image)"
  if [[ -n "$inferred_container_image" ]]; then
    export TF_VAR_container_image="$inferred_container_image"
    echo "[lab] Using inferred container image: $TF_VAR_container_image"
    return 0
  fi

  echo "[lab] Missing container image input for Terraform."
  echo "[lab] Copy infrastructure/environments/lab/terraform.tfvars.example to terraform.tfvars and set container_image."
  echo "[lab] Or export TF_VAR_container_image before running deploy."
  exit 1
}

ensure_registry_secret_input() {
  if [[ -n "${TF_VAR_container_secrets:-}" ]]; then
    return 0
  fi

  if [[ -z "${TF_VAR_registry_server:-}" || -z "${TF_VAR_registry_username:-}" || -z "${TF_VAR_registry_password_secret_name:-}" ]]; then
    return 0
  fi

  local registry_name="${TF_VAR_registry_server%.azurecr.io}"
  local registry_password=""
  local escaped_registry_password=""

  registry_password="$(az acr credential show -n "$registry_name" --query "passwords[?name=='password'].value | [0]" -o tsv 2>/dev/null || true)"
  if [[ -z "$registry_password" ]]; then
    echo "[lab] Unable to read ACR credentials for $registry_name."
    echo "[lab] Set TF_VAR_container_secrets manually with the registry password secret."
    exit 1
  fi

  escaped_registry_password="${registry_password//\\/\\\\}"
  escaped_registry_password="${escaped_registry_password//\"/\\\"}"
  export TF_VAR_container_secrets="{\"${TF_VAR_registry_password_secret_name}\":\"${escaped_registry_password}\"}"
  echo "[lab] Injected ACR password into secret: ${TF_VAR_registry_password_secret_name}"
}

prompt_confirm() {
  local prompt_text="$1"
  local answer

  if [[ "${LAB_ASSUME_YES:-false}" == "true" || "${CI:-false}" == "true" ]]; then
    echo "[lab] Auto-confirm enabled for non-interactive execution."
    return 0
  fi

  read -r -p "$prompt_text [y/N] " answer
  case "${answer,,}" in
    y|yes)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

get_active_subscription_tsv() {
  az account show --query '[name,id,tenantId]' -o tsv
}

tf_output_raw() {
  local output_name="$1"
  terraform -chdir="$LAB_TF_DIR" output -raw "$output_name" 2>/dev/null || true
}

tf_output_json() {
  terraform -chdir="$LAB_TF_DIR" output -json 2>/dev/null || true
}

health_check_url() {
  local app_url="$1"
  local normalized_url="${app_url%/}"
  curl -fsS "$normalized_url/api/health" >/dev/null
}

show_residual_cost_warning() {
  cat <<'EOF'
[lab] Stopped-state cost reminder:
[lab] - Compute can be reduced or paused, but plans, workspaces, logs, and storage may still bill.
[lab] - Azure Container Apps and App Service plans are not automatically free when stopped.
[lab] - Review Azure Cost Management for actual charges before assuming the lab is idle-cost only.
EOF
}
