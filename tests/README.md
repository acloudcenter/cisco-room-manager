# Testing Guide

This directory contains tests for the Cisco Room Manager application.

## Test Structure

```
tests/
├── services/           # Service layer tests (device communication)
│   ├── connection/     # WebSocket connection tests
│   ├── status/         # Device status query tests
│   ├── config/         # Device configuration tests
│   ├── provisioning/   # Provisioning workflow tests
│   └── README.md       # Detailed service test documentation
└── README.md          # This file
```

## Quick Start

### Prerequisites

1. **Create `.env` file** in project root:

```bash
TSD_IPADDRESS=192.168.1.186
TSD_USERNAME=admin
TSD_PASSWORD=your-device-password
```

2. **Enable WebSocket** on Cisco device:
   - Setup > NetworkServices > WebSocket = "FollowHTTPService"
   - Accept HTTPS certificate at https://[device-ip]

### Run Tests

```bash
# Test basic connection
npx tsx tests/services/connection/test-single-device.ts

# Test device status monitoring
npx tsx tests/services/status/test-status-queries.ts

# Test configuration reading
npx tsx tests/services/config/test-config-queries.ts

# Test complete provisioning workflow
npx tsx tests/services/provisioning/test-full-cycle-to-tms.ts
npx tsx tests/services/provisioning/test-back-to-webex.ts
```

## Test Categories

### Service Tests (`services/`)

**Real device communication tests** - These test actual jsxapi functions against your Cisco device.

- ✅ **Connection**: WebSocket setup and cleanup
- ✅ **Status Queries**: 27 device monitoring functions
- ✅ **Configuration**: 20 device configuration functions
- ✅ **Provisioning**: Complete check/push/clear workflow

See `tests/services/README.md` for detailed documentation.

### Unit Tests (Removed)

Component and store unit tests were removed as they became outdated. The service-level tests provide comprehensive coverage of the actual device functionality.

## Test Results

**Cisco DX80 (CE 9.15.18.5)**: All service tests passing ✅

- **Connection**: WebSocket over HTTPS working
- **Status**: 27/27 functions successful
- **Config**: 16/20 functions successful (4 network restricted)
- **Provisioning**: Complete workflow verified

## Development Notes

- All tests validate environment variables before running
- Tests use read-only operations by default for safety
- Provisioning tests include automatic restoration
- Tests designed to run individually or in sequence
- Focus on real device communication over mocked interfaces
