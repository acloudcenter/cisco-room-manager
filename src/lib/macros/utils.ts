/**
 * Macro Utilities
 *
 * Common utilities for macro operations
 */

import { MacroOperationResult } from "./types";

import { ciscoConnectionService } from "@/services/cisco-connection-service";

/**
 * Get the current xAPI connector instance
 * @throws Error if device is not connected
 */
export function getConnector() {
  const connector = ciscoConnectionService.getConnector();

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
