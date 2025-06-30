/**
 * Connection Manager
 * Manages multiple CiscoConnectionService instances for multi-device support
 * Implements connection limits to prevent overwhelming the browser
 */

import CiscoConnectionService from "./cisco-connection-service";

import { useDeviceStore } from "@/stores/device-store";

export class ConnectionManager {
  private static instance: ConnectionManager;
  private connections: Map<string, CiscoConnectionService> = new Map();

  // Future: implement connection limits (e.g., max 10 active connections)
  private readonly MAX_CONNECTIONS = 10;

  private constructor() {}

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }

    return ConnectionManager.instance;
  }

  /**
   * Get or create a connection service for a specific device
   */
  getConnection(deviceId: string): CiscoConnectionService {
    if (!this.connections.has(deviceId)) {
      // Check if we're at the connection limit
      if (this.connections.size >= this.MAX_CONNECTIONS) {
        console.warn(
          `Connection limit reached (${this.MAX_CONNECTIONS}). Consider disconnecting unused devices.`,
        );
        // Future: implement automatic disconnection of oldest connections
      }

      // Create new service instance for this device
      const service = new CiscoConnectionService();

      // Listen for disconnection events
      service.on("disconnected", (host: string) => {
        console.log(`Device disconnected: ${host}`);

        // Update device state in store
        const store = useDeviceStore.getState();
        const device = store.devices.find((d) => d.id === deviceId);

        if (device) {
          // Update connection state
          store.updateDeviceConnectionState(deviceId, "not-connected");
        }

        // Clean up the connection
        this.connections.delete(deviceId);
      });

      this.connections.set(deviceId, service);
    }

    return this.connections.get(deviceId)!;
  }

  /**
   * Disconnect and remove a specific device connection
   */
  disconnectDevice(deviceId: string): void {
    const service = this.connections.get(deviceId);

    if (service) {
      service.disconnect();
      this.connections.delete(deviceId);
    }
  }

  /**
   * Disconnect all device connections
   */
  disconnectAll(): void {
    this.connections.forEach((service) => {
      service.disconnect();
    });
    this.connections.clear();
  }

  /**
   * Get the number of active connections
   */
  getActiveConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Check if we can accept more connections
   */
  canAddMoreConnections(): boolean {
    return this.connections.size < this.MAX_CONNECTIONS;
  }
}

export const connectionManager = ConnectionManager.getInstance();
