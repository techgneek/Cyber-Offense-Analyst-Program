output "subscription_id" {
  description = "Active Azure subscription identifier used by the lab."
  value       = data.azurerm_client_config.current.subscription_id
}

output "tenant_id" {
  description = "Active Azure tenant identifier used by the lab."
  value       = data.azurerm_client_config.current.tenant_id
}

output "resource_group_name" {
  description = "Lab resource group name."
  value       = module.resource_group.name
}

output "resource_group_id" {
  description = "Lab resource group ID."
  value       = module.resource_group.id
}

output "hosting_kind" {
  description = "Hosting model chosen for the lab."
  value       = "container-app"
}

output "container_app_environment_name" {
  description = "Azure Container Apps environment name."
  value       = module.hosting.container_app_environment_name
}

output "container_app_name" {
  description = "Azure Container App name."
  value       = module.hosting.container_app_name
}

output "container_app_fqdn" {
  description = "Container App default FQDN."
  value       = module.hosting.container_app_fqdn
}

output "container_app_url" {
  description = "Container App URL."
  value       = module.hosting.container_app_url
}

output "app_url" {
  description = "Primary application URL."
  value       = module.hosting.container_app_url
}

output "container_app_min_replicas" {
  description = "Minimum replica count used for the lab."
  value       = var.min_replicas
}

output "container_app_max_replicas" {
  description = "Maximum replica count used for the lab."
  value       = var.max_replicas
}

output "tags" {
  description = "Merged default and custom tags."
  value       = local.merged_tags
}

data "azurerm_client_config" "current" {}
