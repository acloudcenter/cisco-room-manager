/**
 * Test status queries with real Cisco device
 * Tests the cisco-status-service functions
 */

import * as jsxapi from "jsxapi";
import { ciscoConnectionService } from "@/services/cisco-connection-service";
import { ciscoStatusService } from "@/services/cisco-status-service";
import {
  getDeviceConfig,
  handleConnectionError,
  logTestSection,
  logTestStep,
  logSuccess,
  logInfo,
  logWarning,
  formatError,
} from "../test-utils";

const testStatusQueries = async () => {
  logTestSection("Status Query Tests");

  // Get configuration
  const deviceConfig = getDeviceConfig();
  logInfo(`Target device: ${deviceConfig.host}`);

  // Step 1: Connect to device
  logTestStep(1, "Connecting to device");
  const connected = await ciscoConnectionService.connect({
    host: deviceConfig.host,
    username: deviceConfig.username,
    password: deviceConfig.password,
  });

  if (!connected) {
    // Error message already shown by connection service
    process.exit(1);
  }

  logSuccess("Connected successfully!");

  // Step 2: Test System Info
  logTestStep(2, "Getting system information");
  try {
    const systemInfo = await ciscoStatusService.getSystemInfo();
    console.log("System Info:", {
      name: systemInfo.name,
      platform: systemInfo.productPlatform,
      version: systemInfo.softwareVersion,
      uptime: `${Math.floor(systemInfo.uptime / 3600)}h ${Math.floor((systemInfo.uptime % 3600) / 60)}m`,
      ip: systemInfo.ipAddress,
    });
    logSuccess("System info retrieved");
  } catch (error) {
    logWarning(`System Info Error: ${formatError(error)}`);
  }

  // Step 3: Test Audio Status
  logTestStep(3, "Getting audio status");
  try {
    const audioStatus = await ciscoStatusService.getAudioStatus();
    console.log("Audio Status:", {
      volume: audioStatus.volume,
      microphones: audioStatus.microphones.numberOfMicrophones,
      micMuted: audioStatus.microphones.muted,
      speakers: audioStatus.speakers.numberOfSpeakers,
    });
    logSuccess("Audio status retrieved");
  } catch (error) {
    logWarning(`Audio Status Error: ${formatError(error)}`);
  }

  // Step 4: Test Video Status
  logTestStep(4, "Getting video status");
  try {
    const videoStatus = await ciscoStatusService.getVideoStatus();
    console.log("Video Status:", {
      inputConnectors: videoStatus.input.connectors.length,
      outputConnectors: videoStatus.output.connectors.length,
      connectedInputs: videoStatus.input.connectors.filter((c) => c.connected).length,
      connectedOutputs: videoStatus.output.connectors.filter((c) => c.connected).length,
    });
    logSuccess("Video status retrieved");
  } catch (error) {
    logWarning(`Video Status Error: ${formatError(error)}`);
  }

  // Step 5: Test Call Status
  logTestStep(5, "Getting call status");
  try {
    const callStatus = await ciscoStatusService.getCallStatus();
    console.log("Call Status:", {
      status: callStatus.status,
      duration: callStatus.duration,
      hasRemoteNumber: !!callStatus.remoteNumber,
    });
    logSuccess("Call status retrieved");
  } catch (error) {
    logWarning(`Call Status Error: ${formatError(error)}`);
  }

  // Step 6: Test Standby Status
  logTestStep(6, "Getting standby status");
  try {
    const standbyStatus = await ciscoStatusService.getStandbyStatus();
    console.log("Standby Status:", standbyStatus);
    logSuccess("Standby status retrieved");
  } catch (error) {
    logWarning(`Standby Status Error: ${formatError(error)}`);
  }

  // Step 7: Test Capabilities
  logTestStep(7, "Getting device capabilities");
  try {
    const capabilities = await ciscoStatusService.getCapabilities();
    console.log("Capabilities:", {
      hasAudioInput: capabilities.audioInput,
      hasAudioOutput: capabilities.audioOutput,
      hasVideoInput: capabilities.videoInput,
      hasVideoOutput: capabilities.videoOutput,
      maxCalls: capabilities.maxCalls,
    });
    logSuccess("Capabilities retrieved");
  } catch (error) {
    logWarning(`Capabilities Error: ${formatError(error)}`);
  }

  // Test all 27 status functions
  logTestStep(8, "Running comprehensive status tests");
  const statusTests = [
    { name: "getAudioInputStatus", fn: ciscoStatusService.getAudioInputStatus },
    { name: "getAudioOutputStatus", fn: ciscoStatusService.getAudioOutputStatus },
    { name: "getVideoInputStatus", fn: ciscoStatusService.getVideoInputStatus },
    { name: "getVideoOutputStatus", fn: ciscoStatusService.getVideoOutputStatus },
    { name: "getCameraStatus", fn: ciscoStatusService.getCameraStatus },
    { name: "getConferenceStatus", fn: ciscoStatusService.getConferenceStatus },
    { name: "getRoomAnalytics", fn: ciscoStatusService.getRoomAnalytics },
    { name: "getNetworkStatus", fn: ciscoStatusService.getNetworkStatus },
    { name: "getWiFiStatus", fn: ciscoStatusService.getWiFiStatus },
    { name: "getBluetoothStatus", fn: ciscoStatusService.getBluetoothStatus },
    { name: "getProximityStatus", fn: ciscoStatusService.getProximityStatus },
    { name: "getSipStatus", fn: ciscoStatusService.getSipStatus },
    { name: "getH323Status", fn: ciscoStatusService.getH323Status },
    { name: "getWebRTCStatus", fn: ciscoStatusService.getWebRTCStatus },
    { name: "getHttpFeedbackStatus", fn: ciscoStatusService.getHttpFeedbackStatus },
    { name: "getUIStatus", fn: ciscoStatusService.getUIStatus },
    { name: "getActiveControllers", fn: ciscoStatusService.getActiveControllers },
    { name: "getPeripheralsStatus", fn: ciscoStatusService.getPeripheralsStatus },
    { name: "getSecurityStatus", fn: ciscoStatusService.getSecurityStatus },
    { name: "getDiagnosticsStatus", fn: ciscoStatusService.getDiagnosticsStatus },
    { name: "getHealthStatus", fn: ciscoStatusService.getHealthStatus },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const test of statusTests) {
    try {
      const result = await test.fn();
      console.log(`✅ ${test.name}: Success`);
      successCount++;
    } catch (error) {
      console.log(`❌ ${test.name}: ${formatError(error)}`);
      errorCount++;
    }
  }

  console.log(
    `\n📊 Summary: ${successCount} successful, ${errorCount} errors out of ${statusTests.length} tests`,
  );

  // Disconnect
  logTestStep(9, "Disconnecting from device");
  await ciscoConnectionService.disconnect();
  logSuccess("Disconnected successfully!");

  console.log("\n✨ Status query tests completed!");

  if (errorCount > 0) {
    console.log(
      `\n⚠️  ${errorCount} functions failed. This is normal as not all devices support all status queries.`,
    );
  }

  console.log("\n💡 Next steps:");
  console.log(
    "  - Run 'npx tsx tests/services/config/test-config-queries.ts' to test configuration reading",
  );
  console.log("  - Check /docs/JSXAPI_REFERENCE.md for detailed function documentation");
};

// Run the test
console.log("🚀 Cisco Status Query Tests");
console.log("===========================\n");
testStatusQueries().catch((error) => {
  console.error("\n❌ Unhandled error in test execution:");
  console.error(error);
  process.exit(1);
});
