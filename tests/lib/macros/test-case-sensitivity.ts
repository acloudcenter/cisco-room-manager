/**
 * Test case sensitivity of parameters
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

const testCaseSensitivity = async () => {
  const deviceConfig = getDeviceConfig();

  logTestSection("TEST CASE SENSITIVITY");
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
          const testName = "CaseTest_" + Date.now();
          const testContent = "const xapi = require('xapi'); console.log('Case test');";

          console.log("Testing different parameter cases:\n");

          // Test variations
          const variations = [
            { Body: testContent, desc: "Body (uppercase B)" },
            { body: testContent, desc: "body (lowercase)" },
            { Content: testContent, desc: "Content (uppercase C)" },
            { content: testContent, desc: "content (lowercase)" },
            { Code: testContent, desc: "Code" },
            { Macro: testContent, desc: "Macro" },
          ];

          for (const variation of variations) {
            try {
              console.log(`Testing ${variation.desc}:`);
              const params = {
                Name: testName + "_" + variation.desc.replace(/[^a-zA-Z]/g, ""),
                ...variation,
                Overwrite: "True",
              };
              delete params.desc;

              console.log("Parameters:", params);
              const result = await xapi.Command.Macros.Macro.Save(params);
              console.log(`✅ SUCCESS with ${variation.desc}!`);
              console.log("Result:", result);

              // Clean up successful save
              await xapi.Command.Macros.Macro.Remove({
                Name: testName + "_" + variation.desc.replace(/[^a-zA-Z]/g, ""),
              });
              console.log("Cleaned up\n");
              break; // Found the right one!
            } catch (e) {
              console.log(`❌ Failed with ${variation.desc}: ${e.message}\n`);
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
testCaseSensitivity()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
