/**
 * Cisco Provisioning Service
 * Provides provisioning management functions for connected Cisco devices
 */

import { ciscoConnectionService } from "./cisco-connection-service";

export interface ProvisioningStatus {
  status: string;
  lastResult: string;
  connectivity: string;
  registration: string;
}

export interface ProvisioningConfig {
  mode: string;
  connectivity: string;
  loginName: string;
  password: string;
  tlsVerify: string;
  webexEdge: string;
  externalManager: {
    address: string;
    alternateAddress: string;
    protocol: string;
    path: string;
    domain: string;
  };
}

export interface ExternalManagerConfig {
  address: string;
  alternateAddress?: string;
  protocol?: "HTTP" | "HTTPS";
  path?: string;
  domain?: string;
}

class CiscoProvisioningService {
  /**
   * Get current provisioning status
   */
  async getProvisioningStatus(): Promise<ProvisioningStatus> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      const [status, lastResult, connectivity, registration] = await Promise.all([
        connector.Status.Provisioning.Status.get().catch(() => "Unknown"),
        connector.Status.Provisioning.LastResult.get().catch(() => "Unknown"),
        connector.Status.Provisioning.Connectivity.get().catch(() => "Unknown"),
        connector.Status.Provisioning.Registration.get().catch(() => "Unknown"),
      ]);

      return {
        status: status || "Unknown",
        lastResult: lastResult || "Unknown",
        connectivity: connectivity || "Unknown",
        registration: registration || "Unknown",
      };
    } catch (error) {
      throw new Error(`Failed to get provisioning status: ${error}`);
    }
  }

  /**
   * Get provisioning configuration
   */
  async getProvisioningConfig(): Promise<ProvisioningConfig> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      const [
        mode,
        connectivity,
        loginName,
        password,
        tlsVerify,
        webexEdge,
        address,
        alternateAddress,
        protocol,
        path,
        domain,
      ] = await Promise.all([
        connector.Config.Provisioning.Mode.get().catch(() => "Off"),
        connector.Config.Provisioning.Connectivity.get().catch(() => "Auto"),
        connector.Config.Provisioning.LoginName.get().catch(() => ""),
        connector.Config.Provisioning.Password.get().catch(() => ""),
        connector.Config.Provisioning.TlsVerify.get().catch(() => "On"),
        connector.Config.Provisioning.WebexEdge.get().catch(() => "Off"),
        connector.Config.Provisioning.ExternalManager.Address.get().catch(() => ""),
        connector.Config.Provisioning.ExternalManager.AlternateAddress.get().catch(() => ""),
        connector.Config.Provisioning.ExternalManager.Protocol.get().catch(() => "HTTPS"),
        connector.Config.Provisioning.ExternalManager.Path.get().catch(() => ""),
        connector.Config.Provisioning.ExternalManager.Domain.get().catch(() => ""),
      ]);

      return {
        mode: mode || "Off",
        connectivity: connectivity || "Auto",
        loginName: loginName || "",
        password: password || "",
        tlsVerify: tlsVerify || "On",
        webexEdge: webexEdge || "Off",
        externalManager: {
          address: address || "",
          alternateAddress: alternateAddress || "",
          protocol: protocol || "HTTPS",
          path: path || "",
          domain: domain || "",
        },
      };
    } catch (error) {
      throw new Error(`Failed to get provisioning config: ${error}`);
    }
  }

  /**
   * Set provisioning mode
   */
  async setProvisioningMode(
    mode: "Off" | "TMS" | "VCS" | "CUCM" | "ExternalManager" | "Auto",
  ): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await connector.Config.Provisioning.Mode.set(mode);
    } catch (error) {
      throw new Error(`Failed to set provisioning mode: ${error}`);
    }
  }

  /**
   * Configure external manager provisioning
   */
  async setExternalManager(config: ExternalManagerConfig): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      // First set mode to ExternalManager
      await this.setProvisioningMode("ExternalManager");

      // Configure external manager settings
      const promises = [];

      if (config.address) {
        promises.push(connector.Config.Provisioning.ExternalManager.Address.set(config.address));
      }

      if (config.protocol) {
        promises.push(connector.Config.Provisioning.ExternalManager.Protocol.set(config.protocol));
      }

      if (config.path !== undefined) {
        promises.push(connector.Config.Provisioning.ExternalManager.Path.set(config.path));
      }

      if (config.domain !== undefined) {
        promises.push(connector.Config.Provisioning.ExternalManager.Domain.set(config.domain));
      }

      if (config.alternateAddress !== undefined) {
        promises.push(
          connector.Config.Provisioning.ExternalManager.AlternateAddress.set(
            config.alternateAddress,
          ),
        );
      }

      await Promise.all(promises);
    } catch (error) {
      throw new Error(`Failed to configure external manager: ${error}`);
    }
  }

  /**
   * Push provisioning (register with provisioning service)
   */
  async pushProvisioning(): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await connector.Command.Provisioning.Service.Register();
    } catch (error) {
      throw new Error(`Failed to push provisioning: ${error}`);
    }
  }

  /**
   * Fetch latest provisioning configuration
   */
  async fetchProvisioning(): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await connector.Command.Provisioning.Service.Fetch();
    } catch (error) {
      throw new Error(`Failed to fetch provisioning: ${error}`);
    }
  }

  /**
   * Clear provisioning (deregister from service)
   */
  async clearProvisioning(): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await connector.Command.Provisioning.Service.Deregister();
    } catch (error) {
      throw new Error(`Failed to clear provisioning: ${error}`);
    }
  }

  /**
   * Reset all provisioning settings
   */
  async resetProvisioning(): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await connector.Command.Provisioning.Service.Reset();
    } catch (error) {
      throw new Error(`Failed to reset provisioning: ${error}`);
    }
  }

  /**
   * Check if device is provisioned
   */
  async isProvisioned(): Promise<boolean> {
    try {
      const status = await this.getProvisioningStatus();

      return status.status === "Provisioned";
    } catch (error) {
      return false;
    }
  }

  /**
   * Get provisioning mode
   */
  async getProvisioningMode(): Promise<string> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      const mode = await connector.Config.Provisioning.Mode.get().catch(() => "Off");

      return mode || "Off";
    } catch (error) {
      throw new Error(`Failed to get provisioning mode: ${error}`);
    }
  }

  /**
   * Set provisioning connectivity
   */
  async setConnectivity(connectivity: "Internal" | "External" | "Auto"): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await connector.Config.Provisioning.Connectivity.set(connectivity);
    } catch (error) {
      throw new Error(`Failed to set connectivity: ${error}`);
    }
  }

  /**
   * Set provisioning credentials
   */
  async setCredentials(loginName: string, password: string): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await Promise.all([
        connector.Config.Provisioning.LoginName.set(loginName),
        connector.Config.Provisioning.Password.set(password),
      ]);
    } catch (error) {
      throw new Error(`Failed to set credentials: ${error}`);
    }
  }

  /**
   * Set external manager address
   */
  async setExternalManagerAddress(address: string): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await connector.Config.Provisioning.ExternalManager.Address.set(address);
    } catch (error) {
      throw new Error(`Failed to set external manager address: ${error}`);
    }
  }

  /**
   * Set external manager alternate address
   */
  async setExternalManagerAlternateAddress(address: string): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await connector.Config.Provisioning.ExternalManager.AlternateAddress.set(address);
    } catch (error) {
      throw new Error(`Failed to set external manager alternate address: ${error}`);
    }
  }

  /**
   * Set external manager domain
   */
  async setExternalManagerDomain(domain: string): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await connector.Config.Provisioning.ExternalManager.Domain.set(domain);
    } catch (error) {
      throw new Error(`Failed to set external manager domain: ${error}`);
    }
  }

  /**
   * Set external manager path
   */
  async setExternalManagerPath(path: string): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await connector.Config.Provisioning.ExternalManager.Path.set(path);
    } catch (error) {
      throw new Error(`Failed to set external manager path: ${error}`);
    }
  }

  /**
   * Set external manager protocol
   */
  async setExternalManagerProtocol(protocol: "HTTP" | "HTTPS"): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await connector.Config.Provisioning.ExternalManager.Protocol.set(protocol);
    } catch (error) {
      throw new Error(`Failed to set external manager protocol: ${error}`);
    }
  }

  /**
   * Set provisioning login name
   */
  async setLoginName(loginName: string): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await connector.Config.Provisioning.LoginName.set(loginName);
    } catch (error) {
      throw new Error(`Failed to set login name: ${error}`);
    }
  }

  /**
   * Set provisioning password
   */
  async setPassword(password: string): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await connector.Config.Provisioning.Password.set(password);
    } catch (error) {
      throw new Error(`Failed to set password: ${error}`);
    }
  }

  /**
   * Set TLS verification
   */
  async setTlsVerify(enabled: boolean): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await connector.Config.Provisioning.TlsVerify.set(enabled ? "On" : "Off");
    } catch (error) {
      throw new Error(`Failed to set TLS verify: ${error}`);
    }
  }

  /**
   * Set Webex Edge mode
   */
  async setWebexEdge(enabled: boolean): Promise<void> {
    const connector = ciscoConnectionService.getConnector();

    if (!connector) {
      throw new Error("Device not connected");
    }

    try {
      await connector.Config.Provisioning.WebexEdge.set(enabled ? "On" : "Off");
    } catch (error) {
      throw new Error(`Failed to set Webex Edge: ${error}`);
    }
  }

  /**
   * Full provisioning setup workflow
   */
  async setupProvisioning(
    serverUrl: string,
    options?: {
      alternateAddress?: string;
      protocol?: "HTTP" | "HTTPS";
      path?: string;
      domain?: string;
      connectivity?: "Internal" | "External" | "Auto";
      loginName?: string;
      password?: string;
      tlsVerify?: boolean;
      autoRegister?: boolean;
    },
  ): Promise<void> {
    try {
      // Configure external manager
      await this.setExternalManager({
        address: serverUrl,
        alternateAddress: options?.alternateAddress,
        protocol: options?.protocol || "HTTPS",
        path: options?.path || "",
        domain: options?.domain || "",
      });

      // Set connectivity if specified
      if (options?.connectivity) {
        await this.setConnectivity(options.connectivity);
      }

      // Set credentials if provided
      if (options?.loginName && options?.password) {
        await this.setCredentials(options.loginName, options.password);
      }

      // Set TLS verification if specified
      if (options?.tlsVerify !== undefined) {
        await this.setTlsVerify(options.tlsVerify);
      }

      // Auto-register if requested
      if (options?.autoRegister) {
        await this.pushProvisioning();
      }
    } catch (error) {
      throw new Error(`Failed to setup provisioning: ${error}`);
    }
  }
}

// Export singleton instance
export const ciscoProvisioningService = new CiscoProvisioningService();
export default CiscoProvisioningService;
