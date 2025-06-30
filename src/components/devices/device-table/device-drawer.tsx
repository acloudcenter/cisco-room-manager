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
  Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

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
  currentDeviceIndex: number;
  totalDevices: number;
  isProvisioningEditMode: boolean;
  onActionChange: (action: string) => void;
  onProvisioningEdit: () => void;
  onProvisioningCancel: () => void;
  onProvisioningSubmit: (formData: ProvisioningFormData) => Promise<void>;
  onNavigateDevice: (direction: "prev" | "next") => void;
}

export const DeviceDrawer: React.FC<DeviceDrawerProps> = ({
  isOpen,
  onClose,
  drawerAction,
  selectedDevice,
  selectedCount,
  currentDeviceIndex,
  totalDevices,
  isProvisioningEditMode,
  onActionChange,
  onProvisioningEdit,
  onProvisioningCancel,
  onProvisioningSubmit,
  onNavigateDevice,
}) => {
  const { viewMode, setViewMode } = useDeviceStore();
  const isBulkAction = drawerAction.startsWith("bulk-");
  const actionLabel = capitalize(drawerAction.replace("bulk-", ""));
  const showNavigation = !isBulkAction && totalDevices > 1;

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen || !showNavigation) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onNavigateDevice("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNavigateDevice("next");
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, showNavigation, onNavigateDevice]);

  // Device navigation component
  const DeviceNavigation = () => {
    if (!showNavigation) return null;

    return (
      <motion.div
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 ml-3 px-3 py-1 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg border-2 border-primary-200 dark:border-primary-700 shadow-sm"
        initial={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Tooltip content="Previous device (←)" delay={500}>
          <Button
            isIconOnly
            aria-label="Previous device"
            className="min-w-unit-8 h-unit-8 shadow-md"
            color="primary"
            size="sm"
            variant="solid"
            onPress={() => onNavigateDevice("prev")}
          >
            <Icon icon="solar:alt-arrow-left-bold" width={20} />
          </Button>
        </Tooltip>
        <div className="flex flex-col items-center px-3 min-w-[140px]">
          <span className="text-sm font-bold text-primary-700 dark:text-primary">
            Device {currentDeviceIndex + 1} of {totalDevices}
          </span>
          <span className="text-xs text-default-600 font-medium truncate max-w-[120px]">
            {selectedDevice?.info.unitName}
          </span>
        </div>
        <Tooltip content="Next device (→)" delay={500}>
          <Button
            isIconOnly
            aria-label="Next device"
            className="min-w-unit-8 h-unit-8 shadow-md"
            color="primary"
            size="sm"
            variant="solid"
            onPress={() => onNavigateDevice("next")}
          >
            <Icon icon="solar:alt-arrow-right-bold" width={20} />
          </Button>
        </Tooltip>
      </motion.div>
    );
  };

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
            <div className="flex items-center gap-2 flex-1">
              <h2 className="text-base font-semibold whitespace-nowrap">{actionLabel}</h2>
              {isBulkAction ? (
                <span className="text-xs text-default-500">{selectedCount} devices selected</span>
              ) : (
                <>
                  <DeviceNavigation />
                  {selectedDevice && (
                    <Tooltip content="Open device web interface" delay={500}>
                      <Button
                        isIconOnly
                        as="a"
                        className="ml-2"
                        href={`https://${selectedDevice.credentials.host}`}
                        rel="noopener noreferrer"
                        size="sm"
                        target="_blank"
                        variant="flat"
                      >
                        <Icon icon="heroicons:arrow-top-right-on-square-16-solid" width={16} />
                      </Button>
                    </Tooltip>
                  )}
                </>
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
            <div className="flex items-center gap-2 flex-1">
              <h2 className="text-base font-semibold whitespace-nowrap">{actionLabel}</h2>
              {isBulkAction ? (
                <span className="text-xs text-default-500">{selectedCount} devices selected</span>
              ) : (
                <>
                  <DeviceNavigation />
                  {selectedDevice && (
                    <Tooltip content="Open device web interface" delay={500}>
                      <Button
                        isIconOnly
                        as="a"
                        className="ml-2"
                        href={`https://${selectedDevice.credentials.host}`}
                        rel="noopener noreferrer"
                        size="sm"
                        target="_blank"
                        variant="flat"
                      >
                        <Icon icon="heroicons:arrow-top-right-on-square-16-solid" width={16} />
                      </Button>
                    </Tooltip>
                  )}
                </>
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
