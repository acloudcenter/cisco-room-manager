/**
 * Provisioning Configuration Read Functions
 *
 * Functions for reading device provisioning configuration
 */

import type { ProvisioningConfig } from "./types";
import type { ConnectedDevice } from "@/stores/device-store";

import { getConnector } from "./utils";

/**
 * Get complete provisioning configuration from device
 */
export async function getProvisioningConfig(device?: ConnectedDevice): Promise<ProvisioningConfig> {
  const xapi = getConnector(device);

  try {
    const [
      mode,
      connectivity,
      loginName,
      password,
      tlsVerify,
      webexEdge,
      address,
      alternateAddress,
      protocol,
      path,
      domain,
    ] = await Promise.all([
      xapi.Config.Provisioning.Mode.get().catch(() => "Off"),
      xapi.Config.Provisioning.Connectivity.get().catch(() => "Auto"),
      xapi.Config.Provisioning.LoginName.get().catch(() => ""),
      xapi.Config.Provisioning.Password.get().catch(() => ""),
      xapi.Config.Provisioning.TlsVerify.get().catch(() => "On"),
      xapi.Config.Provisioning.WebexEdge.get().catch(() => "Off"),
      xapi.Config.Provisioning.ExternalManager.Address.get().catch(() => ""),
      xapi.Config.Provisioning.ExternalManager.AlternateAddress.get().catch(() => ""),
      xapi.Config.Provisioning.ExternalManager.Protocol.get().catch(() => "HTTPS"),
      xapi.Config.Provisioning.ExternalManager.Path.get().catch(() => ""),
      xapi.Config.Provisioning.ExternalManager.Domain.get().catch(() => ""),
    ]);

    return {
      mode: mode || "Off",
      connectivity: connectivity || "Auto",
      loginName: loginName || "",
      password: password || "",
      tlsVerify: tlsVerify || "On",
      webexEdge: webexEdge || "Off",
      externalManager: {
        address: address || "",
        alternateAddress: alternateAddress || "",
        protocol: protocol || "HTTPS",
        path: path || "",
        domain: domain || "",
      },
    };
  } catch (error) {
    throw new Error(`Failed to get provisioning config: ${error}`);
  }
}
