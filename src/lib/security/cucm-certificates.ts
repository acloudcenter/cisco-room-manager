/**
 * CUCM Certificate Management Functions (CTL/ITL)
 */

import type { CTLInfo, ITLInfo } from "./types";

import { ciscoConnectionService } from "@/services/cisco-connection-service";

/**
 * Get CTL (Certificate Trust List) information
 */
export async function getCTLInfo(): Promise<CTLInfo | null> {
  if (!ciscoConnectionService.isConnected()) {
    throw new Error("No active device connection");
  }

  try {
    const response = await ciscoConnectionService
      .getConnector()
      ?.Command.Security.Certificates.CUCM.CTL.Show();

    if (!response) {
      return null;
    }

    return {
      version: response.Version,
      serialNumber: response.SerialNumber,
      issuer: response.Issuer,
      certificates: response.Certificate
        ? (Array.isArray(response.Certificate) ? response.Certificate : [response.Certificate]).map(
            (cert: any) => ({
              fingerprint: cert.Fingerprint || "",
              subject: cert.Subject || "",
              issuer: cert.Issuer || "",
              notBefore: cert.NotBefore || "",
              notAfter: cert.NotAfter || "",
              serialNumber: cert.SerialNumber,
              signatureAlgorithm: cert.SignatureAlgorithm,
            }),
          )
        : [],
    };
  } catch (error) {
    console.error("Failed to get CTL info:", error);

    // CTL might not exist on non-CUCM registered devices
    return null;
  }
}

/**
 * Get ITL (Identity Trust List) information
 */
export async function getITLInfo(): Promise<ITLInfo | null> {
  if (!ciscoConnectionService.isConnected()) {
    throw new Error("No active device connection");
  }

  try {
    const response = await ciscoConnectionService
      .getConnector()
      ?.Command.Security.Certificates.CUCM.ITL.Show();

    if (!response) {
      return null;
    }

    return {
      version: response.Version,
      serialNumber: response.SerialNumber,
      issuer: response.Issuer,
      certificates: response.Certificate
        ? (Array.isArray(response.Certificate) ? response.Certificate : [response.Certificate]).map(
            (cert: any) => ({
              fingerprint: cert.Fingerprint || "",
              subject: cert.Subject || "",
              issuer: cert.Issuer || "",
              notBefore: cert.NotBefore || "",
              notAfter: cert.NotAfter || "",
              serialNumber: cert.SerialNumber,
              signatureAlgorithm: cert.SignatureAlgorithm,
            }),
          )
        : [],
    };
  } catch (error) {
    console.error("Failed to get ITL info:", error);

    // ITL might not exist on non-CUCM registered devices
    return null;
  }
}

/**
 * Delete CTL and ITL from device
 */
export async function deleteCUCMCertificates(): Promise<void> {
  if (!ciscoConnectionService.isConnected()) {
    throw new Error("No active device connection");
  }

  try {
    await ciscoConnectionService.getConnector()?.Command.Security.Certificates.CUCM.CTL.Delete();
  } catch (error) {
    console.error("Failed to delete CUCM certificates:", error);
    throw new Error("Failed to delete CUCM certificates (CTL/ITL)");
  }
}
