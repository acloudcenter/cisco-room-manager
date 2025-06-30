/**
 * CA Certificate Management Functions
 */

import type { Certificate, CertificateList, CertificateFormat } from "./types";
import type { ConnectedDevice } from "@/stores/device-store";

import { getConnector } from "@/lib/utils/get-connector";

/**
 * Get all CA certificates
 */
export async function getCACertificates(
  device?: ConnectedDevice,
  format: CertificateFormat = "Text",
): Promise<CertificateList> {
  const connector = getConnector(device);

  try {
    const response = await connector.Command.Security.Certificates.CA.Show({
      Format: format,
    });

    // Parse the response to extract certificates
    const certificates: Certificate[] = [];

    // Check for Details array (Text format response)
    if (response?.Details) {
      const certs = Array.isArray(response.Details) ? response.Details : [response.Details];

      for (const cert of certs) {
        if (cert.Fingerprint) {
          certificates.push({
            fingerprint: cert.Fingerprint || "",
            subject: cert.SubjectName || "",
            issuer: cert.IssuerName || "",
            notBefore: cert.notBefore || "",
            notAfter: cert.notAfter || "",
            serialNumber: cert.SerialNumber,
            signatureAlgorithm: cert.SignatureAlgorithm || cert.HashingAlgorithm,
          });
        }
      }
    }

    return {
      certificates,
      totalCount: certificates.length,
    };
  } catch (error) {
    console.error("Failed to get CA certificates:", error);
    throw new Error("Failed to retrieve CA certificates");
  }
}

/**
 * Add a new CA certificate
 */
export async function addCACertificate(
  device?: ConnectedDevice,
  certificateContent?: string,
): Promise<void> {
  if (!certificateContent?.trim()) {
    throw new Error("Certificate content cannot be empty");
  }

  const connector = getConnector(device);

  try {
    // This is a multiline command that expects the certificate content
    // The certificate content should be passed as the body parameter
    await connector.Command.Security.Certificates.CA.Add({
      body: certificateContent,
    });
  } catch (error) {
    console.error("Failed to add CA certificate:", error);
    throw new Error("Failed to add CA certificate");
  }
}

/**
 * Delete a CA certificate by fingerprint
 */
export async function deleteCACertificate(
  device?: ConnectedDevice,
  fingerprint?: string,
): Promise<void> {
  if (!fingerprint) {
    throw new Error("Certificate fingerprint is required");
  }

  const connector = getConnector(device);

  try {
    await connector.Command.Security.Certificates.CA.Delete({
      Fingerprint: fingerprint,
    });
  } catch (error) {
    console.error("Failed to delete CA certificate:", error);
    throw new Error("Failed to delete CA certificate");
  }
}
