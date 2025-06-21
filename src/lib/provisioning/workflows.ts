/**
 * Provisioning Workflows
 *
 * Core business logic for device provisioning operations.
 * Handles individual device configuration to either TMS or Webex mode.
 * Devices may start in various states - these workflows handle the transitions safely.
 */

import type { ProvisioningFormData } from "@/components/provisioning/provisioning-types";
import type { ConnectedDevice } from "@/stores/device-store";

import { ciscoConnectionService } from "@/services/cisco-connection-service";
import { ciscoProvisioningService } from "@/services/cisco-provisioning-service";
import { useDeviceStore } from "@/stores/device-store";

/**
 * Configure device for TMS provisioning with user-specified settings
 * Handles devices in any starting state and applies the complete TMS configuration
 */
export const applyTmsConfiguration = async (
  device: ConnectedDevice,
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
    const currentConfig = await ciscoProvisioningService.getProvisioningConfig();

    console.log(`Current device mode: ${currentConfig.mode}`);

    // Step 3: Switch to TMS mode
    setProvisioningState(true, "Switching to TMS mode...");
    await ciscoProvisioningService.setProvisioningMode("TMS");

    // Give device time to process mode change
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 4: Set connectivity to External
    setProvisioningState(true, "Setting connectivity to External...");
    await ciscoProvisioningService.setConnectivity("External");

    // Step 5: Configure External Manager settings
    if (formData.externalManagerAddress) {
      setProvisioningState(true, "Configuring external manager...");

      await ciscoProvisioningService.setExternalManagerAddress(formData.externalManagerAddress);

      if (formData.externalManagerDomain) {
        await ciscoProvisioningService.setExternalManagerDomain(formData.externalManagerDomain);
      }

      if (formData.externalManagerPath) {
        await ciscoProvisioningService.setExternalManagerPath(formData.externalManagerPath);
      }

      if (formData.externalManagerProtocol) {
        await ciscoProvisioningService.setExternalManagerProtocol(formData.externalManagerProtocol);
      }
    }

    // Step 6: Set credentials
    if (formData.loginName && formData.password) {
      setProvisioningState(true, "Setting credentials...");
      await ciscoProvisioningService.setLoginName(formData.loginName);
      await ciscoProvisioningService.setPassword(formData.password);
    }

    // Step 7: Apply security settings
    if (formData.tlsVerify !== undefined) {
      setProvisioningState(true, "Configuring security settings...");
      await ciscoProvisioningService.setTlsVerify(formData.tlsVerify);
    }

    if (formData.webexEdge !== undefined) {
      await ciscoProvisioningService.setWebexEdge(formData.webexEdge);
    }

    // Step 8: Verify final configuration
    setProvisioningState(true, "Verifying configuration...");
    const finalConfig = await ciscoProvisioningService.getProvisioningConfig();

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
export const clearToWebexMode = async (device: ConnectedDevice): Promise<void> => {
  const { setProvisioningState, setProvisioningError } = useDeviceStore.getState();

  try {
    setProvisioningState(true, "Checking device connection...");

    // Step 1: Verify existing connection (don't create new one)
    if (!ciscoConnectionService.isConnected()) {
      throw new Error("Device not connected. Please connect to device first.");
    }

    setProvisioningState(true, "Checking current configuration...");

    // Step 2: Check current state (device can be in any mode)
    const currentConfig = await ciscoProvisioningService.getProvisioningConfig();

    console.log(`Current device mode: ${currentConfig.mode}`);

    setProvisioningState(true, "Clearing to Webex mode...");

    // Step 3: Switch to Webex mode (auto-clears all TMS configuration)
    await ciscoProvisioningService.setProvisioningMode("Webex");

    // Give device time to process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 4: Verify we're back in Webex mode
    setProvisioningState(true, "Verifying Webex mode...");
    const finalConfig = await ciscoProvisioningService.getProvisioningConfig();

    if (finalConfig.mode !== "Webex") {
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
export const getCurrentProvisioningConfig = async (device: ConnectedDevice) => {
  const { setProvisioningState, setProvisioningError } = useDeviceStore.getState();

  try {
    setProvisioningState(true, "Reading device configuration...");

    // Use existing connection
    if (!ciscoConnectionService.isConnected()) {
      throw new Error("Device not connected. Please connect to device first.");
    }

    const config = await ciscoProvisioningService.getProvisioningConfig();

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
