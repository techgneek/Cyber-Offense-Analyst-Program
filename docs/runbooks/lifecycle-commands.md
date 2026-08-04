# Lab Lifecycle Commands

These commands are the operational wrapper around the lab Terraform stack and Azure runtime. They are designed to keep the lab isolated, reviewable, and reversible, and they cover the current Container Apps-based lab path end to end.

## Prerequisites

- Azure CLI authenticated to the correct subscription.
- Terraform installed locally.
- Checkov installed for Terraform security checks.
- The Phase 2 Terraform scaffold present under `infrastructure/environments/lab`.
- A local `terraform.tfvars` file, `TF_VAR_container_image`, or `GITHUB_REPOSITORY` value for the lab container image.
- A valid application image and infrastructure variables once the lab stack is fully wired.
- The GitHub Actions deploy workflow is a bootstrap path that uses the Phase 2 local-state pattern; it keeps the Terraform lockfile for traceability but does not ship state artifacts.

## Lifecycle operations

- Deploy: validate prerequisites, review infrastructure changes, apply the lab stack, and confirm the environment is healthy.
- Start: restore runtime capacity after a stop.
- Stop: reduce runtime cost without destroying the environment.
- Status: report the active subscription, resource group, hosting status, endpoint, and readiness indicators.
- Destroy: confirm the teardown plan, remove the lab, and verify cleanup.

## Destroy And Billing

Use the resource group as the teardown boundary for this lab. The lab resources are tagged and grouped under the isolated Azure resource group, so deleting that group removes the hosting, monitoring, and registry resources created for the exercise.

1. Identify the lab resource group if you do not already have it.

```bash
az group list --tag project=cyber-offense-lab --query "[].name" -o tsv
```

2. Delete the lab resource group.

```bash
az group delete --name <resource-group-name> --yes
```

3. Wait for Azure to finish the deletion and verify cleanup.

```bash
az group wait --deleted --name <resource-group-name> --interval 10 --timeout 1800
az group exists --name <resource-group-name>
```

4. Query billing at the resource-group scope if you need the accrued lab cost before or after teardown.

```bash
az rest --method post --url "https://management.azure.com/subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.CostManagement/query?api-version=2023-11-01" --body '{"type":"ActualCost","timeframe":"Custom","timePeriod":{"from":"2026-08-01T00:00:00Z","to":"2026-08-02T23:59:59Z"},"dataset":{"granularity":"None","aggregation":{"totalCost":{"name":"PreTaxCost","function":"Sum"}}}}' -o json
```

The returned `rows[0][0]` value is the pre-tax cost and `rows[0][1]` is the currency. Adjust the date range to match the exact period you want to report.

## Residual Cost Notes

Stopping the lab does not make Azure free. Plan for residual cost from hosting plans, logging workspaces, storage accounts, and any other supporting services that remain allocated.
