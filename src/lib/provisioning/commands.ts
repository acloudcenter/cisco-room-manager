/**
 * Provisioning Command Functions
 *
 * Functions for executing provisioning commands on devices
 */

import { getConnector } from "./utils";

/**
 * Register device with provisioning service (push provisioning)
 * This triggers the device to connect to its configured provisioning server
 */
export async function pushProvisioning(): Promise<void> {
  const xapi = getConnector();

  try {
    await xapi.Command.Provisioning.Service.Register();
  } catch (error) {
    throw new Error(`Failed to push provisioning: ${error}`);
  }
}

/**
 * Deregister device from provisioning service (clear provisioning)
 * This removes the device from its current provisioning server
 */
export async function clearProvisioning(): Promise<void> {
  const xapi = getConnector();

  try {
    await xapi.Command.Provisioning.Service.Deregister();
  } catch (error) {
    throw new Error(`Failed to clear provisioning: ${error}`);
  }
}

/**
 * Reset all provisioning settings to factory defaults
 * WARNING: This will clear all provisioning configuration
 */
export async function resetProvisioning(): Promise<void> {
  const xapi = getConnector();

  try {
    await xapi.Command.Provisioning.Service.Reset();
  } catch (error) {
    throw new Error(`Failed to reset provisioning: ${error}`);
  }
}

// Note: The Fetch command is specifically for downloading customization templates
// (branding, macros, panels, etc.) and is not used for general provisioning updates.
// If needed for customization in the future, it would be:
// xapi.Command.Provisioning.Service.Fetch({ URL: url, Checksum: checksum, ... })
