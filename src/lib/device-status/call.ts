/**
 * Call Status Functions
 *
 * Functions for querying device call status
 */

import type { CallStatus } from "./types";

import { getConnector } from "./utils";

/**
 * Get current call status
 */
export async function getCallStatus(): Promise<CallStatus> {
  const xapi = getConnector();

  try {
    const [status, duration, remoteNumber, direction] = await Promise.all([
      xapi.Status.Call.Status.get().catch(() => "Idle"),
      xapi.Status.Call.Duration.get().catch(() => 0),
      xapi.Status.Call.RemoteNumber.get().catch(() => undefined),
      xapi.Status.Call.Direction.get().catch(() => undefined),
    ]);

    return {
      status: status || "Idle",
      duration: parseInt(duration) || 0,
      remoteNumber: remoteNumber || undefined,
      direction: direction || undefined,
    };
  } catch (error) {
    throw new Error(`Failed to get call status: ${error}`);
  }
}

/**
 * Get standby status
 */
export async function getStandbyStatus() {
  const xapi = getConnector();

  try {
    const state = await xapi.Status.Standby.State.get().catch(() => "Off");

    return {
      state: state || "Off",
    };
  } catch (error) {
    throw new Error(`Failed to get standby status: ${error}`);
  }
}
