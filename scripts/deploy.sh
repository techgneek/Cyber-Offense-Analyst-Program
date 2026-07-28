#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lab-common.sh"

require_commands terraform az curl checkov
require_terraform_scaffold
require_container_image_input
ensure_registry_secret_input

IFS=$'\t' read -r subscription_name subscription_id tenant_id <<<"$(get_active_subscription_tsv)"

echo "[lab] Active Azure subscription: ${subscription_name} (${subscription_id})"
echo "[lab] Tenant: ${tenant_id}"
echo "[lab] Terraform root: ${LAB_TF_DIR}"

terraform -chdir="$LAB_TF_DIR" fmt -check -recursive
terraform -chdir="$LAB_TF_DIR" init -input=false
terraform -chdir="$LAB_TF_DIR" validate
checkov -d "$LAB_TF_DIR" --quiet

LAB_PLAN_FILE="${LAB_PLAN_FILE:-$(mktemp -t aetos-lab-plan.XXXXXX)}"
export LAB_PLAN_FILE

terraform -chdir="$LAB_TF_DIR" plan -out="$LAB_PLAN_FILE"
terraform -chdir="$LAB_TF_DIR" show "$LAB_PLAN_FILE"

if ! prompt_confirm "Apply this Terraform plan to the active Azure subscription?"; then
  echo "[lab] Deployment cancelled by user."
  exit 1
fi

terraform -chdir="$LAB_TF_DIR" apply -auto-approve "$LAB_PLAN_FILE"

app_url="$(tf_output_raw app_url)"
if [[ -n "$app_url" ]]; then
  echo "[lab] Application URL: $app_url"
  if health_check_url "$app_url"; then
    echo "[lab] Health check passed."
  else
    echo "[lab] Health check failed or the app is not yet reachable."
    exit 1
  fi
else
  echo "[lab] No app_url output was found yet. Add the Phase 2 Terraform outputs before the deploy step can finish end-to-end."
fi
