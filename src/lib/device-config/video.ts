/**
 * Video Configuration Functions
 *
 * Functions for querying device video configuration
 */

import type { VideoConfig } from "./types";

import { getConnector } from "./utils";

/**
 * Get video configuration
 */
export async function getVideoConfig(): Promise<VideoConfig> {
  const xapi = getConnector();

  try {
    const [defaultMainSource, outputResolution, selfviewEnabled, selfviewPosition] =
      await Promise.all([
        xapi.Config.Video.DefaultMainSource.get().catch(() => 1),
        xapi.Config.Video.Output.Connector[1].Resolution.get().catch(() => "Auto"),
        xapi.Config.Video.Selfview.Default.Mode.get().catch(() => "Off"),
        xapi.Config.Video.Selfview.Default.PIPPosition.get().catch(() => "LowerRight"),
      ]);

    return {
      defaultMainSource: parseInt(defaultMainSource) || 1,
      outputResolution: outputResolution || "Auto",
      selfviewEnabled: selfviewEnabled === "On",
      selfviewPosition: selfviewPosition || "LowerRight",
    };
  } catch (error) {
    throw new Error(`Failed to get video config: ${error}`);
  }
}
