/**
 * Macro Types
 *
 * Type definitions for macro operations
 */

// Basic macro information
export interface Macro {
  name: string;
  active: boolean;
  content?: string;
}

// Macro with full details
export interface MacroDetails extends Macro {
  content: string;
  transpiled?: boolean;
  lastModified?: string;
}

// Runtime status
export interface MacroRuntimeStatus {
  running: boolean;
  state: "Running" | "Stopped" | "Error" | "Unknown";
  message?: string;
}

// Macro log entry
export interface MacroLogEntry {
  timestamp: string;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  macroName?: string;
  offset?: number;
}

// Macro logs response
export interface MacroLogs {
  entries: MacroLogEntry[];
  hasMore?: boolean;
}

// Operation results (designed for single and bulk operations)
export interface MacroOperationResult {
  success: boolean;
  macroName?: string;
  operation?: string;
  message?: string;
  error?: string;
}

// Bulk operation results
export interface BulkMacroOperationResult {
  results: MacroOperationResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Save options
export interface MacroSaveOptions {
  overwrite?: boolean;
  transpile?: boolean;
  activate?: boolean; // Activate after saving
}

// List options for future filtering
export interface MacroListOptions {
  includeContent?: boolean;
  filterActive?: boolean;
}
