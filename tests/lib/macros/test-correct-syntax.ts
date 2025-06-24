/**
 * Test the correct macro command syntax
 * Based on the PowerShell tool reference
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

const testCorrectSyntax = async () => {
  const deviceConfig = getDeviceConfig();

  logTestSection("TESTING CORRECT MACRO SYNTAX");
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
          console.log("Testing Command.Macros.Macro.Get() with no parameters:\n");

          // Try the correct syntax from PowerShell tool
          const result = await xapi.Command.Macros.Macro.Get();
          console.log("✅ SUCCESS! Got macro list:");
          console.log(JSON.stringify(result, null, 2));

          // Check if we have macros
          if (result?.Macro) {
            const macros = Array.isArray(result.Macro) ? result.Macro : [result.Macro];
            console.log(`\nFound ${macros.length} macro(s):`);

            for (const macro of macros) {
              console.log(`  - ${macro.Name || macro}`);

              // Try to get the specific macro content
              try {
                const details = await xapi.Command.Macros.Macro.Get({
                  Name: macro.Name || macro,
                  Content: true,
                });
                console.log(`    Has content: ${details.Macro ? "Yes" : "No"}`);

                // Get status
                try {
                  const status = await xapi.status.get(
                    `Macros Macro ${macro.Name || macro} Status`,
                  );
                  console.log(`    Status: ${status}`);
                } catch (e) {
                  console.log(`    Status: Unable to retrieve`);
                }
              } catch (e) {
                console.log(`    Could not get details: ${e.message}`);
              }
            }
          } else {
            console.log("No macros found on device");
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
testCorrectSyntax()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
