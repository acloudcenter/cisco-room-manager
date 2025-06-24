import type { Selection, SortDescriptor } from "@heroui/react";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import { columns, statusColorMap, INITIAL_VISIBLE_COLUMNS } from "./device-table-utils";
import { DeviceDrawer } from "./device-drawer";
import { DeviceTableTopContent } from "./device-table-top-content";
import { DeviceTableBottomContent } from "./device-table-bottom-content";

import { useDeviceStore, ConnectedDevice } from "@/stores/device-store";
import { ProvisioningFormData } from "@/components/provisioning";
import { applyTmsConfiguration, applyWebexConfiguration, clearToOffMode } from "@/lib/provisioning";

// Empty state component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <Icon className="text-default-300 mb-4" icon="solar:monitor-outline" width={64} />
    <h3 className="text-lg font-semibold text-default-600 mb-2">No Devices Connected</h3>
    <p className="text-default-400 text-center max-w-md mb-6">
      Connect to a Cisco room device to view status, configure settings, and manage provisioning.
      <br />
      <span className="text-sm">
        To get started, click the <strong>Add Device</strong> button in the top right.
      </span>
    </p>
    <Button
      color="primary"
      startContent={<Icon icon="solar:add-circle-outline" width={20} />}
      onPress={() => {
        // Trigger the connect modal from header
        const connectButton = document.querySelector("[data-connect-devices-button]");

        if (connectButton) {
          (connectButton as HTMLButtonElement).click();
        }
      }}
    >
      Add Device
    </Button>
  </div>
);

interface DeviceTableRowData {
  id: string;
  roomName: string;
  ipAddress: string;
  type: string;
  status: string;
  firmware: string;
  device: ConnectedDevice;
}

export default function DeviceTable() {
  const { devices, disconnectDevice } = useDeviceStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();

  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "roomName",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const [selectedDevice, setSelectedDevice] = React.useState<ConnectedDevice | null>(null);
  const [drawerAction, setDrawerAction] = React.useState<string>("");
  const [isProvisioningEditMode, setIsProvisioningEditMode] = React.useState(false);
  const [pendingDisconnect, setPendingDisconnect] = React.useState<{
    device?: ConnectedDevice;
    count?: number;
  } | null>(null);

  // Get devices from store
  const displayDevices = devices;

  // Get selected count
  const selectedCount = React.useMemo(() => {
    if (selectedKeys === "all") return displayDevices.length;

    return (selectedKeys as Set<React.Key>).size;
  }, [selectedKeys, displayDevices.length]);

  // Simple firmware version formatter - removes git hash
  const formatFirmware = (version: string) => {
    // Split by dot and take first 4 parts (ce11.29.1.5)
    const parts = version.split(".");

    if (parts.length > 4) {
      return parts.slice(0, 4).join(".").toUpperCase();
    }

    return version.toUpperCase();
  };

  // Transform devices into table row data
  const tableData: DeviceTableRowData[] = React.useMemo(() => {
    return displayDevices.map((device) => ({
      id: device.id,
      roomName: device.info.unitName || "Unknown Room",
      ipAddress: device.credentials.host,
      type: device.info.unitType || "Unknown Type",
      status: device.connectionState,
      firmware: formatFirmware(device.info.softwareVersion || "Unknown"),
      device,
    }));
  }, [displayDevices]);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredDevices = [...tableData];

    if (hasSearchFilter) {
      filteredDevices = filteredDevices.filter(
        (device) =>
          device.roomName.toLowerCase().includes(filterValue.toLowerCase()) ||
          device.ipAddress.toLowerCase().includes(filterValue.toLowerCase()) ||
          device.type.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    if (statusFilter !== "all") {
      filteredDevices = filteredDevices.filter((device) =>
        Array.from(statusFilter).includes(device.status),
      );
    }

    return filteredDevices;
  }, [tableData, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: DeviceTableRowData, b: DeviceTableRowData) => {
      const first = a[sortDescriptor.column as keyof DeviceTableRowData] as string;
      const second = b[sortDescriptor.column as keyof DeviceTableRowData] as string;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleAction = (device: ConnectedDevice, action: string) => {
    if (action === "disconnect") {
      // Handle disconnect with HeroUI modal
      setPendingDisconnect({ device });
      onConfirmOpen();

      return;
    }

    // For other actions, open the drawer
    setSelectedDevice(device);
    setDrawerAction(action);
    setIsProvisioningEditMode(false); // Always start in view mode
    onOpen();
  };

  const handleBulkAction = (action: string) => {
    // Handle bulk disconnect same as individual
    if (action === "disconnect") {
      setPendingDisconnect({ count: selectedCount });
      onConfirmOpen();

      return;
    }

    // For other actions, open the drawer
    if (displayDevices.length > 0) {
      setSelectedDevice(displayDevices[0]);
      setDrawerAction(`bulk-${action}`);
      onOpen();
    }
  };

  const handleProvisioningSubmit = async (formData: ProvisioningFormData) => {
    if (!selectedDevice) {
      return;
    }

    try {
      if (formData.mode === "TMS") {
        await applyTmsConfiguration(selectedDevice, formData);
      } else if (formData.mode === "Webex") {
        await applyWebexConfiguration(selectedDevice, formData);
      } else if (formData.mode === "Off") {
        await clearToOffMode(selectedDevice);
      } else {
        throw new Error(`Unsupported provisioning mode: ${formData.mode}`);
      }

      // Success - close drawer
      onClose();
    } catch {
      // Error handling - keep drawer open, error is shown via Zustand state
      // Note: Error is displayed in the form via Zustand provisioningError state
    }
  };

  const handleProvisioningCancel = () => {
    setIsProvisioningEditMode(false);
    onClose();
  };

  const handleProvisioningEdit = () => {
    setIsProvisioningEditMode(true);
  };

  const handleActionChange = (action: string) => {
    setDrawerAction(action);
    setIsProvisioningEditMode(false);
  };

  const renderCell = React.useCallback((device: DeviceTableRowData, columnKey: React.Key) => {
    const cellValue = device[columnKey as keyof DeviceTableRowData];

    switch (columnKey) {
      case "roomName":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{device.roomName}</p>
            <p className="text-bold text-tiny text-default-400">
              Connected {device.device.connectedAt.toLocaleTimeString()}
            </p>
          </div>
        );
      case "ipAddress":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small font-mono">{device.ipAddress}</p>
          </div>
        );
      case "type":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{device.type}</p>
          </div>
        );
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[device.status]}
            size="sm"
            variant="flat"
          >
            {device.status}
          </Chip>
        );
      case "firmware":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small font-mono">{device.firmware}</p>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-center items-center">
            <Button
              isIconOnly
              color="primary"
              size="sm"
              variant="flat"
              onPress={() => handleAction(device.device, "status")}
            >
              <Icon icon="solar:tuning-square-2-outline" width={18} />
            </Button>
          </div>
        );
      default:
        return String(cellValue);
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <DeviceTableTopContent
        deviceCount={displayDevices.length}
        filterValue={filterValue}
        rowsPerPage={rowsPerPage}
        selectedCount={selectedCount}
        statusFilter={statusFilter}
        visibleColumns={visibleColumns}
        onBulkAction={handleBulkAction}
        onFilterChange={onSearchChange}
        onFilterClear={onClear}
        onRowsPerPageChange={onRowsPerPageChange}
        onStatusFilterChange={setStatusFilter}
        onVisibleColumnsChange={setVisibleColumns}
      />
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    displayDevices.length,
    selectedCount,
    handleBulkAction,
    rowsPerPage,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <DeviceTableBottomContent
        filteredCount={filteredItems.length}
        page={page}
        pages={pages}
        selectedCount={selectedCount}
        selectedKeys={selectedKeys}
        onNextPage={onNextPage}
        onPageChange={setPage}
        onPreviousPage={onPreviousPage}
      />
    );
  }, [selectedKeys, selectedCount, filteredItems.length, page, pages, onPreviousPage, onNextPage]);

  return (
    <div className="w-full">
      <div className="w-full">
        <Table
          isHeaderSticky
          aria-label="Device management table"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          classNames={{
            wrapper: "max-h-[600px]",
          }}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          sortDescriptor={sortDescriptor}
          topContent={topContent}
          topContentPlacement="outside"
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={<EmptyState />} items={sortedItems}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Drawer component */}
      <DeviceDrawer
        drawerAction={drawerAction}
        drawerMode="overlay"
        isOpen={isOpen}
        isProvisioningEditMode={isProvisioningEditMode}
        selectedCount={selectedCount}
        selectedDevice={selectedDevice}
        onActionChange={handleActionChange}
        onClose={onClose}
        onProvisioningCancel={handleProvisioningCancel}
        onProvisioningEdit={handleProvisioningEdit}
        onProvisioningSubmit={handleProvisioningSubmit}
      />

      {/* Disconnect Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} placement="center" size="sm" onClose={onConfirmClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Icon className="text-warning" icon="solar:logout-2-outline" width={24} />
              <span>Confirm Disconnect</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-default-600">
              {pendingDisconnect?.device
                ? `Are you sure you want to disconnect from ${pendingDisconnect.device.info.unitName}?`
                : `Are you sure you want to disconnect from ${pendingDisconnect?.count || 0} device${
                    (pendingDisconnect?.count || 0) > 1 ? "s" : ""
                  }?`}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onConfirmClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={() => {
                disconnectDevice();
                setSelectedKeys(new Set([])); // Clear selection
                onConfirmClose();
                setPendingDisconnect(null);
              }}
            >
              Disconnect
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
