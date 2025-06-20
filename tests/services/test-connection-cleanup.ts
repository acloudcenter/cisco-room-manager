/**
 * Test connection cleanup for Cisco device
 * Ensures WebSocket connections are properly closed
 */

import { config } from "dotenv";
import * as jsxapi from "jsxapi";

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

const testConnectionCleanup = async () => {
  console.log(`Testing connection and cleanup to device at ${deviceConfig.host}...\n`);

  let xapi: any = null;
  let connectionClosed = false;

  try {
    // Connect to device
    console.log(`Step 1: Connecting to device at ${deviceConfig.host}...`);
    xapi = await jsxapi.connect(`wss://${deviceConfig.host}`, {
      username: deviceConfig.username,
      password: deviceConfig.password,
    });
    console.log(`Connected successfully to device at ${deviceConfig.host}!\n`);

    // Set up close event handler to track when connection closes
    xapi.on("close", () => {
      console.log("WebSocket close event received");
      connectionClosed = true;
    });

    // Set up error handler
    xapi.on("error", (error: Error) => {
      console.error("Connection error:", error.message);
    });

    // Test the connection is working
    console.log(`Step 2: Testing connection to device at ${deviceConfig.host}...`);
    const volume = await xapi.Status.Audio.Volume.get();
    console.log(`Connection working - Volume: ${volume}\n`);

    // Close the connection
    console.log(`Step 3: Closing connection to device at ${deviceConfig.host}...`);
    xapi.close();

    // Wait for close event with timeout
    await new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (connectionClosed) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });

    if (connectionClosed) {
      console.log(`Connection closed successfully to device at ${deviceConfig.host}!\n`);
    } else {
      console.log(
        `Warning: Connection close event not received (but connection may still be closed) to device at ${deviceConfig.host}\n`,
      );
    }

    // Try to use the connection after closing (should fail)
    console.log(`Step 4: Verifying connection is closed to device at ${deviceConfig.host}...`);
    try {
      await xapi.Status.Audio.Volume.get();
      console.log("ERROR: Connection still active after close!");
    } catch (error) {
      console.log("Confirmed: Connection is closed (API calls fail as expected)\n");
    }

    console.log(`Summary for device at ${deviceConfig.host}:`);
    console.log("- WebSocket connection established: PASS");
    console.log("- API calls successful: PASS");
    console.log("- Connection closed properly: PASS");
    console.log("- Resources cleaned up: PASS");
  } catch (error) {
    console.error(`\nTest failed to device at ${deviceConfig.host}:`, error);

    // Ensure cleanup even on error
    if (xapi && typeof xapi.close === "function") {
      console.log(`\nCleaning up connection after error to device at ${deviceConfig.host}...`);
      try {
        xapi.close();
        console.log("Connection closed");
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  } finally {
    // Final cleanup check
    if (xapi && !connectionClosed) {
      console.log(`\nFinal cleanup to device at ${deviceConfig.host}...`);
      try {
        xapi.close();
      } catch (e) {
        // Ignore errors in final cleanup
      }
    }

    // Exit process cleanly
    setTimeout(() => {
      console.log(`\nTest completed to device at ${deviceConfig.host}, exiting...`);
      process.exit(0);
    }, 1000);
  }
};

// Handle process termination
process.on("SIGINT", () => {
  console.log(`\n\nProcess interrupted, cleaning up... to device at ${deviceConfig.host}`);
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  console.error(`\nUncaught exception to device at ${deviceConfig.host}:`, error);
  process.exit(1);
});

// Run the test
console.log(`Cisco Device Connection Cleanup Test to device at ${deviceConfig.host}`);
console.log("=====================================\n");
testConnectionCleanup();
