/**
 * Common utilities for test files
 * Provides error handling and connection helpers
 */

import { config } from "dotenv";

// Load environment variables
config();

export interface DeviceConfig {
  host: string;
  username: string;
  password: string;
}

/**
 * Get device configuration from environment variables
 */
export function getDeviceConfig(): DeviceConfig {
  const deviceConfig = {
    host: process.env.TSD_IPADDRESS || "",
    username: process.env.TSD_USERNAME || "",
    password: process.env.TSD_PASSWORD || "",
  };

  // Validate environment variables
  if (!deviceConfig.host || !deviceConfig.username || !deviceConfig.password) {
    console.error("\n❌ Missing required environment variables:");
    if (!deviceConfig.host) console.error("  - TSD_IPADDRESS");
    if (!deviceConfig.username) console.error("  - TSD_USERNAME");
    if (!deviceConfig.password) console.error("  - TSD_PASSWORD");
    console.error("\nPlease check your .env file contains all required variables.");
    console.error("Example .env file:");
    console.error("  TSD_IPADDRESS=192.168.1.100");
    console.error("  TSD_USERNAME=admin");
    console.error("  TSD_PASSWORD=your-device-password\n");
    process.exit(1);
  }

  return deviceConfig;
}

/**
 * Handle common connection errors with helpful messages
 */
export function handleConnectionError(error: any): void {
  console.error("\n❌ Connection failed!");

  // Check for specific error types
  if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
    console.error("\n🔐 Authentication Error (401 Unauthorized)");
    console.error("The username or password is incorrect.");
    console.error("\nTroubleshooting steps:");
    console.error("1. Check your .env file has the correct credentials");
    console.error("2. Verify the username has admin privileges on the device");
    console.error("3. Try logging into the device web interface with these credentials");
    console.error(
      `4. Current credentials: username='${process.env.TSD_USERNAME}', password='${process.env.TSD_PASSWORD?.replace(/./g, "*")}'`,
    );
  } else if (error.message?.includes("ECONNREFUSED")) {
    console.error("\n🔌 Connection Refused");
    console.error(`Could not connect to device at ${process.env.TSD_IPADDRESS}`);
    console.error("\nTroubleshooting steps:");
    console.error("1. Verify the device IP address is correct");
    console.error("2. Check the device is powered on and on the network");
    console.error(
      "3. Ensure WebSocket is enabled: Setup > NetworkServices > WebSocket = 'FollowHTTPService'",
    );
    console.error("4. Try pinging the device: ping " + process.env.TSD_IPADDRESS);
  } else if (error.message?.includes("EHOSTUNREACH") || error.message?.includes("ETIMEDOUT")) {
    console.error("\n🌐 Network Error");
    console.error(`Cannot reach device at ${process.env.TSD_IPADDRESS}`);
    console.error("\nTroubleshooting steps:");
    console.error("1. Check your network connection");
    console.error("2. Verify the device IP address is on the same network");
    console.error("3. Check for firewalls blocking the connection");
    console.error(
      "4. Try accessing the device web interface: https://" + process.env.TSD_IPADDRESS,
    );
  } else if (error.message?.includes("certificate") || error.message?.includes("self signed")) {
    console.error("\n🔒 Certificate Error");
    console.error("The device is using a self-signed certificate.");
    console.error("\nTroubleshooting steps:");
    console.error(
      "1. Open the device web interface in your browser: https://" + process.env.TSD_IPADDRESS,
    );
    console.error("2. Accept the self-signed certificate");
    console.error("3. Try running the test again");
  } else if (error.message?.includes("403") || error.message?.includes("Forbidden")) {
    console.error("\n🚫 Access Forbidden (403)");
    console.error("Authentication failed or access is denied.");
    console.error("\nThis usually means:");
    console.error("• Wrong username or password");
    console.error("• The user account is disabled or locked");
    console.error("• WebSocket access is restricted on the device");
    console.error("\nTroubleshooting steps:");
    console.error("1. Double-check your username and password in the .env file");
    console.error(
      "2. Try logging into the device web interface at https://" + process.env.TSD_IPADDRESS,
    );
    console.error("3. Ensure the user account is active and has admin privileges");
    console.error("4. Check if WebSocket is enabled: Setup > NetworkServices > WebSocket");
    console.error(
      `5. Current credentials: username='${process.env.TSD_USERNAME}', password='${process.env.TSD_PASSWORD?.replace(/./g, "*")}'`,
    );
  } else if (error.message?.includes("Unexpected server response")) {
    console.error("\n🔒 Server Response Error");
    const statusMatch = error.message.match(/Unexpected server response: (\d+)/);
    const statusCode = statusMatch ? statusMatch[1] : "unknown";

    if (statusCode === "403") {
      console.error("Access Forbidden (403) - Authentication failed at server level");
      console.error("\nThis usually means:");
      console.error("• Wrong username or password");
      console.error("• The user account doesn't exist or is disabled");
      console.error("\nTroubleshooting steps:");
      console.error("1. Verify your credentials are correct in the .env file");
      console.error(
        "2. Try logging into the device web interface at https://" + process.env.TSD_IPADDRESS,
      );
      console.error("3. Check if the account is active and has proper permissions");
      console.error(
        `4. Current credentials: username='${process.env.TSD_USERNAME}', password='${process.env.TSD_PASSWORD?.replace(/./g, "*")}'`,
      );
    } else {
      console.error(`Server returned status code: ${statusCode}`);
      console.error("\nCheck the device web interface and logs for more information.");
    }
  } else if (error.message?.includes("WebSocket")) {
    console.error("\n🔧 WebSocket Error");
    console.error("WebSocket connection could not be established.");
    console.error("\nTroubleshooting steps:");
    console.error("1. Ensure WebSocket is enabled on the device:");
    console.error("   Setup > NetworkServices > WebSocket = 'FollowHTTPService'");
    console.error("2. Check if HTTP or HTTPS mode is enabled on the device");
    console.error("3. Restart the device if you just enabled WebSocket");
  } else {
    // Generic error handling
    console.error("\n⚠️  Unexpected Error");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);

    if (error.code) {
      console.error("Error code:", error.code);
    }

    if (error.statusCode || error.status) {
      console.error("HTTP Status:", error.statusCode || error.status);
    }

    console.error("\nFull error details:");
    console.error(error);
  }

  console.error("\n📋 Environment Configuration:");
  console.error(`  Device IP: ${process.env.TSD_IPADDRESS}`);
  console.error(`  Username: ${process.env.TSD_USERNAME}`);
  console.error(
    `  Password: ${process.env.TSD_PASSWORD ? "***" + process.env.TSD_PASSWORD.slice(-2) : "not set"}`,
  );

  console.error("\n💡 For more help, check the documentation at:");
  console.error("  - /docs/JSXAPI_REFERENCE.md");
  console.error("  - /tests/services/README.md\n");
}

/**
 * Log test section header
 */
export function logTestSection(title: string): void {
  console.log("\n" + "=".repeat(60));
  console.log(title);
  console.log("=".repeat(60) + "\n");
}

/**
 * Log test step
 */
export function logTestStep(step: number, description: string): void {
  console.log(`\n📍 Step ${step}: ${description}`);
}

/**
 * Log success message
 */
export function logSuccess(message: string): void {
  console.log(`✅ ${message}`);
}

/**
 * Log warning message
 */
export function logWarning(message: string): void {
  console.log(`⚠️  ${message}`);
}

/**
 * Log info message
 */
export function logInfo(message: string): void {
  console.log(`ℹ️  ${message}`);
}

/**
 * Format error for display
 */
export function formatError(error: any): string {
  if (error.message) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return JSON.stringify(error);
}
