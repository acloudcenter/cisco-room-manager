/**
 * Audio Status Functions
 *
 * Functions for querying device audio status
 */

import type { AudioStatus } from "./types";
import type { ConnectedDevice } from "@/stores/device-store";

import { getConnector } from "./utils";

/**
 * Get audio system status
 */
export async function getAudioStatus(device?: ConnectedDevice): Promise<AudioStatus> {
  const xapi = getConnector(device);

  try {
    const [volume, micCount, micMuted, speakerCount] = await Promise.all([
      xapi.Status.Audio.Volume.get().catch(() => 50),
      xapi.Status.Audio.Microphones.NumberOfMicrophones.get().catch(() => 0),
      xapi.Status.Audio.Microphones.Mute.get().catch(() => false),
      xapi.Status.Audio.Output.NumberOfOutputs.get().catch(() => 0),
    ]);

    return {
      volume: parseInt(volume) || 50,
      microphones: {
        numberOfMicrophones: parseInt(micCount) || 0,
        muted: micMuted === "On" || micMuted === true,
      },
      speakers: {
        numberOfSpeakers: parseInt(speakerCount) || 0,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get audio status: ${error}`);
  }
}
