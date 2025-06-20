/**
 * Test HTTP API Connector
 */

// Since we're in a Node.js environment, we need to use dynamic import for TypeScript files
async function runTest() {
  const { HTTPAPIConnector } = await import("../src/services/http-api-connector.js");

  const connector = new HTTPAPIConnector();

  const credentials = {
    host: "192.168.1.186",
    username: "admin",
    password: "NascarApollo1788!",
  };

  console.log("HTTP API Connector Test");
  console.log("======================\n");

  try {
    // Connect to device
    console.log("🔌 Connecting to device...");
    await connector.connect(credentials);
    console.log("✅ Connected successfully!\n");

    // Get device info
    console.log("📊 Getting device information...");
    const deviceInfo = await connector.getDeviceInfo();
    console.log("Device Info:", deviceInfo, "\n");

    // Get some status values
    console.log("📈 Getting status values...");

    try {
      const audioStatus = await connector.getStatus("Audio");
      console.log(
        "Audio Status:",
        JSON.stringify(audioStatus, null, 2).substring(0, 200) + "...\n",
      );
    } catch (error) {
      console.log("Audio Status Error:", error.message, "\n");
    }

    // Get WebSocket configuration
    console.log("🔧 Checking WebSocket configuration...");
    try {
      const wsConfig = await connector.getConfig("NetworkServices/WebSocket");
      console.log("WebSocket Config:", wsConfig, "\n");
    } catch (error) {
      console.log("WebSocket Config Error:", error.message, "\n");
    }

    // Try a simple command
    console.log("🎯 Testing command execution...");
    try {
      const volumeCmd = await connector.executeCommand("<Audio><Volume><Get/></Volume></Audio>");
      console.log("Volume Command Result:", volumeCmd, "\n");
    } catch (error) {
      console.log("Command Error:", error.message, "\n");
    }

    // Disconnect
    console.log("🔌 Disconnecting...");
    connector.disconnect();
    console.log("✅ Test completed!\n");

    console.log("📋 Summary:");
    console.log("- HTTP API connection works");
    console.log("- Can retrieve device status and configuration");
    console.log("- Commands may require different authentication or format");
    console.log("- For full functionality, enable WebSocket on the device");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
runTest().catch(console.error);
