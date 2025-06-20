import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeroUIProvider } from "@heroui/react";
import ConnectDevicesModal from "@/components/connect-devices-modal";

// Mock the device store
const mockConnectDevice = vi.fn();
const mockClearConnectionError = vi.fn();

vi.mock("@/stores/device-store", () => ({
  useDeviceStore: () => ({
    connectDevice: mockConnectDevice,
    isConnecting: false,
    connectionError: null,
    clearConnectionError: mockClearConnectionError,
  }),
}));

// Helper component to wrap with providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}

describe("ConnectDevicesModal", () => {
  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render modal when open", () => {
    render(
      <TestWrapper>
        <ConnectDevicesModal {...defaultProps} />
      </TestWrapper>,
    );

    expect(screen.getByText("Connect to Room Systems")).toBeInTheDocument();
    expect(screen.getByText("Add devices to manage")).toBeInTheDocument();
  });

  it("should not render modal when closed", () => {
    render(
      <TestWrapper>
        <ConnectDevicesModal {...defaultProps} isOpen={false} />
      </TestWrapper>,
    );

    expect(screen.queryByText("Connect to Room Systems")).not.toBeInTheDocument();
  });

  describe("form validation", () => {
    it("should disable connect button when fields are empty", () => {
      render(
        <TestWrapper>
          <ConnectDevicesModal {...defaultProps} />
        </TestWrapper>,
      );

      const connectButton = screen.getByRole("button", { name: /connect/i });
      expect(connectButton).toBeDisabled();
    });

    it("should enable connect button when all fields are filled", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ConnectDevicesModal {...defaultProps} />
        </TestWrapper>,
      );

      // Fill in form fields
      await user.type(screen.getByLabelText(/ip address/i), "192.168.1.100");
      await user.type(screen.getByLabelText(/username/i), "admin");
      await user.type(screen.getByLabelText(/password/i), "admin");

      const connectButton = screen.getByRole("button", { name: /connect/i });
      expect(connectButton).toBeEnabled();
    });
  });

  describe("form interaction", () => {
    it("should update form fields when typing", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ConnectDevicesModal {...defaultProps} />
        </TestWrapper>,
      );

      const ipInput = screen.getByLabelText(/ip address/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(ipInput, "192.168.1.100");
      await user.type(usernameInput, "admin");
      await user.type(passwordInput, "secret");

      expect(ipInput).toHaveValue("192.168.1.100");
      expect(usernameInput).toHaveValue("admin");
      expect(passwordInput).toHaveValue("secret");
    });

    it("should clear error when user starts typing", async () => {
      const user = userEvent.setup();

      // Re-mock the store with error state
      vi.doMock("@/stores/device-store", () => ({
        useDeviceStore: () => ({
          connectDevice: mockConnectDevice,
          isConnecting: false,
          connectionError: "Connection failed",
          clearConnectionError: mockClearConnectionError,
        }),
      }));

      render(
        <TestWrapper>
          <ConnectDevicesModal {...defaultProps} />
        </TestWrapper>,
      );

      const ipInput = screen.getByLabelText(/ip address/i);
      await user.type(ipInput, "1");

      expect(mockClearConnectionError).toHaveBeenCalled();
    });
  });

  describe("connection handling", () => {
    it("should call connectDevice with correct credentials", async () => {
      const user = userEvent.setup();
      mockConnectDevice.mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <ConnectDevicesModal {...defaultProps} />
        </TestWrapper>,
      );

      // Fill form
      await user.type(screen.getByLabelText(/ip address/i), "192.168.1.100");
      await user.type(screen.getByLabelText(/username/i), "admin");
      await user.type(screen.getByLabelText(/password/i), "admin");

      // Click connect
      await user.click(screen.getByRole("button", { name: /connect/i }));

      expect(mockConnectDevice).toHaveBeenCalledWith({
        host: "192.168.1.100",
        username: "admin",
        password: "admin",
      });
    });

    it("should close modal and reset form on successful connection", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      mockConnectDevice.mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <ConnectDevicesModal {...defaultProps} onOpenChange={onOpenChange} />
        </TestWrapper>,
      );

      // Fill form
      await user.type(screen.getByLabelText(/ip address/i), "192.168.1.100");
      await user.type(screen.getByLabelText(/username/i), "admin");
      await user.type(screen.getByLabelText(/password/i), "admin");

      // Click connect
      await user.click(screen.getByRole("button", { name: /connect/i }));

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });

      // Form should be reset
      expect(screen.getByLabelText(/ip address/i)).toHaveValue("");
      expect(screen.getByLabelText(/username/i)).toHaveValue("");
      expect(screen.getByLabelText(/password/i)).toHaveValue("");
    });

    it("should handle connection errors gracefully", async () => {
      const user = userEvent.setup();
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      mockConnectDevice.mockRejectedValue(new Error("Connection failed"));

      render(
        <TestWrapper>
          <ConnectDevicesModal {...defaultProps} />
        </TestWrapper>,
      );

      // Fill form
      await user.type(screen.getByLabelText(/ip address/i), "192.168.1.100");
      await user.type(screen.getByLabelText(/username/i), "admin");
      await user.type(screen.getByLabelText(/password/i), "wrong");

      // Click connect
      await user.click(screen.getByRole("button", { name: /connect/i }));

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith("Connection failed:", expect.any(Error));
      });

      consoleError.mockRestore();
    });
  });

  describe("cancel functionality", () => {
    it("should close modal and reset form when cancel is clicked", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <TestWrapper>
          <ConnectDevicesModal {...defaultProps} onOpenChange={onOpenChange} />
        </TestWrapper>,
      );

      // Fill form
      await user.type(screen.getByLabelText(/ip address/i), "192.168.1.100");
      await user.type(screen.getByLabelText(/username/i), "admin");
      await user.type(screen.getByLabelText(/password/i), "admin");

      // Click cancel
      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(mockClearConnectionError).toHaveBeenCalled();

      // Form should be reset
      expect(screen.getByLabelText(/ip address/i)).toHaveValue("");
      expect(screen.getByLabelText(/username/i)).toHaveValue("");
      expect(screen.getByLabelText(/password/i)).toHaveValue("");
    });
  });

  describe("tabs functionality", () => {
    it("should switch between single and multiple device tabs", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ConnectDevicesModal {...defaultProps} />
        </TestWrapper>,
      );

      // Should start on single device tab
      expect(screen.getByLabelText(/ip address/i)).toBeInTheDocument();

      // Switch to multiple devices tab
      await user.click(screen.getByRole("tab", { name: /multiple devices/i }));

      // Should show multiple devices content
      expect(screen.getByText("Multiple device connection coming soon")).toBeInTheDocument();
      expect(screen.queryByLabelText(/ip address/i)).not.toBeInTheDocument();

      // Switch back to single device tab
      await user.click(screen.getByRole("tab", { name: /single device/i }));

      // Should show single device form again
      expect(screen.getByLabelText(/ip address/i)).toBeInTheDocument();
    });
  });

  describe("loading states", () => {
    it("should show loading state during connection", () => {
      // Mock store with loading state
      vi.mocked(vi.importActual("@/stores/device-store")).useDeviceStore = () => ({
        connectDevice: mockConnectDevice,
        isConnecting: true,
        connectionError: null,
        clearConnectionError: mockClearConnectionError,
      });

      render(
        <TestWrapper>
          <ConnectDevicesModal {...defaultProps} />
        </TestWrapper>,
      );

      const connectButton = screen.getByRole("button", { name: /connecting/i });
      expect(connectButton).toBeDisabled();
      expect(connectButton).toHaveTextContent("Connecting...");
    });
  });

  describe("error display", () => {
    it("should display connection errors", () => {
      // Mock store with error
      vi.mocked(vi.importActual("@/stores/device-store")).useDeviceStore = () => ({
        connectDevice: mockConnectDevice,
        isConnecting: false,
        connectionError: "Authentication failed. Please check username and password.",
        clearConnectionError: mockClearConnectionError,
      });

      render(
        <TestWrapper>
          <ConnectDevicesModal {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText("Connection Failed")).toBeInTheDocument();
      expect(
        screen.getByText("Authentication failed. Please check username and password."),
      ).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have proper labels and ARIA attributes", () => {
      render(
        <TestWrapper>
          <ConnectDevicesModal {...defaultProps} />
        </TestWrapper>,
      );

      // Check form labels
      expect(screen.getByLabelText(/ip address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

      // Check tab accessibility
      expect(screen.getByRole("tablist")).toHaveAttribute(
        "aria-label",
        "Connection type selection",
      );
    });

    it("should associate labels with inputs correctly", () => {
      render(
        <TestWrapper>
          <ConnectDevicesModal {...defaultProps} />
        </TestWrapper>,
      );

      const ipInput = screen.getByLabelText(/ip address/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(ipInput).toHaveAttribute("id", "ip-address");
      expect(usernameInput).toHaveAttribute("id", "username");
      expect(passwordInput).toHaveAttribute("id", "password");
    });
  });
});
