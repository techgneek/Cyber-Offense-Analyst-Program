#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lab-common.sh"

require_commands terraform az curl
require_terraform_scaffold

IFS=$'\t' read -r subscription_name subscription_id tenant_id <<<"$(get_active_subscription_tsv)"
echo "[lab] Active Azure subscription: ${subscription_name} (${subscription_id})"
echo "[lab] Tenant: ${tenant_id}"

app_url="$(tf_output_raw app_url)"
hosting_kind="$(tf_output_raw hosting_kind)"
resource_group_name="$(tf_output_raw resource_group_name)"
container_app_name="$(tf_output_raw container_app_name)"
app_service_name="$(tf_output_raw app_service_name)"
container_app_min_replicas="$(tf_output_raw container_app_min_replicas)"

if [[ "$hosting_kind" == "container-app" || "$hosting_kind" == "containerapp" || -n "$container_app_name" ]]; then
  if [[ -z "$resource_group_name" || -z "$container_app_name" ]]; then
    echo "[lab] Container App outputs are incomplete. Add resource_group_name and container_app_name outputs in Terraform."
    exit 1
  fi

  desired_min_replicas="${container_app_min_replicas:-1}"
  az containerapp update \
    --name "$container_app_name" \
    --resource-group "$resource_group_name" \
    --min-replicas "${desired_min_replicas:-1}"
elif [[ -n "$app_service_name" ]]; then
  az webapp start --name "$app_service_name" --resource-group "$resource_group_name"
else
  echo "[lab] No hosting resource outputs were found yet. Nothing to start."
  exit 1
fi

if [[ -n "$app_url" ]]; then
  echo "[lab] Application URL: $app_url"
  if health_check_url "$app_url"; then
    echo "[lab] Health check passed."
  else
    echo "[lab] Health check did not pass yet. Verify the hosting resource is ready."
    exit 1
  fi
else
  echo "[lab] No app_url output found. Add the Terraform output before using start end-to-end."
fi
