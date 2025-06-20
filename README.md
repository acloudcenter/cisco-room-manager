# Cisco Room Manager

A modern React-based web application for managing Cisco video conferencing devices through direct browser communication via WebSocket connections. This tool enables IT administrators and users to monitor, configure, and provision Cisco room systems locally without requiring centralized management infrastructure.

## About This Project

Cisco Room Manager is a work-in-progress application that provides a comprehensive interface for managing Cisco video conferencing devices directly from your browser. The application communicates with devices using the Cisco CE JSXAPI over secure WebSocket connections, enabling real-time device monitoring, configuration management, and provisioning workflows.

## Key Features

### Device Management

- Real-time WebSocket connections to Cisco CE devices
- Device status monitoring with 27 different status queries
- Configuration reading and management with 20 configuration functions
- Complete provisioning workflow supporting Webex, TMS, and external manager modes

### User Interface

- Modern glassmorphism design with HeroUI v2 components
- Light and dark theme support
- Responsive sidebar navigation
- Real-time device status display
- Bulk device operations interface

### Provisioning Capabilities

- Switch between Webex and TMS provisioning modes
- Configure external manager settings (address, domain, path, protocol)
- Manage device credentials and connectivity settings
- Handle security configurations including TLS verification

### Monitoring and Status

- System information and health monitoring
- Audio and video status tracking
- Call status and standby state monitoring
- Network and connectivity status

## Technology Stack

- **React 18.3.1** with TypeScript for type-safe development
- **Vite 5.2.0** for fast development and building
- **HeroUI v2** for modern UI components with individual imports
- **Tailwind CSS 3.4.16** for utility-first styling
- **Framer Motion 11.15.0** for smooth animations
- **Zustand 5.0.5** for lightweight state management
- **React Router DOM 6.23.0** for client-side routing
- **Cisco CE JSXAPI** for direct device communication

## Getting Started

### Prerequisites

Before using this application, ensure your Cisco devices meet these requirements:

1. **WebSocket Support**: Enable WebSocket in device settings (Setup > NetworkServices > WebSocket = "FollowHTTPService")
2. **HTTPS Certificate**: Accept the self-signed certificate at https://[device-ip]
3. **Admin Access**: Admin credentials for configuration and provisioning changes
4. **Compatible Firmware**: Tested on Cisco CE 9.15.18.5 and later

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/cisco-room-manager.git
cd cisco-room-manager
npm install
```

### Configuration

Create a `.env` file in the project root with your device credentials:

```bash
TSD_IPADDRESS=192.168.1.186
TSD_USERNAME=admin
TSD_PASSWORD=your-device-password
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173

### Building for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Testing

The project includes comprehensive testing for device communication:

### Service Tests

Test direct device communication with organized test suites:

```bash
# Test basic device connection
npx tsx tests/services/connection/test-single-device.ts

# Test status monitoring functions
npx tsx tests/services/status/test-status-queries.ts

# Test configuration reading
npx tsx tests/services/config/test-config-queries.ts

# Test complete provisioning workflow
npx tsx tests/services/provisioning/test-full-cycle-to-tms.ts
```

### Unit Tests

Run unit tests with Vitest:

```bash
npm run test:run        # Run tests once
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage
```

## Code Quality

The project maintains high code quality through:

- **ESLint** for code linting with auto-fix
- **Prettier** for consistent code formatting
- **TypeScript** with strict mode for type safety
- **Husky** git hooks for pre-commit quality checks
- **lint-staged** for running linters on staged files

Run quality checks:

```bash
npm run lint      # Lint and auto-fix code
npm run format    # Format code with Prettier
```

## CI/CD Pipeline

The project includes a comprehensive GitHub Actions pipeline that runs on every push and pull request:

### Build and Quality Checks

- Application build verification
- TypeScript compilation
- ESLint linting validation
- Prettier formatting check
- Unit test execution

### Security Analysis

- **Semgrep** security scanning with multiple rulesets:
  - Security audit rules
  - Secrets detection
  - OWASP Top Ten vulnerability checks
- **SonarCloud** code quality and security analysis
- **GitHub Advanced Security** with automatic CodeQL scanning

The pipeline ensures code quality and security before merging changes to the main branch.

## Device Compatibility

Currently tested and verified with:

- **Cisco DX80** running CE 9.15.18.5
- **Cisco Room Series** (compatibility testing in progress)
- **Cisco Desk Series** (compatibility testing in progress)

## Development Status

This is an active work-in-progress project with the following completed phases:

**Phase 1 - Foundation** (Complete)

- WebSocket connection management
- Environment variable security
- Error handling and connection cleanup

**Phase 2 - Status Monitoring** (Complete)

- 27 status query functions implemented
- Real-time device monitoring capabilities
- System, audio, video, call, and health status

**Phase 3 - Configuration Management** (Complete)

- 20 configuration query functions implemented
- System, audio, video, network, and UI configuration reading
- Configuration validation and error handling

**Phase 4 - Provisioning Workflow** (Complete)

- Complete provisioning management
- Webex to TMS mode switching
- External manager configuration
- Credentials and security management

**Future Phases**

- Phase 5: Device command execution (volume, mute, video switching)
- Phase 6: Real-time event subscriptions
- Phase 7: Multi-device batch operations
- Phase 8: Advanced configuration dashboard

## Contributing

This project follows standard development practices with automated quality checks. All contributions are welcome through pull requests.

## License

Licensed under the [MIT license](https://github.com/frontio-ai/vite-template/blob/main/LICENSE).
