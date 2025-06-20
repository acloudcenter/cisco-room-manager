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

  try {
    // Step 1: Connect to device
    console.log("Step 1: Connecting to device...");
    await ciscoConnectionService.connect({
      host: deviceConfig.host,
      username: deviceConfig.username,
      password: deviceConfig.password,
    });
    console.log("✅ Connected successfully!\n");

    // Step 2: Show starting Webex configuration
    console.log("Step 2: Starting Webex configuration...");
    const startConfig = await ciscoProvisioningService.getProvisioningConfig();
    console.log("📋 Starting Config:", {
      mode: startConfig.mode,
      connectivity: startConfig.connectivity,
    });
    console.log("");

    // Step 3: Switch to TMS mode (unlock all fields)
    console.log("Step 3: Switching to TMS mode (unlock fields)...");
    await ciscoProvisioningService.setProvisioningMode("TMS");
    const tmsMode = await ciscoProvisioningService.getProvisioningMode();
    console.log("✅ Mode set to:", tmsMode);
    console.log("");

    // Step 4: Set connectivity to External
    console.log("Step 4: Setting connectivity to External...");
    await ciscoProvisioningService.setConnectivity("External");
    const connectivity = await ciscoProvisioningService.getProvisioningConfig();
    console.log("✅ Connectivity set to:", connectivity.connectivity);
    console.log("");

    // Step 5: Set credentials
    console.log("Step 5: Setting credentials (admin/admin)...");
    await ciscoProvisioningService.setCredentials("admin", "admin");
    console.log("✅ Credentials set");
    console.log("");

    // Step 6: Set TLS verify OFF
    console.log("Step 6: Setting TLS verify to OFF...");
    await ciscoProvisioningService.setTlsVerify(false);
    console.log("✅ TLS verify set to OFF");
    console.log("");

    // Step 7: Set Webex Edge OFF
    console.log("Step 7: Setting Webex Edge to OFF...");
    await ciscoProvisioningService.setWebexEdge(false);
    console.log("✅ Webex Edge set to OFF");
    console.log("");

    // Step 8: Configure External Manager (all fields)
    console.log("Step 8: Configuring External Manager...");
    const connector = ciscoConnectionService.getConnector();

    console.log("  🔧 Setting address to 'externaltmstest.com'...");
    await connector.Config.Provisioning.ExternalManager.Address.set("externaltmstest.com");

    console.log("  🔧 Setting domain to 'testcisco'...");
    await connector.Config.Provisioning.ExternalManager.Domain.set("testcisco");

    console.log("  🔧 Setting path to '/my/path/to/prov'...");
    await connector.Config.Provisioning.ExternalManager.Path.set("/my/path/to/prov");

    console.log("  🔧 Setting protocol to 'HTTPS'...");
    await connector.Config.Provisioning.ExternalManager.Protocol.set("HTTPS");

    console.log("✅ External Manager fully configured");
    console.log("");

    // Step 9: Final verification
    console.log("Step 9: Final TMS configuration verification...");
    const finalConfig = await ciscoProvisioningService.getProvisioningConfig();
    console.log("📋 Complete TMS Config:", {
      mode: finalConfig.mode,
      connectivity: finalConfig.connectivity,
      loginName: finalConfig.loginName,
      passwordSet: finalConfig.password ? "Yes" : "No",
      tlsVerify: finalConfig.tlsVerify,
      webexEdge: finalConfig.webexEdge,
      externalManager: {
        address: finalConfig.externalManager.address,
        domain: finalConfig.externalManager.domain,
        path: finalConfig.externalManager.path,
        protocol: finalConfig.externalManager.protocol,
      },
    });
    console.log("");

    // Step 10: Verification summary
    console.log("Step 10: Configuration verification...");
    const verificationResults = {
      mode: finalConfig.mode === "TMS" ? "✅" : "❌",
      connectivity: finalConfig.connectivity === "External" ? "✅" : "❌",
      credentials: finalConfig.loginName === "admin" ? "✅" : "❌",
      tlsVerify: finalConfig.tlsVerify === "Off" ? "✅" : "❌",
      webexEdge: finalConfig.webexEdge === "Off" ? "✅" : "❌",
      address: finalConfig.externalManager.address === "externaltmstest.com" ? "✅" : "❌",
      domain: finalConfig.externalManager.domain === "testcisco" ? "✅" : "❌",
      path: finalConfig.externalManager.path === "/my/path/to/prov" ? "✅" : "❌",
      protocol: finalConfig.externalManager.protocol === "HTTPS" ? "✅" : "❌",
    };

    console.log("📊 Verification Results:");
    console.log(`  ${verificationResults.mode} Mode: TMS`);
    console.log(`  ${verificationResults.connectivity} Connectivity: External`);
    console.log(`  ${verificationResults.credentials} Credentials: admin/admin`);
    console.log(`  ${verificationResults.tlsVerify} TLS Verify: OFF`);
    console.log(`  ${verificationResults.webexEdge} Webex Edge: OFF`);
    console.log(`  ${verificationResults.address} Address: externaltmstest.com`);
    console.log(`  ${verificationResults.domain} Domain: testcisco`);
    console.log(`  ${verificationResults.path} Path: /my/path/to/prov`);
    console.log(`  ${verificationResults.protocol} Protocol: HTTPS`);

    const allSuccess = Object.values(verificationResults).every((r) => r === "✅");
    console.log(
      `\n${allSuccess ? "🎉" : "⚠️"} Complete TMS configuration ${allSuccess ? "successful" : "partial"}!`,
    );

    if (allSuccess) {
      console.log("📝 Full workflow completed:");
      console.log("   Webex → TMS → External → Credentials → External Manager ✅");
      console.log("🎯 Device ready for external provisioning system!");
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
console.log("Complete Cycle to TMS Configuration");
console.log("====================================\n");
testFullCycleToTms();
