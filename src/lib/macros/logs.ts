/**
 * Macro Log Operations
 *
 * Functions for managing macro logs
 */

import { MacroLogs, MacroLogEntry, MacroOperationResult } from "./types";
import { getConnector, executeMacroOperation } from "./utils";

/**
 * Parse log entries from API response
 */
function parseLogEntries(logData: any): MacroLogEntry[] {
  if (!logData) return [];

  // The actual format of log data needs to be determined from the API response
  // This is a placeholder implementation
  if (typeof logData === "string") {
    // If logs come as a string, split by lines and parse
    return logData
      .split("\n")
      .filter((line: string) => line.trim())
      .map((line: string, index: number) => {
        // Basic parsing - adjust based on actual log format
        const timestampMatch = line.match(/^\[([\d\-T:\.Z]+)\]/);
        const levelMatch = line.match(/\[(INFO|WARNING|ERROR|DEBUG)\]/i);
        const macroMatch = line.match(/\[([^\]]+)\]$/);

        return {
          timestamp: timestampMatch ? timestampMatch[1] : new Date().toISOString(),
          level: (levelMatch ? levelMatch[1].toLowerCase() : "info") as MacroLogEntry["level"],
          message: line,
          macroName: macroMatch ? macroMatch[1] : undefined,
          offset: index,
        };
      });
  }

  // If logs come as structured data
  if (Array.isArray(logData)) {
    return logData.map((entry: any, index: number) => ({
      timestamp: entry.Timestamp || new Date().toISOString(),
      level: (entry.Level || "info").toLowerCase() as MacroLogEntry["level"],
      message: entry.Message || entry.Text || String(entry),
      macroName: entry.MacroName || entry.Macro,
      offset: entry.Offset || index,
    }));
  }

  // If it's a single log entry object
  if (logData.Log || logData.Logs) {
    const logs = logData.Log || logData.Logs;

    return Array.isArray(logs) ? parseLogEntries(logs) : parseLogEntries([logs]);
  }

  return [];
}

/**
 * Get macro logs
 * @param offset - Start from this offset (for pagination)
 * @param limit - Maximum number of entries to return
 */
export async function getMacroLogs(offset: number = 0, limit?: number): Promise<MacroLogs> {
  const xapi = getConnector();

  try {
    const result = await xapi.Command.Macros.Log.Get({
      Offset: offset,
    });

    const entries = parseLogEntries(result);

    // Apply limit if specified
    const limitedEntries = limit ? entries.slice(0, limit) : entries;

    return {
      entries: limitedEntries,
      hasMore: limit ? entries.length > limit : false,
    };
  } catch (error) {
    throw new Error(`Failed to get macro logs: ${error}`);
  }
}

/**
 * Clear all macro logs
 */
export async function clearMacroLogs(): Promise<MacroOperationResult> {
  const xapi = getConnector();

  return executeMacroOperation(() => xapi.Command.Macros.Log.Clear(), "Clear Logs");
}

/**
 * Get logs for a specific macro (filter from all logs)
 */
export async function getMacroLogsByName(
  macroName: string,
  offset: number = 0,
  limit?: number,
): Promise<MacroLogs> {
  const allLogs = await getMacroLogs(offset);

  const filteredEntries = allLogs.entries.filter((entry) => entry.macroName === macroName);

  const limitedEntries = limit ? filteredEntries.slice(0, limit) : filteredEntries;

  return {
    entries: limitedEntries,
    hasMore: limit ? filteredEntries.length > limit : false,
  };
}

/**
 * Get recent error logs
 */
export async function getErrorLogs(limit: number = 50): Promise<MacroLogs> {
  const allLogs = await getMacroLogs(0);

  const errorEntries = allLogs.entries.filter((entry) => entry.level === "error").slice(0, limit);

  return {
    entries: errorEntries,
    hasMore: false,
  };
}
