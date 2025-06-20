# Testing Guide

This directory contains tests for the Cisco Room Manager application.

## Test Structure

```
tests/
├── components/          # Component tests
├── services/           # Service layer tests
├── stores/             # Zustand store tests
├── utils/              # Test utilities and helpers
├── __mocks__/          # Mock implementations
├── setup.ts            # Test setup and configuration
├── connection tests    # Direct device connection tests
└── README.md          # This file
```

## Running Tests

### Development Commands

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Types

#### Unit Tests

- **Components**: Test individual React components in isolation
- **Services**: Test business logic and API interactions
- **Stores**: Test Zustand state management
- **Utils**: Test utility functions

#### Integration Tests

- Test component interactions with stores
- Test full user workflows

## Test Technologies

- **Vitest**: Fast test runner built on Vite
- **Testing Library**: React component testing utilities
- **Jest DOM**: Additional DOM matchers
- **User Event**: Simulate user interactions

## Writing Tests

### Component Tests

```typescript
import { render, screen } from '@/tests/utils/test-utils';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

### Store Tests

```typescript
import { renderHook, act } from "@testing-library/react";
import { useMyStore } from "@/stores/my-store";

describe("useMyStore", () => {
  it("should update state correctly", () => {
    const { result } = renderHook(() => useMyStore());

    act(() => {
      result.current.updateValue("new value");
    });

    expect(result.current.value).toBe("new value");
  });
});
```

### Service Tests

```typescript
import { MyService } from "@/services/my-service";

describe("MyService", () => {
  it("should handle successful operation", async () => {
    const service = new MyService();
    const result = await service.doSomething();
    expect(result).toBeDefined();
  });
});
```

## Test Utilities

### Custom Render

Use the custom render function that includes all necessary providers:

```typescript
import { render } from "@/tests/utils/test-utils";
// This includes HeroUIProvider and BrowserRouter automatically
```

### Mock Helpers

```typescript
import { createMockCredentials, createMockDeviceInfo } from "@/tests/utils/test-utils";

const credentials = createMockCredentials({ host: "192.168.1.200" });
const deviceInfo = createMockDeviceInfo({ name: "Custom Device" });
```

## Mock Implementations

### MockRoomOSConnector

The `MockRoomOSConnector` simulates Cisco device connections for testing:

- **Success**: username "admin", password "admin"
- **Network Error**: host "invalid.host"
- **Auth Error**: any password "wrong"
- **Generic Error**: other invalid credentials

## Best Practices

### 1. Test Structure

- Use descriptive test names
- Group related tests with `describe` blocks
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Isolation

- Each test should be independent
- Use `beforeEach` to reset state
- Mock external dependencies

### 3. User-Centric Testing

- Test from user perspective
- Use accessible queries (getByRole, getByLabelText)
- Test user interactions, not implementation details

### 4. Async Testing

- Use `await waitFor()` for async operations
- Use `act()` for state updates
- Handle loading states and errors

### 5. Accessibility

- Test ARIA attributes
- Test keyboard navigation
- Test screen reader compatibility

## Example Test Files

### Component Test

```typescript
describe('ConnectDevicesModal', () => {
  it('should validate form fields', async () => {
    const user = userEvent.setup();
    render(<ConnectDevicesModal isOpen={true} onOpenChange={vi.fn()} />);

    const connectButton = screen.getByRole('button', { name: /connect/i });
    expect(connectButton).toBeDisabled();

    await user.type(screen.getByLabelText(/ip address/i), '192.168.1.100');
    await user.type(screen.getByLabelText(/username/i), 'admin');
    await user.type(screen.getByLabelText(/password/i), 'admin');

    expect(connectButton).toBeEnabled();
  });
});
```

### Store Test

```typescript
describe("useDeviceStore", () => {
  it("should connect device successfully", async () => {
    const { result } = renderHook(() => useDeviceStore());

    await act(async () => {
      await result.current.connectDevice(createMockCredentials());
    });

    expect(result.current.devices).toHaveLength(1);
    expect(result.current.isConnecting).toBe(false);
  });
});
```

## Coverage Goals

- **Components**: 90%+ coverage
- **Services**: 95%+ coverage
- **Stores**: 95%+ coverage
- **Utils**: 100% coverage

## Continuous Integration

Tests run automatically on:

- Pull requests
- Main branch pushes
- Before deployments

The CI pipeline requires all tests to pass before merging.

## Device Connection Tests

These tests verify actual connections to Cisco devices. They require a real device with WebSocket enabled.

### Prerequisites for Connection Tests

1. **Enable WebSocket on your Cisco device**

   - Access device web interface: https://[device-ip]/web
   - Navigate to Setup > Configuration > NetworkServices
   - Set WebSocket to "FollowHTTPService"
   - Ensure HTTP Mode is set to "HTTPS"

2. **Accept the device's self-signed certificate**
   - Open https://[device-ip] in your browser
   - Accept/trust the certificate

### Running Connection Tests

#### 1. TypeScript Connection Test

```bash
# Run the TypeScript test in services folder
npx tsx tests/services/test-single-device.ts
```

#### 2. WebSocket Connection Test

```bash
# Test WebSocket connection after enabling
node tests/test-websocket-enabled.js
```

#### 3. Simple HTTP Test

```bash
# Check device API endpoints
node tests/simple-http-test.js
```

#### 4. Debug Connection

```bash
# Diagnose connection issues
node tests/debug-connection.js
```

#### 5. Connection Cleanup Test

```bash
# Test proper WebSocket cleanup
npx tsx tests/services/test-connection-cleanup.ts
```

### Configuration for Connection Tests

The connection tests now use environment variables for security. Create a `.env` file in the project root:

```bash
# Copy .env.example to .env and update with your values
cp .env.example .env
```

Your `.env` file should contain:

```bash
TSD_IPADDRESS=192.168.1.186
TSD_USERNAME=admin
TSD_PASSWORD=your-device-password
```

**Important:**

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Use `.env.example` as a template

### React App Connection Test

To test device connection in the React app:

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:5173/test

3. Enter your device credentials and click Connect

### Troubleshooting Connection Issues

#### Certificate Errors

- Open https://[device-ip] in your browser
- Accept the self-signed certificate
- Try the connection again

#### WebSocket Not Working

- Run `node tests/simple-http-test.js` to check if WebSocket is enabled
- The /ws endpoint should not return 404
- If it returns 404, WebSocket needs to be enabled on the device

#### Connection Timeouts

- Ensure you're on the same network as the device
- Check firewall settings
- Verify the device IP is correct
- Make sure you're not on VPN

#### Authentication Failures

- Verify username and password are correct
- Ensure the user has admin privileges
- Check if local user authentication is enabled on the device
