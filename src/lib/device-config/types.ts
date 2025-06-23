/**
 * Device Configuration Types and Interfaces
 *
 * Type definitions for Cisco device configuration queries
 */

export interface SystemConfig {
  name: string;
  timezone: string;
  language: string;
  contactInfo: string;
}

export interface AudioConfig {
  defaultVolume: number;
  muteEnabled: boolean;
  echoControl: string;
  noiseRemoval: string;
}

export interface VideoConfig {
  defaultMainSource: number;
  outputResolution: string;
  selfviewEnabled: boolean;
  selfviewPosition: string;
}

export interface NetworkConfig {
  ipAddress: string;
  gateway: string;
  dns: string;
  hostname: string;
  dhcp: boolean;
}

export interface UserInterfaceConfig {
  wallpaperUrl: string;
  keyTones: boolean;
  language: string;
  osd: boolean;
}

export interface CompleteDeviceConfig {
  system: SystemConfig;
  audio: AudioConfig;
  video: VideoConfig;
  network: NetworkConfig;
  userInterface: UserInterfaceConfig;
}
