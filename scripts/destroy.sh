#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lab-common.sh"

require_commands terraform az
require_terraform_scaffold

IFS=$'\t' read -r subscription_name subscription_id tenant_id <<<"$(get_active_subscription_tsv)"
resource_group_name="$(tf_output_raw resource_group_name)"

echo "[lab] Target subscription: ${subscription_name} (${subscription_id})"
echo "[lab] Tenant: ${tenant_id}"
echo "[lab] Target resource group: ${resource_group_name:-not configured yet}"

LAB_PLAN_FILE="${LAB_PLAN_FILE:-$(mktemp -t aetos-lab-destroy.XXXXXX)}"
export LAB_PLAN_FILE

terraform -chdir="$LAB_TF_DIR" plan -destroy -out="$LAB_PLAN_FILE"
terraform -chdir="$LAB_TF_DIR" show "$LAB_PLAN_FILE"

if ! prompt_confirm "Destroy the lab resources shown above?"; then
  echo "[lab] Destroy cancelled by user."
  exit 1
fi

terraform -chdir="$LAB_TF_DIR" apply -auto-approve "$LAB_PLAN_FILE"

if [[ -n "$resource_group_name" ]]; then
  if az group exists --name "$resource_group_name" | grep -qi true; then
    echo "[lab] Resource group still exists: $resource_group_name"
    echo "[lab] Terraform may not manage all manually created resources. Review Azure Resource Group contents manually."
    exit 1
  fi
  echo "[lab] Resource group removed: $resource_group_name"
else
  echo "[lab] No resource group output found to verify deletion."
fi
