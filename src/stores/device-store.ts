import { create } from "zustand";

import {
  ConnectionCredentials,
  ConnectionState,
  ConnectedDeviceInfo,
} from "@/services/cisco-connection-service";
import { connectionManager } from "@/services/connection-manager";

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
  drawerMode: "push" | "overlay";
  viewMode: "side" | "center";

  // Provisioning State
  isProvisioning: boolean;
  provisioningProgress: string | null;
  provisioningError: string | null;

  // Actions
  connectDevice: (credentials: ConnectionCredentials) => Promise<void>;
  disconnectDevice: (deviceId?: string) => void;
  clearConnectionError: () => void;
  getCurrentDevice: () => ConnectedDevice | null;
  getDeviceService: (deviceId: string) => any; // Returns CiscoConnectionService instance
  setProvisioningState: (isProvisioning: boolean, progress?: string) => void;
  setProvisioningError: (error: string | null) => void;
  setDrawerMode: (mode: "push" | "overlay") => void;
  setViewMode: (mode: "side" | "center") => void;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  isConnecting: false,
  connectionError: null,
  drawerMode: "overlay", // Default to overlay mode
  viewMode: "side", // Default to side view
  isProvisioning: false,
  provisioningProgress: null,
  provisioningError: null,

  connectDevice: async (credentials: ConnectionCredentials) => {
    set({ isConnecting: true, connectionError: null });

    try {
      // Generate device ID from host
      const deviceId = `device_${credentials.host.replace(/[^\w]/g, "_")}`;

      // Check if device is already connected
      const existingDevices = get().devices;

      if (existingDevices.some((d) => d.id === deviceId)) {
        throw new Error(`Device ${credentials.host} is already connected`);
      }

      // Check connection limit
      if (!connectionManager.canAddMoreConnections()) {
        throw new Error(`Connection limit reached. Please disconnect a device before adding more.`);
      }

      // Get dedicated connection service for this device
      const deviceService = connectionManager.getConnection(deviceId);

      // Connect using the device-specific service
      const connected = await deviceService.connect(credentials);

      if (!connected) {
        connectionManager.disconnectDevice(deviceId); // Clean up on failure
        throw new Error(
          "Connection failed. Please check: 1) Your credentials are correct, 2) The device's certificate is trusted (visit https://[device-ip] to accept it), 3) You're on the same network as the device",
        );
      }

      // Wait a bit for device info to be populated
      await new Promise((resolve) => setTimeout(resolve, 500));

      const deviceInfo = deviceService.getDeviceInfo();
      const connectionState = deviceService.getConnectionState();

      if (connectionState === "connected" && deviceInfo) {
        const connectedDevice: ConnectedDevice = {
          id: deviceId,
          info: deviceInfo,
          credentials: {
            ...credentials,
            password: "***", // Don't store password in state
          },
          connectionState,
          connectedAt: new Date(),
        };

        set((state) => ({
          devices: [...state.devices, connectedDevice], // Append to existing devices
          isConnecting: false,
          connectionError: null,
        }));
      } else {
        connectionManager.disconnectDevice(deviceId); // Clean up on failure
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

  disconnectDevice: (deviceId?: string) => {
    if (deviceId) {
      // Disconnect specific device
      connectionManager.disconnectDevice(deviceId);
      set((state) => ({
        devices: state.devices.filter((d) => d.id !== deviceId),
      }));
    } else {
      // Disconnect all devices
      connectionManager.disconnectAll();
      set({ devices: [] });
    }
  },

  clearConnectionError: () => {
    set({ connectionError: null });
  },

  getCurrentDevice: () => {
    const { devices } = get();

    return devices.length > 0 ? devices[0] : null;
  },

  getDeviceService: (deviceId: string) => {
    // Check if device is connected
    const device = get().devices.find((d) => d.id === deviceId);

    if (!device) {
      throw new Error(`Device ${deviceId} not found or not connected`);
    }

    return connectionManager.getConnection(deviceId);
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

  setDrawerMode: (mode: "push" | "overlay") => {
    set({ drawerMode: mode });
  },

  setViewMode: (mode: "side" | "center") => {
    set({ viewMode: mode });
  },
}));
