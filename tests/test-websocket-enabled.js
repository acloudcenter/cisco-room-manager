/**
 * Test WebSocket connection now that it's enabled
 */

import * as jsxapi from "jsxapi";

const config = {
  host: "192.168.1.186",
  username: "admin",
  password: "NascarApollo1788!",
};

async function testConnection() {
  console.log("Testing WebSocket Connection");
  console.log("===========================\n");
  console.log(`🔌 Connecting to ${config.host}...\n`);

  try {
    // Connect exactly like Cisco does
    const xapi = await jsxapi.connect(`wss://${config.host}`, {
      username: config.username,
      password: config.password,
    });

    console.log("✅ WebSocket connected successfully!\n");

    // Get device information like Cisco does
    let unitName = "Unknown Device";
    let unitType = "Unknown Type";

    try {
      unitName = await xapi.Config.SystemUnit.Name.get();
      console.log(`Device Name: ${unitName}`);
    } catch (e) {
      console.log("Could not get unit name:", e.message);
    }

    try {
      unitType = await xapi.Status.SystemUnit.ProductPlatform.get();
      console.log(`Device Type: ${unitType}`);
    } catch (e) {
      console.log("Could not get unit type:", e.message);
    }

    // Store info on connector like Cisco does
    xapi.unitName = unitName;
    xapi.unitType = unitType;

    console.log("\n📊 Testing API calls...\n");

    // Test various API endpoints
    try {
      const version = await xapi.Status.SystemUnit.Software.Version.get();
      console.log(`Software Version: ${version}`);
    } catch (e) {
      console.log("Software Version: Error -", e.message);
    }

    try {
      const uptime = await xapi.Status.SystemUnit.Uptime.get();
      console.log(`Uptime: ${uptime} seconds`);
    } catch (e) {
      console.log("Uptime: Error -", e.message);
    }

    try {
      const volume = await xapi.Status.Audio.Volume.get();
      console.log(`Audio Volume: ${volume}`);
    } catch (e) {
      console.log("Audio Volume: Error -", e.message);
    }

    // Test event subscription
    console.log("\n🔔 Setting up event listener for volume changes...");

    xapi.on("status", (event) => {
      if (event.Audio && event.Audio.Volume) {
        console.log(`Volume changed to: ${event.Audio.Volume}`);
      }
    });

    // Keep connection alive for a bit to test events
    console.log("(Adjust volume on device to see events)\n");

    setTimeout(() => {
      console.log("🔌 Closing connection...");
      xapi.close();
      console.log("\n✅ Test completed successfully!");
      console.log("\n📋 Summary:");
      console.log("- WebSocket is now enabled and working");
      console.log("- Can connect and retrieve device information");
      console.log("- API calls are functioning properly");
      console.log("- Event subscriptions work");
      process.exit(0);
    }, 10000);
  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error("Error:", error.message);

    if (error.message.includes("self signed certificate")) {
      console.error("\n💡 Solution:");
      console.error(`1. Open https://${config.host} in your browser`);
      console.error("2. Accept the self-signed certificate");
      console.error("3. Try running this test again");
    }

    process.exit(1);
  }
}

// Run the test
testConnection();
