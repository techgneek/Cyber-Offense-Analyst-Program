output "container_app_environment_id" {
  description = "Container Apps environment ID."
  value       = azurerm_container_app_environment.this.id
}

output "container_app_environment_name" {
  description = "Container Apps environment name."
  value       = azurerm_container_app_environment.this.name
}

output "container_app_id" {
  description = "Container App ID."
  value       = azurerm_container_app.this.id
}

output "container_app_name" {
  description = "Container App name."
  value       = azurerm_container_app.this.name
}

output "container_app_fqdn" {
  description = "Container App default FQDN."
  value       = azurerm_container_app.this.latest_revision_fqdn
}

output "container_app_url" {
  description = "Full application URL."
  value       = "https://${azurerm_container_app.this.latest_revision_fqdn}"
}
