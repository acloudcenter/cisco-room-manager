/**
 * Test macro operations
 * Tests the macro API functions with a real device
 */

import { config } from "dotenv";
import jsxapi from "jsxapi";
import {
  getDeviceConfig,
  handleConnectionError,
  logTestSection,
  logTestStep,
  logSuccess,
  logInfo,
  logWarning,
} from "../../services/test-utils";

// Load environment variables
config();

// We need to temporarily set up the connection service
// to match what the production code expects
import { ciscoConnectionService } from "../../../src/services/cisco-connection-service";

const testMacroOperations = async () => {
  const deviceConfig = getDeviceConfig();

  logTestSection("TESTING MACRO OPERATIONS");
  logInfo(`Connecting to device at ${deviceConfig.host}...`);

  return new Promise((resolve) => {
    // Connect directly with jsxapi first to debug
    jsxapi
      .connect(`wss://${deviceConfig.host}`, {
        username: deviceConfig.username,
        password: deviceConfig.password,
      })
      .on("ready", async (xapi: any) => {
        logSuccess("Connected successfully!");

        try {
          // First, let's test the raw API call
          logTestStep(1, "Testing raw Macros Macro List command");

          // Try different command syntaxes
          let rawResult: any;
          try {
            // Try with xCommand prefix
            rawResult = await xapi.command("Macros/Macro/List");
            console.log("Raw result (slash syntax):", JSON.stringify(rawResult, null, 2));
          } catch (e1) {
            console.log("Slash syntax failed:", e1);

            try {
              // Try with different syntax
              rawResult = await xapi.Command.Macros.Macro.List();
              console.log("Raw result (dot syntax):", JSON.stringify(rawResult, null, 2));
            } catch (e2) {
              console.log("Dot syntax failed:", e2);

              try {
                // Try status path
                const macroStatus = await xapi.Status.Macros.get();
                console.log("Macro status:", JSON.stringify(macroStatus, null, 2));
              } catch (e3) {
                console.log("Status path failed:", e3);
              }
            }
          }

          // Check if we got any macros
          if (rawResult?.Macro) {
            const macroArray = Array.isArray(rawResult.Macro) ? rawResult.Macro : [rawResult.Macro];
            logSuccess(`Found ${macroArray.length} macro(s)`);

            // List macro names
            macroArray.forEach((macro: any) => {
              console.log(`  - ${macro.Name}`);
            });

            // Test getting status for first macro
            if (macroArray.length > 0) {
              logTestStep(2, `Testing status for macro: ${macroArray[0].Name}`);
              try {
                const status = await xapi.status.get(`Macros Macro ${macroArray[0].Name} Status`);
                console.log(`  Status: ${status}`);
              } catch (e) {
                logWarning(`Could not get status: ${e}`);
              }
            }
          } else {
            logInfo("No macros found on device");
          }

          // Now test with our library functions
          logTestStep(3, "Testing with library functions");

          // Set up the connection in the service (temporary hack for testing)
          // In production, this happens through the UI connection flow
          (ciscoConnectionService as any).connector = xapi;
          (ciscoConnectionService as any).connection = "connected";

          // Import and test our macro functions
          const { getMacroList, getRuntimeStatus } = await import("../../../src/lib/macros");

          logTestStep(4, "Testing getMacroList()");
          try {
            const macros = await getMacroList();
            logSuccess(`getMacroList() returned ${macros.length} macro(s)`);
            macros.forEach((macro) => {
              console.log(`  - ${macro.name} (${macro.active ? "Active" : "Inactive"})`);
            });
          } catch (error) {
            console.error("❌ getMacroList() failed:", error);
          }

          logTestStep(5, "Testing getRuntimeStatus()");
          try {
            const runtimeStatus = await getRuntimeStatus();
            logSuccess("Runtime status retrieved:");
            console.log(`  Running: ${runtimeStatus.running}`);
            console.log(`  State: ${runtimeStatus.state}`);
            if (runtimeStatus.message) {
              console.log(`  Message: ${runtimeStatus.message}`);
            }
          } catch (error) {
            console.error("❌ getRuntimeStatus() failed:", error);
          }
        } catch (error) {
          console.error("Test failed:", error);
        } finally {
          // Close connection
          xapi.close();
          logInfo("Connection closed");
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
testMacroOperations()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
