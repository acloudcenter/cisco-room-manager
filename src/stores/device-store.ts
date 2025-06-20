import { create } from "zustand";

import {
  ciscoConnectionService,
  ConnectionCredentials,
  ConnectionState,
  ConnectedDeviceInfo,
} from "@/services/cisco-connection-service";

export interface ConnectedDevice {
  id: string;
  info: ConnectedDeviceInfo;
  credentials: ConnectionCredentials;
  connectionState: ConnectionState;
  connectedAt: Date;
}

interface DeviceState {
  // Connected devices
  devices: ConnectedDevice[];

  // UI State
  isConnecting: boolean;
  connectionError: string | null;

  // Actions
  connectDevice: (credentials: ConnectionCredentials) => Promise<void>;
  disconnectDevice: () => void;
  clearConnectionError: () => void;
  getCurrentDevice: () => ConnectedDevice | null;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  isConnecting: false,
  connectionError: null,

  connectDevice: async (credentials: ConnectionCredentials) => {
    set({ isConnecting: true, connectionError: null });

    try {
      // Use the Cisco connection service
      await ciscoConnectionService.connect(credentials);

      // Wait a bit for device info to be populated
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const deviceInfo = ciscoConnectionService.getDeviceInfo();
      const connectionState = ciscoConnectionService.getConnectionState();

      if (connectionState === "connected" && deviceInfo) {
        const connectedDevice: ConnectedDevice = {
          id: `device_${credentials.host.replace(/[^\w]/g, "_")}`,
          info: deviceInfo,
          credentials,
          connectionState,
          connectedAt: new Date(),
        };

        set({
          devices: [connectedDevice], // Single device for now
          isConnecting: false,
          connectionError: null,
        });
      } else {
        throw new Error("Failed to establish connection");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection failed";

      set({
        isConnecting: false,
        connectionError: errorMessage,
      });
      throw error;
    }
  },

  disconnectDevice: () => {
    ciscoConnectionService.disconnect();
    set({ devices: [] });
  },

  clearConnectionError: () => {
    set({ connectionError: null });
  },

  getCurrentDevice: () => {
    const { devices } = get();

    return devices.length > 0 ? devices[0] : null;
  },
}));
