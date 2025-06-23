/**
 * Provisioning Workflows
 *
 * Core business logic for device provisioning operations.
 * Handles individual device configuration to either TMS or Webex mode.
 * Devices may start in various states - these workflows handle the transitions safely.
 */

import type { ProvisioningFormData } from "@/components/provisioning/provisioning-types";
import type { ConnectedDevice } from "@/stores/device-store";

import {
  getProvisioningConfig,
  setProvisioningMode,
  setConnectivity,
  setExternalManagerAddress,
  setExternalManagerDomain,
  setExternalManagerPath,
  setExternalManagerProtocol,
  setLoginName,
  setPassword,
  setTlsVerify,
  setWebexEdge,
} from "./index";

import { ciscoConnectionService } from "@/services/cisco-connection-service";
import { useDeviceStore } from "@/stores/device-store";

/**
 * Configure device for TMS provisioning with user-specified settings
 * Handles devices in any starting state and applies the complete TMS configuration
 */
export const applyTmsConfiguration = async (
  _device: ConnectedDevice,
  formData: ProvisioningFormData,
): Promise<void> => {
  const { setProvisioningState, setProvisioningError } = useDeviceStore.getState();

  try {
    setProvisioningState(true, "Checking device connection...");

    // Step 1: Verify existing connection (don't create new one)
    if (!ciscoConnectionService.isConnected()) {
      throw new Error("Device not connected. Please connect to device first.");
    }

    setProvisioningState(true, "Checking current configuration...");

    // Step 2: Check current state (device can be in any mode)
    await getProvisioningConfig();

    // Step 3: Switch to TMS mode
    setProvisioningState(true, "Switching to TMS mode...");
    await setProvisioningMode("TMS");

    // Give device time to process mode change
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 4: Set connectivity to External
    setProvisioningState(true, "Setting connectivity to External...");
    await setConnectivity("External");

    // Step 5: Configure External Manager settings
    if (formData.externalManager.address) {
      setProvisioningState(true, "Configuring external manager...");

      await setExternalManagerAddress(formData.externalManager.address);

      if (formData.externalManager.domain) {
        await setExternalManagerDomain(formData.externalManager.domain);
      }

      if (formData.externalManager.path) {
        await setExternalManagerPath(formData.externalManager.path);
      }

      if (formData.externalManager.protocol) {
        await setExternalManagerProtocol(formData.externalManager.protocol);
      }
    }

    // Step 6: Set credentials
    if (formData.credentials.loginName && formData.credentials.password) {
      setProvisioningState(true, "Setting credentials...");
      await setLoginName(formData.credentials.loginName);
      await setPassword(formData.credentials.password);
    }

    // Step 7: Apply security settings
    if (formData.security.tlsVerify !== undefined) {
      setProvisioningState(true, "Configuring security settings...");
      await setTlsVerify(formData.security.tlsVerify);
    }

    if (formData.security.webexEdge !== undefined) {
      await setWebexEdge(formData.security.webexEdge);
    }

    // Step 8: Verify final configuration
    setProvisioningState(true, "Verifying configuration...");
    const finalConfig = await getProvisioningConfig();

    if (finalConfig.mode !== "TMS") {
      throw new Error("Configuration applied but device not in TMS mode");
    }

    setProvisioningState(false);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    setProvisioningError(errorMessage);
    setProvisioningState(false);
    throw error;
  } finally {
    // Don't disconnect - keep existing connection for the UI
  }
};

/**
 * Configure device for Webex mode with default cloud settings
 * Switches device to Webex mode regardless of current state
 */
export const clearToWebexMode = async (_device: ConnectedDevice): Promise<void> => {
  const { setProvisioningState, setProvisioningError } = useDeviceStore.getState();

  try {
    setProvisioningState(true, "Checking device connection...");

    // Step 1: Verify existing connection (don't create new one)
    if (!ciscoConnectionService.isConnected()) {
      throw new Error("Device not connected. Please connect to device first.");
    }

    setProvisioningState(true, "Checking current configuration...");

    // Step 2: Check current state (device can be in any mode)
    await getProvisioningConfig();

    setProvisioningState(true, "Clearing to Webex mode...");

    // Step 3: Switch to Webex mode (auto-clears all TMS configuration)
    await setProvisioningMode("Off");

    // Give device time to process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 4: Verify we're back in Webex mode
    setProvisioningState(true, "Verifying Webex mode...");
    const finalConfig = await getProvisioningConfig();

    if (finalConfig.mode !== "Off") {
      throw new Error("Device may not have fully switched to Webex mode yet");
    }

    setProvisioningState(false);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    setProvisioningError(errorMessage);
    setProvisioningState(false);
    throw error;
  } finally {
    // Don't disconnect - keep existing connection for the UI
  }
};

/**
 * Get current provisioning configuration from device
 */
export const getCurrentProvisioningConfig = async (_device: ConnectedDevice) => {
  const { setProvisioningState, setProvisioningError } = useDeviceStore.getState();

  try {
    setProvisioningState(true, "Reading device configuration...");

    // Use existing connection
    if (!ciscoConnectionService.isConnected()) {
      throw new Error("Device not connected. Please connect to device first.");
    }

    const config = await getProvisioningConfig();

    setProvisioningState(false);

    return config;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to read configuration";

    setProvisioningError(errorMessage);
    setProvisioningState(false);
    throw error;
  } finally {
    // Don't disconnect - keep existing connection for the UI
  }
};

/**
 * Validate device connection before provisioning
 */
export const validateDeviceConnection = async (device: ConnectedDevice): Promise<boolean> => {
  // Just check if we have an active connection to the right device
  return (
    ciscoConnectionService.isConnected() &&
    ciscoConnectionService.getLogin()?.host === device.credentials.host
  );
};
