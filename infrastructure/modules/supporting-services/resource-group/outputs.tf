output "id" {
  description = "Azure resource group ID."
  value       = azurerm_resource_group.this.id
}

output "name" {
  description = "Azure resource group name."
  value       = azurerm_resource_group.this.name
}

output "location" {
  description = "Azure resource group location."
  value       = azurerm_resource_group.this.location
}

output "tags" {
  description = "Azure resource group tags."
  value       = azurerm_resource_group.this.tags
}
