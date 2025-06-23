/**
 * System Configuration Functions
 *
 * Functions for querying device system configuration
 */

import type { SystemConfig } from "./types";

import { getConnector } from "./utils";

/**
 * Get system configuration
 */
export async function getSystemConfig(): Promise<SystemConfig> {
  const xapi = getConnector();

  try {
    const [name, timezone, language, contactInfo] = await Promise.all([
      xapi.Config.SystemUnit.Name.get().catch(() => "Unknown"),
      xapi.Config.Time.Zone.get().catch(() => "UTC"),
      xapi.Config.UserInterface.Language.get().catch(() => "English"),
      xapi.Config.SystemUnit.ContactInfo.Name.get().catch(() => "Unknown"),
    ]);

    return {
      name,
      timezone,
      language,
      contactInfo,
    };
  } catch (error) {
    throw new Error(`Failed to get system config: ${error}`);
  }
}
