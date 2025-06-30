/**
 * Macro Utilities
 *
 * Common utilities for macro operations
 */

import { MacroOperationResult } from "./types";

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

/**
 * Helper to create operation result
 */
export function createOperationResult(
  success: boolean,
  macroName?: string,
  operation?: string,
  message?: string,
  error?: string,
): MacroOperationResult {
  return {
    success,
    macroName,
    operation,
    message,
    error,
  };
}

/**
 * Validate macro name according to API constraints
 * Max length: 250 characters
 */
export function validateMacroName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new Error("Macro name cannot be empty");
  }

  if (name.length > 250) {
    throw new Error("Macro name cannot exceed 250 characters");
  }

  // Check for invalid characters (if any restrictions exist)
  // For now, we'll allow all characters that the API accepts
}

/**
 * Helper for executing macro operations with consistent error handling
 * This will be useful for both single and bulk operations
 */
export async function executeMacroOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  macroName?: string,
): Promise<MacroOperationResult> {
  try {
    await operation();

    return createOperationResult(true, macroName, operationName, `${operationName} successful`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return createOperationResult(
      false,
      macroName,
      operationName,
      `${operationName} failed`,
      errorMessage,
    );
  }
}
