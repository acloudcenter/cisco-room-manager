/**
 * Device Status Types and Interfaces
 *
 * Type definitions for Cisco device status queries
 */

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

export interface HealthStatus {
  temperature: number;
  fanSpeed: number;
  powerConsumption: number;
}

export interface SipStatus {
  registrationStatus: "Deregister" | "Failed" | "Inactive" | "Registered" | "Registering";
  displayName: string;
  uri: string;
}

export interface CompleteDeviceStatus {
  system: SystemInfo;
  audio: AudioStatus;
  video: VideoStatus;
  call: CallStatus;
  standby: StandbyStatus;
  health: HealthStatus;
  sip: SipStatus;
}
