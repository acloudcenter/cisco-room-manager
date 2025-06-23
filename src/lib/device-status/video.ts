/**
 * Video Status Functions
 *
 * Functions for querying device video status
 */

import type { VideoStatus } from "./types";

import { getConnector } from "./utils";

/**
 * Get video system status
 */
export async function getVideoStatus(): Promise<VideoStatus> {
  const xapi = getConnector();

  try {
    // Get basic video connector info
    const inputConnectors = await xapi.Status.Video.Input.Connector.get().catch(() => []);
    const outputConnectors = await xapi.Status.Video.Output.Connector.get().catch(() => []);

    return {
      input: {
        connectors: Array.isArray(inputConnectors)
          ? inputConnectors.map((conn: any, index: number) => ({
              id: index + 1,
              connected: conn?.Connected === "True",
              signalState: conn?.SignalState || "Unknown",
            }))
          : [],
      },
      output: {
        connectors: Array.isArray(outputConnectors)
          ? outputConnectors.map((conn: any, index: number) => ({
              id: index + 1,
              connected: conn?.Connected === "True",
              resolution:
                conn?.Resolution?.Width && conn?.Resolution?.Height
                  ? `${conn.Resolution.Width}x${conn.Resolution.Height}`
                  : "Unknown",
            }))
          : [],
      },
    };
  } catch (error) {
    throw new Error(`Failed to get video status: ${error}`);
  }
}
