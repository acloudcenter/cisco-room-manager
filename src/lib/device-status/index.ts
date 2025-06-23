/**
 * Device Status Library Barrel Exports
 */

// Types
export type {
  SystemInfo,
  AudioStatus,
  VideoStatus,
  CallStatus,
  StandbyStatus,
  HealthStatus,
  CompleteDeviceStatus,
} from "./types";

// System functions
export { getSystemInfo } from "./system";

// Audio functions
export { getAudioStatus } from "./audio";

// Video functions
export { getVideoStatus } from "./video";

// Call functions
export { getCallStatus, getStandbyStatus } from "./call";

// Health functions
export { getHealthStatus } from "./health";

// Composite function
import type { CompleteDeviceStatus } from "./types";

import { getSystemInfo } from "./system";
import { getAudioStatus } from "./audio";
import { getVideoStatus } from "./video";
import { getCallStatus, getStandbyStatus } from "./call";
import { getHealthStatus } from "./health";

/**
 * Get all status information in one call
 */
export async function getAllStatus(): Promise<CompleteDeviceStatus> {
  try {
    const [system, audio, video, call, standby, health] = await Promise.all([
      getSystemInfo(),
      getAudioStatus(),
      getVideoStatus(),
      getCallStatus(),
      getStandbyStatus(),
      getHealthStatus(),
    ]);

    return { system, audio, video, call, standby, health };
  } catch (error) {
    throw new Error(`Failed to get complete status: ${error}`);
  }
}
