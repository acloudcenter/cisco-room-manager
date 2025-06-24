/**
 * Test script for certificate management
 * Tests listing, adding, and deleting CA certificates
 */

import { config } from "dotenv";
import { join } from "path";
import { readFileSync } from "fs";
import {
  getCACertificates,
  addCACertificate,
  deleteCACertificate,
  getCTLInfo,
  getITLInfo,
} from "../../../src/lib/security";
import { connectToDevice } from "../../../src/lib/device-connection";

// Load environment variables
config({ path: join(process.cwd(), ".env") });

const TEST_DEVICE = {
  host: process.env.TSD_IPADDRESS || "192.168.1.186",
  username: process.env.TSD_USERNAME || "admin",
  password: process.env.TSD_PASSWORD || "",
};

// Sample test certificate (this is a dummy certificate for testing)
const TEST_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIDQTCCAimgAwIBAgITBmyfz5m/jAo54vB4ikPmljZbyjANBgkqhkiG9w0BAQsF
ADA5MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6
b24gUm9vdCBDQSAxMB4XDTE1MDUyNjAwMDAwMFoXDTM4MDExNzAwMDAwMFowOTEL
MAkGA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJv
b3QgQ0EgMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ4gHHKeNXj
ca9HgFB0fW7Y14h29Jlo91ghYPl0hAEvrAIthtOgQ3pOsqTQNroBvo3bSMgHFzZM
9O6II8c+6zf1tRn4SWiw3te5djgdYZ6k/oI2peVKVuRF4fn9tBb6dNqcmzU5L/qw
IFAGbHrQgLKm+a/sRxmPUDgH3KKHOVj4utWp+UhnMJbulHheb4mjUcAwhmahRWa6
VOujw5H5SNz/0egwLX0tdHA114gk957EWW67c4cX8jJGKLhD+rcdqsq08p8kDi1L
93FcXmn/6pUCyziKrlA4b9v7LWIbxcceVOF34GfID5yHI9Y/QCB/IIDEgEw+OyQm
jgSubJrIqg0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMC
AYYwHQYDVR0OBBYEFIQYzIU07LwMlJQuCFmcx7IQTgoIMA0GCSqGSIb3DQEBCwUA
A4IBAQCY8jdaQZChGsV2USggNiMOruYou6r4lK5IpDB/G/wkjUu0yKGX9rbxenDI
U5PMCCjjmCXPI6T53iHTfIUJrU6adTrCC2qJeHZERxhlbI1Bjjt/msv0tadQ1wUs
N+gDS63pYaACbvXy8MWy7Vu33PqUXHeeE6V/Uq2V8viTO96LXFvKWlJbYK8U90vv
o/ufQJVtMVT8QtPHRh8jrdkPSHCa2XV4cdFyQzR1bldZwgJcJmApzyMZFo6IQ6XU
5MsI+yMRQ+hDKXJioaldXgjUkK642M4UwtBV8ob2xJNDd2ZhwLnoQdeXeGADbkpy
rqXRfboQnoZsG4q5WTP468SQvvG5
-----END CERTIFICATE-----`;

async function testCertificateOperations() {
  console.log("🔒 Testing Certificate Operations");
  console.log("================================\n");

  try {
    // Step 1: Connect to device
    console.log("1️⃣ Connecting to device...");
    await connectToDevice(TEST_DEVICE);
    console.log("✅ Connected successfully\n");

    // Step 2: List existing CA certificates
    console.log("2️⃣ Listing CA certificates...");
    const initialCerts = await getCACertificates();
    console.log(`✅ Found ${initialCerts.totalCount} CA certificates`);

    if (initialCerts.certificates.length > 0) {
      console.log("\nExisting certificates:");
      initialCerts.certificates.forEach((cert, index) => {
        console.log(`  ${index + 1}. ${cert.subject}`);
        console.log(`     Issuer: ${cert.issuer}`);
        console.log(`     Expires: ${cert.notAfter}`);
        console.log(`     Fingerprint: ${cert.fingerprint.substring(0, 32)}...`);
      });
    }
    console.log();

    // Step 3: Test CTL/ITL info (may not exist on all devices)
    console.log("3️⃣ Checking CUCM certificates (CTL/ITL)...");
    try {
      const ctlInfo = await getCTLInfo();
      const itlInfo = await getITLInfo();

      if (ctlInfo) {
        console.log("✅ CTL found:");
        console.log(`   Version: ${ctlInfo.version || "N/A"}`);
        console.log(`   Certificates: ${ctlInfo.certificates?.length || 0}`);
      } else {
        console.log("ℹ️  No CTL found (device may not be CUCM registered)");
      }

      if (itlInfo) {
        console.log("✅ ITL found:");
        console.log(`   Version: ${itlInfo.version || "N/A"}`);
        console.log(`   Certificates: ${itlInfo.certificates?.length || 0}`);
      } else {
        console.log("ℹ️  No ITL found (device may not be CUCM registered)");
      }
    } catch (error) {
      console.log("ℹ️  CUCM certificates not available on this device");
    }
    console.log();

    // Step 4: Add a test certificate
    console.log("4️⃣ Adding test certificate...");
    console.log("   ⚠️  Note: This test adds a real Amazon Root CA certificate");

    const userConfirm = await new Promise<string>((resolve) => {
      process.stdout.write("   Continue? (y/n): ");
      process.stdin.once("data", (data) => {
        resolve(data.toString().trim().toLowerCase());
      });
    });

    if (userConfirm === "y") {
      try {
        await addCACertificate(TEST_CERTIFICATE);
        console.log("✅ Certificate added successfully\n");

        // Step 5: List certificates again to verify
        console.log("5️⃣ Verifying certificate was added...");
        const updatedCerts = await getCACertificates();
        console.log(`✅ Now have ${updatedCerts.totalCount} CA certificates`);

        // Find the newly added certificate
        const amazonCert = updatedCerts.certificates.find((cert) =>
          cert.subject.includes("Amazon"),
        );

        if (amazonCert) {
          console.log("\n✅ Found the newly added certificate:");
          console.log(`   Subject: ${amazonCert.subject}`);
          console.log(`   Fingerprint: ${amazonCert.fingerprint}`);

          // Step 6: Delete the test certificate
          console.log("\n6️⃣ Cleaning up - deleting test certificate...");
          const deleteConfirm = await new Promise<string>((resolve) => {
            process.stdout.write("   Delete the test certificate? (y/n): ");
            process.stdin.once("data", (data) => {
              resolve(data.toString().trim().toLowerCase());
            });
          });

          if (deleteConfirm === "y") {
            await deleteCACertificate(amazonCert.fingerprint);
            console.log("✅ Certificate deleted successfully");
          } else {
            console.log("⚠️  Certificate left on device - remember to delete it manually!");
          }
        } else {
          console.log("⚠️  Could not find the added certificate in the list");
        }
      } catch (error) {
        console.error("❌ Failed to add certificate:", error);
      }
    } else {
      console.log("⏭️  Skipping certificate add/delete test");
    }

    console.log("\n✅ Certificate operations test completed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  } finally {
    process.exit(0);
  }
}

// Run the test
console.log("Certificate Management Test");
console.log("==========================");
console.log(`Target device: ${TEST_DEVICE.host}`);
console.log(`Username: ${TEST_DEVICE.username}`);
console.log();

testCertificateOperations();
