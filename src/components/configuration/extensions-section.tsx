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
} from "@heroui/react";
import { Icon } from "@iconify/react";

import { ciscoConnectionService } from "@/services/cisco-connection-service";

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
  const [newExtensionContent, setNewExtensionContent] = useState("");

  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onOpenChange: onViewOpenChange,
  } = useDisclosure();
  const {
    isOpen: isUploadOpen,
    onOpen: onUploadOpen,
    onOpenChange: onUploadOpenChange,
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
      const xapi = ciscoConnectionService.getConnector();

      if (!xapi) {
        throw new Error("No device connection");
      }

      // Get list of extensions
      const extensionList = await xapi.command("Extensions List");

      if (extensionList?.Extension) {
        const extensionArray = Array.isArray(extensionList.Extension)
          ? extensionList.Extension
          : [extensionList.Extension];
        const extensionsData = extensionArray.map((ext: any) => ({
          id: ext.Id,
          name: ext.Name || ext.Id,
          version: ext.Version || "Unknown",
          status: ext.Status || "Active",
        }));

        setExtensions(extensionsData);
      } else {
        setExtensions([]);
      }
    } catch (error) {
      console.error("Error fetching extensions:", error);
      setError("Failed to fetch extensions");
      setExtensions([]);
    } finally {
      setLoading(false);
    }
  };

  const viewExtension = async (extension: Extension) => {
    try {
      const xapi = ciscoConnectionService.getConnector();

      if (!xapi) {
        throw new Error("No device connection");
      }

      const result = await xapi.command("Extensions Details", { Id: extension.id });

      setExtensionContent(JSON.stringify(result, null, 2));
      setSelectedExtension(extension);
      onViewOpen();
    } catch (error) {
      console.error("Error fetching extension details:", error);
      setError("Failed to fetch extension details");
    }
  };

  const uploadExtension = async () => {
    try {
      const xapi = ciscoConnectionService.getConnector();

      if (!xapi) {
        throw new Error("No device connection");
      }

      // Parse the extension content to validate it's valid JSON
      JSON.parse(newExtensionContent);

      await xapi.command("Extensions Install", {
        Data: newExtensionContent,
      });

      onUploadOpenChange();
      setNewExtensionContent("");
      fetchExtensions();
    } catch (error) {
      console.error("Error uploading extension:", error);
      if (error instanceof SyntaxError) {
        setError("Invalid JSON format for extension");
      } else {
        setError("Failed to upload extension");
      }
    }
  };

  const deleteExtension = async () => {
    if (!selectedExtension) return;

    try {
      const xapi = ciscoConnectionService.getConnector();

      if (!xapi) {
        throw new Error("No device connection");
      }

      await xapi.command("Extensions Uninstall", { Id: selectedExtension.id });

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
      <Card className="bg-background/70 backdrop-blur-md mt-4">
        <CardBody className="flex items-center justify-center h-32">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-background/70 backdrop-blur-md mt-4">
        <CardHeader className="justify-between">
          <div className="flex items-center gap-2">
            <Icon className="text-primary" icon="solar:widget-2-bold-duotone" width="24" />
            <h4 className="text-lg font-semibold">Extensions</h4>
          </div>
          <Button
            color="primary"
            size="sm"
            startContent={<Icon icon="solar:upload-bold-duotone" width="20" />}
            onPress={onUploadOpen}
          >
            Upload Extension
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="gap-3">
          {error && <div className="text-danger text-sm">{error}</div>}

          {extensions.length === 0 ? (
            <div className="text-center py-8 text-default-500">
              No extensions found on this device
            </div>
          ) : (
            <div className="grid gap-3">
              {extensions.map((extension) => (
                <div
                  key={extension.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-50/10"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="text-primary" icon="solar:widget-3-bold-duotone" width="20" />
                    <div>
                      <span className="font-medium">{extension.name}</span>
                      <span className="text-sm text-default-500 ml-2">v{extension.version}</span>
                    </div>
                    <Chip
                      color={extension.status === "Active" ? "success" : "default"}
                      size="sm"
                      variant="flat"
                    >
                      {extension.status}
                    </Chip>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      title="View extension details"
                      variant="light"
                      onPress={() => viewExtension(extension)}
                    >
                      <Icon icon="solar:eye-bold" width="18" />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      size="sm"
                      title="Uninstall extension"
                      variant="light"
                      onPress={() => {
                        setSelectedExtension(extension);
                        onDeleteOpen();
                      }}
                    >
                      <Icon icon="solar:trash-bin-trash-bold" width="18" />
                    </Button>
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

      {/* Upload Extension Modal */}
      <Modal isOpen={isUploadOpen} size="3xl" onOpenChange={onUploadOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Upload New Extension</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <div className="text-sm text-default-500">
                    Paste the extension JSON configuration below. The extension must be in the
                    proper format for your device.
                  </div>
                  <Textarea
                    classNames={{
                      base: "font-mono",
                      input: "text-xs",
                    }}
                    maxRows={25}
                    minRows={15}
                    placeholder='{\n  "id": "my.extension.id",\n  "name": "My Extension",\n  "version": "1.0.0",\n  ...\n}'
                    value={newExtensionContent}
                    onChange={(e) => setNewExtensionContent(e.target.value)}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" isDisabled={!newExtensionContent} onPress={uploadExtension}>
                  Install Extension
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
