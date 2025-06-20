/**
 * Test status queries with real Cisco device
 * Tests the cisco-status-service functions
 */

import { config } from "dotenv";
import * as jsxapi from "jsxapi";
import { ciscoConnectionService } from "@/services/cisco-connection-service";
import { ciscoStatusService } from "@/services/cisco-status-service";

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

const testStatusQueries = async () => {
  console.log(`Testing status queries with device at ${deviceConfig.host}...\n`);

  try {
    // Step 1: Connect to device
    console.log("Step 1: Connecting to device...");
    await ciscoConnectionService.connect({
      host: deviceConfig.host,
      username: deviceConfig.username,
      password: deviceConfig.password,
    });
    console.log("Connected successfully!\n");

    // Step 2: Test System Info
    console.log("Step 2: Getting system information...");
    try {
      const systemInfo = await ciscoStatusService.getSystemInfo();
      console.log("System Info:", {
        name: systemInfo.name,
        platform: systemInfo.productPlatform,
        version: systemInfo.softwareVersion,
        uptime: `${Math.floor(systemInfo.uptime / 3600)}h ${Math.floor((systemInfo.uptime % 3600) / 60)}m`,
        ip: systemInfo.ipAddress,
      });
    } catch (error) {
      console.log("System Info Error:", error.message);
    }
    console.log("");

    // Step 3: Test Audio Status
    console.log("Step 3: Getting audio status...");
    try {
      const audioStatus = await ciscoStatusService.getAudioStatus();
      console.log("Audio Status:", {
        volume: audioStatus.volume,
        microphones: audioStatus.microphones.numberOfMicrophones,
        micMuted: audioStatus.microphones.muted,
        speakers: audioStatus.speakers.numberOfSpeakers,
      });
    } catch (error) {
      console.log("Audio Status Error:", error.message);
    }
    console.log("");

    // Step 4: Test Video Status
    console.log("Step 4: Getting video status...");
    try {
      const videoStatus = await ciscoStatusService.getVideoStatus();
      console.log("Video Status:", {
        inputConnectors: videoStatus.input.connectors.length,
        outputConnectors: videoStatus.output.connectors.length,
        connectedInputs: videoStatus.input.connectors.filter((c) => c.connected).length,
        connectedOutputs: videoStatus.output.connectors.filter((c) => c.connected).length,
      });
    } catch (error) {
      console.log("Video Status Error:", error.message);
    }
    console.log("");

    // Step 5: Test Call Status
    console.log("Step 5: Getting call status...");
    try {
      const callStatus = await ciscoStatusService.getCallStatus();
      console.log("Call Status:", {
        status: callStatus.status,
        duration: callStatus.duration,
        hasRemoteNumber: !!callStatus.remoteNumber,
      });
    } catch (error) {
      console.log("Call Status Error:", error.message);
    }
    console.log("");

    // Step 6: Test Standby Status
    console.log("Step 6: Getting standby status...");
    try {
      const standbyStatus = await ciscoStatusService.getStandbyStatus();
      console.log("Standby Status:", standbyStatus);
    } catch (error) {
      console.log("Standby Status Error:", error.message);
    }
    console.log("");

    // Step 7: Test Health Status
    console.log("Step 7: Getting health status...");
    try {
      const healthStatus = await ciscoStatusService.getHealthStatus();
      console.log("Health Status:", {
        temperature: `${healthStatus.temperature}°C`,
        fanSpeed: `${healthStatus.fanSpeed} RPM`,
        power: `${healthStatus.powerConsumption}W`,
      });
    } catch (error) {
      console.log("Health Status Error:", error.message);
    }
    console.log("");

    // Step 8: Test All Status (comprehensive call)
    console.log("Step 8: Getting all status information...");
    try {
      const allStatus = await ciscoStatusService.getAllStatus();
      console.log("All Status Retrieved Successfully");
      console.log("Summary:", {
        deviceName: allStatus.system.name,
        platform: allStatus.system.productPlatform,
        currentVolume: allStatus.audio.volume,
        callStatus: allStatus.call.status,
        standbyState: allStatus.standby.state,
      });
    } catch (error) {
      console.log("All Status Error:", error.message);
    }

    console.log("\nStatus query tests completed successfully!");
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
console.log("Cisco Status Queries Test");
console.log("=========================\n");
testStatusQueries();
