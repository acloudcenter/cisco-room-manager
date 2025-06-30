/**
 * SIP Status Functions
 *
 * Functions for querying device SIP registration and configuration
 */

import type { SipStatus } from "./types";
import type { ConnectedDevice } from "@/stores/device-store";

import { getConnector } from "./utils";

/**
 * Get SIP registration status and configuration
 */
export async function getSipStatus(device?: ConnectedDevice): Promise<SipStatus> {
  const xapi = getConnector(device);

  try {
    // Get SIP registration status from first registration slot
    const registrationStatus = await xapi.Status.SIP.Registration[1].Status.get().catch(
      () => "Inactive",
    );

    // Get SIP configuration
    const [displayName, uri] = await Promise.all([
      xapi.Config.SIP.DisplayName.get().catch(() => ""),
      xapi.Config.SIP.URI.get().catch(() => ""),
    ]);

    return {
      registrationStatus: registrationStatus as SipStatus["registrationStatus"],
      displayName: displayName || "",
      uri: uri || "",
    };
  } catch (error) {
    throw new Error(`Failed to get SIP status: ${error}`);
  }
}
