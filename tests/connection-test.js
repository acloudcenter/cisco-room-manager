/**
 * Simple connection test for Cisco device
 * Run with: node tests/connection-test.js
 */

import * as jsxapi from "jsxapi";

// Configuration - UPDATE THESE VALUES
const config = {
  host: "192.168.1.186",
  username: "admin",
  password: "NascarApollo1788!",
};

async function testConnection() {
  console.log(`\n🔌 Testing connection to ${config.host}...`);

  try {
    // Connect to the device
    const xapi = await jsxapi.connect(`wss://${config.host}`, {
      username: config.username,
      password: config.password,
    });

    console.log("✅ Connected successfully!");

    // Set up event handlers
    xapi.on("error", (error) => {
      console.error("❌ Connection error:", error.message);
    });

    xapi.on("close", () => {
      console.log("🔌 Connection closed");
    });

    // Test some basic API calls
    console.log("\n📊 Getting device information...");

    try {
      // Get device name
      const name = await xapi.Config.SystemUnit.Name.get();
      console.log(`  Device Name: ${name}`);
    } catch (e) {
      console.log("  Device Name: Unable to retrieve");
    }

    try {
      // Get product type
      const productType = await xapi.Status.SystemUnit.ProductPlatform.get();
      console.log(`  Product Type: ${productType}`);
    } catch (e) {
      console.log("  Product Type: Unable to retrieve");
    }

    try {
      // Get software version
      const version = await xapi.Status.SystemUnit.Software.Version.get();
      console.log(`  Software Version: ${version}`);
    } catch (e) {
      console.log("  Software Version: Unable to retrieve");
    }

    try {
      // Get current volume
      const volume = await xapi.Status.Audio.Volume.get();
      console.log(`  Current Volume: ${volume}`);
    } catch (e) {
      console.log("  Current Volume: Unable to retrieve");
    }

    // Close the connection
    console.log("\n🔌 Closing connection...");
    xapi.close();

    console.log("✅ Test completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error("Error:", error.message);
    console.error("\nPossible reasons:");
    console.error("1. Device is not reachable at the specified IP");
    console.error("2. Incorrect username or password");
    console.error("3. Device does not have API access enabled");
    console.error("4. Firewall blocking the connection");
    console.error("\nPlease check your configuration and try again.\n");
  }
}

// Run the test
console.log("Cisco Device Connection Test");
console.log("============================");
testConnection();
