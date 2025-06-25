/**
 * CA Certificates Management Section
 */

import React from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Chip,
  useDisclosure,
  Tooltip,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import { AddCertificateModal } from "./add-certificate-modal";
import { ViewCertificateModal } from "./view-certificate-modal";

import { getCACertificates, deleteCACertificate, type Certificate } from "@/lib/security";
import { useDeviceStore } from "@/stores/device-store";

export default function CACertificatesSection() {
  const { isProvisioning } = useDeviceStore();
  const [certificates, setCertificates] = React.useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = React.useState<Certificate | null>(null);
  const [deletingFingerprint, setDeletingFingerprint] = React.useState<string | null>(null);

  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onOpenChange: onViewOpenChange,
  } = useDisclosure();

  const loadCertificates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getCACertificates();

      setCertificates(result.certificates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load certificates");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadCertificates();
  }, []);

  const handleDelete = async (fingerprint: string) => {
    setDeletingFingerprint(fingerprint);
    try {
      await deleteCACertificate(fingerprint);
      await loadCertificates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete certificate");
    } finally {
      setDeletingFingerprint(null);
    }
  };

  const handleView = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    onViewOpen();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString();
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

  const getExpiryStatus = (notAfter: string) => {
    if (isExpired(notAfter)) return "danger";

    const daysUntilExpiry = Math.ceil(
      (new Date(notAfter).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilExpiry < 30) return "warning";

    return "success";
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center p-8">
          <Spinner size="sm" />
          <p className="text-xs text-default-500 mt-2">Loading certificates...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-1 pt-2 px-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon icon="solar:diploma-verified-outline" width={16} />
            <h4 className="text-xs font-medium">CA Certificates</h4>
          </div>
          <Button
            isDisabled={isProvisioning}
            size="sm"
            startContent={<Icon icon="solar:add-circle-outline" width={14} />}
            variant="flat"
            onPress={onAddOpen}
          >
            Add Certificate
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="pt-1 pb-3 px-3 gap-3">
          {error && <div className="text-danger text-xs p-2 bg-danger-50 rounded">{error}</div>}

          {certificates.length === 0 ? (
            <div className="text-center py-4 text-xs text-default-500">
              No CA certificates found on this device
            </div>
          ) : (
            <div className="grid gap-2">
              {certificates.map((cert) => (
                <div
                  key={cert.fingerprint}
                  className="flex items-center justify-between p-2 rounded-lg bg-default-50 dark:bg-default-50/10"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium truncate">{cert.subject}</p>
                      <Chip color={getExpiryStatus(cert.notAfter)} size="sm" variant="flat">
                        {isExpired(cert.notAfter) ? "Expired" : "Valid"}
                      </Chip>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-default-500">Issuer: {cert.issuer}</p>
                      <p className="text-xs text-default-500">
                        Expires: {formatDate(cert.notAfter)}
                      </p>
                    </div>
                    <p className="text-xs text-default-400 font-mono mt-1">
                      Fingerprint: {cert.fingerprint}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    <Tooltip content="View details">
                      <Button isIconOnly size="sm" variant="light" onPress={() => handleView(cert)}>
                        <Icon icon="solar:eye-outline" width={14} />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete certificate">
                      <Button
                        isIconOnly
                        color="danger"
                        isDisabled={deletingFingerprint === cert.fingerprint}
                        size="sm"
                        variant="light"
                        onPress={() => handleDelete(cert.fingerprint)}
                      >
                        {deletingFingerprint === cert.fingerprint ? (
                          <Spinner size="sm" />
                        ) : (
                          <Icon icon="solar:trash-bin-trash-outline" width={14} />
                        )}
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <AddCertificateModal
        isOpen={isAddOpen}
        onOpenChange={onAddOpenChange}
        onSuccess={loadCertificates}
      />

      {selectedCertificate && (
        <ViewCertificateModal
          certificate={selectedCertificate}
          isOpen={isViewOpen}
          onOpenChange={onViewOpenChange}
        />
      )}
    </>
  );
}
