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

  try {
    // Step 1: Connect to device
    console.log("Step 1: Connecting to device...");
    await ciscoConnectionService.connect({
      host: deviceConfig.host,
      username: deviceConfig.username,
      password: deviceConfig.password,
    });
    console.log("✅ Connected successfully!\n");

    // Step 2: Show current TMS configuration
    console.log("Step 2: Current TMS provisioning configuration...");
    const currentConfig = await ciscoProvisioningService.getProvisioningConfig();
    console.log("📋 Current TMS Config:", {
      mode: currentConfig.mode,
      connectivity: currentConfig.connectivity,
      loginName: currentConfig.loginName,
      passwordSet: currentConfig.password ? "Yes" : "No",
      tlsVerify: currentConfig.tlsVerify,
      webexEdge: currentConfig.webexEdge,
      externalManager: {
        address: currentConfig.externalManager.address,
        domain: currentConfig.externalManager.domain,
        path: currentConfig.externalManager.path,
        protocol: currentConfig.externalManager.protocol,
      },
    });
    console.log("");

    // Step 3: Switch back to Webex mode
    console.log("Step 3: Switching provisioning mode back to Webex...");
    await ciscoProvisioningService.setProvisioningMode("Webex");

    // Verify the mode change
    const newMode = await ciscoProvisioningService.getProvisioningMode();
    console.log("✅ Mode changed to:", newMode);
    console.log("");

    // Step 4: Check configuration after switching to Webex
    console.log("Step 4: Configuration after switching to Webex...");
    const webexConfig = await ciscoProvisioningService.getProvisioningConfig();
    console.log("📋 Webex Config:", {
      mode: webexConfig.mode,
      connectivity: webexConfig.connectivity,
      loginName: webexConfig.loginName || "(not set)",
      passwordSet: webexConfig.password ? "Yes" : "No",
      tlsVerify: webexConfig.tlsVerify,
      webexEdge: webexConfig.webexEdge,
      externalManager: {
        address: webexConfig.externalManager.address || "(not set)",
        domain: webexConfig.externalManager.domain || "(not set)",
        path: webexConfig.externalManager.path || "(not set)",
        protocol: webexConfig.externalManager.protocol,
      },
    });
    console.log("");

    // Step 5: Summary of what changed
    console.log("Step 5: Changes when switching to Webex mode...");
    const changes = {
      mode: currentConfig.mode !== webexConfig.mode,
      connectivity: currentConfig.connectivity !== webexConfig.connectivity,
      loginName: currentConfig.loginName !== webexConfig.loginName,
      tlsVerify: currentConfig.tlsVerify !== webexConfig.tlsVerify,
      webexEdge: currentConfig.webexEdge !== webexConfig.webexEdge,
      externalManagerAddress:
        currentConfig.externalManager.address !== webexConfig.externalManager.address,
      externalManagerDomain:
        currentConfig.externalManager.domain !== webexConfig.externalManager.domain,
      externalManagerPath: currentConfig.externalManager.path !== webexConfig.externalManager.path,
      externalManagerProtocol:
        currentConfig.externalManager.protocol !== webexConfig.externalManager.protocol,
    };

    console.log("📊 What changed when switching to Webex:");
    Object.entries(changes).forEach(([field, changed]) => {
      const icon = changed ? "🔄" : "➡️";
      console.log(`  ${icon} ${field}: ${changed ? "CHANGED" : "unchanged"}`);
    });

    const modeSuccess = webexConfig.mode === "Webex" ? "✅" : "❌";
    console.log(`\n${modeSuccess} Successfully switched back to Webex mode!`);

    if (webexConfig.mode === "Webex") {
      console.log("🎉 Complete provisioning cycle successful!");
      console.log("📝 Full workflow: Webex → TMS → Configure → Back to Webex ✅");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
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
console.log("Test Switch Back to Webex Mode");
console.log("===============================\n");
testBackToWebex();
