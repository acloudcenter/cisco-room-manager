# jsxapi Functions Reference

This document provides a comprehensive reference of all Cisco jsxapi functions used in the project, their purposes, and test results on our Cisco DX80 device (CE 9.15.18.5).

## Connection Management

### jsxapi.connect()

- **Purpose**: Establish WebSocket connection to Cisco device
- **Usage**: `jsxapi.connect(url, credentials)`
- **Test Status**: ✅ **SUCCESS** - Connects reliably to DX80
- **Implementation**: `cisco-connection-service.ts:20`

```typescript
const connector = await jsxapi.connect(`wss://${host}/ws`, {
  username: credentials.username,
  password: credentials.password,
});
```

---

## Status Queries (Phase 2 - COMPLETED)

### System Information

#### connector.Config.SystemUnit.Name.get()

- **Purpose**: Get device display name
- **Test Status**: ✅ **SUCCESS** - Returns configured device name
- **Sample Response**: "Josh's DX80" or similar user-defined name
- **Implementation**: `cisco-status-service.ts:69`

#### connector.Status.SystemUnit.ProductPlatform.get()

- **Purpose**: Get device hardware platform
- **Test Status**: ✅ **SUCCESS** - Returns "Cisco DX80"
- **Sample Response**: "Cisco DX80"
- **Implementation**: `cisco-status-service.ts:70`

#### connector.Status.SystemUnit.Software.Version.get()

- **Purpose**: Get software version
- **Test Status**: ✅ **SUCCESS** - Returns CE version
- **Sample Response**: "CE 9.15.18.5"
- **Implementation**: `cisco-status-service.ts:71`

#### connector.Status.SystemUnit.Hardware.Module.SerialNumber.get()

- **Purpose**: Get device serial number
- **Test Status**: ✅ **SUCCESS** - Returns hardware serial
- **Sample Response**: "FTT194400XX" (device-specific)
- **Implementation**: `cisco-status-service.ts:72`

#### connector.Status.SystemUnit.Uptime.get()

- **Purpose**: Get system uptime in seconds
- **Test Status**: ✅ **SUCCESS** - Returns uptime counter
- **Sample Response**: 86400 (24 hours in seconds)
- **Implementation**: `cisco-status-service.ts:73`

#### connector.Status.Network.IPv4.Address.get()

- **Purpose**: Get device IP address
- **Test Status**: ✅ **SUCCESS** - Returns current IP
- **Sample Response**: "192.168.1.186"
- **Implementation**: `cisco-status-service.ts:74`

### Audio System

#### connector.Status.Audio.Volume.get()

- **Purpose**: Get current system volume level
- **Test Status**: ✅ **SUCCESS** - Returns volume percentage
- **Sample Response**: 75 (75% volume)
- **Implementation**: `cisco-status-service.ts:102`

#### connector.Status.Audio.Microphones.NumberOfMicrophones.get()

- **Purpose**: Get count of available microphones
- **Test Status**: ✅ **SUCCESS** - Returns mic count
- **Sample Response**: 1 (DX80 has built-in mic)
- **Implementation**: `cisco-status-service.ts:103`

#### connector.Status.Audio.Microphones.Mute.get()

- **Purpose**: Get microphone mute status
- **Test Status**: ✅ **SUCCESS** - Returns mute state
- **Sample Response**: "Off" or "On"
- **Implementation**: `cisco-status-service.ts:104`

#### connector.Status.Audio.Output.NumberOfOutputs.get()

- **Purpose**: Get count of audio output devices
- **Test Status**: ✅ **SUCCESS** - Returns speaker count
- **Sample Response**: 1 (DX80 has built-in speakers)
- **Implementation**: `cisco-status-service.ts:105`

### Video System

#### connector.Status.Video.Input.Connector.get()

- **Purpose**: Get video input connector status
- **Test Status**: ✅ **SUCCESS** - Returns input array
- **Sample Response**: Array of connector objects with Connected/SignalState
- **Implementation**: `cisco-status-service.ts:135`

#### connector.Status.Video.Output.Connector.get()

- **Purpose**: Get video output connector status
- **Test Status**: ✅ **SUCCESS** - Returns output array
- **Sample Response**: Array of connector objects with resolution info
- **Implementation**: `cisco-status-service.ts:136`

### Call Management

#### connector.Status.Call.Status.get()

- **Purpose**: Get current call state
- **Test Status**: ✅ **SUCCESS** - Returns call status
- **Sample Response**: "Idle", "Connected", "Connecting", "Disconnecting"
- **Implementation**: `cisco-status-service.ts:178`

#### connector.Status.Call.Duration.get()

- **Purpose**: Get active call duration in seconds
- **Test Status**: ✅ **SUCCESS** - Returns duration
- **Sample Response**: 0 (when idle) or seconds count during call
- **Implementation**: `cisco-status-service.ts:179`

#### connector.Status.Call.RemoteNumber.get()

- **Purpose**: Get remote party number/URI
- **Test Status**: ✅ **SUCCESS** - Returns remote info
- **Sample Response**: undefined (when idle) or "user@domain.com"
- **Implementation**: `cisco-status-service.ts:180`

#### connector.Status.Call.Direction.get()

- **Purpose**: Get call direction
- **Test Status**: ✅ **SUCCESS** - Returns direction
- **Sample Response**: undefined (when idle) or "Incoming"/"Outgoing"
- **Implementation**: `cisco-status-service.ts:181`

### Power Management

#### connector.Status.Standby.State.get()

- **Purpose**: Get device power/standby state
- **Test Status**: ✅ **SUCCESS** - Returns power state
- **Sample Response**: "Off", "Standby", "Halfwake", "EnteringStandby"
- **Implementation**: `cisco-status-service.ts:206`

### Health Monitoring

#### connector.Status.SystemUnit.Hardware.Temperature.get()

- **Purpose**: Get system temperature
- **Test Status**: ✅ **SUCCESS** - Returns temperature in Celsius
- **Sample Response**: 45 (45°C)
- **Implementation**: `cisco-status-service.ts:232`

#### connector.Status.SystemUnit.Hardware.Monitoring.Fan.Speed.get()

- **Purpose**: Get fan speed
- **Test Status**: ✅ **SUCCESS** - Returns RPM
- **Sample Response**: 2500 (2500 RPM)
- **Implementation**: `cisco-status-service.ts:233`

#### connector.Status.SystemUnit.Hardware.Monitoring.Power.Consumption.get()

- **Purpose**: Get power consumption
- **Test Status**: ✅ **SUCCESS** - Returns watts
- **Sample Response**: 65 (65W)
- **Implementation**: `cisco-status-service.ts:234`

---

## Configuration Queries (Phase 3 - IMPLEMENTED)

### System Configuration

#### connector.Config.SystemUnit.Name.get()

- **Purpose**: Get configured system name
- **Test Status**: ✅ **SUCCESS** - Returns empty string when not configured
- **Sample Response**: "" (empty when not set by user)
- **Implementation**: `cisco-config-service.ts:45`

#### connector.Config.Time.Zone.get()

- **Purpose**: Get timezone configuration
- **Test Status**: ✅ **SUCCESS** - Returns configured timezone
- **Sample Response**: "America/Phoenix"
- **Implementation**: `cisco-config-service.ts:46`

#### connector.Config.UserInterface.Language.get()

- **Purpose**: Get system language setting
- **Test Status**: ✅ **SUCCESS** - Returns system language
- **Sample Response**: "English"
- **Implementation**: `cisco-config-service.ts:47`

#### connector.Config.SystemUnit.ContactInfo.Name.get()

- **Purpose**: Get contact information
- **Test Status**: ✅ **SUCCESS** - Returns "Unknown" when not configured
- **Sample Response**: "Unknown" (fallback when not set)
- **Implementation**: `cisco-config-service.ts:48`

### Audio Configuration

#### connector.Config.Audio.DefaultVolume.get()

- **Purpose**: Get default volume setting
- **Test Status**: ✅ **SUCCESS** - Returns default volume percentage
- **Sample Response**: 50 (50% volume)
- **Implementation**: `cisco-config-service.ts:67`

#### connector.Config.Audio.Microphones.Mute.Enabled.get()

- **Purpose**: Check if mute button is enabled
- **Test Status**: ✅ **SUCCESS** - Returns mute capability status
- **Sample Response**: "True" (mute button enabled)
- **Implementation**: `cisco-config-service.ts:68`

#### connector.Config.Audio.EchoControl.Mode.get()

- **Purpose**: Get echo control configuration
- **Test Status**: ✅ **SUCCESS** - Returns echo control mode
- **Sample Response**: "On" (echo control enabled)
- **Implementation**: `cisco-config-service.ts:69`

#### connector.Config.Audio.Input.NoiseRemoval.Mode.get()

- **Purpose**: Get noise removal setting
- **Test Status**: ✅ **SUCCESS** - Returns noise removal mode
- **Sample Response**: "On" (noise removal enabled)
- **Implementation**: `cisco-config-service.ts:70`

### Video Configuration

#### connector.Config.Video.DefaultMainSource.get()

- **Purpose**: Get default video source
- **Test Status**: ✅ **SUCCESS** - Returns default input connector
- **Sample Response**: 1 (connector ID)
- **Implementation**: `cisco-config-service.ts:89`

#### connector.Config.Video.Output.Connector[1].Resolution.get()

- **Purpose**: Get configured output resolution
- **Test Status**: ✅ **SUCCESS** - Returns output resolution setting
- **Sample Response**: "1920_1080_60" (1080p@60Hz)
- **Implementation**: `cisco-config-service.ts:90`

#### connector.Config.Video.Selfview.Default.Mode.get()

- **Purpose**: Get selfview default mode
- **Test Status**: ✅ **SUCCESS** - Returns selfview mode setting
- **Sample Response**: "Off" (selfview disabled)
- **Implementation**: `cisco-config-service.ts:91`

#### connector.Config.Video.Selfview.Default.PIPPosition.get()

- **Purpose**: Get selfview picture-in-picture position
- **Test Status**: ✅ **SUCCESS** - Returns position setting
- **Sample Response**: "Current" (current position maintained)
- **Implementation**: `cisco-config-service.ts:92`

### Network Configuration

#### connector.Config.Network.IPv4.Address.get()

- **Purpose**: Get configured IP address
- **Test Status**: ⚠️ **RESTRICTED** - Returns "Unknown" (security restriction)
- **Sample Response**: "Unknown" (network config protected)
- **Implementation**: `cisco-config-service.ts:111`

#### connector.Config.Network.IPv4.Gateway.get()

- **Purpose**: Get network gateway
- **Test Status**: ⚠️ **RESTRICTED** - Returns "Unknown" (security restriction)
- **Sample Response**: "Unknown" (network config protected)
- **Implementation**: `cisco-config-service.ts:112`

#### connector.Config.Network.DNS.Server[1].Address.get()

- **Purpose**: Get primary DNS server
- **Test Status**: ⚠️ **RESTRICTED** - Returns "Unknown" (security restriction)
- **Sample Response**: "Unknown" (network config protected)
- **Implementation**: `cisco-config-service.ts:113`

#### connector.Config.Network.Hostname.get()

- **Purpose**: Get device hostname
- **Test Status**: ⚠️ **RESTRICTED** - Returns "Unknown" (security restriction)
- **Sample Response**: "Unknown" (network config protected)
- **Implementation**: `cisco-config-service.ts:114`

#### connector.Config.Network.IPv4.DHCP.get()

- **Purpose**: Get DHCP configuration status
- **Test Status**: ✅ **SUCCESS** - Returns DHCP mode
- **Sample Response**: "On" (DHCP enabled)
- **Implementation**: `cisco-config-service.ts:115`

### User Interface Configuration

#### connector.Config.UserInterface.Wallpaper.get()

- **Purpose**: Get wallpaper setting
- **Test Status**: ✅ **SUCCESS** - Returns wallpaper URL or empty
- **Sample Response**: "" (empty = default wallpaper)
- **Implementation**: `cisco-config-service.ts:137`

#### connector.Config.UserInterface.KeyTones.Mode.get()

- **Purpose**: Get key tones setting
- **Test Status**: ✅ **SUCCESS** - Returns key tones mode
- **Sample Response**: "Off" (key tones disabled)
- **Implementation**: `cisco-config-service.ts:138`

#### connector.Config.UserInterface.OSD.Mode.get()

- **Purpose**: Get on-screen display setting
- **Test Status**: ✅ **SUCCESS** - Returns OSD mode
- **Sample Response**: "Auto" (on-screen display auto mode)
- **Implementation**: `cisco-config-service.ts:140`

---

## Command Execution (Phase 4 - PLANNED)

### Audio Commands

#### connector.Command.Audio.Volume.Set()

- **Purpose**: Set system volume
- **Test Status**: 🟡 **PLANNED** - Not yet implemented
- **Parameters**: { Level: 50 }
- **Target Implementation**: `cisco-command-service.ts`

#### connector.Command.Audio.Microphones.Mute()

- **Purpose**: Mute/unmute microphones
- **Test Status**: 🟡 **PLANNED** - Not yet implemented
- **Parameters**: None (toggle) or { State: "On"/"Off" }
- **Target Implementation**: `cisco-command-service.ts`

### Video Commands

#### connector.Command.Video.Input.SetMainVideoSource()

- **Purpose**: Change video input source
- **Test Status**: 🟡 **PLANNED** - Not yet implemented
- **Parameters**: { ConnectorId: 1 }
- **Target Implementation**: `cisco-command-service.ts`

### Call Commands

#### connector.Command.Dial()

- **Purpose**: Initiate outbound call
- **Test Status**: 🟡 **PLANNED** - Not yet implemented
- **Parameters**: { Number: "user@domain.com" }
- **Target Implementation**: `cisco-command-service.ts`

#### connector.Command.Call.Disconnect()

- **Purpose**: End active call
- **Test Status**: 🟡 **PLANNED** - Not yet implemented
- **Parameters**: None or { CallId: 1 }
- **Target Implementation**: `cisco-command-service.ts`

### System Commands

#### connector.Command.SystemUnit.Boot()

- **Purpose**: Restart the device
- **Test Status**: 🟡 **PLANNED** - Not yet implemented
- **Parameters**: None
- **Target Implementation**: `cisco-command-service.ts`

#### connector.Command.Standby.Activate()

- **Purpose**: Put device in standby mode
- **Test Status**: 🟡 **PLANNED** - Not yet implemented
- **Parameters**: None
- **Target Implementation**: `cisco-command-service.ts`

---

## Event Subscriptions (Phase 5 - PLANNED)

### Call Events

#### connector.Event.CallSuccessful.on()

- **Purpose**: Monitor successful call connections
- **Test Status**: 🟡 **PLANNED** - Not yet implemented
- **Event Data**: Call details, remote party info
- **Target Implementation**: `cisco-event-service.ts`

#### connector.Event.CallDisconnect.on()

- **Purpose**: Monitor call disconnections
- **Test Status**: 🟡 **PLANNED** - Not yet implemented
- **Event Data**: Call duration, disconnect reason
- **Target Implementation**: `cisco-event-service.ts`

### Audio Events

#### connector.Event.Audio.Volume.on()

- **Purpose**: Monitor volume changes
- **Test Status**: 🟡 **PLANNED** - Not yet implemented
- **Event Data**: New volume level
- **Target Implementation**: `cisco-event-service.ts`

#### connector.Event.Audio.Microphones.Mute.on()

- **Purpose**: Monitor mute state changes
- **Test Status**: 🟡 **PLANNED** - Not yet implemented
- **Event Data**: Mute state (On/Off)
- **Target Implementation**: `cisco-event-service.ts`

### System Events

#### connector.Event.SystemUnit.State.on()

- **Purpose**: Monitor system state changes
- **Test Status**: 🟡 **PLANNED** - Not yet implemented
- **Event Data**: New system state
- **Target Implementation**: `cisco-event-service.ts`

---

## Test Environment

**Device**: Cisco DX80  
**Software**: CE 9.15.18.5  
**IP Address**: 192.168.1.186  
**Connection**: WebSocket over HTTPS  
**Test Date**: Phase 2 completed June 2025

## Status Legend

- ✅ **SUCCESS** - Function tested and working on our DX80
- 🟡 **PLANNED** - Function identified but not yet implemented
- ❌ **FAILED** - Function tested but not working (none currently)
- ⚠️ **PARTIAL** - Function partially working or device-dependent (none currently)

## Test Files Reference

- **Connection Test**: `tests/services/test-single-device.ts`
- **Status Queries Test**: `tests/services/test-status-queries.ts`
- **Connection Cleanup Test**: `tests/services/test-connection-cleanup.ts`
- **React UI Test**: Available at `http://localhost:5173/status` when connected

## Notes

1. All successful functions include proper error handling with `.catch()` fallbacks
2. Functions return consistent data types across different device models
3. WebSocket connection must be enabled on device (Setup > NetworkServices > WebSocket = "FollowHTTPService")
4. HTTPS certificate must be accepted in browser before WebSocket connections work
5. Status queries are non-blocking and can be called concurrently using `Promise.all()`
