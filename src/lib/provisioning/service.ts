/**
 * Provisioning Service
 *
 * High-level provisioning workflows combining multiple operations
 */

import { setConnectivity, setCredentials, setTlsVerify, setExternalManager } from "./setters";
import { pushProvisioning } from "./commands";

/**
 * Full provisioning setup workflow
 * Configures device with external manager and optionally registers
 */
export async function setupProvisioning(
  serverUrl: string,
  options?: {
    alternateAddress?: string;
    protocol?: "HTTP" | "HTTPS";
    path?: string;
    domain?: string;
    connectivity?: "Internal" | "External" | "Auto";
    loginName?: string;
    password?: string;
    tlsVerify?: boolean;
    autoRegister?: boolean;
  },
): Promise<void> {
  try {
    // Configure external manager
    await setExternalManager({
      address: serverUrl,
      alternateAddress: options?.alternateAddress,
      protocol: options?.protocol || "HTTPS",
      path: options?.path || "",
      domain: options?.domain || "",
    });

    // Set connectivity if specified
    if (options?.connectivity) {
      await setConnectivity(options.connectivity);
    }

    // Set credentials if provided
    if (options?.loginName && options?.password) {
      await setCredentials(options.loginName, options.password);
    }

    // Set TLS verification if specified
    if (options?.tlsVerify !== undefined) {
      await setTlsVerify(options.tlsVerify);
    }

    // Auto-register if requested
    if (options?.autoRegister) {
      await pushProvisioning();
    }
  } catch (error) {
    throw new Error(`Failed to setup provisioning: ${error}`);
  }
}
