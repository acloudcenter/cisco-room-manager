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

  // Provisioning State
  isProvisioning: boolean;
  provisioningProgress: string | null;
  provisioningError: string | null;

  // Actions
  connectDevice: (credentials: ConnectionCredentials) => Promise<void>;
  disconnectDevice: () => void;
  clearConnectionError: () => void;
  getCurrentDevice: () => ConnectedDevice | null;
  setProvisioningState: (isProvisioning: boolean, progress?: string) => void;
  setProvisioningError: (error: string | null) => void;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  isConnecting: false,
  connectionError: null,
  isProvisioning: false,
  provisioningProgress: null,
  provisioningError: null,

  connectDevice: async (credentials: ConnectionCredentials) => {
    set({ isConnecting: true, connectionError: null });

    try {
      // Use the Cisco connection service - returns boolean
      const connected = await ciscoConnectionService.connect(credentials);

      if (!connected) {
        throw new Error("Failed to establish connection - check device logs for details");
      }

      // Wait a bit for device info to be populated
      await new Promise((resolve) => setTimeout(resolve, 500));

      const deviceInfo = ciscoConnectionService.getDeviceInfo();
      const connectionState = ciscoConnectionService.getConnectionState();

      if (connectionState === "connected" && deviceInfo) {
        const connectedDevice: ConnectedDevice = {
          id: `device_${credentials.host.replace(/[^\w]/g, "_")}`,
          info: deviceInfo,
          credentials: {
            ...credentials,
            password: "***", // Don't store password in state
          },
          connectionState,
          connectedAt: new Date(),
        };

        set({
          devices: [connectedDevice], // Single device for now
          isConnecting: false,
          connectionError: null,
        });
      } else {
        throw new Error("Failed to retrieve device information");
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

  setProvisioningState: (isProvisioning: boolean, progress?: string) => {
    set({
      isProvisioning,
      provisioningProgress: progress || null,
      provisioningError: isProvisioning ? null : get().provisioningError,
    });
  },

  setProvisioningError: (error: string | null) => {
    set({ provisioningError: error });
  },
}));
