/**
 * Provisioning Validation Utilities
 *
 * Form validation and device state validation functions
 */

import type { ProvisioningFormData } from "@/components/provisioning/provisioning-types";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate TMS form data
 */
export const validateTmsFormData = (formData: ProvisioningFormData): ValidationResult => {
  const errors: string[] = [];

  // Mode validation
  if (!formData.mode) {
    errors.push("Provisioning mode is required");
  }

  // TMS-specific validation
  if (formData.mode === "TMS") {
    // External Manager Address is required for TMS
    if (!formData.externalManager.address?.trim()) {
      errors.push("External Manager Address is required for TMS mode");
    }

    // Credentials are optional for TMS - no validation required

    // Validate External Manager Address format (basic URL validation)
    if (formData.externalManager.address) {
      const addressPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!addressPattern.test(formData.externalManager.address.trim())) {
        errors.push("External Manager Address must be a valid domain or IP address");
      }
    }

    // Validate External Manager Path if provided
    if (formData.externalManager.path && !formData.externalManager.path.startsWith("/")) {
      errors.push("External Manager Path must start with '/'");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate device credentials
 */
export const validateCredentials = (credentials: {
  host: string;
  username: string;
  password: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!credentials.host?.trim()) {
    errors.push("Device host/IP address is required");
  }

  if (!credentials.username?.trim()) {
    errors.push("Username is required");
  }

  if (!credentials.password?.trim()) {
    errors.push("Password is required");
  }

  // Basic IP address or hostname validation
  if (credentials.host) {
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const hostnamePattern = /^[a-zA-Z0-9.-]+$/;

    if (!ipPattern.test(credentials.host) && !hostnamePattern.test(credentials.host)) {
      errors.push("Host must be a valid IP address or hostname");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate device provisioning state before operations
 * Note: Devices can start in any state - these are informational checks
 */
export const validateDeviceState = (): ValidationResult => {
  const errors: string[] = [];

  // Currently no hard validation requirements since devices can be in any starting state
  // These workflows handle state transitions safely

  // Optional: Add warnings for unusual states if needed in the future
  // if (operation === "apply-tms" && currentConfig.mode === "TMS") {
  //   console.warn("Device is already in TMS mode - will reconfigure with new settings");
  // }

  return {
    isValid: true, // Always valid - workflows handle any starting state
    errors,
  };
};

/**
 * Get user-friendly error messages for common validation failures
 */
export const getValidationErrorMessage = (errors: string[]): string => {
  if (errors.length === 0) return "";

  if (errors.length === 1) {
    return errors[0];
  }

  return `Multiple validation errors:\n${errors.map((error) => `• ${error}`).join("\n")}`;
};
