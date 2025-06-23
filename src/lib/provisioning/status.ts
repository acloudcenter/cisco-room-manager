/**
 * Provisioning Status Functions
 *
 * Functions for querying device provisioning status
 */

import type { ProvisioningStatus } from "./types";

import { getConnector } from "./utils";

/**
 * Get current provisioning status from device
 */
export async function getProvisioningStatus(): Promise<ProvisioningStatus> {
  const xapi = getConnector();

  try {
    const [status, lastResult, connectivity, registration] = await Promise.all([
      xapi.Status.Provisioning.Status.get().catch(() => "Unknown"),
      xapi.Status.Provisioning.LastResult.get().catch(() => "Unknown"),
      xapi.Status.Provisioning.Connectivity.get().catch(() => "Unknown"),
      xapi.Status.Provisioning.Registration.get().catch(() => "Unknown"),
    ]);

    return {
      status: status || "Unknown",
      lastResult: lastResult || "Unknown",
      connectivity: connectivity || "Unknown",
      registration: registration || "Unknown",
    };
  } catch (error) {
    throw new Error(`Failed to get provisioning status: ${error}`);
  }
}

/**
 * Check if device is provisioned
 */
export async function isProvisioned(): Promise<boolean> {
  try {
    const status = await getProvisioningStatus();

    return status.status === "Provisioned";
  } catch {
    return false;
  }
}

/**
 * Get current provisioning mode
 */
export async function getProvisioningMode(): Promise<string> {
  const xapi = getConnector();

  try {
    const mode = await xapi.Config.Provisioning.Mode.get().catch(() => "Off");

    return mode || "Off";
  } catch (error) {
    throw new Error(`Failed to get provisioning mode: ${error}`);
  }
}
