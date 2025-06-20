import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { HeroUIProvider } from "@heroui/react";
import { BrowserRouter } from "react-router-dom";

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <HeroUIProvider>{children}</HeroUIProvider>
    </BrowserRouter>
  );
};

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Export everything from testing-library/react
export * from "@testing-library/react";

// Override render method
export { customRender as render };

// Common test utilities
export const mockConsoleError = () => {
  const originalError = console.error;
  const mockError = vi.fn();
  console.error = mockError;

  return {
    mockError,
    restore: () => {
      console.error = originalError;
    },
  };
};

export const mockConsoleWarn = () => {
  const originalWarn = console.warn;
  const mockWarn = vi.fn();
  console.warn = mockWarn;

  return {
    mockWarn,
    restore: () => {
      console.warn = originalWarn;
    },
  };
};

// Helper to create mock device credentials
export const createMockCredentials = (overrides = {}) => ({
  host: "192.168.1.100",
  username: "admin",
  password: "admin",
  ...overrides,
});

// Helper to create mock device info
export const createMockDeviceInfo = (overrides = {}) => ({
  name: "Test Device",
  type: "Room Kit Pro",
  host: "192.168.1.100",
  software: "ce9.15.0",
  ...overrides,
});

// Helper to wait for next tick
export const waitForNextTick = () => new Promise((resolve) => setTimeout(resolve, 0));
