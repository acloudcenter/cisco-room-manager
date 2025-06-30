/**
 * System Status Functions
 *
 * Functions for querying device system information
 */

import type { SystemInfo } from "./types";
import type { ConnectedDevice } from "@/stores/device-store";

import { getConnector } from "./utils";

/**
 * Get comprehensive system information
 */
export async function getSystemInfo(device?: ConnectedDevice): Promise<SystemInfo> {
  const xapi = getConnector(device);

  try {
    const [name, platform, version, serialNumber, uptime, networkInfo] = await Promise.all([
      xapi.Config.SystemUnit.Name.get().catch(() => "Unknown"),
      xapi.Status.SystemUnit.ProductPlatform.get().catch(() => "Unknown"),
      xapi.Status.SystemUnit.Software.Version.get().catch(() => "Unknown"),
      xapi.Status.SystemUnit.Hardware.Module.SerialNumber.get().catch(() => "Unknown"),
      xapi.Status.SystemUnit.Uptime.get().catch(() => 0),
      xapi.Status.Network.IPv4.Address.get().catch(() => "Unknown"),
    ]);

    return {
      name,
      productPlatform: platform,
      softwareVersion: version,
      serialNumber,
      uptime: parseInt(uptime) || 0,
      ipAddress: networkInfo,
    };
  } catch (error) {
    throw new Error(`Failed to get system info: ${error}`);
  }
}
