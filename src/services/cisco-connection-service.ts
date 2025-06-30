/**
 * Cisco Connection Service
 * Based on the working implementation from roomos.cisco.com
 */

// @ts-ignore - jsxapi doesn't have TypeScript definitions
import { EventEmitter } from "events";

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

class CiscoConnectionService extends EventEmitter {
  private connection: ConnectionState = "not-connected";
  private connector: any = null;
  private login: ConnectionCredentials | null = null;
  private unitName = "";
  private unitType = "";
  private softwareVersion = "";
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
  }

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
      const connection = jsxapi.connect(`wss://${host}`, { username, password }) as any;

      connection.on("ready", async (xapi: any) => {
        // Connection successful
        this.connector = xapi;
        this.connection = "connected";

        // Get device info
        try {
          this.unitName = await xapi.Config.SystemUnit.Name.get();
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("Could not get unit name:", e);
          this.unitName = "Unknown Device";
        }

        try {
          this.unitType = await xapi.Status.SystemUnit.ProductPlatform.get();
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("Could not get unit type:", e);
          this.unitType = "Unknown Type";
        }

        try {
          this.softwareVersion = await xapi.Status.SystemUnit.Software.Version.get();
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("Could not get software version:", e);
          this.softwareVersion = "Unknown";
        }

        // Set up close handler
        xapi.on("close", () => {
          this.handleDisconnection();
        });

        // Start heartbeat monitoring
        this.startHeartbeat();

        // Emit connected event
        this.emit("connected", this.login?.host);

        resolve(true);
      });

      connection.on("error", (error: Error) => {
        // Connection failed
        this.connection = "failed";
        this.connector = null;

        // eslint-disable-next-line no-console
        console.error("\nNot able to connect.");
        // eslint-disable-next-line no-console
        console.error(`Try logging in at https://${host} and accept the self-signed certificate?`);
        // eslint-disable-next-line no-console
        console.error("Make sure you are on the same network (not VPN)");
        // eslint-disable-next-line no-console
        console.error(
          "DX80 etc: Make sure xConfiguration NetworkServices WebSocket is FollowHTTPService",
        );

        if (error && error.message) {
          // eslint-disable-next-line no-console
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
    const host = this.login?.host;

    this.stopHeartbeat();

    if (this.connector) {
      this.connector.close();
      this.connector = null;
    }
    this.connection = "not-connected";
    this.login = null;
    this.unitName = "";
    this.unitType = "";
    this.softwareVersion = "";

    // Emit disconnected event
    this.emit("disconnected", host);
  }

  /**
   * Handle unexpected disconnection
   */
  private handleDisconnection(): void {
    const host = this.login?.host;

    this.stopHeartbeat();
    this.connection = "not-connected";
    this.connector = null;

    // Emit disconnected event
    this.emit("disconnected", host);
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.stopHeartbeat(); // Clear any existing interval

    // Check connection health every 30 seconds
    this.heartbeatInterval = setInterval(async () => {
      if (this.connector) {
        try {
          // Simple ping using a lightweight status query
          await this.connector.Status.Standby.State.get();
        } catch (error) {
          // Connection lost
          console.warn("Heartbeat failed, connection lost:", error);
          this.handleDisconnection();
        }
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop heartbeat monitoring
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
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
