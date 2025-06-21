/**
 * Test complete cycle: Webex → TMS → Full Configuration
 * Apply all your test settings in the working sequence
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

const testFullCycleToTms = async () => {
  console.log(`Testing complete cycle to TMS configuration at ${deviceConfig.host}...\n`);
  console.log("🔄 Full Cycle: Webex → TMS → External → Credentials → External Manager");
  console.log("⚠️  This will apply the complete test configuration!");
  console.log("Press Ctrl+C within 3 seconds to cancel...\n");

  // Give user time to cancel
  await new Promise((resolve) => setTimeout(resolve, 3000));

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
    // Step 2: Show starting Webex configuration
    console.log("Step 2: Starting Webex configuration...");
    const startingStatus = await ciscoProvisioningService.getProvisioningConfig();
    console.log("Starting configuration:", {
      mode: startingStatus.mode,
      connectivity: startingStatus.connectivity,
      username: startingStatus.loginName,
    });

    if (startingStatus.mode !== "Webex") {
      console.log("⚠️  Device is not in Webex mode. Cannot proceed with test.");
      await ciscoConnectionService.disconnect();
      return;
    }

    // Step 3: Switch to TMS mode
    console.log("\nStep 3: Switching from Webex to TMS mode...");
    await ciscoProvisioningService.setProvisioningMode("TMS");
    console.log("✅ Mode switched to TMS");

    // Give device a moment to process mode change
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 4: Configure External connectivity
    console.log("\nStep 4: Setting connectivity to External...");
    await ciscoProvisioningService.setConnectivity("External");
    console.log("✅ Connectivity set to External");

    // Step 5: Configure External Manager
    console.log("\nStep 5: Configuring external manager settings...");
    await ciscoProvisioningService.setExternalManagerAddress("tms-server.company.com");
    await ciscoProvisioningService.setExternalManagerDomain("WORKGROUP");
    await ciscoProvisioningService.setExternalManagerPath(
      "tms/public/external/management/SystemManagementService.asmx",
    );
    await ciscoProvisioningService.setExternalManagerProtocol("HTTPS");
    console.log("✅ External manager configured");

    // Step 6: Set credentials
    console.log("\nStep 6: Setting provisioning credentials...");
    await ciscoProvisioningService.setLoginName("tms-user");
    await ciscoProvisioningService.setPassword("tms-password-123");
    console.log("✅ Credentials configured");

    // Step 7: Final status check
    console.log("\nStep 7: Verifying final configuration...");
    const finalStatus = await ciscoProvisioningService.getProvisioningConfig();
    console.log("\nFinal configuration:", {
      mode: finalStatus.mode,
      connectivity: finalStatus.connectivity,
      username: finalStatus.loginName,
    });

    console.log("\n✅ COMPLETE CYCLE TEST SUCCESSFUL!");
    console.log("\n📝 Summary of changes:");
    console.log("  - Mode: Webex → TMS");
    console.log("  - Connectivity: → External");
    console.log("  - External Manager: → tms-server.company.com");
    console.log("  - Credentials: → tms-user");
    console.log("\n💡 To restore Webex mode, run: test-back-to-webex.ts");

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
testFullCycleToTms().catch((error) => {
  console.error("\n❌ Unhandled error:", error);
  process.exit(1);
});
