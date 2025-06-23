/**
 * Device Table Utilities
 *
 * Utility functions and constants for the device table component
 */

import type { ChipProps } from "@heroui/react";

/**
 * Capitalize the first letter of a string
 */
export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

/**
 * Table column definitions
 */
export const columns = [
  { name: "ROOM NAME", uid: "roomName", sortable: true },
  { name: "IP ADDRESS", uid: "ipAddress", sortable: true },
  { name: "TYPE", uid: "type", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "FIRMWARE", uid: "firmware", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

/**
 * Status filter options
 */
export const statusOptions = [
  { name: "Connected", uid: "connected" },
  { name: "Disconnected", uid: "disconnected" },
  { name: "Error", uid: "error" },
];

/**
 * Status color mapping for Chip component
 */
export const statusColorMap: Record<string, ChipProps["color"]> = {
  connected: "success",
  disconnected: "default",
  error: "danger",
  failed: "danger",
};

/**
 * Initial visible columns
 */
export const INITIAL_VISIBLE_COLUMNS = [
  "roomName",
  "ipAddress",
  "type",
  "status",
  "firmware",
  "actions",
];
