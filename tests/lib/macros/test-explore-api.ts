/**
 * Explore available API paths for macros
 * Helps discover the correct command syntax
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

const exploreAPI = async () => {
  const deviceConfig = getDeviceConfig();

  logTestSection("EXPLORING MACRO API");
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
          // Get device info first
          const productId = await xapi.Status.SystemUnit.ProductId.get();
          const version = await xapi.Status.SystemUnit.Software.Version.get();
          console.log("Device:", productId);
          console.log("Version:", version);
          console.log("");

          // Try to explore what's available
          console.log("Exploring available API paths...\n");

          // Check if Command.Macros exists
          console.log("1. Checking xapi.Command structure:");
          if (xapi.Command) {
            console.log("   xapi.Command exists");
            if (xapi.Command.Macros) {
              console.log("   xapi.Command.Macros exists");
              if (xapi.Command.Macros.Macro) {
                console.log("   xapi.Command.Macros.Macro exists");
                console.log("   Available methods:", Object.keys(xapi.Command.Macros.Macro));
              }
            } else {
              console.log("   xapi.Command.Macros does NOT exist");
            }
          }

          // Check Status paths
          console.log("\n2. Checking xapi.Status structure:");
          if (xapi.Status) {
            console.log("   xapi.Status exists");
            if (xapi.Status.Macros) {
              console.log("   xapi.Status.Macros exists");
              try {
                const macroStatus = await xapi.Status.Macros.get();
                console.log("   Macro status:", JSON.stringify(macroStatus, null, 2));
              } catch (e) {
                console.log("   Could not get Macros status:", e.message);
              }
            } else {
              console.log("   xapi.Status.Macros does NOT exist");
            }
          }

          // Try command with different formats
          console.log("\n3. Testing command formats:");
          const commandFormats = [
            "Macros Macro List",
            "Macros.Macro.List",
            "macros/macro/list",
            "Macros/Macro/List",
            "xCommand Macros Macro List",
            "Macros",
            "MacrosList",
          ];

          for (const format of commandFormats) {
            try {
              console.log(`   Trying: xapi.command('${format}')`);
              const result = await xapi.command(format);
              console.log(`   ✅ SUCCESS with format '${format}'`);
              console.log(`   Result:`, JSON.stringify(result, null, 2));
              break;
            } catch (e) {
              console.log(`   ❌ Failed: ${e.message}`);
            }
          }

          // Check Config paths
          console.log("\n4. Checking xapi.Config structure:");
          if (xapi.Config) {
            console.log("   xapi.Config exists");
            if (xapi.Config.Macros) {
              console.log("   xapi.Config.Macros exists");
              try {
                const macroConfig = await xapi.Config.Macros.get();
                console.log("   Macro config:", JSON.stringify(macroConfig, null, 2));
              } catch (e) {
                console.log("   Could not get Macros config:", e.message);
              }
            } else {
              console.log("   xapi.Config.Macros does NOT exist");
            }
          }
        } catch (error) {
          console.error("Exploration failed:", error);
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

// Run the exploration
exploreAPI()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
