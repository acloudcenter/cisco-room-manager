/**
 * Macro Operations
 *
 * Core functions for macro CRUD operations
 */

import {
  Macro,
  MacroDetails,
  MacroOperationResult,
  MacroSaveOptions,
  MacroListOptions,
  BulkMacroOperationResult,
} from "./types";
import {
  getConnector,
  validateMacroName,
  executeMacroOperation,
  createOperationResult,
} from "./utils";

import { ConnectedDevice } from "@/stores/device-store";

/**
 * Get list of all macros with their status
 */
export async function getMacroList(
  device?: ConnectedDevice,
  options?: MacroListOptions,
): Promise<Macro[]> {
  const xapi = getConnector(device);

  try {
    // Get all macros using the correct syntax
    const result = await xapi.Command.Macros.Macro.Get();

    if (!result?.Macro) {
      return [];
    }

    const macroArray = Array.isArray(result.Macro) ? result.Macro : [result.Macro];

    // Transform the response to our Macro type
    const macros: Macro[] = macroArray.map((macro: any) => ({
      name: macro.Name,
      active: macro.Active === "True",
    }));

    // Apply filtering if requested
    if (options?.filterActive !== undefined) {
      return macros.filter((macro) => macro.active === options.filterActive);
    }

    // Include content if requested
    if (options?.includeContent) {
      return Promise.all(
        macros.map(async (macro) => {
          try {
            const details = await getMacro(device, macro.name);

            return { ...macro, content: details.content };
          } catch {
            return macro;
          }
        }),
      );
    }

    return macros;
  } catch (error) {
    throw new Error(`Failed to get macro list: ${error}`);
  }
}

/**
 * Get list of known macros by trying common names
 * This is a workaround for devices that don't support macro listing
 */
export async function probeForMacros(
  device?: ConnectedDevice,
  macroNames: string[],
): Promise<Macro[]> {
  const xapi = getConnector(device);
  const foundMacros: Macro[] = [];

  await Promise.all(
    macroNames.map(async (name) => {
      try {
        // Try to get the macro (without content for speed)
        await xapi.Command.Macros.Macro.Get({ Name: name, Content: false });

        // If we get here, the macro exists
        try {
          const status = await xapi.status.get(`Macros Macro ${name} Status`);

          foundMacros.push({
            name,
            active: status === "Running",
          });
        } catch {
          // Macro exists but we can't get its status
          foundMacros.push({
            name,
            active: false,
          });
        }
      } catch {
        // Macro doesn't exist with this name
      }
    }),
  );

  return foundMacros;
}

/**
 * Get specific macro with content
 */
export async function getMacro(device?: ConnectedDevice, name: string): Promise<MacroDetails> {
  const xapi = getConnector(device);

  validateMacroName(name);

  try {
    const result = await xapi.Command.Macros.Macro.Get({
      Name: name,
      Content: true,
    });

    // The result includes the macro content
    return {
      name: name,
      active: false, // Will be determined from the list or separate call
      content: result.Macro || "",
    };
  } catch (error) {
    throw new Error(`Failed to get macro ${name}: ${error}`);
  }
}

/**
 * Save/create a macro
 */
export async function saveMacro(
  device?: ConnectedDevice,
  name: string,
  content: string,
  options?: MacroSaveOptions,
): Promise<MacroOperationResult> {
  const xapi = getConnector(device);

  validateMacroName(name);

  if (!content || content.trim().length === 0) {
    return createOperationResult(false, name, "Save", "Macro content cannot be empty");
  }

  try {
    await xapi.Command.Macros.Macro.Save({
      Name: name,
      body: content,
      overWrite: options?.overwrite !== false ? "True" : "False",
      Transpile: options?.transpile !== false ? "True" : "False",
    });

    // Activate if requested
    if (options?.activate) {
      const activateResult = await activateMacro(device, name);

      if (!activateResult.success) {
        return createOperationResult(
          true,
          name,
          "Save",
          `Macro saved but activation failed: ${activateResult.error}`,
        );
      }
    }

    return createOperationResult(true, name, "Save", "Macro saved successfully");
  } catch (error) {
    return createOperationResult(false, name, "Save", "Failed to save macro", String(error));
  }
}

/**
 * Activate a macro
 */
export async function activateMacro(
  device?: ConnectedDevice,
  name: string,
): Promise<MacroOperationResult> {
  const xapi = getConnector(device);

  validateMacroName(name);

  return executeMacroOperation(
    () => xapi.Command.Macros.Macro.Activate({ Name: name }),
    "Activate",
    name,
  );
}

/**
 * Deactivate a macro
 */
export async function deactivateMacro(
  device?: ConnectedDevice,
  name: string,
): Promise<MacroOperationResult> {
  const xapi = getConnector(device);

  validateMacroName(name);

  return executeMacroOperation(
    () => xapi.Command.Macros.Macro.Deactivate({ Name: name }),
    "Deactivate",
    name,
  );
}

/**
 * Toggle macro status (helper for UI)
 */
export async function toggleMacroStatus(
  device?: ConnectedDevice,
  name: string,
  currentStatus: boolean,
): Promise<MacroOperationResult> {
  return currentStatus ? deactivateMacro(device, name) : activateMacro(device, name);
}

/**
 * Remove a single macro
 */
export async function removeMacro(
  device?: ConnectedDevice,
  name: string,
): Promise<MacroOperationResult> {
  const xapi = getConnector(device);

  validateMacroName(name);

  return executeMacroOperation(
    () => xapi.Command.Macros.Macro.Remove({ Name: name }),
    "Remove",
    name,
  );
}

/**
 * Remove all macros (requires explicit confirmation)
 */
export async function removeAllMacros(device?: ConnectedDevice): Promise<MacroOperationResult> {
  const xapi = getConnector(device);

  return executeMacroOperation(() => xapi.Command.Macros.Macro.RemoveAll(), "RemoveAll");
}

/**
 * Bulk activate macros (for future use)
 */
export async function bulkActivateMacros(
  device?: ConnectedDevice,
  names: string[],
): Promise<BulkMacroOperationResult> {
  const results = await Promise.all(names.map((name) => activateMacro(device, name)));

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return {
    results,
    summary: {
      total: names.length,
      successful,
      failed,
    },
  };
}

/**
 * Bulk deactivate macros (for future use)
 */
export async function bulkDeactivateMacros(
  device?: ConnectedDevice,
  names: string[],
): Promise<BulkMacroOperationResult> {
  const results = await Promise.all(names.map((name) => deactivateMacro(device, name)));

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return {
    results,
    summary: {
      total: names.length,
      successful,
      failed,
    },
  };
}

/**
 * Bulk remove macros (for future use)
 */
export async function bulkRemoveMacros(
  device?: ConnectedDevice,
  names: string[],
): Promise<BulkMacroOperationResult> {
  const results = await Promise.all(names.map((name) => removeMacro(device, name)));

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return {
    results,
    summary: {
      total: names.length,
      successful,
      failed,
    },
  };
}
