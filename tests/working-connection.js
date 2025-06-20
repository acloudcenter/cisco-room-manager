/**
 * Working connection test for Cisco device
 */

import * as jsxapi from "jsxapi";

const config = {
  host: "192.168.1.186",
  username: "admin",
  password: "NascarApollo1788!",
};

async function connectToDevice() {
  console.log(`\n🔌 Connecting to ${config.host}...`);

  try {
    // Connect to the device
    const xapi = await jsxapi.connect(`wss://${config.host}`, {
      username: config.username,
      password: config.password,
    });

    console.log("✅ Connected successfully!\n");

    // Set up event handlers before making any API calls
    xapi.on("error", (error) => {
      console.warn("⚠️  API Error:", error.message || error);
    });

    xapi.on("close", () => {
      console.log("🔌 Connection closed");
    });

    // Wait a moment for the connection to stabilize
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("📊 Attempting to get device information...\n");

    // Try different API paths to see what works
    const apiTests = [
      { name: "System Unit Name", fn: () => xapi.Config.SystemUnit.Name.get() },
      { name: "Product Platform", fn: () => xapi.Status.SystemUnit.ProductPlatform.get() },
      { name: "Software Version", fn: () => xapi.Status.SystemUnit.Software.Version.get() },
      { name: "Audio Volume", fn: () => xapi.Status.Audio.Volume.get() },
      { name: "System Unit Status", fn: () => xapi.Status.SystemUnit.get() },
      { name: "Full Status", fn: () => xapi.Status.get() },
    ];

    for (const test of apiTests) {
      try {
        console.log(`Testing: ${test.name}`);
        const result = await test.fn();
        console.log(`✅ Success:`, JSON.stringify(result, null, 2).substring(0, 200));
        console.log("");
      } catch (error) {
        console.log(`❌ Failed: ${error.message || error}`);
        console.log("");
      }
    }

    // Try to execute a simple command
    console.log("🎯 Testing command execution...");
    try {
      // Try to get the current standby state
      const standbyState = await xapi.Command.Standby.State.get();
      console.log("Standby state:", standbyState);
    } catch (error) {
      console.log("Standby command failed:", error.message);
    }

    // Close the connection gracefully
    console.log("\n🔌 Closing connection...");
    xapi.close();

    // Wait for close event
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("\n✅ Test completed!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error("Error:", error.message || error);
    console.error("\nTroubleshooting tips:");
    console.error("1. Verify the device IP address is correct");
    console.error("2. Check username and password");
    console.error("3. Ensure the device has API access enabled");
    console.error("4. Check firewall settings");
    process.exit(1);
  }
}

// Run the test
console.log("Cisco Device Connection Test");
console.log("============================");
connectToDevice();
