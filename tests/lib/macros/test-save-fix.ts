/**
 * Test the fixed save command
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

const testSaveFix = async () => {
  const deviceConfig = getDeviceConfig();

  logTestSection("TEST SAVE FIX");
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
          const testName = "SaveFixTest_" + Date.now();
          const testContent = "const xapi = require('xapi'); console.log('Save fix test');";

          console.log("Testing with Body parameter:\n");

          try {
            const result = await xapi.Command.Macros.Macro.Save({
              Name: testName,
              Body: testContent, // Using Body instead of Content
              Overwrite: "True",
              Transpile: "True",
            });
            console.log("✅ Save with Body succeeded!");
            console.log("Result:", result);

            // Verify it was created
            const list = await xapi.Command.Macros.Macro.Get();
            const found = list.Macro.find((m: any) => m.Name === testName);

            if (found) {
              console.log("✅ Macro found in list:", found);

              // Activate it
              await xapi.Command.Macros.Macro.Activate({ Name: testName });
              console.log("✅ Macro activated");

              // Deactivate it
              await xapi.Command.Macros.Macro.Deactivate({ Name: testName });
              console.log("✅ Macro deactivated");
            }

            // Clean up
            await xapi.Command.Macros.Macro.Remove({ Name: testName });
            console.log("✅ Cleanup successful");
          } catch (e) {
            console.log("❌ Save failed:", e);
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
testSaveFix()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
