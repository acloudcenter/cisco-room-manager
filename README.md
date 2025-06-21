# Cisco Room Manager

A modern React-based web application for managing Cisco video conferencing devices through direct browser communication via WebSocket connections. This tool enables IT administrators and users to monitor, configure, and provision Cisco room systems locally without requiring centralized management infrastructure.

## About This Project

Cisco Room Manager is a work-in-progress application that provides a comprehensive interface for managing Cisco video conferencing devices directly from your browser. The application communicates with devices using the Cisco CE JSXAPI over secure WebSocket connections, enabling real-time device monitoring, configuration management, and provisioning workflows without any sensative data leaving your network. No need for any downloads.

## Key Features

### Device Management

- Real-time WebSocket connections to Cisco CE devices
- Device status monitoring with different status queries
- Configuration reading and management with configuration functions
- Complete provisioning workflow supporting Webex, TMS, and external manager modes

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

## Getting Started - Still a work-in-progress

## License

Licensed under the [MIT license](https://github.com/frontio-ai/vite-template/blob/main/LICENSE).
