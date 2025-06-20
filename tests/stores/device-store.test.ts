import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeviceStore } from "@/stores/device-store";
import type { DeviceCredentials } from "@/services/roomos-connector";

// Mock the MockRoomOSConnector
vi.mock("@/services/mock-connector", () => ({
  MockRoomOSConnector: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    getSystemInfo: vi.fn(),
    ping: vi.fn(),
    setErrorHandler: vi.fn(),
    getCredentials: vi.fn(),
  })),
}));

describe("useDeviceStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useDeviceStore());
    act(() => {
      result.current.disconnectAllDevices();
      result.current.clearConnectionError();
    });
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useDeviceStore());

      expect(result.current.devices).toEqual([]);
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.connectionError).toBe(null);
    });
  });

  describe("connectDevice", () => {
    it("should successfully connect a device", async () => {
      const { MockRoomOSConnector } = await import("@/services/mock-connector");
      const mockConnector = new MockRoomOSConnector();

      // Mock successful connection
      vi.mocked(mockConnector.connect).mockResolvedValue(true);
      vi.mocked(mockConnector.getSystemInfo).mockResolvedValue({
        name: "Test Device",
        type: "Room Kit Pro",
        host: "192.168.1.100",
        software: "ce9.15.0",
      });

      const { result } = renderHook(() => useDeviceStore());

      const credentials: DeviceCredentials = {
        host: "192.168.1.100",
        username: "admin",
        password: "admin",
      };

      await act(async () => {
        await result.current.connectDevice(credentials);
      });

      expect(result.current.devices).toHaveLength(1);
      expect(result.current.devices[0]).toMatchObject({
        id: "device_192_168_1_100",
        info: {
          name: "Test Device",
          type: "Room Kit Pro",
          host: "192.168.1.100",
          software: "ce9.15.0",
        },
        credentials,
      });
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.connectionError).toBe(null);
    });

    it("should handle connection errors", async () => {
      const { MockRoomOSConnector } = await import("@/services/mock-connector");
      const mockConnector = new MockRoomOSConnector();

      // Mock failed connection
      const errorMessage = "Connection failed";
      vi.mocked(mockConnector.connect).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useDeviceStore());

      const credentials: DeviceCredentials = {
        host: "192.168.1.100",
        username: "admin",
        password: "wrong",
      };

      await act(async () => {
        try {
          await result.current.connectDevice(credentials);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.devices).toHaveLength(0);
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.connectionError).toBe(errorMessage);
    });

    it("should set connecting state during connection", async () => {
      const { MockRoomOSConnector } = await import("@/services/mock-connector");
      const mockConnector = new MockRoomOSConnector();

      // Mock connection that takes time
      let resolveConnection: (value: boolean) => void;
      const connectionPromise = new Promise<boolean>((resolve) => {
        resolveConnection = resolve;
      });
      vi.mocked(mockConnector.connect).mockReturnValue(connectionPromise);

      const { result } = renderHook(() => useDeviceStore());

      const credentials: DeviceCredentials = {
        host: "192.168.1.100",
        username: "admin",
        password: "admin",
      };

      // Start connection
      const connectPromise = act(async () => {
        return result.current.connectDevice(credentials);
      });

      // Should be in connecting state
      expect(result.current.isConnecting).toBe(true);

      // Complete connection
      vi.mocked(mockConnector.getSystemInfo).mockResolvedValue({
        name: "Test Device",
        type: "Room Kit Pro",
        host: "192.168.1.100",
        software: "ce9.15.0",
      });

      resolveConnection!(true);
      await connectPromise;

      expect(result.current.isConnecting).toBe(false);
    });

    it("should replace existing device with same host", async () => {
      const { MockRoomOSConnector } = await import("@/services/mock-connector");
      const mockConnector = new MockRoomOSConnector();

      vi.mocked(mockConnector.connect).mockResolvedValue(true);
      vi.mocked(mockConnector.getSystemInfo).mockResolvedValue({
        name: "Test Device",
        type: "Room Kit Pro",
        host: "192.168.1.100",
        software: "ce9.15.0",
      });

      const { result } = renderHook(() => useDeviceStore());

      const credentials: DeviceCredentials = {
        host: "192.168.1.100",
        username: "admin",
        password: "admin",
      };

      // Connect first time
      await act(async () => {
        await result.current.connectDevice(credentials);
      });

      expect(result.current.devices).toHaveLength(1);

      // Connect again with same host
      await act(async () => {
        await result.current.connectDevice(credentials);
      });

      // Should still have only one device
      expect(result.current.devices).toHaveLength(1);
      expect(mockConnector.disconnect).toHaveBeenCalled();
    });
  });

  describe("disconnectDevice", () => {
    it("should disconnect a specific device", async () => {
      const { MockRoomOSConnector } = await import("@/services/mock-connector");
      const mockConnector = new MockRoomOSConnector();

      vi.mocked(mockConnector.connect).mockResolvedValue(true);
      vi.mocked(mockConnector.getSystemInfo).mockResolvedValue({
        name: "Test Device",
        type: "Room Kit Pro",
        host: "192.168.1.100",
        software: "ce9.15.0",
      });

      const { result } = renderHook(() => useDeviceStore());

      const credentials: DeviceCredentials = {
        host: "192.168.1.100",
        username: "admin",
        password: "admin",
      };

      // Connect device
      await act(async () => {
        await result.current.connectDevice(credentials);
      });

      expect(result.current.devices).toHaveLength(1);
      const deviceId = result.current.devices[0].id;

      // Disconnect device
      act(() => {
        result.current.disconnectDevice(deviceId);
      });

      expect(result.current.devices).toHaveLength(0);
      expect(mockConnector.disconnect).toHaveBeenCalled();
    });

    it("should handle disconnecting non-existent device gracefully", () => {
      const { result } = renderHook(() => useDeviceStore());

      act(() => {
        result.current.disconnectDevice("non-existent-id");
      });

      expect(result.current.devices).toHaveLength(0);
    });
  });

  describe("disconnectAllDevices", () => {
    it("should disconnect all devices", async () => {
      const { MockRoomOSConnector } = await import("@/services/mock-connector");
      const mockConnector1 = new MockRoomOSConnector();
      const mockConnector2 = new MockRoomOSConnector();

      vi.mocked(mockConnector1.connect).mockResolvedValue(true);
      vi.mocked(mockConnector2.connect).mockResolvedValue(true);
      vi.mocked(mockConnector1.getSystemInfo).mockResolvedValue({
        name: "Device 1",
        type: "Room Kit Pro",
        host: "192.168.1.100",
        software: "ce9.15.0",
      });
      vi.mocked(mockConnector2.getSystemInfo).mockResolvedValue({
        name: "Device 2",
        type: "Room Kit Pro",
        host: "192.168.1.101",
        software: "ce9.15.0",
      });

      const { result } = renderHook(() => useDeviceStore());

      // Connect two devices
      await act(async () => {
        await result.current.connectDevice({
          host: "192.168.1.100",
          username: "admin",
          password: "admin",
        });
      });

      await act(async () => {
        await result.current.connectDevice({
          host: "192.168.1.101",
          username: "admin",
          password: "admin",
        });
      });

      expect(result.current.devices).toHaveLength(2);

      // Disconnect all
      act(() => {
        result.current.disconnectAllDevices();
      });

      expect(result.current.devices).toHaveLength(0);
    });
  });

  describe("clearConnectionError", () => {
    it("should clear connection error", () => {
      const { result } = renderHook(() => useDeviceStore());

      // Set an error manually (in real scenario this would come from failed connection)
      act(() => {
        result.current.clearConnectionError();
      });

      expect(result.current.connectionError).toBe(null);
    });
  });

  describe("pingDevice", () => {
    it("should ping a connected device successfully", async () => {
      const { MockRoomOSConnector } = await import("@/services/mock-connector");
      const mockConnector = new MockRoomOSConnector();

      vi.mocked(mockConnector.connect).mockResolvedValue(true);
      vi.mocked(mockConnector.getSystemInfo).mockResolvedValue({
        name: "Test Device",
        type: "Room Kit Pro",
        host: "192.168.1.100",
        software: "ce9.15.0",
      });
      vi.mocked(mockConnector.ping).mockResolvedValue({ Volume: 50 });

      const { result } = renderHook(() => useDeviceStore());

      // Connect device
      await act(async () => {
        await result.current.connectDevice({
          host: "192.168.1.100",
          username: "admin",
          password: "admin",
        });
      });

      const deviceId = result.current.devices[0].id;

      // Ping device
      let pingResult: boolean;
      await act(async () => {
        pingResult = await result.current.pingDevice(deviceId);
      });

      expect(pingResult!).toBe(true);
      expect(mockConnector.ping).toHaveBeenCalled();
      expect(result.current.devices[0].lastPing).toBeInstanceOf(Date);
    });

    it("should handle ping failure", async () => {
      const { MockRoomOSConnector } = await import("@/services/mock-connector");
      const mockConnector = new MockRoomOSConnector();

      vi.mocked(mockConnector.connect).mockResolvedValue(true);
      vi.mocked(mockConnector.getSystemInfo).mockResolvedValue({
        name: "Test Device",
        type: "Room Kit Pro",
        host: "192.168.1.100",
        software: "ce9.15.0",
      });
      vi.mocked(mockConnector.ping).mockRejectedValue(new Error("Ping failed"));

      const { result } = renderHook(() => useDeviceStore());

      // Connect device
      await act(async () => {
        await result.current.connectDevice({
          host: "192.168.1.100",
          username: "admin",
          password: "admin",
        });
      });

      const deviceId = result.current.devices[0].id;

      // Ping device
      let pingResult: boolean;
      await act(async () => {
        pingResult = await result.current.pingDevice(deviceId);
      });

      expect(pingResult!).toBe(false);
    });

    it("should return false for non-existent device", async () => {
      const { result } = renderHook(() => useDeviceStore());

      let pingResult: boolean;
      await act(async () => {
        pingResult = await result.current.pingDevice("non-existent-id");
      });

      expect(pingResult!).toBe(false);
    });
  });

  describe("getDevice", () => {
    it("should return device by id", async () => {
      const { MockRoomOSConnector } = await import("@/services/mock-connector");
      const mockConnector = new MockRoomOSConnector();

      vi.mocked(mockConnector.connect).mockResolvedValue(true);
      vi.mocked(mockConnector.getSystemInfo).mockResolvedValue({
        name: "Test Device",
        type: "Room Kit Pro",
        host: "192.168.1.100",
        software: "ce9.15.0",
      });

      const { result } = renderHook(() => useDeviceStore());

      // Connect device
      await act(async () => {
        await result.current.connectDevice({
          host: "192.168.1.100",
          username: "admin",
          password: "admin",
        });
      });

      const deviceId = result.current.devices[0].id;
      const device = result.current.getDevice(deviceId);

      expect(device).toBeDefined();
      expect(device!.id).toBe(deviceId);
      expect(device!.info.name).toBe("Test Device");
    });

    it("should return undefined for non-existent device", () => {
      const { result } = renderHook(() => useDeviceStore());

      const device = result.current.getDevice("non-existent-id");

      expect(device).toBeUndefined();
    });
  });
});
