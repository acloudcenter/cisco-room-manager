/**
 * Provisioning Configuration Write Functions
 *
 * Functions for setting device provisioning configuration
 */

import type { ExternalManagerConfig, ProvisioningMode, ConnectivityType } from "./types";

import { getConnector } from "./utils";

/**
 * Set provisioning mode
 */
export async function setProvisioningMode(mode: ProvisioningMode): Promise<void> {
  const xapi = getConnector();

  try {
    await xapi.Config.Provisioning.Mode.set(mode);
  } catch (error) {
    throw new Error(`Failed to set provisioning mode: ${error}`);
  }
}

/**
 * Set provisioning connectivity type
 */
export async function setConnectivity(connectivity: ConnectivityType): Promise<void> {
  const xapi = getConnector();

  try {
    await xapi.Config.Provisioning.Connectivity.set(connectivity);
  } catch (error) {
    throw new Error(`Failed to set connectivity: ${error}`);
  }
}

/**
 * Set provisioning credentials
 */
export async function setCredentials(loginName: string, password: string): Promise<void> {
  const xapi = getConnector();

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
export async function setLoginName(loginName: string): Promise<void> {
  const xapi = getConnector();

  try {
    await xapi.Config.Provisioning.LoginName.set(loginName);
  } catch (error) {
    throw new Error(`Failed to set login name: ${error}`);
  }
}

/**
 * Set individual password
 */
export async function setPassword(password: string): Promise<void> {
  const xapi = getConnector();

  try {
    await xapi.Config.Provisioning.Password.set(password);
  } catch (error) {
    throw new Error(`Failed to set password: ${error}`);
  }
}

/**
 * Configure external manager with all settings
 */
export async function setExternalManager(config: ExternalManagerConfig): Promise<void> {
  const xapi = getConnector();

  try {
    // First set mode to ExternalManager
    await setProvisioningMode("ExternalManager");

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
export async function setExternalManagerAddress(address: string): Promise<void> {
  const xapi = getConnector();

  try {
    await xapi.Config.Provisioning.ExternalManager.Address.set(address);
  } catch (error) {
    throw new Error(`Failed to set external manager address: ${error}`);
  }
}

/**
 * Set external manager alternate address
 */
export async function setExternalManagerAlternateAddress(address: string): Promise<void> {
  const xapi = getConnector();

  try {
    await xapi.Config.Provisioning.ExternalManager.AlternateAddress.set(address);
  } catch (error) {
    throw new Error(`Failed to set external manager alternate address: ${error}`);
  }
}

/**
 * Set external manager domain
 */
export async function setExternalManagerDomain(domain: string): Promise<void> {
  const xapi = getConnector();

  try {
    await xapi.Config.Provisioning.ExternalManager.Domain.set(domain);
  } catch (error) {
    throw new Error(`Failed to set external manager domain: ${error}`);
  }
}

/**
 * Set external manager path
 */
export async function setExternalManagerPath(path: string): Promise<void> {
  const xapi = getConnector();

  try {
    await xapi.Config.Provisioning.ExternalManager.Path.set(path);
  } catch (error) {
    throw new Error(`Failed to set external manager path: ${error}`);
  }
}

/**
 * Set external manager protocol
 */
export async function setExternalManagerProtocol(protocol: "HTTP" | "HTTPS"): Promise<void> {
  const xapi = getConnector();

  try {
    await xapi.Config.Provisioning.ExternalManager.Protocol.set(protocol);
  } catch (error) {
    throw new Error(`Failed to set external manager protocol: ${error}`);
  }
}

/**
 * Set TLS verification
 */
export async function setTlsVerify(enabled: boolean): Promise<void> {
  const xapi = getConnector();

  try {
    await xapi.Config.Provisioning.TlsVerify.set(enabled ? "On" : "Off");
  } catch (error) {
    throw new Error(`Failed to set TLS verify: ${error}`);
  }
}

/**
 * Set Webex Edge mode
 */
export async function setWebexEdge(enabled: boolean): Promise<void> {
  const xapi = getConnector();

  try {
    await xapi.Config.Provisioning.WebexEdge.set(enabled ? "On" : "Off");
  } catch (error) {
    throw new Error(`Failed to set Webex Edge: ${error}`);
  }
}
