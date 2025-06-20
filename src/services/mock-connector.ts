/**
 * Mock RoomOS Connector for testing
 * Simulates connection behavior without actual device connection
 */

import { DeviceCredentials, DeviceInfo, ConnectionState } from "./roomos-connector";

export class MockRoomOSConnector {
  private connectionState: ConnectionState = "not-connected";
  private errorHandler: ((error: Error) => void) | null = null;
  private login: DeviceCredentials | null = null;

  constructor() {
    // Intentionally empty
  }

  async connect(credentials: DeviceCredentials): Promise<boolean> {
    const { host, username, password } = credentials;

    if (!host || !username || !password) {
      throw new Error("Host, username, and password are required");
    }

    this.login = credentials;
    this.connectionState = "connecting";

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate different connection outcomes based on credentials
    if (host === "invalid.host") {
      // Network error
      this.connectionState = "failed";
      const error = new Error(
        "Network unreachable. Please check the IP address and network connectivity.",
      );

      this.onError(error);
      throw error;
    } else if (password === "wrong") {
      // Auth error
      this.connectionState = "failed";
      const error = new Error("Authentication failed. Please check username and password.");

      this.onError(error);
      throw error;
    } else if (username === "admin" && password === "admin") {
      // Success
      this.connectionState = "connected";

      return true;
    } else {
      // Generic connection error
      this.connectionState = "failed";
      const error = new Error(
        "Connection failed. Device may be unreachable or credentials invalid.",
      );

      this.onError(error);
      throw error;
    }
  }

  async ping(): Promise<any> {
    if (!this.isConnected()) {
      throw new Error("Not connected to device");
    }

    return { Volume: 50 }; // Mock volume response
  }

  disconnect(): void {
    this.connectionState = "not-connected";
    this.login = null;
  }

  async getSystemInfo(): Promise<DeviceInfo> {
    if (!this.isConnected()) {
      throw new Error("Not connected to device");
    }

    return {
      name: "Mock Room System",
      type: "Room Kit Pro (Mock)",
      host: this.login?.host || "mock.device",
      software: "ce9.15.0.mock",
    };
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.connectionState === "connected";
  }

  getXAPI(): any {
    return null; // Mock doesn't provide real xAPI
  }

  setErrorHandler(handler: (error: Error) => void): void {
    this.errorHandler = handler;
  }

  private onError(error: Error): void {
    if (this.errorHandler) {
      this.errorHandler(error);
    }
    console.warn("Mock connection error:", error);
  }

  getCredentials(): DeviceCredentials | null {
    return this.login;
  }
}
