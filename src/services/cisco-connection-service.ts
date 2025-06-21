/**
 * Cisco Connection Service
 * Based on the working implementation from roomos.cisco.com
 */

// @ts-ignore - jsxapi doesn't have TypeScript definitions
import * as jsxapi from "jsxapi";

export interface ConnectionCredentials {
  host: string;
  username: string;
  password: string;
}

export type ConnectionState = "not-connected" | "connecting" | "connected" | "failed";

export interface ConnectedDeviceInfo {
  unitName: string;
  unitType: string;
  host: string;
  softwareVersion: string;
}

class CiscoConnectionService {
  private connection: ConnectionState = "not-connected";
  private connector: any = null;
  private login: ConnectionCredentials | null = null;
  private unitName = "";
  private unitType = "";
  private softwareVersion = "";

  /**
   * Connect to device using event-based pattern like Cisco's official tool
   */
  async connect(credentials: ConnectionCredentials | false): Promise<boolean> {
    // Handle disconnect
    if (credentials === false) {
      this.disconnect();

      return false;
    }

    const { host, username, password } = credentials;

    if (!host || !username) {
      throw new Error("Host and username are required");
    }

    this.login = credentials;
    this.connection = "connecting";

    return new Promise((resolve) => {
      // @ts-ignore - jsxapi connect returns EventEmitter but TypeScript infers it as Promise
      jsxapi
        .connect(`wss://${host}`, { username, password })
        .on("ready", async (xapi: any) => {
          // Connection successful
          this.connector = xapi;
          this.connection = "connected";

          // Get device info
          try {
            this.unitName = await xapi.Config.SystemUnit.Name.get();
          } catch (e) {
            console.warn("Could not get unit name:", e);
            this.unitName = "Unknown Device";
          }

          try {
            this.unitType = await xapi.Status.SystemUnit.ProductPlatform.get();
          } catch (e) {
            console.warn("Could not get unit type:", e);
            this.unitType = "Unknown Type";
          }

          try {
            this.softwareVersion = await xapi.Status.SystemUnit.Software.Version.get();
          } catch (e) {
            console.warn("Could not get software version:", e);
            this.softwareVersion = "Unknown";
          }

          // Set up close handler
          xapi.on("close", () => {
            this.connection = "not-connected";
            this.connector = null;
          });

          resolve(true);
        })
        .on("error", (error: Error) => {
          // Connection failed
          this.connection = "failed";
          this.connector = null;

          console.error("\nNot able to connect.");
          console.error(
            `Try logging in at https://${host} and accept the self-signed certificate?`,
          );
          console.error("Make sure you are on the same network (not VPN)");
          console.error(
            "DX80 etc: Make sure xConfiguration NetworkServices WebSocket is FollowHTTPService",
          );

          if (error.message) {
            console.error("\nError details:", error.message);
          }

          resolve(false);
        });
    });
  }

  /**
   * Disconnect from device
   */
  disconnect(): void {
    if (this.connector) {
      this.connector.close();
      this.connector = null;
    }
    this.connection = "not-connected";
    this.login = null;
    this.unitName = "";
    this.unitType = "";
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connection;
  }

  /**
   * Get connected device info
   */
  getDeviceInfo(): ConnectedDeviceInfo | null {
    if (this.connection !== "connected" || !this.login) {
      return null;
    }

    return {
      unitName: this.unitName,
      unitType: this.unitType,
      host: this.login.host,
      softwareVersion: this.softwareVersion,
    };
  }

  /**
   * Get login credentials
   */
  getLogin(): ConnectionCredentials | null {
    return this.login;
  }

  /**
   * Get connector instance
   */
  getConnector(): any {
    return this.connector;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection === "connected";
  }

  /**
   * Ping the device to check if connection is alive
   */
  async ping(): Promise<boolean> {
    if (!this.connector) return false;

    try {
      await this.connector.Status.Audio.Volume.get();

      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const ciscoConnectionService = new CiscoConnectionService();
export default CiscoConnectionService;
