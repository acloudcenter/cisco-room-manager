/**
 * Provisioning Types and Interfaces
 *
 * Type definitions for Cisco device provisioning operations
 */

export interface ProvisioningStatus {
  status: string;
  lastResult: string;
  connectivity: string;
  registration: string;
}

export interface ProvisioningConfig {
  mode: string;
  connectivity: string;
  loginName: string;
  password: string;
  tlsVerify: string;
  webexEdge: string;
  externalManager: {
    address: string;
    alternateAddress: string;
    protocol: string;
    path: string;
    domain: string;
  };
}

export interface ExternalManagerConfig {
  address: string;
  alternateAddress?: string;
  protocol?: "HTTP" | "HTTPS";
  path?: string;
  domain?: string;
}

export type ProvisioningMode = "Off" | "TMS" | "VCS" | "CUCM" | "ExternalManager" | "Auto";
export type ConnectivityType = "Internal" | "External" | "Auto";
