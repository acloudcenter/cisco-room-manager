/**
 * Simple HTTP test to check Cisco device API
 */

import https from "https";

const config = {
  host: "192.168.1.186",
  username: "admin",
  password: "NascarApollo1788!",
};

// Make a simple HTTPS request
function httpsRequest(path) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${config.username}:${config.password}`).toString("base64");

    const options = {
      hostname: config.host,
      port: 443,
      path: path,
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      rejectUnauthorized: false,
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 500), // Limit output
        });
      });
    });

    req.on("error", reject);
    req.end();
  });
}

async function testDevice() {
  console.log("Testing Cisco Device API");
  console.log("========================\n");

  const endpoints = [
    "/",
    "/web",
    "/status.xml",
    "/getxml",
    "/getxml?location=/Status",
    "/putxml",
    "/ws", // WebSocket endpoint
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const result = await httpsRequest(endpoint);
      console.log(`  Status: ${result.status}`);
      if (result.status === 302) {
        console.log(`  Redirects to: ${result.headers.location}`);
      }
      if (result.data && result.status === 200) {
        console.log(`  Response preview: ${result.data.substring(0, 100)}...`);
      }
      console.log("");
    } catch (error) {
      console.log(`  Error: ${error.message}\n`);
    }
  }

  // Now test if we need to enable WebSocket
  console.log("\n📋 Next Steps:");
  console.log("1. If /ws returns 404, WebSocket needs to be enabled on the device");
  console.log("2. Connect to device web interface at https://192.168.1.186/web");
  console.log("3. Navigate to Setup > Configuration > NetworkServices");
  console.log('4. Set WebSocket to "FollowHTTPService"');
  console.log('5. Ensure HTTP Mode is set to "HTTPS" or "HTTP+HTTPS"');
}

testDevice();
