#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lab-common.sh"

require_commands terraform az
require_terraform_scaffold

IFS=$'\t' read -r subscription_name subscription_id tenant_id <<<"$(get_active_subscription_tsv)"
echo "[lab] Active Azure subscription: ${subscription_name} (${subscription_id})"
echo "[lab] Tenant: ${tenant_id}"

hosting_kind="$(tf_output_raw hosting_kind)"
resource_group_name="$(tf_output_raw resource_group_name)"
container_app_name="$(tf_output_raw container_app_name)"
app_service_name="$(tf_output_raw app_service_name)"

if [[ "$hosting_kind" == "container-app" || "$hosting_kind" == "containerapp" || -n "$container_app_name" ]]; then
  if [[ -z "$resource_group_name" || -z "$container_app_name" ]]; then
    echo "[lab] Container App outputs are incomplete. Add resource_group_name and container_app_name outputs in Terraform."
    exit 1
  fi

  az containerapp update \
    --name "$container_app_name" \
    --resource-group "$resource_group_name" \
    --min-replicas 0
  echo "[lab] Container App scaled toward zero. Runtime compute should drop, but environment and attached services may still cost money."
elif [[ -n "$app_service_name" ]]; then
  az webapp stop --name "$app_service_name" --resource-group "$resource_group_name"
  echo "[lab] App Service stopped. The plan and any linked services may still incur charges."
else
  echo "[lab] No hosting resource outputs were found yet. Nothing to stop."
  exit 1
fi

show_residual_cost_warning
