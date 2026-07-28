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

function Test-AppHealth {
  param([Parameter(Mandatory=$true)][string]$AppUrl)
  $normalized = $AppUrl.TrimEnd('/')
  Invoke-WebRequest -UseBasicParsing -Uri "$normalized/api/health" | Out-Null
}

Assert-Command terraform
Assert-Command az
Assert-Command curl
Assert-Command checkov
Assert-TerraformScaffold

$subscriptionLine = Get-ActiveSubscription
$parts = $subscriptionLine -split "`t"
Write-Host "[lab] Active Azure subscription: $($parts[0]) ($($parts[1]))"
Write-Host "[lab] Tenant: $($parts[2])"

terraform -chdir=$TfDir fmt -check -recursive
terraform -chdir=$TfDir init -input=false
terraform -chdir=$TfDir validate
checkov -d $TfDir --quiet

$planFile = New-TemporaryFile
terraform -chdir=$TfDir plan -out=$planFile
terraform -chdir=$TfDir show $planFile

if (-not (Confirm-Action 'Apply this Terraform plan to the active Azure subscription?')) {
  Write-Host '[lab] Deployment cancelled by user.'
  exit 1
}

terraform -chdir=$TfDir apply -auto-approve $planFile

$appUrl = Get-TfOutputRaw 'app_url'
if ($appUrl) {
  Write-Host "[lab] Application URL: $appUrl"
  Test-AppHealth -AppUrl $appUrl
  Write-Host '[lab] Health check passed.'
} else {
  Write-Host '[lab] No app_url output was found yet. Add the Phase 2 Terraform outputs before the deploy step can finish end-to-end.'
}
