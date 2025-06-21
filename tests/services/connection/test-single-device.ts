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
  console.error("Missing required environment variables:");
  if (!deviceConfig.host) console.error("  - TSD_IPADDRESS");
  if (!deviceConfig.username) console.error("  - TSD_USERNAME");
  if (!deviceConfig.password) console.error("  - TSD_PASSWORD");
  console.error("\nPlease check your .env file contains all required variables.");
  process.exit(1);
}

const testConnection = async () => {
  console.log(`Testing connection to device at ${deviceConfig.host}...`);

  return new Promise((resolve) => {
    let errorShown = false;

    jsxapi
      .connect(`wss://${deviceConfig.host}`, {
        username: deviceConfig.username,
        password: deviceConfig.password,
      })
      .on("ready", async (xapi: any) => {
        console.log("Connected successfully!");

        // Get device info
        try {
          const productId = await xapi.Status.SystemUnit.ProductId.get();
          const version = await xapi.Status.SystemUnit.Software.Version.get();
          console.log("Device:", productId);
          console.log("Version:", version);
        } catch (e) {
          console.log("Could not get device info");
        }

        // Test a simple API call
        try {
          const volume = await xapi.Status.Audio.Volume.get();
          console.log("Current volume:", volume);
        } catch (e) {
          console.log("Could not get volume (might not be available on this device)");
        }

        // Disconnect
        xapi.close();
        console.log("Disconnected successfully!");
        resolve(true);
      })
      .on("error", (error: any) => {
        // Only show the error once (jsxapi might emit multiple error events)
        if (errorShown) return;
        errorShown = true;

        console.error("\nNot able to connect.");
        console.error(
          `Try logging in at https://${deviceConfig.host} and accept the self-signed certificate?`,
        );
        console.error("Make sure you are on the same network (not VPN)");
        console.error(
          "DX80 etc: Make sure xConfiguration NetworkServices WebSocket is FollowHTTPService",
        );

        if (error.message) {
          console.error("\nError details:", error.message);
        }

        resolve(false);
      });
  });
};

// Run the test
testConnection();
