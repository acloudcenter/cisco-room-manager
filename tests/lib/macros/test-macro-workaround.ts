/**
 * Test workaround for listing macros
 * Since List command doesn't exist, try other approaches
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

const testMacroWorkaround = async () => {
  const deviceConfig = getDeviceConfig();

  logTestSection("TESTING MACRO WORKAROUNDS");
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
          // We know there are 5 active macros from Runtime.Status
          console.log("Runtime status shows 5 active macros\n");

          // Since we can't list macros, let's try some common macro names
          console.log("1. Trying to get macros with common names:");
          const commonNames = [
            "init",
            "main",
            "startup",
            "config",
            "roomcontrol",
            "ui",
            "uiextensions",
            "default",
            "macro1",
            "macro2",
            "webex",
            "custom",
          ];

          const foundMacros: string[] = [];

          for (const name of commonNames) {
            try {
              const result = await xapi.Command.Macros.Macro.Get({
                Name: name,
                Content: false, // Just check if it exists
              });
              console.log(`✅ Found macro: ${name}`);
              foundMacros.push(name);
            } catch (e) {
              // Macro doesn't exist with this name
            }
          }

          if (foundMacros.length === 0) {
            console.log("❌ No macros found with common names");
          }

          // Try to explore the command structure more
          console.log("\n2. Exploring Command.Macros structure:");
          if (xapi.Command.Macros) {
            console.log(
              "Command.Macros properties:",
              Object.getOwnPropertyNames(xapi.Command.Macros),
            );

            // Check each property
            for (const prop of Object.getOwnPropertyNames(xapi.Command.Macros)) {
              console.log(`  ${prop}:`, typeof xapi.Command.Macros[prop]);
              if (typeof xapi.Command.Macros[prop] === "object" && prop !== "Macro") {
                try {
                  // Try to call it if it's a function
                  if (typeof xapi.Command.Macros[prop] === "function") {
                    const result = await xapi.Command.Macros[prop]();
                    console.log(`    Result:`, JSON.stringify(result, null, 2));
                  }
                } catch (e) {
                  console.log(`    Error:`, e.message);
                }
              }
            }
          }

          // Check if there's a way to get all macros through status
          console.log("\n3. Looking for macro information in Status paths:");
          try {
            // Try to get individual macro status
            if (foundMacros.length > 0) {
              for (const macroName of foundMacros) {
                try {
                  const status = await xapi.status.get(`Macros Macro ${macroName} Status`);
                  console.log(`Macro ${macroName} status:`, status);
                } catch (e) {
                  console.log(`Could not get status for ${macroName}`);
                }
              }
            }
          } catch (e) {
            console.log("Status exploration failed:", e.message);
          }

          // Final approach: Check if there's an export/import mechanism
          console.log("\n4. Checking for export/import commands:");
          const exportCommands = ["Export", "Backup", "Dump", "GetAll", "ListAll"];

          for (const cmd of exportCommands) {
            if (xapi.Command.Macros[cmd]) {
              try {
                console.log(`Found Command.Macros.${cmd}`);
                const result = await xapi.Command.Macros[cmd]();
                console.log(`Result:`, JSON.stringify(result, null, 2));
              } catch (e) {
                console.log(`${cmd} failed:`, e.message);
              }
            }
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
testMacroWorkaround()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
