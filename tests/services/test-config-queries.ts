/**
 * Test configuration queries with real Cisco device
 * Tests the cisco-config-service functions
 */

import { config } from "dotenv";
import * as jsxapi from "jsxapi";
import { ciscoConnectionService } from "@/services/cisco-connection-service";
import { ciscoConfigService } from "@/services/cisco-config-service";

// Load environment variables
config();

const deviceConfig = {
  host: process.env.TSD_IPADDRESS,
  username: process.env.TSD_USERNAME,
  password: process.env.TSD_PASSWORD,
};

// Validate environment variables
if (!deviceConfig.host || !deviceConfig.username || !deviceConfig.password) {
  console.error("Missing required environment variables:");
  if (!deviceConfig.host) console.error("  - TSD_IPADDRESS");
  if (!deviceConfig.username) console.error("  - TSD_USERNAME");
  if (!deviceConfig.password) console.error("  - TSD_PASSWORD");
  console.error("\nPlease check your .env file contains all required variables.");
  process.exit(1);
}

const testConfigQueries = async () => {
  console.log(`Testing configuration queries with device at ${deviceConfig.host}...\n`);

  try {
    // Step 1: Connect to device
    console.log("Step 1: Connecting to device...");
    await ciscoConnectionService.connect({
      host: deviceConfig.host,
      username: deviceConfig.username,
      password: deviceConfig.password,
    });
    console.log("Connected successfully!\n");

    // Step 2: Test System Configuration
    console.log("Step 2: Getting system configuration...");
    try {
      const systemConfig = await ciscoConfigService.getSystemConfig();
      console.log("System Config:", {
        name: systemConfig.name,
        timezone: systemConfig.timezone,
        language: systemConfig.language,
        contact: systemConfig.contactInfo,
      });
    } catch (error) {
      console.log("System Config Error:", error.message);
    }
    console.log("");

    // Step 3: Test Audio Configuration
    console.log("Step 3: Getting audio configuration...");
    try {
      const audioConfig = await ciscoConfigService.getAudioConfig();
      console.log("Audio Config:", {
        defaultVolume: `${audioConfig.defaultVolume}%`,
        muteEnabled: audioConfig.muteEnabled,
        echoControl: audioConfig.echoControl,
        noiseRemoval: audioConfig.noiseRemoval,
      });
    } catch (error) {
      console.log("Audio Config Error:", error.message);
    }
    console.log("");

    // Step 4: Test Video Configuration
    console.log("Step 4: Getting video configuration...");
    try {
      const videoConfig = await ciscoConfigService.getVideoConfig();
      console.log("Video Config:", {
        defaultMainSource: videoConfig.defaultMainSource,
        outputResolution: videoConfig.outputResolution,
        selfviewEnabled: videoConfig.selfviewEnabled,
        selfviewPosition: videoConfig.selfviewPosition,
      });
    } catch (error) {
      console.log("Video Config Error:", error.message);
    }
    console.log("");

    // Step 5: Test Network Configuration
    console.log("Step 5: Getting network configuration...");
    try {
      const networkConfig = await ciscoConfigService.getNetworkConfig();
      console.log("Network Config:", {
        ipAddress: networkConfig.ipAddress,
        gateway: networkConfig.gateway,
        dns: networkConfig.dns,
        hostname: networkConfig.hostname,
        dhcp: networkConfig.dhcp,
      });
    } catch (error) {
      console.log("Network Config Error:", error.message);
    }
    console.log("");

    // Step 6: Test User Interface Configuration
    console.log("Step 6: Getting user interface configuration...");
    try {
      const uiConfig = await ciscoConfigService.getUserInterfaceConfig();
      console.log("UI Config:", {
        wallpaper: uiConfig.wallpaperUrl ? "Custom" : "Default",
        keyTones: uiConfig.keyTones,
        language: uiConfig.language,
        osd: uiConfig.osd,
      });
    } catch (error) {
      console.log("UI Config Error:", error.message);
    }
    console.log("");

    // Step 7: Test Specific Config Value Query
    console.log("Step 7: Testing specific config value queries...");
    try {
      const systemName = await ciscoConfigService.getConfigValue("SystemUnit.Name");
      const timezone = await ciscoConfigService.getConfigValue("Time.Zone");
      console.log("Specific Config Values:", {
        systemName: systemName,
        timezone: timezone,
      });
    } catch (error) {
      console.log("Specific Config Error:", error.message);
    }
    console.log("");

    // Step 8: Test All Configuration (comprehensive call)
    console.log("Step 8: Getting all configuration information...");
    try {
      const allConfig = await ciscoConfigService.getAllConfig();
      console.log("All Configuration Retrieved Successfully");
      console.log("Summary:", {
        deviceName: allConfig.system.name,
        timezone: allConfig.system.timezone,
        defaultVolume: `${allConfig.audio.defaultVolume}%`,
        videoSource: allConfig.video.defaultMainSource,
        networkMode: allConfig.network.dhcp ? "DHCP" : "Static",
        language: allConfig.userInterface.language,
      });
    } catch (error) {
      console.log("All Config Error:", error.message);
    }

    console.log("\nConfiguration query tests completed successfully!");
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    // Always disconnect
    console.log("\nDisconnecting...");
    ciscoConnectionService.disconnect();

    setTimeout(() => {
      console.log("Test completed, exiting...");
      process.exit(0);
    }, 1000);
  }
};

// Handle process termination
process.on("SIGINT", () => {
  console.log("\nProcess interrupted, cleaning up...");
  ciscoConnectionService.disconnect();
  process.exit(0);
});

// Run the test
console.log("Cisco Configuration Queries Test");
console.log("=================================\n");
testConfigQueries();
