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
}

class CiscoConnectionService {
  private connection: ConnectionState = "not-connected";
  private connector: any = null;
  private login: ConnectionCredentials | null = null;
  private unitName = "";
  private unitType = "";

  /**
   * Connect to device - matches Cisco's implementation pattern
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

    try {
      const xapi = await jsxapi.connect(`wss://${host}`, {
        username,
        password,
      });

      // Connection is already established at this point
      this.connector = xapi;
      this.connection = "connected";

      // Get device info immediately after connection
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

      // Set up event handlers
      xapi.on("error", (error: Error) => {
        this.onError(error);
      });

      xapi.on("close", () => {
        this.connection = "not-connected";
        this.connector = null;
      });

      return true;
    } catch (error) {
      this.connection = "failed";
      this.onError(error as Error);
      throw error;
    }
  }

  /**
   * Handle connection errors
   */
  private onError(error: Error): void {
    this.connection = "failed";
    console.warn("Connection error:", error.message);
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
}

// Export singleton instance
export const ciscoConnectionService = new CiscoConnectionService();
export default CiscoConnectionService;
