/**
 * Debug connection test - tries multiple connection methods
 */

import * as jsxapi from "jsxapi";
import https from "https";

const config = {
  host: "192.168.1.186",
  username: "admin",
  password: "NascarApollo1788!",
};

// Test 1: Check if the device is reachable via HTTPS
async function testHTTPS() {
  console.log("\n1️⃣ Testing HTTPS connectivity...");

  return new Promise((resolve) => {
    const options = {
      hostname: config.host,
      port: 443,
      path: "/",
      method: "GET",
      rejectUnauthorized: false, // Accept self-signed certificates
    };

    const req = https.request(options, (res) => {
      console.log(`   Status Code: ${res.statusCode}`);
      console.log(`   Headers:`, res.headers);
      resolve(true);
    });

    req.on("error", (e) => {
      console.error(`   ❌ HTTPS Error: ${e.message}`);
      resolve(false);
    });

    req.end();
  });
}

// Test 2: Try WebSocket connection with different paths
async function testWebSocket() {
  console.log("\n2️⃣ Testing WebSocket connections...");

  const paths = [
    "wss://" + config.host,
    "wss://" + config.host + "/ws",
    "wss://" + config.host + "/api/websocket",
    "ws://" + config.host, // Try non-secure as well
    "https://" + config.host, // Some devices might use HTTP adapter
  ];

  for (const path of paths) {
    console.log(`\n   Trying: ${path}`);
    try {
      const xapi = await jsxapi.connect(path, {
        username: config.username,
        password: config.password,
      });

      console.log(`   ✅ Connected successfully to ${path}!`);

      // Try to get some basic info
      try {
        const systemName = await xapi.Status.SystemUnit.get();
        console.log("   System info:", systemName);
      } catch (e) {
        console.log("   Could not get system info:", e.message);
      }

      xapi.close();
      return path;
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }

  return null;
}

// Test 3: Try HTTP/HTTPS API endpoints
async function testHTTPAPI() {
  console.log("\n3️⃣ Testing HTTP API endpoints...");

  const endpoints = [
    "/status.xml",
    "/getxml?location=/Status/SystemUnit",
    "/web/api/status",
    "/api/v1/status",
  ];

  for (const endpoint of endpoints) {
    console.log(`\n   Trying: https://${config.host}${endpoint}`);

    const auth = Buffer.from(`${config.username}:${config.password}`).toString("base64");

    await new Promise((resolve) => {
      const options = {
        hostname: config.host,
        port: 443,
        path: endpoint,
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
        },
        rejectUnauthorized: false,
      };

      const req = https.request(options, (res) => {
        console.log(`   Status: ${res.statusCode}`);

        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 200) {
            console.log(`   ✅ Success! Response preview:`, data.substring(0, 100) + "...");
          }
          resolve(true);
        });
      });

      req.on("error", (e) => {
        console.error(`   ❌ Error: ${e.message}`);
        resolve(false);
      });

      req.end();
    });
  }
}

// Main test runner
async function runTests() {
  console.log("Cisco Device Connection Debug");
  console.log("=============================");
  console.log(`Target: ${config.host}`);

  // Test HTTPS connectivity first
  await testHTTPS();

  // Test WebSocket connections
  const workingPath = await testWebSocket();

  if (workingPath) {
    console.log(`\n✅ Found working WebSocket path: ${workingPath}`);
  } else {
    console.log("\n⚠️  No working WebSocket path found");

    // Try HTTP API as fallback
    await testHTTPAPI();
  }

  console.log("\n📋 Recommendations:");
  console.log("1. Ensure the device has API access enabled");
  console.log("2. Check if the device requires specific ports or paths");
  console.log("3. Verify firewall settings allow WebSocket connections");
  console.log("4. Check device documentation for correct API endpoints");
}

// Run the tests
runTests().catch(console.error);
