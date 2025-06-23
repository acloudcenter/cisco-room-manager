/**
 * Provisioning Utilities
 *
 * Common utilities for provisioning operations
 */

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
