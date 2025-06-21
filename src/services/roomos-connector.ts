/**
 * RoomOS Device Connector
 *
 * Core connection management for Cisco RoomOS devices via jsxAPI.
 * Based on extracted code from roomos.cisco.com
 */

// Import jsxapi directly like Cisco does
// @ts-ignore - jsxapi doesn't have TypeScript definitions
import * as jsxapi from "jsxapi";

const protocol = "wss://"; // ws won't work from https sites

export interface DeviceCredentials {
  host: string;
  username: string;
  password: string;
}

export interface DeviceInfo {
  name: string;
  type: string;
  host: string;
  software?: string;
}

export type ConnectionState = "not-connected" | "connecting" | "connected" | "failed";

export class RoomOSConnector {
  private xapi: any = null;
  private errorHandler: ((error: Error) => void) | null = null;
  private login: DeviceCredentials | null = null;
  private unitName = "";
  private unitType = "";
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectionState: ConnectionState = "not-connected";

  constructor() {
    this.onConnected = this.onConnected.bind(this);
    this.onError = this.onError.bind(this);
  }

  /**
   * Called when connection is established
   */
  private async onConnected(xapi: any): Promise<void> {
    this.xapi = xapi;
    this.connectionState = "connected";

    try {
      // Get device information
      this.unitName = await xapi.Config.SystemUnit.Name.get();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Could not get unit name:", e);
    }

    try {
      this.unitType = await xapi.Status.SystemUnit.ProductPlatform.get();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Could not get unit type:", e);
    }
  }

  /**
   * Connect to a RoomOS device
   */
  async connect(credentials: DeviceCredentials): Promise<boolean> {
    const { host, username, password } = credentials;

    if (!host || !username || !password) {
      throw new Error("Host, username, and password are required");
    }

    this.login = credentials;
    this.connectionState = "connecting";

    try {
      const connection = await jsxapi.connect(protocol + host, {
        username,
        password,
      });

      // Set up event handlers
      connection.on("ready", this.onConnected);
      connection.on("error", this.onError);
      connection.on("close", () => {
        this.connectionState = "not-connected";
        this.xapi = null;
      });

      return true;
    } catch (error) {
      this.connectionState = "failed";
      this.onError(error as Error);
      throw error;
    }
  }

  /**
   * Test connection with a simple API call
   */
  async ping(): Promise<any> {
    if (!this.xapi) {
      throw new Error("Not connected to device");
    }

    return this.xapi.Status.Audio.Volume.get();
  }

  /**
   * Disconnect from the device
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.xapi) {
      this.xapi.close();
      this.xapi = null;
    }

    this.connectionState = "not-connected";
  }

  /**
   * Get basic system information
   */
  async getSystemInfo(): Promise<DeviceInfo> {
    if (!this.xapi) {
      throw new Error("Not connected to device");
    }

    try {
      const [name, device, software] = await Promise.all([
        this.xapi.Status.UserInterface.ContactInfo.Name.get().catch(() => this.unitName),
        this.xapi.Status.SystemUnit.ProductPlatform.get().catch(() => this.unitType),
        this.xapi.Status.SystemUnit.Software.Version.get().catch(() => "Unknown"),
      ]);

      return {
        name: name || this.unitName || "Unknown Device",
        type: device || this.unitType || "Unknown Type",
        host: this.login?.host || "Unknown Host",
        software: software,
      };
    } catch (error) {
      throw new Error(`Failed to get system info: ${error}`);
    }
  }

  /**
   * Get connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connectionState === "connected" && this.xapi !== null;
  }

  /**
   * Get the underlying xAPI instance
   */
  getXAPI(): any {
    return this.xapi;
  }

  /**
   * Set error handler function
   */
  setErrorHandler(handler: (error: Error) => void): void {
    this.errorHandler = handler;
  }

  /**
   * Handle connection errors
   */
  private onError(error: Error): void {
    this.connectionState = "failed";
    if (this.errorHandler) {
      this.errorHandler(error);
    }
    // eslint-disable-next-line no-console
    console.warn("Connection error:", error);
  }

  /**
   * Get device credentials used for connection
   */
  getCredentials(): DeviceCredentials | null {
    return this.login;
  }
}

// Export a singleton instance for global use
export const roomosConnector = new RoomOSConnector();
export default RoomOSConnector;
