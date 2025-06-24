/**
 * Macros Module
 *
 * Comprehensive API for managing Cisco device macros
 */

import type { MacroSaveOptions, MacroOperationResult } from "./types";

import { getMacroList } from "./operations";
import { getRuntimeStatus, ensureRuntimeStarted } from "./runtime";
import { getMacroLogs } from "./logs";
import { saveMacro } from "./operations";

// Type exports
export type {
  Macro,
  MacroDetails,
  MacroRuntimeStatus,
  MacroLogEntry,
  MacroLogs,
  MacroOperationResult,
  BulkMacroOperationResult,
  MacroSaveOptions,
  MacroListOptions,
} from "./types";

// Operation exports
export {
  getMacroList,
  getMacro,
  saveMacro,
  activateMacro,
  deactivateMacro,
  toggleMacroStatus,
  removeMacro,
  removeAllMacros,
  bulkActivateMacros,
  bulkDeactivateMacros,
  bulkRemoveMacros,
  probeForMacros,
} from "./operations";

// Runtime exports
export {
  getRuntimeStatus,
  startRuntime,
  stopRuntime,
  restartRuntime,
  ensureRuntimeStarted,
} from "./runtime";

// Log exports
export { getMacroLogs, clearMacroLogs, getMacroLogsByName, getErrorLogs } from "./logs";

// Utility exports (for advanced use cases)
export { validateMacroName, executeMacroOperation, createOperationResult } from "./utils";

// Composite functions for common workflows

/**
 * Get complete macro information including runtime status and recent logs
 */
export async function getCompleteMacroInfo() {
  try {
    const [macros, runtimeStatus, recentLogs] = await Promise.all([
      getMacroList(),
      getRuntimeStatus(),
      getMacroLogs(0, 100),
    ]);

    return {
      macros,
      runtimeStatus,
      recentLogs,
      summary: {
        totalMacros: macros.length,
        activeMacros: macros.filter((m) => m.active).length,
        runtimeActive: runtimeStatus.running,
        recentErrors: recentLogs.entries.filter((e) => e.level === "error").length,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get complete macro info: ${error}`);
  }
}

/**
 * Deploy a new macro (save and activate)
 */
export async function deployMacro(
  name: string,
  content: string,
  options?: MacroSaveOptions,
): Promise<MacroOperationResult> {
  // Ensure runtime is started
  await ensureRuntimeStarted();

  // Save with activation
  return saveMacro(name, content, {
    ...options,
    activate: true,
  });
}
