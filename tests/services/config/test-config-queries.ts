/**
 * Test configuration queries with real Cisco device
 * Tests the cisco-config-service functions
 */

import * as jsxapi from "jsxapi";
import { ciscoConnectionService } from "@/services/cisco-connection-service";
import { ciscoConfigService } from "@/services/cisco-config-service";
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

const testConfigQueries = async () => {
  logTestSection("Configuration Query Tests");

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

  // Step 2: Test System Configuration
  logTestStep(2, "Getting system configuration");
  try {
    const systemConfig = await ciscoConfigService.getSystemConfig();
    console.log("System Config:", {
      name: systemConfig.name,
      timezone: systemConfig.timezone,
      language: systemConfig.language,
      contact: systemConfig.contactInfo,
    });
    logSuccess("System configuration retrieved");
  } catch (error) {
    logWarning(`System Config Error: ${formatError(error)}`);
  }

  // Step 3: Test Audio Configuration
  logTestStep(3, "Getting audio configuration");
  try {
    const audioConfig = await ciscoConfigService.getAudioConfig();
    console.log("Audio Config:", {
      defaultVolume: audioConfig.defaultVolume,
      muteEnabled: audioConfig.muteEnabled,
      echoControl: audioConfig.echoControl,
      noiseRemoval: audioConfig.noiseRemoval,
    });
    logSuccess("Audio configuration retrieved");
  } catch (error) {
    logWarning(`Audio Config Error: ${formatError(error)}`);
  }

  // Step 4: Test Video Configuration
  logTestStep(4, "Getting video configuration");
  try {
    const videoConfig = await ciscoConfigService.getVideoConfig();
    console.log("Video Config:", {
      defaultMainSource: videoConfig.defaultMainSource,
      outputResolution: videoConfig.outputResolution,
      selfviewEnabled: videoConfig.selfviewEnabled,
      selfviewPosition: videoConfig.selfviewPosition,
    });
    logSuccess("Video configuration retrieved");
  } catch (error) {
    logWarning(`Video Config Error: ${formatError(error)}`);
  }

  // Step 5: Test Network Configuration
  logTestStep(5, "Getting network configuration");
  try {
    const networkConfig = await ciscoConfigService.getNetworkConfig();
    console.log("Network Config:", {
      ipAddress: networkConfig.ipAddress,
      gateway: networkConfig.gateway,
      dns: networkConfig.dns,
      hostname: networkConfig.hostname,
      dhcp: networkConfig.dhcp,
    });
    logSuccess("Network configuration retrieved");
  } catch (error) {
    logWarning(`Network Config Error: ${formatError(error)}`);
    logInfo("Note: Network config access is often restricted for security reasons");
  }

  // Step 6: Test all available configuration functions
  logTestStep(6, "Running comprehensive configuration tests");
  const configTests = [
    {
      name: "getUserInterfaceConfig",
      fn: ciscoConfigService.getUserInterfaceConfig.bind(ciscoConfigService),
    },
    { name: "getAllConfig", fn: ciscoConfigService.getAllConfig.bind(ciscoConfigService) },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const test of configTests) {
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
    `\n📊 Summary: ${successCount} successful, ${errorCount} errors out of ${configTests.length} additional tests`,
  );

  // Disconnect
  logTestStep(7, "Disconnecting from device");
  await ciscoConnectionService.disconnect();
  logSuccess("Disconnected successfully!");

  console.log("\n✨ Configuration query tests completed!");
  console.log(
    `\n📝 Available config functions: getSystemConfig, getAudioConfig, getVideoConfig, getNetworkConfig, getUserInterfaceConfig, getAllConfig`,
  );

  if (errorCount > 0) {
    console.log(`\n⚠️  ${errorCount} additional functions failed. This is normal as:`);
    console.log("  - Not all devices support all configuration options");
    console.log("  - Some configurations require specific permissions");
    console.log("  - Network configurations are often restricted for security");
  }

  console.log("\n💡 Next steps:");
  console.log(
    "  - Run 'npx tsx tests/services/provisioning/test-full-cycle-to-tms.ts' to test provisioning",
  );
  console.log("  - Check /docs/JSXAPI_REFERENCE.md for detailed function documentation");
};

// Run the test
console.log("🚀 Cisco Configuration Query Tests");
console.log("==================================\n");
testConfigQueries().catch((error) => {
  console.error("\n❌ Unhandled error in test execution:");
  console.error(error);
  process.exit(1);
});
