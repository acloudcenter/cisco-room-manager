/**
 * Network Configuration Functions
 *
 * Functions for querying device network configuration
 */

import type { NetworkConfig } from "./types";

import { getConnector } from "./utils";

/**
 * Get network configuration
 */
export async function getNetworkConfig(): Promise<NetworkConfig> {
  const xapi = getConnector();

  try {
    const [ipAddress, gateway, dns, hostname, dhcp] = await Promise.all([
      xapi.Config.Network.IPv4.Address.get().catch(() => "Unknown"),
      xapi.Config.Network.IPv4.Gateway.get().catch(() => "Unknown"),
      xapi.Config.Network.DNS.Server[1].Address.get().catch(() => "Unknown"),
      xapi.Config.Network.Hostname.get().catch(() => "Unknown"),
      xapi.Config.Network.IPv4.DHCP.get().catch(() => "On"),
    ]);

    return {
      ipAddress: ipAddress || "Unknown",
      gateway: gateway || "Unknown",
      dns: dns || "Unknown",
      hostname: hostname || "Unknown",
      dhcp: dhcp === "On",
    };
  } catch (error) {
    throw new Error(`Failed to get network config: ${error}`);
  }
}
