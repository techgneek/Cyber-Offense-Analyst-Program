param()

$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$TfDir = Join-Path $RootDir 'infrastructure/environments/lab'

function Assert-Command {
  param([Parameter(Mandatory=$true)][string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $Name"
  }
}

function Assert-TerraformScaffold {
  if (-not (Test-Path $TfDir)) {
    throw "Terraform directory not found: $TfDir"
  }
  if (-not (Get-ChildItem -Path $TfDir -Filter '*.tf' -ErrorAction SilentlyContinue | Select-Object -First 1)) {
    throw "No Terraform files found in: $TfDir"
  }
}

function Get-ActiveSubscription {
  az account show --query '[name,id,tenantId]' -o tsv
}

function Get-TfOutputRaw {
  param([Parameter(Mandatory=$true)][string]$Name)
  terraform -chdir=$TfDir output -raw $Name 2>$null
}

Assert-Command terraform
Assert-Command az
Assert-TerraformScaffold

$subscriptionLine = Get-ActiveSubscription
$parts = $subscriptionLine -split "`t"
Write-Host "[lab] Active Azure subscription: $($parts[0]) ($($parts[1]))"
Write-Host "[lab] Tenant: $($parts[2])"

$resourceGroup = Get-TfOutputRaw 'resource_group_name'
$hostingKind = Get-TfOutputRaw 'hosting_kind'
$containerAppName = Get-TfOutputRaw 'container_app_name'
$appServiceName = Get-TfOutputRaw 'app_service_name'

if ($hostingKind -match 'container-app|containerapp' -or $containerAppName) {
  if (-not $resourceGroup -or -not $containerAppName) {
    throw 'Container App outputs are incomplete. Add resource_group_name and container_app_name outputs in Terraform.'
  }
  az containerapp update --name $containerAppName --resource-group $resourceGroup --min-replicas 0 | Out-Null
  Write-Host '[lab] Container App scaled toward zero.'
} elseif ($appServiceName) {
  az webapp stop --name $appServiceName --resource-group $resourceGroup | Out-Null
  Write-Host '[lab] App Service stopped.'
} else {
  Write-Host '[lab] No hosting resource outputs were found yet. Nothing to stop.'
  exit 1
}

Write-Host '[lab] Stopped-state cost reminder:'
Write-Host '[lab] - Compute can be reduced or paused, but plans, workspaces, logs, and storage may still bill.'
Write-Host '[lab] - Azure Container Apps and App Service plans are not automatically free when stopped.'
Write-Host '[lab] - Review Azure Cost Management for actual charges before assuming the lab is idle-cost only.'
