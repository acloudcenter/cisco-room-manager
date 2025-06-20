/**
 * Cisco Status Service
 * Provides status query functions for connected Cisco devices
 */

import { ciscoConnectionService } from "./cisco-connection-service";

export interface SystemInfo {
  name: string;
  productPlatform: string;
  softwareVersion: string;
  serialNumber: string;
  uptime: number;
  ipAddress: string;
}

export interface AudioStatus {
  volume: number;
  microphones: {
    numberOfMicrophones: number;
    muted: boolean;
  };
  speakers: {
    numberOfSpeakers: number;
  };
}

export interface VideoStatus {
  input: {
    connectors: Array<{
      id: number;
      connected: boolean;
      signalState: string;
    }>;
  };
  output: {
    connectors: Array<{
      id: number;
      connected: boolean;
      resolution: string;
    }>;
  };
}

export interface CallStatus {
  status: "Idle" | "Connected" | "Connecting" | "Disconnecting";
  duration: number;
  remoteNumber?: string;
  direction?: "Incoming" | "Outgoing";
}

export interface StandbyStatus {
  state: "Off" | "Standby" | "Halfwake" | "EnteringStandby";
}

class CiscoStatusService {
  /**
   * Get comprehensive system information
   */
  async getSystemInfo(): Promise<SystemInfo> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      const [name, platform, version, serialNumber, uptime, networkInfo] = await Promise.all([
        connector.Config.SystemUnit.Name.get().catch(() => "Unknown"),
        connector.Status.SystemUnit.ProductPlatform.get().catch(() => "Unknown"),
        connector.Status.SystemUnit.Software.Version.get().catch(() => "Unknown"),
        connector.Status.SystemUnit.Hardware.Module.SerialNumber.get().catch(() => "Unknown"),
        connector.Status.SystemUnit.Uptime.get().catch(() => 0),
        connector.Status.Network.IPv4.Address.get().catch(() => "Unknown"),
      ]);

      return {
        name,
        productPlatform: platform,
        softwareVersion: version,
        serialNumber,
        uptime: parseInt(uptime) || 0,
        ipAddress: networkInfo,
      };
    } catch (error) {
      throw new Error(`Failed to get system info: ${error}`);
    }
  }

  /**
   * Get audio system status
   */
  async getAudioStatus(): Promise<AudioStatus> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      const [volume, micCount, micMuted, speakerCount] = await Promise.all([
        connector.Status.Audio.Volume.get().catch(() => 50),
        connector.Status.Audio.Microphones.NumberOfMicrophones.get().catch(() => 0),
        connector.Status.Audio.Microphones.Mute.get().catch(() => false),
        connector.Status.Audio.Output.NumberOfOutputs.get().catch(() => 0),
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

  /**
   * Get video system status
   */
  async getVideoStatus(): Promise<VideoStatus> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      // Get basic video connector info
      const inputConnectors = await connector.Status.Video.Input.Connector.get().catch(() => []);
      const outputConnectors = await connector.Status.Video.Output.Connector.get().catch(() => []);

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

  /**
   * Get current call status
   */
  async getCallStatus(): Promise<CallStatus> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      const [status, duration, remoteNumber, direction] = await Promise.all([
        connector.Status.Call.Status.get().catch(() => "Idle"),
        connector.Status.Call.Duration.get().catch(() => 0),
        connector.Status.Call.RemoteNumber.get().catch(() => undefined),
        connector.Status.Call.Direction.get().catch(() => undefined),
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
  async getStandbyStatus(): Promise<StandbyStatus> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      const state = await connector.Status.Standby.State.get().catch(() => "Off");

      return {
        state: state || "Off",
      };
    } catch (error) {
      throw new Error(`Failed to get standby status: ${error}`);
    }
  }

  /**
   * Get basic device health status
   */
  async getHealthStatus(): Promise<{
    temperature: number;
    fanSpeed: number;
    powerConsumption: number;
  }> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      const [temperature, fanSpeed, powerConsumption] = await Promise.all([
        connector.Status.SystemUnit.Hardware.Temperature.get().catch(() => 0),
        connector.Status.SystemUnit.Hardware.Monitoring.Fan.Speed.get().catch(() => 0),
        connector.Status.SystemUnit.Hardware.Monitoring.Power.Consumption.get().catch(() => 0),
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

  /**
   * Get all status information in one call
   */
  async getAllStatus(): Promise<{
    system: SystemInfo;
    audio: AudioStatus;
    video: VideoStatus;
    call: CallStatus;
    standby: StandbyStatus;
    health: { temperature: number; fanSpeed: number; powerConsumption: number };
  }> {
    try {
      const [system, audio, video, call, standby, health] = await Promise.all([
        this.getSystemInfo(),
        this.getAudioStatus(),
        this.getVideoStatus(),
        this.getCallStatus(),
        this.getStandbyStatus(),
        this.getHealthStatus(),
      ]);

      return { system, audio, video, call, standby, health };
    } catch (error) {
      throw new Error(`Failed to get complete status: ${error}`);
    }
  }
}

// Export singleton instance
export const ciscoStatusService = new CiscoStatusService();
export default CiscoStatusService;
