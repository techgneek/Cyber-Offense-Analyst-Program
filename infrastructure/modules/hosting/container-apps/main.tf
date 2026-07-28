locals {
  container_secret_names = {
    for key in keys(var.container_secrets) : key => substr(lower(replace(replace(replace(key, "_", "-"), ".", "-"), " ", "-")), 0, 253)
  }

  container_environment_variables = merge(
    {
      for key, value in var.environment_variables : key => {
        value       = value
        secret_name = null
      }
    },
    {
      for key in keys(var.container_secrets) : key => {
        value       = null
        secret_name = local.container_secret_names[key]
      }
    }
  )

  registry_configured = var.registry_server != null && var.registry_username != null && var.registry_password_secret_name != null
}

resource "azurerm_container_app_environment" "this" {
  name                       = var.container_app_environment_name
  location                   = var.location
  resource_group_name        = var.resource_group_name
  log_analytics_workspace_id = var.log_analytics_workspace_id
  infrastructure_subnet_id   = var.infrastructure_subnet_id
  tags                       = var.tags
}

resource "azurerm_container_app" "this" {
  name                         = var.container_app_name
  resource_group_name          = var.resource_group_name
  container_app_environment_id = azurerm_container_app_environment.this.id
  revision_mode                = "Single"
  tags                         = var.tags

  dynamic "secret" {
    for_each = var.container_secrets

    content {
      name  = local.container_secret_names[secret.key]
      value = secret.value
    }
  }

  ingress {
    external_enabled = var.public_ingress
    target_port      = var.container_port
    transport        = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  dynamic "registry" {
    for_each = local.registry_configured ? [1] : []

    content {
      server               = var.registry_server
      username             = var.registry_username
      password_secret_name = var.registry_password_secret_name
    }
  }

  template {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    container {
      name   = var.container_app_name
      image  = var.container_image
      cpu    = var.container_cpu
      memory = var.container_memory

      dynamic "env" {
        for_each = local.container_environment_variables

        content {
          name        = env.key
          value       = env.value.value
          secret_name = env.value.secret_name
        }
      }
    }
  }
}
