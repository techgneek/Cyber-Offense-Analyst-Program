resource "random_string" "suffix" {
  length  = 6
  upper   = false
  special = false
}

locals {
  normalized_prefix = lower(replace(replace(var.name_prefix, "_", "-"), " ", "-"))
  suffix            = random_string.suffix.result

  resource_group_name            = substr("${local.normalized_prefix}-${var.environment}-${local.suffix}", 0, 90)
  log_analytics_workspace_name   = substr("${local.normalized_prefix}-law-${local.suffix}", 0, 63)
  container_app_environment_name = substr("${local.normalized_prefix}-cae-${local.suffix}", 0, 32)
  container_app_name             = substr("${local.normalized_prefix}-app-${local.suffix}", 0, 32)

  default_tags = {
    project           = "cyber-offense-lab"
    environment       = var.environment
    owner             = "james"
    "managed-by"      = "terraform"
    "production-data" = "prohibited"
    "auto-shutdown"   = "scale-to-zero"
  }

  merged_tags = merge(local.default_tags, var.tags)
}

module "resource_group" {
  source   = "../../modules/supporting-services/resource-group"
  name     = local.resource_group_name
  location = var.location
  tags     = local.merged_tags
}

module "monitoring" {
  source              = "../../modules/monitoring/log-analytics"
  name                = local.log_analytics_workspace_name
  location            = var.location
  resource_group_name = module.resource_group.name
  retention_in_days   = 30
  tags                = local.merged_tags
}

module "hosting" {
  source                         = "../../modules/hosting/container-apps"
  resource_group_name            = module.resource_group.name
  location                       = var.location
  container_app_environment_name = local.container_app_environment_name
  container_app_name             = local.container_app_name
  log_analytics_workspace_id     = module.monitoring.id
  container_image                = var.container_image
  container_port                 = var.container_port
  container_cpu                  = var.container_cpu
  container_memory               = var.container_memory
  min_replicas                   = var.min_replicas
  max_replicas                   = var.max_replicas
  public_ingress                 = var.public_ingress
  environment_variables          = var.environment_variables
  container_secrets              = var.container_secrets
  registry_server                = var.registry_server
  registry_username              = var.registry_username
  registry_password_secret_name  = var.registry_password_secret_name
  tags                           = local.merged_tags
}
