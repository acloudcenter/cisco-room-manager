/**
 * Simple test to list certificates without user interaction
 */

import { config } from "dotenv";
import { join } from "path";
import { getCACertificates, getCTLInfo, getITLInfo } from "../../../src/lib/security";
import { ciscoConnectionService } from "../../../src/services/cisco-connection-service";

// Load environment variables
config({ path: join(process.cwd(), ".env") });

const TEST_DEVICE = {
  host: process.env.TSD_IPADDRESS || "192.168.1.186",
  username: process.env.TSD_USERNAME || "admin",
  password: process.env.TSD_PASSWORD || "",
};

async function listCertificates() {
  console.log("🔒 Listing Device Certificates");
  console.log("================================\n");

  try {
    // Connect to device
    console.log("Connecting to device...");
    await ciscoConnectionService.connect(TEST_DEVICE);
    console.log("✅ Connected successfully\n");

    // List CA certificates
    console.log("📋 CA Certificates:");
    console.log("------------------");
    try {
      const certs = await getCACertificates();
      console.log(`Total: ${certs.totalCount} certificates\n`);

      if (certs.certificates.length > 0) {
        certs.certificates.forEach((cert, index) => {
          console.log(`Certificate ${index + 1}:`);
          console.log(`  Subject: ${cert.subject}`);
          console.log(`  Issuer: ${cert.issuer}`);
          console.log(`  Valid From: ${cert.notBefore}`);
          console.log(`  Valid Until: ${cert.notAfter}`);
          console.log(`  Fingerprint: ${cert.fingerprint}`);
          if (cert.serialNumber) {
            console.log(`  Serial: ${cert.serialNumber}`);
          }
          console.log();
        });
      } else {
        console.log("No CA certificates found on device.\n");
      }
    } catch (error) {
      console.error("Failed to get CA certificates:", error);
    }

    // Check CTL/ITL
    console.log("🔐 CUCM Certificates (CTL/ITL):");
    console.log("-------------------------------");
    try {
      const [ctlInfo, itlInfo] = await Promise.all([getCTLInfo(), getITLInfo()]);

      if (ctlInfo) {
        console.log("\nCTL (Certificate Trust List):");
        console.log(`  Version: ${ctlInfo.version || "N/A"}`);
        console.log(`  Serial: ${ctlInfo.serialNumber || "N/A"}`);
        console.log(`  Issuer: ${ctlInfo.issuer || "N/A"}`);
        console.log(`  Certificates: ${ctlInfo.certificates?.length || 0}`);
      } else {
        console.log("\nNo CTL found");
      }

      if (itlInfo) {
        console.log("\nITL (Identity Trust List):");
        console.log(`  Version: ${itlInfo.version || "N/A"}`);
        console.log(`  Serial: ${itlInfo.serialNumber || "N/A"}`);
        console.log(`  Issuer: ${itlInfo.issuer || "N/A"}`);
        console.log(`  Certificates: ${itlInfo.certificates?.length || 0}`);
      } else {
        console.log("\nNo ITL found");
      }
    } catch (error) {
      console.log("\nCUCM certificates not available (device may not be CUCM registered)");
    }

    console.log("\n✅ Certificate listing completed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  } finally {
    // Disconnect
    ciscoConnectionService.disconnect();
    process.exit(0);
  }
}

// Run the test
console.log(`Target device: ${TEST_DEVICE.host}`);
console.log(`Username: ${TEST_DEVICE.username}\n`);

listCertificates();
