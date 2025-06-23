/**
 * User Interface Configuration Functions
 *
 * Functions for querying device UI configuration
 */

import type { UserInterfaceConfig } from "./types";

import { getConnector } from "./utils";

/**
 * Get user interface configuration
 */
export async function getUserInterfaceConfig(): Promise<UserInterfaceConfig> {
  const xapi = getConnector();

  try {
    const [wallpaperUrl, keyTones, language, osd] = await Promise.all([
      xapi.Config.UserInterface.Wallpaper.get().catch(() => ""),
      xapi.Config.UserInterface.KeyTones.Mode.get().catch(() => "On"),
      xapi.Config.UserInterface.Language.get().catch(() => "English"),
      xapi.Config.UserInterface.OSD.Mode.get().catch(() => "Auto"),
    ]);

    return {
      wallpaperUrl: wallpaperUrl || "",
      keyTones: keyTones === "On",
      language: language || "English",
      osd: osd === "On" || osd === "Auto",
    };
  } catch (error) {
    throw new Error(`Failed to get user interface config: ${error}`);
  }
}

/**
 * Get specific configuration value by path
 * @param path - Dot-separated path to config value (e.g., "Audio.DefaultVolume")
 */
export async function getConfigValue(path: string): Promise<any> {
  const xapi = getConnector();

  try {
    // Split path and navigate to the config value
    const pathParts = path.split(".");
    let configNode = xapi.Config;

    for (const part of pathParts) {
      if (configNode[part]) {
        configNode = configNode[part];
      } else {
        throw new Error(`Invalid config path: ${path}`);
      }
    }

    const value = await configNode.get();

    return value;
  } catch (error) {
    throw new Error(`Failed to get config value at ${path}: ${error}`);
  }
}
