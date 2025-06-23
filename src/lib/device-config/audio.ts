/**
 * Audio Configuration Functions
 *
 * Functions for querying device audio configuration
 */

import type { AudioConfig } from "./types";

import { getConnector } from "./utils";

/**
 * Get audio configuration
 */
export async function getAudioConfig(): Promise<AudioConfig> {
  const xapi = getConnector();

  try {
    const [defaultVolume, muteEnabled, echoControl, noiseRemoval] = await Promise.all([
      xapi.Config.Audio.DefaultVolume.get().catch(() => 50),
      xapi.Config.Audio.Microphones.Mute.Enabled.get().catch(() => "True"),
      xapi.Config.Audio.EchoControl.Mode.get().catch(() => "On"),
      xapi.Config.Audio.Input.NoiseRemoval.Mode.get().catch(() => "On"),
    ]);

    return {
      defaultVolume: parseInt(defaultVolume) || 50,
      muteEnabled: muteEnabled === "True",
      echoControl: echoControl || "On",
      noiseRemoval: noiseRemoval || "On",
    };
  } catch (error) {
    throw new Error(`Failed to get audio config: ${error}`);
  }
}
