/**
 * Test macro commands using direct object syntax
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

const testMacroDirect = async () => {
  const deviceConfig = getDeviceConfig();

  logTestSection("TESTING MACRO COMMANDS DIRECTLY");
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
          console.log("Testing direct object access...\n");

          // Try direct method calls
          try {
            console.log("1. Trying xapi.Command.Macros.Macro.List():");
            const result = await xapi.Command.Macros.Macro.List();
            console.log("✅ SUCCESS!");
            console.log("Result:", JSON.stringify(result, null, 2));
          } catch (e) {
            console.log("❌ Failed:", e.message);
          }

          // Try other macro commands
          try {
            console.log("\n2. Trying xapi.Command.Macros.Runtime.Status():");
            const status = await xapi.Command.Macros.Runtime.Status();
            console.log("✅ SUCCESS!");
            console.log("Result:", JSON.stringify(status, null, 2));
          } catch (e) {
            console.log("❌ Failed:", e.message);
          }

          // Try to get a specific macro if any exist
          try {
            console.log("\n3. First, let's see if there are any macros:");
            const list = await xapi.Command.Macros.Macro.List();
            console.log("Macro list result:", JSON.stringify(list, null, 2));

            if (list?.Macro) {
              const macros = Array.isArray(list.Macro) ? list.Macro : [list.Macro];
              const firstMacro = macros[0];

              console.log(`\n4. Getting details for macro: ${firstMacro.Name}`);
              const details = await xapi.Command.Macros.Macro.Get({
                Name: firstMacro.Name,
                Content: true,
              });
              console.log("Macro details:", JSON.stringify(details, null, 2));

              // Try to get status using Status path
              console.log(`\n5. Getting status for macro: ${firstMacro.Name}`);
              try {
                const status = await xapi.Status.Macros.Macro[firstMacro.Name].Status.get();
                console.log("Macro status:", status);
              } catch (e) {
                console.log("Status path failed, trying alternative:");
                try {
                  const status = await xapi.status.get(`Macros.Macro.${firstMacro.Name}.Status`);
                  console.log("Macro status:", status);
                } catch (e2) {
                  console.log("Alternative failed too:", e2.message);
                }
              }
            }
          } catch (e) {
            console.log("Failed:", e.message);
          }

          // Test creating a simple test macro
          console.log("\n6. Testing macro save:");
          try {
            const testMacroContent = `
              const xapi = require('xapi');
              console.log('Test macro loaded');
            `;

            await xapi.Command.Macros.Macro.Save({
              Name: "TestMacro",
              Content: testMacroContent,
              Overwrite: true,
              Transpile: true,
            });
            console.log("✅ Test macro saved successfully");

            // Try to activate it
            console.log("\n7. Activating test macro:");
            await xapi.Command.Macros.Macro.Activate({ Name: "TestMacro" });
            console.log("✅ Test macro activated");

            // Clean up - remove test macro
            console.log("\n8. Cleaning up - removing test macro:");
            await xapi.Command.Macros.Macro.Remove({ Name: "TestMacro" });
            console.log("✅ Test macro removed");
          } catch (e) {
            console.log("Failed:", e.message);
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
testMacroDirect()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
