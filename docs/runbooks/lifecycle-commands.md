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

## Residual Cost Notes

Stopping the lab does not make Azure free. Plan for residual cost from hosting plans, logging workspaces, storage accounts, and any other supporting services that remain allocated.
