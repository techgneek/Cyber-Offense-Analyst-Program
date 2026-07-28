variable "name" {
  description = "Azure resource group name."
  type        = string

  validation {
    condition     = length(trimspace(var.name)) > 0
    error_message = "The resource group name must not be empty."
  }
}

variable "location" {
  description = "Azure region for the resource group."
  type        = string

  validation {
    condition     = length(trimspace(var.location)) > 0
    error_message = "The resource group location must not be empty."
  }
}

variable "tags" {
  description = "Common tags to apply to the resource group."
  type        = map(string)
  default     = {}
}
