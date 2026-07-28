variable "resource_group_name" {
  description = "Resource group name for the hosting resources."
  type        = string
}

variable "location" {
  description = "Azure region for the hosting resources."
  type        = string
}

variable "container_app_environment_name" {
  description = "Azure Container Apps environment name."
  type        = string
}

variable "container_app_name" {
  description = "Azure Container App name."
  type        = string
}

variable "log_analytics_workspace_id" {
  description = "Log Analytics workspace ID required by the Container Apps environment."
  type        = string
}

variable "infrastructure_subnet_id" {
  description = "Optional subnet ID for a delegated Container Apps environment."
  type        = string
  default     = null
}

variable "container_image" {
  description = "Container image reference for the lab application."
  type        = string
}

variable "container_port" {
  description = "Container listen port."
  type        = number
  default     = 3000
}

variable "container_cpu" {
  description = "CPU allocation for the container app."
  type        = number
  default     = 0.25
}

variable "container_memory" {
  description = "Memory allocation for the container app."
  type        = string
  default     = "0.5Gi"
}

variable "min_replicas" {
  description = "Minimum number of container replicas."
  type        = number
  default     = 0

  validation {
    condition     = var.min_replicas >= 0
    error_message = "Minimum replicas must be zero or greater."
  }
}

variable "max_replicas" {
  description = "Maximum number of container replicas."
  type        = number
  default     = 1

  validation {
    condition     = var.max_replicas >= 1
    error_message = "Maximum replicas must be at least one."
  }
}

variable "public_ingress" {
  description = "Whether the app should be exposed through a public endpoint."
  type        = bool
  default     = true
}

variable "environment_variables" {
  description = "Non-secret environment variables injected into the container."
  type        = map(string)
  default     = {}
}

variable "container_secrets" {
  description = "Secret environment variables injected into the container. Keep values local and unshared."
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "registry_server" {
  description = "Optional container registry server."
  type        = string
  default     = null
}

variable "registry_username" {
  description = "Optional registry username."
  type        = string
  default     = null
}

variable "registry_password_secret_name" {
  description = "Optional secret name containing the registry password."
  type        = string
  default     = null
}

variable "tags" {
  description = "Common tags to apply to the hosting resources."
  type        = map(string)
  default     = {}
}
