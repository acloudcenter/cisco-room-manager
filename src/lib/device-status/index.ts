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
  SipStatus,
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

// SIP functions
export { getSipStatus } from "./sip";

// Composite function
import type { CompleteDeviceStatus } from "./types";

import { getSystemInfo } from "./system";
import { getAudioStatus } from "./audio";
import { getVideoStatus } from "./video";
import { getCallStatus, getStandbyStatus } from "./call";
import { getHealthStatus } from "./health";
import { getSipStatus } from "./sip";

/**
 * Get all status information in one call
 */
export async function getAllStatus(): Promise<CompleteDeviceStatus> {
  try {
    const [system, audio, video, call, standby, health, sip] = await Promise.all([
      getSystemInfo(),
      getAudioStatus(),
      getVideoStatus(),
      getCallStatus(),
      getStandbyStatus(),
      getHealthStatus(),
      getSipStatus(),
    ]);

    return { system, audio, video, call, standby, health, sip };
  } catch (error) {
    throw new Error(`Failed to get complete status: ${error}`);
  }
}
