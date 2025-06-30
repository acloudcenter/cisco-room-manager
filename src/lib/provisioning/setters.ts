/**
 * Provisioning Configuration Write Functions
 *
 * Functions for setting device provisioning configuration
 */

import type { ExternalManagerConfig, ProvisioningMode, ConnectivityType } from "./types";
import type { ConnectedDevice } from "@/stores/device-store";

import { getConnector } from "./utils";

/**
 * Set provisioning mode
 */
export async function setProvisioningMode(
  device: ConnectedDevice | undefined,
  mode: ProvisioningMode,
): Promise<void> {
  const xapi = getConnector(device);

  try {
    await xapi.Config.Provisioning.Mode.set(mode);
  } catch (error) {
    throw new Error(`Failed to set provisioning mode: ${error}`);
  }
}

/**
 * Set provisioning connectivity type
 */
export async function setConnectivity(
  device: ConnectedDevice | undefined,
  connectivity: ConnectivityType,
): Promise<void> {
  const xapi = getConnector(device);

  try {
    await xapi.Config.Provisioning.Connectivity.set(connectivity);
  } catch (error) {
    throw new Error(`Failed to set connectivity: ${error}`);
  }
}

/**
 * Set provisioning credentials
 */
export async function setCredentials(
  device: ConnectedDevice | undefined,
  loginName: string,
  password: string,
): Promise<void> {
  const xapi = getConnector(device);

  try {
    await Promise.all([
      xapi.Config.Provisioning.LoginName.set(loginName),
      xapi.Config.Provisioning.Password.set(password),
    ]);
  } catch (error) {
    throw new Error(`Failed to set credentials: ${error}`);
  }
}

/**
 * Set individual login name
 */
export async function setLoginName(
  device: ConnectedDevice | undefined,
  loginName: string,
): Promise<void> {
  const xapi = getConnector(device);

  try {
    await xapi.Config.Provisioning.LoginName.set(loginName);
  } catch (error) {
    throw new Error(`Failed to set login name: ${error}`);
  }
}

/**
 * Set individual password
 */
export async function setPassword(
  device: ConnectedDevice | undefined,
  password: string,
): Promise<void> {
  const xapi = getConnector(device);

  try {
    await xapi.Config.Provisioning.Password.set(password);
  } catch (error) {
    throw new Error(`Failed to set password: ${error}`);
  }
}

/**
 * Configure external manager with all settings
 */
export async function setExternalManager(
  device: ConnectedDevice | undefined,
  config: ExternalManagerConfig,
): Promise<void> {
  const xapi = getConnector(device);

  try {
    // First set mode to ExternalManager
    await setProvisioningMode(device, "ExternalManager");

    // Configure external manager settings
    const promises = [];

    if (config.address) {
      promises.push(xapi.Config.Provisioning.ExternalManager.Address.set(config.address));
    }

    if (config.protocol) {
      promises.push(xapi.Config.Provisioning.ExternalManager.Protocol.set(config.protocol));
    }

    if (config.path !== undefined) {
      promises.push(xapi.Config.Provisioning.ExternalManager.Path.set(config.path));
    }

    if (config.domain !== undefined) {
      promises.push(xapi.Config.Provisioning.ExternalManager.Domain.set(config.domain));
    }

    if (config.alternateAddress !== undefined) {
      promises.push(
        xapi.Config.Provisioning.ExternalManager.AlternateAddress.set(config.alternateAddress),
      );
    }

    await Promise.all(promises);
  } catch (error) {
    throw new Error(`Failed to configure external manager: ${error}`);
  }
}

/**
 * Set external manager address
 */
export async function setExternalManagerAddress(
  device: ConnectedDevice | undefined,
  address: string,
): Promise<void> {
  const xapi = getConnector(device);

  try {
    await xapi.Config.Provisioning.ExternalManager.Address.set(address);
  } catch (error) {
    throw new Error(`Failed to set external manager address: ${error}`);
  }
}

/**
 * Set external manager alternate address
 */
export async function setExternalManagerAlternateAddress(
  device: ConnectedDevice | undefined,
  address: string,
): Promise<void> {
  const xapi = getConnector(device);

  try {
    await xapi.Config.Provisioning.ExternalManager.AlternateAddress.set(address);
  } catch (error) {
    throw new Error(`Failed to set external manager alternate address: ${error}`);
  }
}

/**
 * Set external manager domain
 */
export async function setExternalManagerDomain(
  device: ConnectedDevice | undefined,
  domain: string,
): Promise<void> {
  const xapi = getConnector(device);

  try {
    await xapi.Config.Provisioning.ExternalManager.Domain.set(domain);
  } catch (error) {
    throw new Error(`Failed to set external manager domain: ${error}`);
  }
}

/**
 * Set external manager path
 */
export async function setExternalManagerPath(
  device: ConnectedDevice | undefined,
  path: string,
): Promise<void> {
  const xapi = getConnector(device);

  try {
    await xapi.Config.Provisioning.ExternalManager.Path.set(path);
  } catch (error) {
    throw new Error(`Failed to set external manager path: ${error}`);
  }
}

/**
 * Set external manager protocol
 */
export async function setExternalManagerProtocol(
  device: ConnectedDevice | undefined,
  protocol: "HTTP" | "HTTPS",
): Promise<void> {
  const xapi = getConnector(device);

  try {
    await xapi.Config.Provisioning.ExternalManager.Protocol.set(protocol);
  } catch (error) {
    throw new Error(`Failed to set external manager protocol: ${error}`);
  }
}

/**
 * Set TLS verification
 */
export async function setTlsVerify(
  device: ConnectedDevice | undefined,
  enabled: boolean,
): Promise<void> {
  const xapi = getConnector(device);

  try {
    await xapi.Config.Provisioning.TlsVerify.set(enabled ? "On" : "Off");
  } catch (error) {
    throw new Error(`Failed to set TLS verify: ${error}`);
  }
}

/**
 * Set Webex Edge mode
 */
export async function setWebexEdge(
  device: ConnectedDevice | undefined,
  enabled: boolean,
): Promise<void> {
  const xapi = getConnector(device);

  try {
    await xapi.Config.Provisioning.WebexEdge.set(enabled ? "On" : "Off");
  } catch (error) {
    throw new Error(`Failed to set Webex Edge: ${error}`);
  }
}
