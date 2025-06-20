/**
 * Test connection to a single Cisco device
 * Uses environment variables for credentials
 */

import { config } from "dotenv";
import jsxapi from "jsxapi";

// Load environment variables from .env file
config();

const deviceConfig = {
  host: process.env.TSD_IPADDRESS,
  username: process.env.TSD_USERNAME,
  password: process.env.TSD_PASSWORD,
};

// Validate environment variables
if (!deviceConfig.host || !deviceConfig.username || !deviceConfig.password) {
  console.error("❌ Missing required environment variables:");
  if (!deviceConfig.host) console.error("  - TSD_IPADDRESS");
  if (!deviceConfig.username) console.error("  - TSD_USERNAME");
  if (!deviceConfig.password) console.error("  - TSD_PASSWORD");
  console.error("\nPlease check your .env file contains all required variables.");
  process.exit(1);
}

const testConnection = async () => {
  console.log(`Testing connection to device at ${deviceConfig.host}...`);

  try {
    // Check if jsxapi is imported correctly
    console.log("jsxapi type:", typeof jsxapi);
    console.log("jsxapi value:", jsxapi);

    // Using connect method (if jsxapi has a connect property)
    if (jsxapi && typeof jsxapi.connect === "function") {
      console.log("Attempting connection via jsxapi.connect...");
      const xapi = await jsxapi.connect(`wss://${deviceConfig.host}`, {
        username: deviceConfig.username,
        password: deviceConfig.password,
      });

      console.log("Connected successfully!");

      // Test a simple API call
      const volume = await xapi.Status.Audio.Volume.get();
      console.log("Current volume:", volume);

      // Disconnect
      xapi.close();
      console.log("Disconnected successfully! WebSocket connection closed.");
      return;
    }

    // If approach works, log what we have
    console.error("Unable to determine how to use jsxapi. Object structure:");
    console.error("Keys:", Object.keys(jsxapi || {}));
    console.error("jsxapi.default:", (jsxapi as any).default);
  } catch (error) {
    console.error("Connection failed:", error);
    console.error("Error details:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
  }
};

// Run the test
testConnection();
