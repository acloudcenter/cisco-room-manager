import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeroUIProvider } from "@heroui/react";
import ConnectDevicesModal from "@/components/connect-devices-modal";

// Simple mock for the device store
vi.mock("@/stores/device-store", () => ({
  useDeviceStore: () => ({
    connectDevice: vi.fn().mockResolvedValue(undefined),
    isConnecting: false,
    connectionError: null,
    clearConnectionError: vi.fn(),
  }),
}));

// Helper component to wrap with providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}

describe("ConnectDevicesModal - Core Functionality", () => {
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

  it("should have form fields with correct labels", () => {
    render(
      <TestWrapper>
        <ConnectDevicesModal {...defaultProps} />
      </TestWrapper>,
    );

    expect(screen.getByLabelText(/ip address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

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

  it("should switch between tabs", async () => {
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

  it("should have proper accessibility attributes", () => {
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
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-label", "Connection type selection");

    // Check input IDs
    expect(screen.getByLabelText(/ip address/i)).toHaveAttribute("id", "ip-address");
    expect(screen.getByLabelText(/username/i)).toHaveAttribute("id", "username");
    expect(screen.getByLabelText(/password/i)).toHaveAttribute("id", "password");
  });

  it("should show cancel and connect buttons", () => {
    render(
      <TestWrapper>
        <ConnectDevicesModal {...defaultProps} />
      </TestWrapper>,
    );

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /connect/i })).toBeInTheDocument();
  });
});
