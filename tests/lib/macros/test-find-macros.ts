/**
 * Find the correct way to list macros
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

const findMacros = async () => {
  const deviceConfig = getDeviceConfig();

  logTestSection("FINDING MACRO LIST METHOD");
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
          // We know Runtime.Status works and shows 5 active macros
          console.log("Runtime status shows 5 active macros\n");

          // Try to find macro information in Status
          console.log("1. Exploring Status.Macros paths:");
          try {
            // Try to get the full Macros status tree
            const macrosStatus = await xapi.Status.get("Macros");
            console.log("Status.Macros:", JSON.stringify(macrosStatus, null, 2));
          } catch (e) {
            console.log("Failed to get Status.Macros:", e.message);
          }

          // Try specific macro status paths
          console.log("\n2. Trying specific status paths:");
          const statusPaths = [
            "Macros.Macro",
            "Macros.MacroList",
            "Macros.List",
            "Macros.Runtime",
            "Macros.ActiveMacros",
          ];

          for (const path of statusPaths) {
            try {
              const result = await xapi.Status.get(path);
              console.log(`✅ Status.${path}:`, JSON.stringify(result, null, 2));
            } catch (e) {
              console.log(`❌ Status.${path}: ${e.message}`);
            }
          }

          // Try Config paths
          console.log("\n3. Exploring Config.Macros:");
          try {
            const macroConfig = await xapi.Config.get("Macros");
            console.log("Config.Macros:", JSON.stringify(macroConfig, null, 2));
          } catch (e) {
            console.log("Failed:", e.message);
          }

          // Try to save and then get a test macro
          console.log("\n4. Testing save and retrieval:");
          try {
            // Save a test macro (without newlines)
            const testContent = "const xapi = require('xapi'); console.log('Test macro');";

            await xapi.Command.Macros.Macro.Save({
              Name: "APITest",
              Content: testContent,
              Overwrite: true,
              Transpile: true,
            });
            console.log("✅ Test macro saved");

            // Now try to get it back
            console.log("\n5. Trying to retrieve the saved macro:");
            try {
              const result = await xapi.Command.Macros.Macro.Get({
                Name: "APITest",
                Content: true,
              });
              console.log("✅ Macro retrieved:", JSON.stringify(result, null, 2));
            } catch (e) {
              console.log("❌ Get failed:", e.message);
            }

            // Check its status
            console.log("\n6. Checking macro status:");
            const statusVariations = [
              "Macros.Macro.APITest.Status",
              "Macros.Macro.APITest",
              "Macros.APITest.Status",
              "Macros.APITest",
            ];

            for (const path of statusVariations) {
              try {
                const status = await xapi.Status.get(path);
                console.log(`✅ Status.${path}:`, status);
              } catch (e) {
                // Try with status.get method
                try {
                  const status = await xapi.status.get(path);
                  console.log(`✅ status.get('${path}'):`, status);
                } catch (e2) {
                  console.log(`❌ ${path}: Failed`);
                }
              }
            }

            // Clean up
            await xapi.Command.Macros.Macro.Remove({ Name: "APITest" });
            console.log("\n✅ Test macro removed");
          } catch (e) {
            console.log("Save/retrieve test failed:", e.message);
          }

          // Check if there's a way to enumerate macros
          console.log("\n7. Looking for enumeration methods:");
          if (xapi.Command.Macros.Macro) {
            console.log(
              "Available methods on Command.Macros.Macro:",
              Object.keys(xapi.Command.Macros.Macro),
            );
            console.log("Type:", typeof xapi.Command.Macros.Macro);

            // Try to see properties
            try {
              for (const prop in xapi.Command.Macros.Macro) {
                console.log(`  Property: ${prop}`);
              }
            } catch (e) {
              console.log("Could not enumerate properties");
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
findMacros()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
