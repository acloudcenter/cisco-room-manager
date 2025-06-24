import React from "react";
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import { Icon } from "@iconify/react";
// import { useNavigate } from "react-router-dom"; // Will use when full page view is implemented

import { capitalize } from "./device-table-utils";
import { DeviceDrawerNavigation } from "./device-drawer-navigation";
import { DeviceDrawerContent } from "./device-drawer-content";
import { ViewModeButtons } from "./view-mode-buttons";

import { ProvisioningFormData } from "@/components/provisioning";
import { ConnectedDevice, useDeviceStore } from "@/stores/device-store";

interface DeviceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  drawerMode: "overlay" | "push";
  drawerAction: string;
  selectedDevice: ConnectedDevice | null;
  selectedCount: number;
  isProvisioningEditMode: boolean;
  onActionChange: (action: string) => void;
  onProvisioningEdit: () => void;
  onProvisioningCancel: () => void;
  onProvisioningSubmit: (formData: ProvisioningFormData) => Promise<void>;
}

export const DeviceDrawer: React.FC<DeviceDrawerProps> = ({
  isOpen,
  onClose,
  drawerAction,
  selectedDevice,
  selectedCount,
  isProvisioningEditMode,
  onActionChange,
  onProvisioningEdit,
  onProvisioningCancel,
  onProvisioningSubmit,
}) => {
  // const navigate = useNavigate(); // Will use when full page view is implemented
  const { viewMode, setViewMode } = useDeviceStore();
  const isBulkAction = drawerAction.startsWith("bulk-");
  const actionLabel = capitalize(drawerAction.replace("bulk-", ""));

  // Debug logging removed for production

  // Handle full page navigation
  React.useEffect(() => {
    if (viewMode === "full" && isOpen && selectedDevice) {
      // For now, just show a message since we don't have the full page route yet
      alert("Full page view coming soon! This will open device details in a dedicated page.");
      // Reset to side view
      setViewMode("side");
    }
  }, [viewMode, isOpen, selectedDevice, drawerAction, setViewMode]);

  // Center peek - modal view
  if (viewMode === "center") {
    // Rendering center modal view
    return (
      <Modal
        classNames={{
          wrapper: "items-start pt-16",
        }}
        hideCloseButton={true}
        isDismissable={true}
        isOpen={isOpen}
        scrollBehavior="inside"
        size="5xl"
        onClose={onClose}
      >
        <ModalContent className="h-[85vh] max-h-[800px] min-h-[600px]">
          <ModalHeader className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold">
                {actionLabel} Device{isBulkAction ? "s" : ""}
              </h2>
              {selectedDevice && (
                <span className="text-xs text-default-500">
                  {isBulkAction
                    ? `${selectedCount} devices selected`
                    : `${selectedDevice.info.unitName}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ViewModeButtons currentMode={viewMode} onModeChange={setViewMode} />
              <Button isIconOnly size="sm" variant="light" onPress={onClose}>
                <Icon icon="solar:close-circle-linear" width={18} />
              </Button>
            </div>
          </ModalHeader>
          <ModalBody className="py-0 px-6 overflow-y-auto">
            <div className="flex flex-col gap-3 h-full">
              <DeviceDrawerNavigation
                currentAction={drawerAction}
                isBulkAction={isBulkAction}
                onActionChange={onActionChange}
              />
              {isBulkAction ? null : <Divider />}
              <DeviceDrawerContent
                action={drawerAction}
                device={selectedDevice}
                isProvisioningEditMode={isProvisioningEditMode}
                onProvisioningCancel={onProvisioningCancel}
                onProvisioningEdit={onProvisioningEdit}
                onProvisioningSubmit={onProvisioningSubmit}
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  // Side peek - drawer view (default)
  if (viewMode === "side") {
    // Rendering side drawer view
    return (
      <Drawer
        classNames={{
          base: "max-w-[700px]",
        }}
        hideCloseButton={true}
        isOpen={isOpen}
        placement="right"
        size="5xl"
        onClose={onClose}
      >
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold">
                {actionLabel} Device{isBulkAction ? "s" : ""}
              </h2>
              {selectedDevice && (
                <span className="text-xs text-default-500">
                  {isBulkAction
                    ? `${selectedCount} devices selected`
                    : `${selectedDevice.info.unitName}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ViewModeButtons currentMode={viewMode} onModeChange={setViewMode} />
              <Button isIconOnly size="sm" variant="light" onPress={onClose}>
                <Icon icon="solar:close-circle-linear" width={18} />
              </Button>
            </div>
          </DrawerHeader>
          <DrawerBody className="py-0 px-6">
            <div className="flex flex-col gap-3">
              <DeviceDrawerNavigation
                currentAction={drawerAction}
                isBulkAction={isBulkAction}
                onActionChange={onActionChange}
              />

              {isBulkAction ? null : <Divider />}

              <DeviceDrawerContent
                action={drawerAction}
                device={selectedDevice}
                isProvisioningEditMode={isProvisioningEditMode}
                onProvisioningCancel={onProvisioningCancel}
                onProvisioningEdit={onProvisioningEdit}
                onProvisioningSubmit={onProvisioningSubmit}
              />
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  return null;
};
