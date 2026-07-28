variable "name_prefix" {
  description = "Short prefix used to generate lab resource names."
  type        = string
  default     = "cyber-offense-lab"

  validation {
    condition     = length(trimspace(var.name_prefix)) > 0
    error_message = "The name prefix must not be empty."
  }
}

variable "environment" {
  description = "Deployment environment label."
  type        = string
  default     = "lab"

  validation {
    condition     = length(trimspace(var.environment)) > 0
    error_message = "The environment label must not be empty."
  }
}

variable "location" {
  description = "Azure region for the lab."
  type        = string
  default     = "eastus"

  validation {
    condition     = length(trimspace(var.location)) > 0
    error_message = "The Azure location must not be empty."
  }
}

variable "container_image" {
  description = "Image reference used by the Azure Container App."
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
  description = "Minimum number of running replicas."
  type        = number
  default     = 0
}

variable "max_replicas" {
  description = "Maximum number of running replicas."
  type        = number
  default     = 1
}

variable "public_ingress" {
  description = "Whether the container app should be publicly reachable."
  type        = bool
  default     = true
}

variable "environment_variables" {
  description = "Non-secret environment variables forwarded to the container."
  type        = map(string)
  default = {
    LAB_TRAINING_MODE = "false"
  }
}

variable "container_secrets" {
  description = "Secret environment variables forwarded to the container. Keep this local and unshared."
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "registry_server" {
  description = "Optional registry server for private images."
  type        = string
  default     = null
}

variable "registry_username" {
  description = "Optional registry username for private images."
  type        = string
  default     = null
}

variable "registry_password_secret_name" {
  description = "Optional secret name holding the registry password."
  type        = string
  default     = null
}

variable "tags" {
  description = "Additional tags to merge with the default lab tags."
  type        = map(string)
  default     = {}
}
