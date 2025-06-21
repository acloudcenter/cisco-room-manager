/**
 * Test switching back from TMS to Webex mode
 * Complete the full cycle: Webex → TMS → Configure → Back to Webex
 */

import { config } from "dotenv";
import * as jsxapi from "jsxapi";
import { ciscoConnectionService } from "@/services/cisco-connection-service";
import { ciscoProvisioningService } from "@/services/cisco-provisioning-service";

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

const testBackToWebex = async () => {
  console.log(`Testing switch back to Webex mode at ${deviceConfig.host}...\n`);

  // Step 1: Connect to device
  console.log("Step 1: Connecting to device...");
  const connected = await ciscoConnectionService.connect({
    host: deviceConfig.host,
    username: deviceConfig.username,
    password: deviceConfig.password,
  });

  if (!connected) {
    // Error message already shown by connection service
    process.exit(1);
  }

  console.log("✅ Connected successfully!\n");

  try {
    // Step 2: Show current TMS configuration
    console.log("Step 2: Current TMS provisioning configuration...");
    const currentConfig = await ciscoProvisioningService.getProvisioningConfig();
    console.log("📋 Current TMS Config:", {
      mode: currentConfig.mode,
      connectivity: currentConfig.connectivity,
      loginName: currentConfig.loginName,
      passwordSet: currentConfig.password ? "Yes" : "No",
      externalManagerAddress: currentConfig.externalManagerAddress,
      externalManagerDomain: currentConfig.externalManagerDomain,
    });

    if (currentConfig.mode !== "TMS") {
      console.log("\n⚠️  Device is not in TMS mode. Cannot test switch back to Webex.");
      console.log("Current mode:", currentConfig.mode);
      await ciscoConnectionService.disconnect();
      return;
    }

    console.log("\n⚠️  WARNING: This will clear all TMS configuration!");
    console.log("Press Ctrl+C within 3 seconds to cancel...\n");

    // Give user time to cancel
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Step 3: Switching provisioning to Webex
    console.log("Step 3: Switching provisioning to Webex...");
    await ciscoProvisioningService.setProvisioningMode("Webex");
    console.log("✅ Switched to Webex mode");

    // Give device a moment to process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 4: Verify we're back in Webex mode
    console.log("\nStep 4: Verifying Webex mode restored...");
    const finalStatus = await ciscoProvisioningService.getProvisioningConfig();
    console.log("✅ Final status:", {
      mode: finalStatus.mode,
      connectivity: finalStatus.connectivity,
      loginName: finalStatus.loginName,
    });

    if (finalStatus.mode === "Webex") {
      console.log("\n✅ SUCCESSFULLY RESTORED TO WEBEX MODE!");
      console.log("\n📝 What happened:");
      console.log("  - Mode: TMS → Webex");
      console.log("  - All TMS configuration cleared");
      console.log("  - Device restored to cloud registration");
    } else {
      console.log("\n⚠️  Device may not have fully switched to Webex mode yet.");
      console.log("Current mode:", finalStatus.mode);
    }

    // Disconnect
    await ciscoConnectionService.disconnect();
    console.log("\n✅ Disconnected from device");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    await ciscoConnectionService.disconnect();
    process.exit(1);
  }
};

// Run the test
testBackToWebex().catch((error) => {
  console.error("\n❌ Unhandled error:", error);
  process.exit(1);
});
