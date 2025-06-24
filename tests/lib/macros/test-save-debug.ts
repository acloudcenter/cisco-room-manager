/**
 * Debug the save macro issue
 */

import { config } from "dotenv";
import jsxapi from "jsxapi";
import {
  getDeviceConfig,
  handleConnectionError,
  logTestSection,
  logInfo,
  logSuccess,
} from "../../services/test-utils";

// Load environment variables
config();

const debugSave = async () => {
  const deviceConfig = getDeviceConfig();

  logTestSection("DEBUG SAVE MACRO");
  logInfo(`Connecting to device at ${deviceConfig.host}...`);

  return new Promise((resolve) => {
    jsxapi
      .connect(`wss://${deviceConfig.host}`, {
        username: deviceConfig.username,
        password: deviceConfig.password,
      })
      .on("ready", async (xapi: any) => {
        logSuccess("Connected successfully!");

        try {
          const testName = "DebugTest_" + Date.now();
          const testContent = "const xapi = require('xapi'); console.log('Debug test');";

          console.log("Testing different save approaches:\n");

          // Test 1: Direct command
          try {
            console.log("1. Testing direct command:");
            const result = await xapi.Command.Macros.Macro.Save({
              Name: testName,
              Content: testContent,
              Overwrite: "True",
              Transpile: "True",
            });
            console.log("✅ Direct save succeeded:", result);

            // Clean up
            await xapi.Command.Macros.Macro.Remove({ Name: testName });
            console.log("✅ Cleanup successful");
          } catch (e) {
            console.log("❌ Direct save failed:", e);
            console.log("Error details:", JSON.stringify(e, null, 2));
          }

          // Test 2: Check what happens with boolean vs string
          try {
            console.log("\n2. Testing with boolean values:");
            const result = await xapi.Command.Macros.Macro.Save({
              Name: testName + "_bool",
              Content: testContent,
              Overwrite: true, // boolean
              Transpile: true, // boolean
            });
            console.log("✅ Boolean save succeeded:", result);

            // Clean up
            await xapi.Command.Macros.Macro.Remove({ Name: testName + "_bool" });
          } catch (e) {
            console.log("❌ Boolean save failed:", e.message);
          }

          // Test 3: Without optional parameters
          try {
            console.log("\n3. Testing without optional parameters:");
            const result = await xapi.Command.Macros.Macro.Save({
              Name: testName + "_minimal",
              Content: testContent,
            });
            console.log("✅ Minimal save succeeded:", result);

            // Clean up
            await xapi.Command.Macros.Macro.Remove({ Name: testName + "_minimal" });
          } catch (e) {
            console.log("❌ Minimal save failed:", e.message);
          }
        } catch (error) {
          console.error("Test failed:", error);
        } finally {
          xapi.close();
          logInfo("\nConnection closed");
          resolve(undefined);
        }
      })
      .on("error", (error: any) => {
        handleConnectionError(error);
        resolve(undefined);
      });
  });
};

// Run the test
debugSave()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
