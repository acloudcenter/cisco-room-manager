# Cisco Room Manager

**Note: This is a personal project currently in development. Some features are still being implemented and tested.**

## About

This is a web-based management tool for Cisco video conferencing devices. I built this to explore how WebSocket connections can enable real-time device management directly from the browser, without requiring additional infrastructure or downloads.

The application connects to Cisco devices using their JSXAPI over WebSocket, allowing administrators to configure, monitor, and provision room systems through a single interface. All features may not work as intended as this is a work in progress. However, feel free to contribute or borrow any code you find helpful!

## Features

### Device Management

- Connect to multiple devices simultaneously (up to 10)
- Real-time status monitoring through WebSocket connections
- Bulk device import via CSV files
- Quick navigation between connected devices

### Configuration

- System settings management
- Macro upload and control
- UI extension management
- Security certificate configuration

### Provisioning

- Support for Webex and TMS provisioning
- External manager configuration
- Network and protocol settings
- TLS verification handling

### Monitoring

- System health and diagnostics
- Call statistics and quality metrics
- Audio/video subsystem status
- Network performance data

## Tech Stack

- React 18.3 with TypeScript
- Vite for build tooling
- HeroUI component library
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management
- React Router for navigation
- JSXAPI for Cisco device communication

## Installation

Prerequisites:

- Node.js 18 or higher
- Network access to Cisco devices (no VPN)
- Admin credentials for target devices

Setup:

```bash
git clone https://github.com/yourusername/cisco-room-manager.git
cd cisco-room-manager
npm install
npm run dev
```

Device configuration:

1. Enable WebSocket on the Cisco device (Setup > NetworkServices > WebSocket = "FollowHTTPService")
2. Accept the device's certificate by visiting https://[device-ip] in your browser
3. Use admin credentials when connecting through the app

## Current Status

This project is under active development. I'm currently working on:

- Improving error handling and connection recovery
- Adding test coverage
- Expanding device management capabilities
- Refining the user interface based on testing

Known limitations:

- Browser WebSocket limit restricts concurrent connections to 10 devices
- Each device requires manual certificate acceptance
- Some features depend on specific Cisco software versions

## Planned Features

- Device discovery automation
- Configuration templates for batch updates
- Data export and analytics
- Configuration backup and restore
- Additional security controls

## Contributing

This is currently a personal project for learning and demonstration purposes. While I'm not accepting pull requests at this time, I welcome feedback and bug reports through GitHub issues.

## License

MIT License - see LICENSE file for details.

---

Disclaimer: This project is not affiliated with or endorsed by Cisco Systems. It's an independent tool created for educational purposes.
