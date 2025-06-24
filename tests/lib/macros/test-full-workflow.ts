/**
 * Test the full macro workflow with our library
 */

import { config } from "dotenv";
import {
  getDeviceConfig,
  handleConnectionError,
  logTestSection,
  logTestStep,
  logSuccess,
  logInfo,
} from "../../services/test-utils";

// Import connection service
import { ciscoConnectionService } from "../../../src/services/cisco-connection-service";

// Import macro functions
import {
  getMacroList,
  saveMacro,
  activateMacro,
  deactivateMacro,
  removeMacro,
  getRuntimeStatus,
} from "../../../src/lib/macros";

// Load environment variables
config();

const testFullWorkflow = async () => {
  const deviceConfig = getDeviceConfig();

  logTestSection("TESTING FULL MACRO WORKFLOW");
  logInfo(`Connecting to device at ${deviceConfig.host}...`);

  try {
    // Connect to device
    await ciscoConnectionService.connect(deviceConfig);
    logSuccess("Connected successfully!");

    // Test 1: Get runtime status
    logTestStep(1, "Getting runtime status");
    const runtimeStatus = await getRuntimeStatus();
    console.log("Runtime status:", runtimeStatus);

    // Test 2: Get macro list
    logTestStep(2, "Getting macro list");
    const macros = await getMacroList();
    console.log(`Found ${macros.length} macros:`);
    macros.forEach((m) => console.log(`  - ${m.name} (${m.active ? "Active" : "Inactive"})`));

    // Test 3: Create a test macro
    logTestStep(3, "Creating test macro");
    const testMacroName = "TestMacro_" + Date.now();
    const testMacroContent = `const xapi = require('xapi'); console.log('Test macro ${testMacroName} is running');`;

    const saveResult = await saveMacro(testMacroName, testMacroContent, {
      overwrite: true,
      activate: true,
    });

    if (saveResult.success) {
      logSuccess("Test macro created and activated");
    } else {
      console.error("Failed to create macro:", saveResult.error);
    }

    // Test 4: Verify it appears in the list
    logTestStep(4, "Verifying macro appears in list");
    const updatedMacros = await getMacroList();
    const testMacro = updatedMacros.find((m) => m.name === testMacroName);

    if (testMacro) {
      logSuccess(
        `Test macro found: ${testMacro.name} (${testMacro.active ? "Active" : "Inactive"})`,
      );
    } else {
      console.error("Test macro not found in list!");
    }

    // Test 5: Deactivate the macro
    logTestStep(5, "Deactivating test macro");
    const deactivateResult = await deactivateMacro(testMacroName);

    if (deactivateResult.success) {
      logSuccess("Test macro deactivated");
    } else {
      console.error("Failed to deactivate:", deactivateResult.error);
    }

    // Test 6: Clean up - remove test macro
    logTestStep(6, "Removing test macro");
    const removeResult = await removeMacro(testMacroName);

    if (removeResult.success) {
      logSuccess("Test macro removed");
    } else {
      console.error("Failed to remove:", removeResult.error);
    }

    // Final: Show updated list
    logTestStep(7, "Final macro list");
    const finalMacros = await getMacroList();
    console.log(`${finalMacros.length} macros remaining`);
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    // Disconnect
    ciscoConnectionService.disconnect();
    logInfo("Connection closed");
  }
};

// Run the test
testFullWorkflow()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
