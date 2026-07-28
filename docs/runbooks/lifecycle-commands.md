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

## Commands

### Deploy

`./scripts/deploy.sh`

Runs formatting, Terraform validation, Checkov, plan review, confirmation, apply, and a non-destructive health check.

### Start

`./scripts/start.sh`

Restores runtime compute after a stop. For containerized hosting, this scales the app back above zero replicas. For App Service, it starts the web app.

### Stop

`./scripts/stop.sh`

Reduces runtime cost without destroying the environment. For containerized hosting, it scales the app toward zero. For App Service, it stops the web app.

### Status

`./scripts/status.sh`

Reports the active subscription, resource group, hosting status, app URL, and readiness indicators.

### Destroy

`./scripts/destroy.sh`

Shows a destroy plan, requires confirmation, applies the destroy, and verifies the resource group removal.

## Residual Cost Notes

Stopping the lab does not make Azure free. Plan for residual cost from hosting plans, logging workspaces, storage accounts, and any other supporting services that remain allocated.
