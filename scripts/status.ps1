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

function Test-AppHealth {
  param([Parameter(Mandatory=$true)][string]$AppUrl)
  $normalized = $AppUrl.TrimEnd('/')
  Invoke-WebRequest -UseBasicParsing -Uri "$normalized/api/health" | Out-Null
}

Assert-Command terraform
Assert-Command az
Assert-Command curl
Assert-TerraformScaffold

$subscriptionLine = Get-ActiveSubscription
$parts = $subscriptionLine -split "`t"
Write-Host "[lab] Active Azure subscription: $($parts[0]) ($($parts[1]))"
Write-Host "[lab] Tenant: $($parts[2])"

$resourceGroup = Get-TfOutputRaw 'resource_group_name'
$hostingKind = Get-TfOutputRaw 'hosting_kind'
$appUrl = Get-TfOutputRaw 'app_url'
$containerAppName = Get-TfOutputRaw 'container_app_name'
$appServiceName = Get-TfOutputRaw 'app_service_name'
$containerAppEnvironmentName = Get-TfOutputRaw 'container_app_environment_name'
$containerAppMinReplicas = Get-TfOutputRaw 'container_app_min_replicas'
$lastDeploymentAt = Get-TfOutputRaw 'last_deployment_at'
$lastDeploymentId = Get-TfOutputRaw 'last_deployment_id'

function Format-Value {
  param([string]$Value, [string]$Fallback)
  if ([string]::IsNullOrWhiteSpace($Value)) { return $Fallback }
  return $Value
}

Write-Host "[lab] Resource group: $(Format-Value $resourceGroup 'not configured yet')"
Write-Host "[lab] Hosting kind: $(Format-Value $hostingKind 'not configured yet')"
Write-Host "[lab] App URL: $(Format-Value $appUrl 'not configured yet')"
Write-Host "[lab] Container App: $(Format-Value $containerAppName 'not configured yet')"
Write-Host "[lab] App Service: $(Format-Value $appServiceName 'not configured yet')"
Write-Host "[lab] Container App environment: $(Format-Value $containerAppEnvironmentName 'not configured yet')"
Write-Host "[lab] Container App min replicas: $(Format-Value $containerAppMinReplicas 'not configured yet')"
Write-Host "[lab] Last deployment at: $(Format-Value $lastDeploymentAt 'not available yet')"
Write-Host "[lab] Last deployment id: $(Format-Value $lastDeploymentId 'not available yet')"

if ($appUrl) {
  try {
    Test-AppHealth -AppUrl $appUrl
    Write-Host '[lab] Health: ready'
  } catch {
    Write-Host '[lab] Health: not ready'
  }
} else {
  Write-Host '[lab] Health: no app URL output available yet'
}

Write-Host '[lab] Stopped-state cost reminder:'
Write-Host '[lab] - Compute can be reduced or paused, but plans, workspaces, logs, and storage may still bill.'
Write-Host '[lab] - Azure Container Apps and App Service plans are not automatically free when stopped.'
Write-Host '[lab] - Review Azure Cost Management for actual charges before assuming the lab is idle-cost only.'
