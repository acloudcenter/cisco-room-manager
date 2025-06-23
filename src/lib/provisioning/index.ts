/**
 * Provisioning Library Barrel Exports
 */

// Types
export type {
  ProvisioningStatus,
  ProvisioningConfig,
  ExternalManagerConfig,
  ProvisioningMode,
  ConnectivityType,
} from "./types";

// Status functions
export { getProvisioningStatus, isProvisioned, getProvisioningMode } from "./status";

// Configuration read functions
export { getProvisioningConfig } from "./config";

// Configuration write functions
export {
  setProvisioningMode,
  setConnectivity,
  setCredentials,
  setLoginName,
  setPassword,
  setExternalManager,
  setExternalManagerAddress,
  setExternalManagerAlternateAddress,
  setExternalManagerDomain,
  setExternalManagerPath,
  setExternalManagerProtocol,
  setTlsVerify,
  setWebexEdge,
} from "./setters";

// Commands
export { pushProvisioning, clearProvisioning, resetProvisioning } from "./commands";

// High-level service
export { setupProvisioning } from "./service";

// Workflows
export {
  applyTmsConfiguration,
  clearToWebexMode,
  getCurrentProvisioningConfig,
  validateDeviceConnection,
} from "./workflows";

// Validation
export {
  validateTmsFormData,
  validateCredentials,
  validateDeviceState,
  getValidationErrorMessage,
  type ValidationResult,
} from "./validation";
