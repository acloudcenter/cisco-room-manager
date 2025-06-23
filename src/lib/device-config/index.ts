/**
 * Device Configuration Library Barrel Exports
 */

// Types
export type {
  SystemConfig,
  AudioConfig,
  VideoConfig,
  NetworkConfig,
  UserInterfaceConfig,
  CompleteDeviceConfig,
} from "./types";

// System functions
export { getSystemConfig } from "./system";

// Audio functions
export { getAudioConfig } from "./audio";

// Video functions
export { getVideoConfig } from "./video";

// Network functions
export { getNetworkConfig } from "./network";

// User Interface functions
export { getUserInterfaceConfig, getConfigValue } from "./user-interface";

// Composite function
import type { CompleteDeviceConfig } from "./types";

import { getSystemConfig } from "./system";
import { getAudioConfig } from "./audio";
import { getVideoConfig } from "./video";
import { getNetworkConfig } from "./network";
import { getUserInterfaceConfig } from "./user-interface";

/**
 * Get all configuration in one call
 */
export async function getAllConfig(): Promise<CompleteDeviceConfig> {
  try {
    const [system, audio, video, network, userInterface] = await Promise.all([
      getSystemConfig(),
      getAudioConfig(),
      getVideoConfig(),
      getNetworkConfig(),
      getUserInterfaceConfig(),
    ]);

    return { system, audio, video, network, userInterface };
  } catch (error) {
    throw new Error(`Failed to get complete config: ${error}`);
  }
}
