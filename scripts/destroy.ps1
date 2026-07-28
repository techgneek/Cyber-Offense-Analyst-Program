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

function Confirm-Action {
  param([Parameter(Mandatory=$true)][string]$Prompt)
  $answer = Read-Host "$Prompt [y/N]"
  return $answer -match '^(?i:y|yes)$'
}

Assert-Command terraform
Assert-Command az
Assert-TerraformScaffold

$subscriptionLine = Get-ActiveSubscription
$parts = $subscriptionLine -split "`t"
$resourceGroup = Get-TfOutputRaw 'resource_group_name'

function Format-Value {
  param([string]$Value, [string]$Fallback)
  if ([string]::IsNullOrWhiteSpace($Value)) { return $Fallback }
  return $Value
}

Write-Host "[lab] Target subscription: $($parts[0]) ($($parts[1]))"
Write-Host "[lab] Tenant: $($parts[2])"
Write-Host "[lab] Target resource group: $(Format-Value $resourceGroup 'not configured yet')"

$planFile = New-TemporaryFile
terraform -chdir=$TfDir plan -destroy -out=$planFile
terraform -chdir=$TfDir show $planFile

if (-not (Confirm-Action 'Destroy the lab resources shown above?')) {
  Write-Host '[lab] Destroy cancelled by user.'
  exit 1
}

terraform -chdir=$TfDir apply -auto-approve $planFile

if ($resourceGroup) {
  $groupExists = az group exists --name $resourceGroup
  if ($groupExists -match 'true') {
    Write-Host "[lab] Resource group still exists: $resourceGroup"
    Write-Host '[lab] Terraform may not manage all manually created resources. Review Azure Resource Group contents manually.'
    exit 1
  }
  Write-Host "[lab] Resource group removed: $resourceGroup"
} else {
  Write-Host '[lab] No resource group output found to verify deletion.'
}
