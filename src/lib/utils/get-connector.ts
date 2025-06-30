/**
 * Common utility to get device connector
 * Used by all lib modules for consistent device connection handling
 */

import { useDeviceStore, ConnectedDevice } from "@/stores/device-store";

/**
 * Get the xAPI connector instance for a specific device
 * @param device - The connected device or null for the first device (backward compatibility)
 * @throws Error if device is not connected
 */
export function getConnector(device?: ConnectedDevice | null) {
  if (device) {
    // Get connector for specific device
    const deviceService = useDeviceStore.getState().getDeviceService(device.id);
    const connector = deviceService.getConnector();

    if (!connector) {
      throw new Error(`Device ${device.info.unitName} not connected`);
    }

    return connector;
  }

  // Backward compatibility: use first device
  const currentDevice = useDeviceStore.getState().getCurrentDevice();

  if (!currentDevice) {
    throw new Error("No device connected");
  }

  const deviceService = useDeviceStore.getState().getDeviceService(currentDevice.id);
  const connector = deviceService.getConnector();

  if (!connector) {
    throw new Error("Device not connected");
  }

  return connector;
}
