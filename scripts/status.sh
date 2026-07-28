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

resource_group_name="$(tf_output_raw resource_group_name)"
hosting_kind="$(tf_output_raw hosting_kind)"
app_url="$(tf_output_raw app_url)"
container_app_name="$(tf_output_raw container_app_name)"
app_service_name="$(tf_output_raw app_service_name)"
container_app_environment_name="$(tf_output_raw container_app_environment_name)"
container_app_min_replicas="$(tf_output_raw container_app_min_replicas)"
last_deployment_at="$(tf_output_raw last_deployment_at)"
last_deployment_id="$(tf_output_raw last_deployment_id)"

echo "[lab] Resource group: ${resource_group_name:-not configured yet}"
echo "[lab] Hosting kind: ${hosting_kind:-not configured yet}"
echo "[lab] App URL: ${app_url:-not configured yet}"
echo "[lab] Container App: ${container_app_name:-not configured yet}"
echo "[lab] App Service: ${app_service_name:-not configured yet}"
echo "[lab] Container App environment: ${container_app_environment_name:-not configured yet}"
echo "[lab] Container App min replicas: ${container_app_min_replicas:-not configured yet}"
echo "[lab] Last deployment at: ${last_deployment_at:-not available yet}"
echo "[lab] Last deployment id: ${last_deployment_id:-not available yet}"

if [[ -n "$app_url" ]]; then
  if health_check_url "$app_url"; then
    echo "[lab] Health: ready"
  else
    echo "[lab] Health: not ready"
  fi
else
  echo "[lab] Health: no app URL output available yet"
fi

show_residual_cost_warning
