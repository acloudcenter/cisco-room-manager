/**
 * Macro Runtime Management
 *
 * Functions for managing the macro runtime environment
 */

import { MacroRuntimeStatus, MacroOperationResult } from "./types";
import { getConnector, executeMacroOperation } from "./utils";

/**
 * Get current runtime status
 */
export async function getRuntimeStatus(): Promise<MacroRuntimeStatus> {
  const xapi = getConnector();

  try {
    const result = await xapi.Command.Macros.Runtime.Status();

    // Parse the actual response format from our tests
    let state: MacroRuntimeStatus["state"] = "Unknown";
    let running = false;
    let message = "";

    if (result) {
      // Based on actual test results:
      // { "ActiveMacros": 5, "Crashes": 0, "Running": "True", "status": "OK" }
      if (result.Running === "True") {
        state = "Running";
        running = true;
      } else if (result.Running === "False") {
        state = "Stopped";
        running = false;
      }

      if (result.status === "OK") {
        message = `ActiveMacros: ${result.ActiveMacros || 0}, Crashes: ${result.Crashes || 0}`;
      } else {
        message = result.status || "";
      }
    }

    return {
      running,
      state,
      message,
    };
  } catch (error) {
    // If we can't get status, assume stopped
    return {
      running: false,
      state: "Unknown",
      message: `Failed to get runtime status: ${error}`,
    };
  }
}

/**
 * Start macro runtime
 */
export async function startRuntime(): Promise<MacroOperationResult> {
  const xapi = getConnector();

  return executeMacroOperation(() => xapi.Command.Macros.Runtime.Start(), "Runtime Start");
}

/**
 * Stop macro runtime
 */
export async function stopRuntime(): Promise<MacroOperationResult> {
  const xapi = getConnector();

  return executeMacroOperation(() => xapi.Command.Macros.Runtime.Stop(), "Runtime Stop");
}

/**
 * Restart macro runtime
 */
export async function restartRuntime(): Promise<MacroOperationResult> {
  const xapi = getConnector();

  return executeMacroOperation(() => xapi.Command.Macros.Runtime.Restart(), "Runtime Restart");
}

/**
 * Helper to ensure runtime is started before operations
 * Useful for bulk operations or when activating macros
 */
export async function ensureRuntimeStarted(): Promise<boolean> {
  const status = await getRuntimeStatus();

  if (!status.running) {
    const result = await startRuntime();

    return result.success;
  }

  return true;
}
