import type { ConnectedDevice } from "@/stores/device-store";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import { getConnector } from "@/lib/utils/get-connector";

interface Extension {
  id: string;
  name: string;
  version: string;
  status: string;
}

interface ExtensionsSectionProps {
  device: ConnectedDevice;
}

export const ExtensionsSection: React.FC<ExtensionsSectionProps> = ({ device }) => {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null);
  const [extensionContent, setExtensionContent] = useState("");

  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onOpenChange: onViewOpenChange,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  useEffect(() => {
    fetchExtensions();
  }, [device.id]);

  const fetchExtensions = async () => {
    setLoading(true);
    setError(null);

    try {
      const xapi = getConnector(device);

      if (!xapi) {
        throw new Error("No device connection");
      }

      // Get list of UI extensions (panels, buttons, web apps)
      const extensionList = await xapi.command("UserInterface.Extensions.List");

      if (extensionList?.Extensions) {
        const extensionArray = Array.isArray(extensionList.Extensions)
          ? extensionList.Extensions
          : [extensionList.Extensions];
        const extensionsData = extensionArray.map((ext: any) => ({
          id: ext.PanelId || ext.Id,
          name: ext.Name || ext.PanelId || "Unnamed Extension",
          version: ext.Type || "Panel",
          status: "Active",
        }));

        setExtensions(extensionsData);
      } else {
        setExtensions([]);
      }
    } catch (error) {
      console.error("Error fetching extensions:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch extensions";

      setError(errorMessage);
      setExtensions([]);
    } finally {
      setLoading(false);
    }
  };

  const viewExtension = async (extension: Extension) => {
    // Since there's no Details command, show what we have
    const extensionInfo = {
      panelId: extension.id,
      name: extension.name,
      type: extension.version,
      status: extension.status,
    };

    setExtensionContent(JSON.stringify(extensionInfo, null, 2));
    setSelectedExtension(extension);
    onViewOpen();
  };

  const deleteExtension = async () => {
    if (!selectedExtension) return;

    try {
      const xapi = getConnector(device);

      if (!xapi) {
        throw new Error("No device connection");
      }

      await xapi.command("UserInterface.Extensions.Panel.Remove", {
        PanelId: selectedExtension.id,
      });

      onDeleteOpenChange();
      setSelectedExtension(null);
      fetchExtensions();
    } catch (error) {
      console.error("Error deleting extension:", error);
      setError("Failed to delete extension");
    }
  };

  if (loading) {
    return (
      <Card className="mt-4">
        <CardBody className="flex items-center justify-center p-8">
          <Spinner size="sm" />
          <p className="text-xs text-default-500 mt-2">Loading extensions...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-4">
        <CardHeader className="pb-1 pt-2 px-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon icon="solar:widget-2-outline" width={16} />
            <h4 className="text-xs font-medium">UI Extensions</h4>
            <span className="text-xs text-default-500">(Panels, Buttons, Web Apps)</span>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-1 pb-3 px-3 gap-3">
          {error && (
            <div className="text-danger text-xs p-2 bg-danger-50 rounded">
              <div className="font-medium">Error loading extensions:</div>
              <div className="mt-1">{error}</div>
              {error.includes("not connected") && (
                <div className="mt-2 text-default-600">
                  Please ensure the device is connected and try refreshing.
                </div>
              )}
            </div>
          )}

          {extensions.length === 0 ? (
            <div className="text-center py-4 text-xs text-default-500">
              No extensions found on this device
            </div>
          ) : (
            <div className="grid gap-2">
              {extensions.map((extension) => (
                <div
                  key={extension.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-default-50 dark:bg-default-50/10"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium truncate">{extension.name}</p>
                      <span className="text-xs text-default-500">v{extension.version}</span>
                      <Chip
                        color={extension.status === "Active" ? "success" : "default"}
                        size="sm"
                        variant="flat"
                      >
                        {extension.status}
                      </Chip>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Tooltip content="View details">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => viewExtension(extension)}
                      >
                        <Icon icon="solar:eye-outline" width={14} />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Uninstall extension">
                      <Button
                        isIconOnly
                        color="danger"
                        size="sm"
                        variant="light"
                        onPress={() => {
                          setSelectedExtension(extension);
                          onDeleteOpen();
                        }}
                      >
                        <Icon icon="solar:trash-bin-trash-outline" width={14} />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* View Extension Modal */}
      <Modal isOpen={isViewOpen} scrollBehavior="inside" size="3xl" onOpenChange={onViewOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedExtension?.name} Details
              </ModalHeader>
              <ModalBody>
                <Textarea
                  isReadOnly
                  classNames={{
                    base: "font-mono",
                    input: "text-xs",
                  }}
                  maxRows={30}
                  minRows={20}
                  value={extensionContent}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} size="sm" onOpenChange={onDeleteOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Uninstall Extension</ModalHeader>
              <ModalBody>
                Are you sure you want to uninstall the extension &quot;{selectedExtension?.name}
                &quot;? This action cannot be undone.
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={deleteExtension}>
                  Uninstall
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
