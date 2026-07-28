# Infrastructure

This directory holds the Azure Terraform scaffold for the Cyber Offense Analyst lab.

## Layout

- `modules/hosting` - Azure Container Apps hosting for the lab application.
- `modules/monitoring` - Minimal Log Analytics support required by Container Apps.
- `modules/supporting-services` - Shared resource-group and shared naming support.
- `environments/lab` - Environment-specific root module for the lab deployment.

## State Strategy

The lab uses local Terraform state for the current bootstrap phase. That keeps the scaffold simple and avoids adding extra Azure storage cost before the deployment target is validated.

The deploy workflow preserves the Terraform lockfile for traceability, but not the state file itself. If a remote state backend is introduced later, use a dedicated storage account with restricted access and treat the backend as lab infrastructure, not production infrastructure.

## Important Notes

- Keep secrets in local, unshared tfvars files.
- Do not store production credentials in Terraform state.
- Keep the lab tags aligned with the project and environment labels used in the rest of the repository.
