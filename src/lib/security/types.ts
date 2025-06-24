/**
 * Security Certificate Types
 */

export interface Certificate {
  fingerprint: string;
  subject: string;
  issuer: string;
  notBefore: string;
  notAfter: string;
  serialNumber?: string;
  signatureAlgorithm?: string;
}

export interface CertificateList {
  certificates: Certificate[];
  totalCount: number;
}

export interface CTLInfo {
  version?: string;
  serialNumber?: string;
  issuer?: string;
  certificates?: Certificate[];
}

export interface ITLInfo {
  version?: string;
  serialNumber?: string;
  issuer?: string;
  certificates?: Certificate[];
}

export type CertificateFormat = "PEM" | "Text";
