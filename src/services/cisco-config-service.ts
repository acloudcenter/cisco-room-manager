/**
 * Cisco Configuration Service
 * Provides configuration query functions for connected Cisco devices
 */

import { ciscoConnectionService } from "./cisco-connection-service";

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

class CiscoConfigService {
  /**
   * Get system configuration
   */
  async getSystemConfig(): Promise<SystemConfig> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      const [name, timezone, language, contactInfo] = await Promise.all([
        connector.Config.SystemUnit.Name.get().catch(() => "Unknown"),
        connector.Config.Time.Zone.get().catch(() => "UTC"),
        connector.Config.UserInterface.Language.get().catch(() => "English"),
        connector.Config.SystemUnit.ContactInfo.Name.get().catch(() => "Unknown"),
      ]);

      return {
        name,
        timezone,
        language,
        contactInfo,
      };
    } catch (error) {
      throw new Error(`Failed to get system config: ${error}`);
    }
  }

  /**
   * Get audio configuration
   */
  async getAudioConfig(): Promise<AudioConfig> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      const [defaultVolume, muteEnabled, echoControl, noiseRemoval] = await Promise.all([
        connector.Config.Audio.DefaultVolume.get().catch(() => 50),
        connector.Config.Audio.Microphones.Mute.Enabled.get().catch(() => "True"),
        connector.Config.Audio.EchoControl.Mode.get().catch(() => "On"),
        connector.Config.Audio.Input.NoiseRemoval.Mode.get().catch(() => "On"),
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

  /**
   * Get video configuration
   */
  async getVideoConfig(): Promise<VideoConfig> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      const [defaultMainSource, outputResolution, selfviewEnabled, selfviewPosition] =
        await Promise.all([
          connector.Config.Video.DefaultMainSource.get().catch(() => 1),
          connector.Config.Video.Output.Connector[1].Resolution.get().catch(() => "Auto"),
          connector.Config.Video.Selfview.Default.Mode.get().catch(() => "Off"),
          connector.Config.Video.Selfview.Default.PIPPosition.get().catch(() => "LowerRight"),
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

  /**
   * Get network configuration
   */
  async getNetworkConfig(): Promise<NetworkConfig> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      const [ipAddress, gateway, dns, hostname, dhcp] = await Promise.all([
        connector.Config.Network.IPv4.Address.get().catch(() => "Unknown"),
        connector.Config.Network.IPv4.Gateway.get().catch(() => "Unknown"),
        connector.Config.Network.DNS.Server[1].Address.get().catch(() => "Unknown"),
        connector.Config.Network.Hostname.get().catch(() => "Unknown"),
        connector.Config.Network.IPv4.DHCP.get().catch(() => "On"),
      ]);

      return {
        ipAddress: ipAddress || "Unknown",
        gateway: gateway || "Unknown",
        dns: dns || "Unknown",
        hostname: hostname || "Unknown",
        dhcp: dhcp === "On",
      };
    } catch (error) {
      throw new Error(`Failed to get network config: ${error}`);
    }
  }

  /**
   * Get user interface configuration
   */
  async getUserInterfaceConfig(): Promise<UserInterfaceConfig> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      const [wallpaperUrl, keyTones, language, osd] = await Promise.all([
        connector.Config.UserInterface.Wallpaper.get().catch(() => ""),
        connector.Config.UserInterface.KeyTones.Mode.get().catch(() => "On"),
        connector.Config.UserInterface.Language.get().catch(() => "English"),
        connector.Config.UserInterface.OSD.Mode.get().catch(() => "Auto"),
      ]);

      return {
        wallpaperUrl: wallpaperUrl || "",
        keyTones: keyTones === "On",
        language: language || "English",
        osd: osd === "On" || osd === "Auto",
      };
    } catch (error) {
      throw new Error(`Failed to get user interface config: ${error}`);
    }
  }

  /**
   * Get specific configuration value by path
   */
  async getConfigValue(path: string): Promise<any> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      // Split path and navigate to the config value
      const pathParts = path.split(".");
      let configNode = connector.Config;

      for (const part of pathParts) {
        if (configNode[part]) {
          configNode = configNode[part];
        } else {
          throw new Error(`Invalid config path: ${path}`);
        }
      }

      const value = await configNode.get();

      return value;
    } catch (error) {
      throw new Error(`Failed to get config value at ${path}: ${error}`);
    }
  }

  /**
   * Get all configuration in one call
   */
  async getAllConfig(): Promise<{
    system: SystemConfig;
    audio: AudioConfig;
    video: VideoConfig;
    network: NetworkConfig;
    userInterface: UserInterfaceConfig;
  }> {
    try {
      const [system, audio, video, network, userInterface] = await Promise.all([
        this.getSystemConfig(),
        this.getAudioConfig(),
        this.getVideoConfig(),
        this.getNetworkConfig(),
        this.getUserInterfaceConfig(),
      ]);

      return { system, audio, video, network, userInterface };
    } catch (error) {
      throw new Error(`Failed to get complete config: ${error}`);
    }
  }
}

// Export singleton instance
export const ciscoConfigService = new CiscoConfigService();
export default CiscoConfigService;
