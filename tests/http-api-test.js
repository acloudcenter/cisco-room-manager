/**
 * HTTP API Test for Cisco Device
 * Tests the HTTP/HTTPS API directly without WebSocket
 */

import https from "https";
import { parseString } from "xml2js";
import { promisify } from "util";

const parseXML = promisify(parseString);

const config = {
  host: "192.168.1.186",
  username: "admin",
  password: "NascarApollo1788!",
};

// Helper function to make HTTP requests
async function makeRequest(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${config.username}:${config.password}`).toString("base64");

    const options = {
      hostname: config.host,
      port: 443,
      path: path,
      method: method,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "text/xml",
      },
      rejectUnauthorized: false, // Accept self-signed certificates
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

async function testHTTPAPI() {
  console.log("Cisco Device HTTP API Test");
  console.log("==========================");
  console.log(`Target: ${config.host}\n`);

  try {
    // Test 1: Check basic connectivity
    console.log("1️⃣  Testing basic HTTPS connectivity...");
    const basicTest = await makeRequest("/");
    console.log(`   ✅ Connected! Redirected to: ${basicTest.headers.location}\n`);

    // Test 2: Get device status via XML API
    console.log("2️⃣  Getting device status...");
    try {
      const statusXML = await makeRequest("/status.xml");
      console.log("   ✅ Retrieved status.xml successfully");

      // Parse XML to show some info
      const parsed = await parseXML(statusXML.data);
      console.log("   Device info preview:", JSON.stringify(parsed).substring(0, 200) + "...\n");
    } catch (error) {
      console.log(`   ❌ Failed to get status.xml: ${error.message}\n`);
    }

    // Test 3: Try getxml endpoint
    console.log("3️⃣  Testing getxml endpoint...");
    try {
      const getXML = await makeRequest("/getxml?location=/Status/SystemUnit");
      console.log("   ✅ Retrieved SystemUnit status");
      const parsed = await parseXML(getXML.data);
      console.log("   System info:", JSON.stringify(parsed, null, 2).substring(0, 300) + "...\n");
    } catch (error) {
      console.log(`   ❌ Failed to use getxml: ${error.message}\n`);
    }

    // Test 4: Check WebSocket configuration
    console.log("4️⃣  Checking WebSocket configuration...");
    try {
      const wsConfig = await makeRequest(
        "/getxml?location=/Configuration/NetworkServices/WebSocket",
      );
      console.log("   ✅ Retrieved WebSocket config");
      const parsed = await parseXML(wsConfig.data);
      console.log("   WebSocket config:", JSON.stringify(parsed, null, 2));

      // Also check HTTP mode
      const httpConfig = await makeRequest(
        "/getxml?location=/Configuration/NetworkServices/HTTP/Mode",
      );
      const httpParsed = await parseXML(httpConfig.data);
      console.log("   HTTP Mode:", JSON.stringify(httpParsed, null, 2) + "\n");
    } catch (error) {
      console.log(`   ❌ Could not check WebSocket config: ${error.message}\n`);
    }

    // Test 5: Try to execute a command via HTTP
    console.log("5️⃣  Testing command execution...");
    try {
      const commandXML = `
        <Command>
          <Audio>
            <Volume>
              <Get/>
            </Volume>
          </Audio>
        </Command>
      `;

      const cmdResult = await makeRequest("/putxml", "POST", commandXML);
      console.log("   ✅ Command executed successfully");
      const parsed = await parseXML(cmdResult.data);
      console.log("   Result:", JSON.stringify(parsed, null, 2) + "\n");
    } catch (error) {
      console.log(`   ❌ Command execution failed: ${error.message}\n`);
    }

    // Test 6: Alternative API endpoints
    console.log("6️⃣  Testing alternative API endpoints...");
    const endpoints = [
      "/api/v1/status",
      "/web/api/status",
      "/configuration.xml",
      "/valuespace.xml",
    ];

    for (const endpoint of endpoints) {
      try {
        await makeRequest(endpoint);
        console.log(`   ✅ ${endpoint} - Available`);
      } catch (error) {
        console.log(`   ❌ ${endpoint} - Not available (${error.message.split(":")[0]})`);
      }
    }

    console.log("\n📋 Summary:");
    console.log("- The device is reachable via HTTPS");
    console.log("- Check if WebSocket is enabled in the configuration");
    console.log("- If WebSocket is disabled, use HTTP API with /getxml and /putxml endpoints");
    console.log("- To enable WebSocket, you may need to configure:");
    console.log("  xConfiguration NetworkServices WebSocket: FollowHTTPService");
    console.log("  xConfiguration NetworkServices HTTP Mode: HTTPS");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
  }
}

// First install xml2js if not already installed
console.log("Installing xml2js for XML parsing...\n");
import { exec } from "child_process";
import { promisify as promisifyExec } from "util";
const execAsync = promisifyExec(exec);

async function runTest() {
  try {
    await execAsync(
      'cd "/Users/joshestrada/Desktop/React Projects/cisco-room-manager" && npm install xml2js',
    );
    console.log("✅ xml2js installed\n");
    await testHTTPAPI();
  } catch (error) {
    console.error("Failed to install dependencies:", error);
  }
}

runTest();
