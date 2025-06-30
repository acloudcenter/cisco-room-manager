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
  CircularProgress,
  Tabs,
  Tab,
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
  const [newExtensionContent, setNewExtensionContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      const xapi = getConnector(device);

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
      const xapi = getConnector(device);

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

  const resetUploadForm = () => {
    setNewExtensionContent("");
    setFileName("");
    setUploadError(null);
  };

  const processFile = (file: File) => {
    if (!file.name.match(/\.(json|xml)$/i)) {
      setUploadError("Please select a valid extension file (.json or .xml)");

      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;

      setNewExtensionContent(content);
      setUploadError(null);
    };
    reader.onerror = () => {
      setUploadError("Failed to read file");
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];

    if (file) processFile(file);
  };

  const uploadExtension = async () => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const xapi = getConnector(device);

      if (!xapi) {
        throw new Error("No device connection");
      }

      // Parse the extension content to validate it's valid JSON
      JSON.parse(newExtensionContent);

      await xapi.command("Extensions Install", {
        Data: newExtensionContent,
      });

      onUploadOpenChange();
      resetUploadForm();
      fetchExtensions();
    } catch (error) {
      console.error("Error uploading extension:", error);
      if (error instanceof SyntaxError) {
        setUploadError("Invalid JSON format for extension");
      } else {
        setUploadError(error instanceof Error ? error.message : "Failed to upload extension");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const deleteExtension = async () => {
    if (!selectedExtension) return;

    try {
      const xapi = getConnector(device);

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
          </div>
          <Button
            size="sm"
            startContent={<Icon icon="solar:add-circle-outline" width={14} />}
            variant="flat"
            onPress={onUploadOpen}
          >
            Upload Extension
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="pt-1 pb-3 px-3 gap-3">
          {error && <div className="text-danger text-xs p-2 bg-danger-50 rounded">{error}</div>}

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

      {/* Upload Extension Modal */}
      <Modal
        isOpen={isUploadOpen}
        size="3xl"
        onOpenChange={(open) => {
          if (!open && !isUploading) {
            onUploadOpenChange();
            resetUploadForm();
          }
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold">Upload New Extension</h3>
                <p className="text-xs text-default-500">Upload a UI extension configuration file</p>
              </ModalHeader>
              <ModalBody>
                <Tabs fullWidth aria-label="Upload method" size="sm">
                  <Tab key="file" title="Upload File">
                    <div className="space-y-3 py-2">
                      <input
                        ref={fileInputRef}
                        accept=".json,.xml"
                        className="hidden"
                        type="file"
                        onChange={handleFileSelect}
                      />

                      <div
                        className={`
                          border-2 border-dashed rounded-lg p-8 text-center transition-colors
                          ${isDragOver ? "border-primary bg-primary-50" : "border-default-300 bg-default-50"}
                          ${fileName ? "bg-success-50 border-success" : ""}
                        `}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        {fileName ? (
                          <div className="space-y-3">
                            <div className="flex justify-center">
                              <Icon
                                className="text-success"
                                icon="solar:check-circle-bold"
                                width={48}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{fileName}</p>
                              <p className="text-xs text-default-500 mt-1">
                                Extension ready to install
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="flat"
                              onPress={() => {
                                setNewExtensionContent("");
                                setFileName("");
                              }}
                            >
                              Choose Different File
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-center">
                              <Icon
                                className="text-default-300"
                                icon="solar:cloud-upload-outline"
                                width={48}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Drop extension file here or click to browse
                              </p>
                              <p className="text-xs text-default-500 mt-1">
                                Supports .json and .xml files
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="flat"
                              onPress={() => fileInputRef.current?.click()}
                            >
                              Browse Files
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Tab>

                  <Tab key="paste" title="Paste Configuration">
                    <div className="py-2">
                      <Textarea
                        className="font-mono"
                        label="Extension Configuration"
                        maxRows={15}
                        minRows={10}
                        placeholder='{\n  "id": "my.extension.id",\n  "name": "My Extension",\n  "version": "1.0.0",\n  ...\n}'
                        size="sm"
                        value={newExtensionContent}
                        variant="bordered"
                        onValueChange={setNewExtensionContent}
                      />
                    </div>
                  </Tab>
                </Tabs>

                {uploadError && (
                  <div className="text-danger text-xs p-2 bg-danger-50 rounded mt-2">
                    {uploadError}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button isDisabled={isUploading} size="sm" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isDisabled={!newExtensionContent || isUploading}
                  size="sm"
                  onPress={uploadExtension}
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <CircularProgress color="current" size="sm" />
                      <span>Installing...</span>
                    </div>
                  ) : (
                    "Install Extension"
                  )}
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
