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

interface Macro {
  name: string;
  active: boolean;
}

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
      const xapi = ciscoConnectionService.getConnector();

      if (!xapi) {
        throw new Error("No device connection");
      }

      // Get list of macros
      const macroList = await xapi.command("Macros Macro List");

      if (macroList?.Macro) {
        const macroArray = Array.isArray(macroList.Macro) ? macroList.Macro : [macroList.Macro];
        const macrosWithStatus = await Promise.all(
          macroArray.map(async (macro: any) => {
            try {
              const status = await xapi.status.get(`Macros Macro ${macro.Name} Status`);

              return {
                name: macro.Name,
                active: status === "Running",
              };
            } catch {
              return {
                name: macro.Name,
                active: false,
              };
            }
          }),
        );

        setMacros(macrosWithStatus);
      } else {
        setMacros([]);
      }
    } catch (error) {
      console.error("Error fetching macros:", error);
      setError("Failed to fetch macros");
      setMacros([]);
    } finally {
      setLoading(false);
    }
  };

  const viewMacro = async (macro: Macro) => {
    try {
      const xapi = ciscoConnectionService.getConnector();

      if (!xapi) {
        throw new Error("No device connection");
      }

      const result = await xapi.command("Macros Macro Get", { Name: macro.name });

      setMacroContent(result.Macro);
      setSelectedMacro(macro);
      onViewOpen();
    } catch (error) {
      console.error("Error fetching macro content:", error);
      setError("Failed to fetch macro content");
    }
  };

  const uploadMacro = async () => {
    try {
      const xapi = ciscoConnectionService.getConnector();

      if (!xapi) {
        throw new Error("No device connection");
      }

      await xapi.command("Macros Macro Save", {
        Name: newMacroName,
        Content: newMacroContent,
        Overwrite: "True",
      });

      // Activate the macro
      await xapi.command("Macros Macro Activate", { Name: newMacroName });

      onUploadOpenChange();
      setNewMacroName("");
      setNewMacroContent("");
      fetchMacros();
    } catch (error) {
      console.error("Error uploading macro:", error);
      setError("Failed to upload macro");
    }
  };

  const deleteMacro = async () => {
    if (!selectedMacro) return;

    try {
      const xapi = ciscoConnectionService.getConnector();

      if (!xapi) {
        throw new Error("No device connection");
      }

      await xapi.command("Macros Macro Remove", { Name: selectedMacro.name });

      onDeleteOpenChange();
      setSelectedMacro(null);
      fetchMacros();
    } catch (error) {
      console.error("Error deleting macro:", error);
      setError("Failed to delete macro");
    }
  };

  const toggleMacroStatus = async (macro: Macro) => {
    try {
      const xapi = ciscoConnectionService.getConnector();

      if (!xapi) {
        throw new Error("No device connection");
      }

      if (macro.active) {
        await xapi.command("Macros Macro Deactivate", { Name: macro.name });
      } else {
        await xapi.command("Macros Macro Activate", { Name: macro.name });
      }

      fetchMacros();
    } catch (error) {
      console.error("Error toggling macro status:", error);
      setError("Failed to toggle macro status");
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
                      onPress={() => toggleMacroStatus(macro)}
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
