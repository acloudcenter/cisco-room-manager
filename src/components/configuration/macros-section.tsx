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

  const uploadMacro = async () => {
    try {
      const result = await saveMacro(newMacroName, newMacroContent, {
        overwrite: true,
        activate: true,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to save macro");
      }

      onUploadOpenChange();
      setNewMacroName("");
      setNewMacroContent("");
      fetchMacros();
    } catch (error) {
      console.error("Error uploading macro:", error);
      setError(error instanceof Error ? error.message : "Failed to upload macro");
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
            <Icon className="text-primary" icon="solar:code-file-bold-duotone" width="24" />
            <h4 className="text-lg font-semibold">Macros</h4>
          </div>
          <Button
            color="primary"
            size="sm"
            startContent={<Icon icon="solar:upload-bold-duotone" width="20" />}
            onPress={onUploadOpen}
          >
            Upload Macro
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="gap-3">
          {error && <div className="text-danger text-sm">{error}</div>}

          {macros.length === 0 ? (
            <div className="text-center py-8 text-default-500">No macros found on this device</div>
          ) : (
            <div className="grid gap-3">
              {macros.map((macro) => (
                <div
                  key={macro.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-50/10"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="text-primary" icon="solar:file-code-bold-duotone" width="20" />
                    <span className="font-medium">{macro.name}</span>
                    <Chip color={macro.active ? "success" : "default"} size="sm" variant="flat">
                      {macro.active ? "Running" : "Stopped"}
                    </Chip>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      title={macro.active ? "Stop macro" : "Start macro"}
                      variant="light"
                      onPress={() => handleToggleMacroStatus(macro)}
                    >
                      <Icon
                        icon={macro.active ? "solar:pause-bold" : "solar:play-bold"}
                        width="18"
                      />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      title="View macro"
                      variant="light"
                      onPress={() => viewMacro(macro)}
                    >
                      <Icon icon="solar:eye-bold" width="18" />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      size="sm"
                      title="Delete macro"
                      variant="light"
                      onPress={() => {
                        setSelectedMacro(macro);
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
      <Modal isOpen={isUploadOpen} size="3xl" onOpenChange={onUploadOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Upload New Macro</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block" htmlFor="macro-name">
                      Macro Name
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-lg bg-default-100 focus:bg-default-50 transition-colors"
                      id="macro-name"
                      placeholder="Enter macro name"
                      type="text"
                      value={newMacroName}
                      onChange={(e) => setNewMacroName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block" htmlFor="macro-content">
                      Macro Content
                    </label>
                    <Textarea
                      classNames={{
                        base: "font-mono",
                        input: "text-xs",
                      }}
                      id="macro-content"
                      maxRows={25}
                      minRows={15}
                      placeholder="Paste your macro code here..."
                      value={newMacroContent}
                      onChange={(e) => setNewMacroContent(e.target.value)}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isDisabled={!newMacroName || !newMacroContent}
                  onPress={uploadMacro}
                >
                  Upload & Activate
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
