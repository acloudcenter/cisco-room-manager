/**
 * CA Certificate Management Functions
 */

import type { Certificate, CertificateList, CertificateFormat } from "./types";

import { ciscoConnectionService } from "@/services/cisco-connection-service";

/**
 * Get all CA certificates
 */
export async function getCACertificates(
  format: CertificateFormat = "Text",
): Promise<CertificateList> {
  if (!ciscoConnectionService.isConnected()) {
    throw new Error("No active device connection");
  }

  try {
    const response = await ciscoConnectionService
      .getConnector()
      ?.Command.Security.Certificates.CA.Show({
        Format: format,
      });

    // Parse the response to extract certificates
    const certificates: Certificate[] = [];

    if (response?.Certificate) {
      const certs = Array.isArray(response.Certificate)
        ? response.Certificate
        : [response.Certificate];

      for (const cert of certs) {
        if (cert.Fingerprint) {
          certificates.push({
            fingerprint: cert.Fingerprint || "",
            subject: cert.Subject || "",
            issuer: cert.Issuer || "",
            notBefore: cert.NotBefore || "",
            notAfter: cert.NotAfter || "",
            serialNumber: cert.SerialNumber,
            signatureAlgorithm: cert.SignatureAlgorithm,
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
export async function addCACertificate(certificateContent: string): Promise<void> {
  if (!ciscoConnectionService.isConnected()) {
    throw new Error("No active device connection");
  }

  if (!certificateContent.trim()) {
    throw new Error("Certificate content cannot be empty");
  }

  try {
    // This is a multiline command that expects the certificate content
    // The certificate content should be passed as the body parameter
    await ciscoConnectionService.getConnector()?.Command.Security.Certificates.CA.Add({
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
export async function deleteCACertificate(fingerprint: string): Promise<void> {
  if (!ciscoConnectionService.isConnected()) {
    throw new Error("No active device connection");
  }

  if (!fingerprint) {
    throw new Error("Certificate fingerprint is required");
  }

  try {
    await ciscoConnectionService.getConnector()?.Command.Security.Certificates.CA.Delete({
      Fingerprint: fingerprint,
    });
  } catch (error) {
    console.error("Failed to delete CA certificate:", error);
    throw new Error("Failed to delete CA certificate");
  }
}
