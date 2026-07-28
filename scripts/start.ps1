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
$containerAppMinReplicas = Get-TfOutputRaw 'container_app_min_replicas'

if ($hostingKind -match 'container-app|containerapp' -or $containerAppName) {
  if (-not $resourceGroup -or -not $containerAppName) {
    throw 'Container App outputs are incomplete. Add resource_group_name and container_app_name outputs in Terraform.'
  }
  $desiredMinReplicas = if ($containerAppMinReplicas) { $containerAppMinReplicas } else { '1' }
  az containerapp update --name $containerAppName --resource-group $resourceGroup --min-replicas $desiredMinReplicas | Out-Null
} elseif ($appServiceName) {
  az webapp start --name $appServiceName --resource-group $resourceGroup | Out-Null
} else {
  Write-Host '[lab] No hosting resource outputs were found yet. Nothing to start.'
  exit 1
}

if ($appUrl) {
  Write-Host "[lab] Application URL: $appUrl"
  Test-AppHealth -AppUrl $appUrl
  Write-Host '[lab] Health check passed.'
} else {
  Write-Host '[lab] No app_url output found. Add the Terraform output before using start end-to-end.'
}
