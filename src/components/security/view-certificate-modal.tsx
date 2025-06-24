/**
 * View Certificate Details Modal
 */

import type { Certificate } from "@/lib/security";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
} from "@heroui/react";

interface ViewCertificateModalProps {
  certificate: Certificate;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewCertificateModal({
  certificate,
  isOpen,
  onOpenChange,
}: ViewCertificateModalProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const isExpired = (notAfter: string) => {
    if (!notAfter) return false;
    try {
      return new Date(notAfter) < new Date();
    } catch {
      return false;
    }
  };

  const getDaysUntilExpiry = (notAfter: string) => {
    if (!notAfter) return null;
    try {
      const days = Math.ceil((new Date(notAfter).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      return days;
    } catch {
      return null;
    }
  };

  const getExpiryStatus = () => {
    if (isExpired(certificate.notAfter)) return "danger";
    const days = getDaysUntilExpiry(certificate.notAfter);

    if (days && days < 30) return "warning";

    return "success";
  };

  const getExpiryText = () => {
    if (isExpired(certificate.notAfter)) return "Expired";
    const days = getDaysUntilExpiry(certificate.notAfter);

    if (days === null) return "Valid";
    if (days === 0) return "Expires today";
    if (days === 1) return "Expires tomorrow";
    if (days < 30) return `Expires in ${days} days`;

    return "Valid";
  };

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="py-2 border-b border-default-200 last:border-b-0">
      <p className="text-xs text-default-500 mb-1">{label}</p>
      <p className="text-xs font-medium break-all">{value}</p>
    </div>
  );

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="2xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Certificate Details</h3>
              <Chip color={getExpiryStatus()} size="sm" variant="flat">
                {getExpiryText()}
              </Chip>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-0">
                <DetailRow label="Subject" value={certificate.subject} />
                <DetailRow label="Issuer" value={certificate.issuer} />
                <DetailRow label="Valid From" value={formatDate(certificate.notBefore)} />
                <DetailRow label="Valid Until" value={formatDate(certificate.notAfter)} />
                {certificate.serialNumber && (
                  <DetailRow label="Serial Number" value={certificate.serialNumber} />
                )}
                {certificate.signatureAlgorithm && (
                  <DetailRow label="Signature Algorithm" value={certificate.signatureAlgorithm} />
                )}
                <DetailRow label="SHA-256 Fingerprint" value={certificate.fingerprint} />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button size="sm" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
