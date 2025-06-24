/**
 * Debug test to see raw certificate response
 */

import { config } from "dotenv";
import { join } from "path";
import { ciscoConnectionService } from "../../../src/services/cisco-connection-service";

// Load environment variables
config({ path: join(process.cwd(), ".env") });

const TEST_DEVICE = {
  host: process.env.TSD_IPADDRESS || "192.168.1.186",
  username: process.env.TSD_USERNAME || "admin",
  password: process.env.TSD_PASSWORD || "",
};

async function debugCertificates() {
  console.log("🔍 Debug Certificate Response");
  console.log("================================\n");

  try {
    // Connect to device
    console.log("Connecting to device...");
    await ciscoConnectionService.connect(TEST_DEVICE);
    console.log("✅ Connected successfully\n");

    // Try with Text format
    console.log("📋 Testing with Format: Text");
    console.log("----------------------------");
    try {
      const response = await ciscoConnectionService
        .getConnector()
        ?.Command.Security.Certificates.CA.Show({
          Format: "Text",
        });

      console.log("Raw response:");
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error("Error with Text format:", error);
    }

    console.log("\n📋 Testing with Format: PEM");
    console.log("---------------------------");
    try {
      const response = await ciscoConnectionService
        .getConnector()
        ?.Command.Security.Certificates.CA.Show({
          Format: "PEM",
        });

      console.log("Raw response:");
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error("Error with PEM format:", error);
    }

    // Also try without format parameter
    console.log("\n📋 Testing without Format parameter");
    console.log("-----------------------------------");
    try {
      const response = await ciscoConnectionService
        .getConnector()
        ?.Command.Security.Certificates.CA.Show();

      console.log("Raw response:");
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error("Error without format:", error);
    }
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  } finally {
    // Disconnect
    ciscoConnectionService.disconnect();
    process.exit(0);
  }
}

// Run the test
console.log(`Target device: ${TEST_DEVICE.host}`);
console.log(`Username: ${TEST_DEVICE.username}\n`);

debugCertificates();
