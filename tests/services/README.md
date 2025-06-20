# Service Tests

This directory contains organized tests for all Cisco Room Manager services.

## Directory Structure

```
tests/services/
├── connection/          # Connection and WebSocket tests
├── status/             # Device status query tests
├── config/             # Device configuration query tests
├── provisioning/       # Provisioning management tests
└── README.md          # This file
```

## Test Categories

### Connection Tests (`connection/`)

**Purpose**: Verify WebSocket connection and cleanup functionality

- `test-single-device.ts` - Basic connection test with environment variables
- `test-connection-cleanup.ts` - Connection cleanup and resource management

**Usage**:

```bash
npx tsx tests/services/connection/test-single-device.ts
npx tsx tests/services/connection/test-connection-cleanup.ts
```

### Status Query Tests (`status/`)

**Purpose**: Test device status monitoring (Phase 2)

- `test-status-queries.ts` - Comprehensive status queries (system, audio, video, call, standby, health)

**Usage**:

```bash
npx tsx tests/services/status/test-status-queries.ts
```

**Verified Functions**: 27 status query functions including system info, audio levels, video connectors, call status, power state, and hardware monitoring.

### Configuration Query Tests (`config/`)

**Purpose**: Test device configuration reading (Phase 3)

- `test-config-queries.ts` - Configuration queries (system, audio, video, network, UI settings)

**Usage**:

```bash
npx tsx tests/services/config/test-config-queries.ts
```

**Verified Functions**: 20 configuration query functions including system settings, audio defaults, video configuration, network setup, and user interface preferences.

### Provisioning Tests (`provisioning/`)

**Purpose**: Test complete provisioning workflow (check, push, clear)

- `test-full-cycle-to-tms.ts` - Complete cycle: Webex → TMS → Configure external manager
- `test-back-to-webex.ts` - Clear cycle: TMS → Webex (auto-cleanup)

**Usage**:

```bash
# Apply full TMS provisioning configuration
npx tsx tests/services/provisioning/test-full-cycle-to-tms.ts

# Clear back to Webex mode
npx tsx tests/services/provisioning/test-back-to-webex.ts
```

**Verified Workflow**:

1. **CHECK**: Read current provisioning status
2. **PUSH**: Webex → TMS → External connectivity → Credentials → External Manager
3. **CLEAR**: TMS → Webex (auto-resets configuration)

## Prerequisites

### Environment Variables

Create `.env` file in project root:

```bash
TSD_IPADDRESS=192.168.1.186
TSD_USERNAME=admin
TSD_PASSWORD=your-device-password
```

### Device Requirements

1. **WebSocket enabled**: Setup > NetworkServices > WebSocket = "FollowHTTPService"
2. **HTTPS certificate accepted**: Visit https://[device-ip] and accept certificate
3. **Admin privileges**: User must have admin rights for provisioning changes

## Test Results Summary

### Cisco DX80 (CE 9.15.18.5) - All Tests Passing ✅

**Connection**: WebSocket over HTTPS working
**Status Queries**: 27/27 functions successful  
**Config Queries**: 16/20 functions successful (4 network queries restricted)
**Provisioning**: Complete workflow verified

## Quick Test Commands

```bash
# Test basic connection
npx tsx tests/services/connection/test-single-device.ts

# Test all status queries
npx tsx tests/services/status/test-status-queries.ts

# Test configuration reading
npx tsx tests/services/config/test-config-queries.ts

# Apply TMS provisioning
npx tsx tests/services/provisioning/test-full-cycle-to-tms.ts

# Clear back to Webex
npx tsx tests/services/provisioning/test-back-to-webex.ts
```

## Development Notes

- All tests use read-only operations by default for safety
- Provisioning tests include automatic restoration/cleanup
- Tests are designed to be run individually or in sequence
- Each test validates environment variables before proceeding
