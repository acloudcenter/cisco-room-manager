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

import { useDeviceStore } from "@/stores/device-store";

/**
 * Configure device for TMS provisioning with user-specified settings
 * Handles devices in any starting state and applies the complete TMS configuration
 */
export const applyTmsConfiguration = async (
  device: ConnectedDevice,
  formData: ProvisioningFormData,
): Promise<void> => {
  const { setProvisioningState, setProvisioningError, getDeviceService } =
    useDeviceStore.getState();

  try {
    setProvisioningState(true, "Checking device connection...");

    // Step 1: Verify existing connection (don't create new one)
    const deviceService = getDeviceService(device.id);

    if (!deviceService.isConnected()) {
      throw new Error("Device not connected. Please connect to device first.");
    }

    setProvisioningState(true, "Checking current configuration...");

    // Step 2: Check current state (device can be in any mode)
    await getProvisioningConfig(device);

    // Step 3: Switch to TMS mode
    setProvisioningState(true, "Switching to TMS mode...");
    await setProvisioningMode(device, "TMS");

    // Give device time to process mode change
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 4: Set connectivity to External
    setProvisioningState(true, "Setting connectivity to External...");
    await setConnectivity(device, "External");

    // Step 5: Configure External Manager settings
    if (formData.externalManager.address) {
      setProvisioningState(true, "Configuring external manager...");

      await setExternalManagerAddress(device, formData.externalManager.address);

      if (formData.externalManager.domain) {
        await setExternalManagerDomain(device, formData.externalManager.domain);
      }

      if (formData.externalManager.path) {
        await setExternalManagerPath(device, formData.externalManager.path);
      }

      if (formData.externalManager.protocol) {
        await setExternalManagerProtocol(device, formData.externalManager.protocol);
      }
    }

    // Step 6: Set credentials
    if (formData.credentials.loginName && formData.credentials.password) {
      setProvisioningState(true, "Setting credentials...");
      await setLoginName(device, formData.credentials.loginName);
      await setPassword(device, formData.credentials.password);
    }

    // Step 7: Apply security settings
    if (formData.security.tlsVerify !== undefined) {
      setProvisioningState(true, "Configuring security settings...");
      await setTlsVerify(device, formData.security.tlsVerify);
    }

    if (formData.security.webexEdge !== undefined) {
      await setWebexEdge(device, formData.security.webexEdge);
    }

    // Step 8: Verify final configuration
    setProvisioningState(true, "Verifying configuration...");
    const finalConfig = await getProvisioningConfig(device);

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
 * Clear provisioning and set device to Off mode
 * This removes any provisioning configuration
 */
export const clearToOffMode = async (device: ConnectedDevice): Promise<void> => {
  const { setProvisioningState, setProvisioningError, getDeviceService } =
    useDeviceStore.getState();

  try {
    setProvisioningState(true, "Checking device connection...");

    // Step 1: Verify existing connection (don't create new one)
    const deviceService = getDeviceService(device.id);

    if (!deviceService.isConnected()) {
      throw new Error("Device not connected. Please connect to device first.");
    }

    setProvisioningState(true, "Checking current configuration...");

    // Step 2: Check current state (device can be in any mode)
    await getProvisioningConfig(device);

    setProvisioningState(true, "Clearing provisioning...");

    // Step 3: Switch to Off mode (clears all provisioning configuration)
    await setProvisioningMode(device, "Off");

    // Give device time to process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 4: Verify provisioning is off
    setProvisioningState(true, "Verifying provisioning is disabled...");
    const finalConfig = await getProvisioningConfig(device);

    if (finalConfig.mode !== "Off") {
      throw new Error("Device may not have fully cleared provisioning yet");
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
 * Configure device for Webex mode
 * Switches device to Webex cloud registration
 */
export const applyWebexConfiguration = async (
  device: ConnectedDevice,
  formData: ProvisioningFormData,
): Promise<void> => {
  const { setProvisioningState, setProvisioningError, getDeviceService } =
    useDeviceStore.getState();

  try {
    setProvisioningState(true, "Checking device connection...");

    // Step 1: Verify existing connection
    const deviceService = getDeviceService(device.id);

    if (!deviceService.isConnected()) {
      throw new Error("Device not connected. Please connect to device first.");
    }

    setProvisioningState(true, "Switching to Webex mode...");

    // Step 2: Set mode to Webex
    await setProvisioningMode(device, "Webex");

    // Give device time to process mode change
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 3: Apply security settings from form
    if (formData.security.tlsVerify !== undefined) {
      setProvisioningState(true, "Configuring security settings...");
      await setTlsVerify(device, formData.security.tlsVerify);
    }

    if (formData.security.webexEdge !== undefined) {
      await setWebexEdge(device, formData.security.webexEdge);
    }

    // Step 4: Verify final configuration
    setProvisioningState(true, "Verifying configuration...");
    const finalConfig = await getProvisioningConfig(device);

    if (finalConfig.mode !== "Webex") {
      throw new Error("Configuration applied but device not in Webex mode");
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
export const getCurrentProvisioningConfig = async (device: ConnectedDevice) => {
  const { setProvisioningState, setProvisioningError, getDeviceService } =
    useDeviceStore.getState();

  try {
    setProvisioningState(true, "Reading device configuration...");

    // Use existing connection
    const deviceService = getDeviceService(device.id);

    if (!deviceService.isConnected()) {
      throw new Error("Device not connected. Please connect to device first.");
    }

    const config = await getProvisioningConfig(device);

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
  const { getDeviceService } = useDeviceStore.getState();
  const deviceService = getDeviceService(device.id);

  // Just check if we have an active connection to the right device
  return deviceService.isConnected() && deviceService.getLogin()?.host === device.credentials.host;
};
