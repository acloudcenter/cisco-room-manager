/**
 * CUCM Certificates (CTL/ITL) Management Section
 */

import React from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Chip,
  Spinner,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import {
  getCTLInfo,
  getITLInfo,
  deleteCUCMCertificates,
  type CTLInfo,
  type ITLInfo,
} from "@/lib/security";
import { useDeviceStore, type ConnectedDevice } from "@/stores/device-store";

interface CUCMCertificatesSectionProps {
  device?: ConnectedDevice;
}

export default function CUCMCertificatesSection({ device }: CUCMCertificatesSectionProps) {
  const { isProvisioning, getCurrentDevice } = useDeviceStore();
  const connectedDevice = device || getCurrentDevice();
  const [ctlInfo, setCtlInfo] = React.useState<CTLInfo | null>(null);
  const [itlInfo, setItlInfo] = React.useState<ITLInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  const loadCUCMInfo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [ctl, itl] = await Promise.all([
        getCTLInfo(connectedDevice),
        getITLInfo(connectedDevice),
      ]);

      setCtlInfo(ctl);
      setItlInfo(itl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load CUCM certificates");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (connectedDevice) {
      loadCUCMInfo();
    }
  }, [connectedDevice?.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCUCMCertificates(connectedDevice);
      await loadCUCMInfo();
      onDeleteOpenChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete CUCM certificates");
    } finally {
      setIsDeleting(false);
    }
  };

  const hasCUCMCertificates = ctlInfo || itlInfo;

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center p-8">
          <Spinner size="sm" />
          <p className="text-xs text-default-500 mt-2">Loading CUCM certificates...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-1 pt-2 px-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon icon="solar:key-outline" width={16} />
            <h4 className="text-xs font-medium">CUCM Certificates (CTL/ITL)</h4>
          </div>
          {hasCUCMCertificates && (
            <Button
              color="danger"
              isDisabled={isProvisioning}
              size="sm"
              startContent={<Icon icon="solar:trash-bin-trash-outline" width={14} />}
              variant="flat"
              onPress={onDeleteOpen}
            >
              Delete All
            </Button>
          )}
        </CardHeader>
        <Divider />
        <CardBody className="pt-1 pb-3 px-3 gap-3">
          {error && <div className="text-danger text-xs p-2 bg-danger-50 rounded">{error}</div>}

          {!hasCUCMCertificates ? (
            <div className="text-center py-4 text-xs text-default-500">
              No CUCM certificates found (device may not be registered to CUCM)
            </div>
          ) : (
            <div className="space-y-3">
              {/* CTL Info */}
              {ctlInfo && (
                <div className="p-3 rounded-lg bg-default-50 dark:bg-default-50/10">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-medium flex items-center gap-2">
                      <Icon icon="solar:document-text-outline" width={14} />
                      Certificate Trust List (CTL)
                    </h5>
                    <Chip color="primary" size="sm" variant="flat">
                      Active
                    </Chip>
                  </div>
                  <div className="space-y-1">
                    {ctlInfo.version && (
                      <p className="text-xs text-default-500">Version: {ctlInfo.version}</p>
                    )}
                    {ctlInfo.serialNumber && (
                      <p className="text-xs text-default-500">Serial: {ctlInfo.serialNumber}</p>
                    )}
                    {ctlInfo.issuer && (
                      <p className="text-xs text-default-500">Issuer: {ctlInfo.issuer}</p>
                    )}
                    {ctlInfo.certificates && ctlInfo.certificates.length > 0 && (
                      <p className="text-xs text-default-500">
                        Certificates: {ctlInfo.certificates.length}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ITL Info */}
              {itlInfo && (
                <div className="p-3 rounded-lg bg-default-50 dark:bg-default-50/10">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-medium flex items-center gap-2">
                      <Icon icon="solar:document-text-outline" width={14} />
                      Identity Trust List (ITL)
                    </h5>
                    <Chip color="primary" size="sm" variant="flat">
                      Active
                    </Chip>
                  </div>
                  <div className="space-y-1">
                    {itlInfo.version && (
                      <p className="text-xs text-default-500">Version: {itlInfo.version}</p>
                    )}
                    {itlInfo.serialNumber && (
                      <p className="text-xs text-default-500">Serial: {itlInfo.serialNumber}</p>
                    )}
                    {itlInfo.issuer && (
                      <p className="text-xs text-default-500">Issuer: {itlInfo.issuer}</p>
                    )}
                    {itlInfo.certificates && itlInfo.certificates.length > 0 && (
                      <p className="text-xs text-default-500">
                        Certificates: {itlInfo.certificates.length}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} size="sm" onOpenChange={onDeleteOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold">Delete CUCM Certificates</h3>
              </ModalHeader>
              <ModalBody>
                <p className="text-xs text-default-600">
                  This will delete both the Certificate Trust List (CTL) and Identity Trust List
                  (ITL) from this device. This action cannot be undone.
                </p>
                <p className="text-xs text-danger mt-2">
                  Warning: This may affect device registration with CUCM.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" isLoading={isDeleting} size="sm" onPress={handleDelete}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
