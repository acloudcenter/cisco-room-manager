/**
 * Health Status Functions
 *
 * Functions for querying device health and hardware status
 */

import type { HealthStatus } from "./types";
import type { ConnectedDevice } from "@/stores/device-store";

import { getConnector } from "./utils";

/**
 * Get basic device health status
 */
export async function getHealthStatus(device?: ConnectedDevice): Promise<HealthStatus> {
  const xapi = getConnector(device);

  try {
    const [temperature, fanSpeed, powerConsumption] = await Promise.all([
      xapi.Status.SystemUnit.Hardware.Temperature.get().catch(() => 0),
      xapi.Status.SystemUnit.Hardware.Monitoring.Fan.Speed.get().catch(() => 0),
      xapi.Status.SystemUnit.Hardware.Monitoring.Power.Consumption.get().catch(() => 0),
    ]);

    return {
      temperature: parseInt(temperature) || 0,
      fanSpeed: parseInt(fanSpeed) || 0,
      powerConsumption: parseInt(powerConsumption) || 0,
    };
  } catch (error) {
    throw new Error(`Failed to get health status: ${error}`);
  }
}
