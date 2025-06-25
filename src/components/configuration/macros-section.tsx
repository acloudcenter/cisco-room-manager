import type { ConnectedDevice } from "@/stores/device-store";
import type { Macro } from "@/lib/macros";

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
  Input,
  Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import { getMacroList, getMacro, saveMacro, toggleMacroStatus, removeMacro } from "@/lib/macros";

interface MacrosSectionProps {
  device: ConnectedDevice;
}

export const MacrosSection: React.FC<MacrosSectionProps> = ({ device }) => {
  const [macros, setMacros] = useState<Macro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMacro, setSelectedMacro] = useState<Macro | null>(null);
  const [macroContent, setMacroContent] = useState("");
  const [newMacroName, setNewMacroName] = useState("");
  const [newMacroContent, setNewMacroContent] = useState("");
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
    fetchMacros();
  }, [device.id]);

  const fetchMacros = async () => {
    setLoading(true);
    setError(null);

    try {
      const macroList = await getMacroList();

      setMacros(macroList);
    } catch (error) {
      console.error("Error fetching macros:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch macros");
      setMacros([]);
    } finally {
      setLoading(false);
    }
  };

  const viewMacro = async (macro: Macro) => {
    try {
      const macroDetails = await getMacro(macro.name);

      setMacroContent(macroDetails.content);
      setSelectedMacro(macro);
      onViewOpen();
    } catch (error) {
      console.error("Error fetching macro content:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch macro content");
    }
  };

  const resetUploadForm = () => {
    setNewMacroName("");
    setNewMacroContent("");
    setFileName("");
    setUploadError(null);
  };

  const processFile = (file: File) => {
    if (!file.name.match(/\.(js|javascript)$/i)) {
      setUploadError("Please select a valid JavaScript file (.js)");

      return;
    }

    setFileName(file.name);
    // Extract macro name from filename (remove .js extension)
    const macroName = file.name.replace(/\.js$/i, "");

    setNewMacroName(macroName);

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;

      setNewMacroContent(content);
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

  const uploadMacro = async () => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await saveMacro(newMacroName, newMacroContent, {
        overwrite: true,
        activate: true,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to save macro");
      }

      onUploadOpenChange();
      resetUploadForm();
      fetchMacros();
    } catch (error) {
      console.error("Error uploading macro:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to upload macro");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteMacro = async () => {
    if (!selectedMacro) return;

    try {
      const result = await removeMacro(selectedMacro.name);

      if (!result.success) {
        throw new Error(result.error || "Failed to remove macro");
      }

      onDeleteOpenChange();
      setSelectedMacro(null);
      fetchMacros();
    } catch (error) {
      console.error("Error deleting macro:", error);
      setError(error instanceof Error ? error.message : "Failed to delete macro");
    }
  };

  const handleToggleMacroStatus = async (macro: Macro) => {
    try {
      const result = await toggleMacroStatus(macro.name, macro.active);

      if (!result.success) {
        throw new Error(result.error || "Failed to toggle macro status");
      }

      fetchMacros();
    } catch (error) {
      console.error("Error toggling macro status:", error);
      setError(error instanceof Error ? error.message : "Failed to toggle macro status");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center p-8">
          <Spinner size="sm" />
          <p className="text-xs text-default-500 mt-2">Loading macros...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-1 pt-2 px-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon icon="solar:code-outline" width={16} />
            <h4 className="text-xs font-medium">Macros</h4>
          </div>
          <Button
            size="sm"
            startContent={<Icon icon="solar:add-circle-outline" width={14} />}
            variant="flat"
            onPress={onUploadOpen}
          >
            Upload Macro
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="pt-1 pb-3 px-3 gap-3">
          {error && <div className="text-danger text-xs p-2 bg-danger-50 rounded">{error}</div>}

          {macros.length === 0 ? (
            <div className="text-center py-4 text-xs text-default-500">
              No macros found on this device
            </div>
          ) : (
            <div className="grid gap-2">
              {macros.map((macro) => (
                <div
                  key={macro.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-default-50 dark:bg-default-50/10"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium truncate">{macro.name}</p>
                      <Chip color={macro.active ? "success" : "default"} size="sm" variant="flat">
                        {macro.active ? "Running" : "Stopped"}
                      </Chip>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Tooltip content={macro.active ? "Stop macro" : "Start macro"}>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleToggleMacroStatus(macro)}
                      >
                        <Icon
                          icon={macro.active ? "solar:pause-outline" : "solar:play-outline"}
                          width={14}
                        />
                      </Button>
                    </Tooltip>
                    <Tooltip content="View macro">
                      <Button isIconOnly size="sm" variant="light" onPress={() => viewMacro(macro)}>
                        <Icon icon="solar:eye-outline" width={14} />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete macro">
                      <Button
                        isIconOnly
                        color="danger"
                        size="sm"
                        variant="light"
                        onPress={() => {
                          setSelectedMacro(macro);
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

      {/* View Macro Modal */}
      <Modal isOpen={isViewOpen} scrollBehavior="inside" size="3xl" onOpenChange={onViewOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{selectedMacro?.name}</ModalHeader>
              <ModalBody>
                <Textarea
                  isReadOnly
                  classNames={{
                    base: "font-mono",
                    input: "text-xs",
                  }}
                  maxRows={30}
                  minRows={20}
                  value={macroContent}
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

      {/* Upload Macro Modal */}
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
                <h3 className="text-sm font-semibold">Upload New Macro</h3>
                <p className="text-xs text-default-500">Upload a JavaScript macro file</p>
              </ModalHeader>
              <ModalBody>
                <Tabs fullWidth aria-label="Upload method" size="sm">
                  <Tab key="file" title="Upload File">
                    <div className="space-y-3 py-2">
                      <input
                        ref={fileInputRef}
                        accept=".js,.javascript"
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
                              <p className="text-xs text-default-500 mt-1">Macro ready to upload</p>
                            </div>
                            <Button
                              size="sm"
                              variant="flat"
                              onPress={() => {
                                setNewMacroContent("");
                                setNewMacroName("");
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
                                Drop JavaScript file here or click to browse
                              </p>
                              <p className="text-xs text-default-500 mt-1">Supports .js files</p>
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

                      {newMacroName && (
                        <Input
                          description="Name will be used to identify the macro on the device"
                          label="Macro Name"
                          size="sm"
                          value={newMacroName}
                          onValueChange={setNewMacroName}
                        />
                      )}
                    </div>
                  </Tab>

                  <Tab key="paste" title="Paste Code">
                    <div className="space-y-3 py-2">
                      <Input
                        description="Name will be used to identify the macro on the device"
                        label="Macro Name"
                        placeholder="Enter macro name"
                        size="sm"
                        value={newMacroName}
                        onValueChange={setNewMacroName}
                      />
                      <Textarea
                        className="font-mono"
                        label="Macro Code"
                        maxRows={15}
                        minRows={10}
                        placeholder="Paste your JavaScript macro code here..."
                        size="sm"
                        value={newMacroContent}
                        variant="bordered"
                        onValueChange={setNewMacroContent}
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
                  isDisabled={!newMacroName || !newMacroContent || isUploading}
                  size="sm"
                  onPress={uploadMacro}
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <CircularProgress color="current" size="sm" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    "Upload & Activate"
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
              <ModalHeader className="flex flex-col gap-1">Delete Macro</ModalHeader>
              <ModalBody>
                Are you sure you want to delete the macro &quot;{selectedMacro?.name}&quot;? This
                action cannot be undone.
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={deleteMacro}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
