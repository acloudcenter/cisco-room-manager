import type { SVGProps } from "react";
import type { Selection, ChipProps, SortDescriptor } from "@heroui/react";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import { useDeviceStore, ConnectedDevice } from "@/stores/device-store";
import {
  ProvisioningForm,
  CurrentConfigDisplay,
  ProvisioningFormData,
} from "@/components/provisioning";
import { applyTmsConfiguration, clearToWebexMode } from "@/lib/provisioning";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export const SearchIcon = (props: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M22 22L20 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};

export const ChevronDownIcon = ({ strokeWidth = 1.5, ...otherProps }: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...otherProps}
    >
      <path
        d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

export const VerticalDotsIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size || height}
      role="presentation"
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
        fill="currentColor"
      />
    </svg>
  );
};

const columns = [
  { name: "ROOM NAME", uid: "roomName", sortable: true },
  { name: "IP ADDRESS", uid: "ipAddress", sortable: true },
  { name: "TYPE", uid: "type", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "FIRMWARE", uid: "firmware", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = [
  { name: "Connected", uid: "connected" },
  { name: "Disconnected", uid: "disconnected" },
  { name: "Error", uid: "error" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
  connected: "success",
  disconnected: "default",
  error: "danger",
  failed: "danger",
};

const INITIAL_VISIBLE_COLUMNS = ["roomName", "ipAddress", "type", "status", "firmware", "actions"];

// Empty state component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <Icon className="text-default-300 mb-4" icon="solar:monitor-outline" width={64} />
    <h3 className="text-lg font-semibold text-default-600 mb-2">No Devices Connected</h3>
    <p className="text-default-400 text-center max-w-md mb-6">
      Connect to a Cisco room device to monitor status, configure settings, and manage provisioning.
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

  const hasSelection = selectedCount > 0;

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
    if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
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
      console.error("No device selected for provisioning");

      return;
    }

    try {
      if (formData.mode === "TMS") {
        await applyTmsConfiguration(selectedDevice, formData);
      } else if (formData.mode === "Webex") {
        await clearToWebexMode(selectedDevice);
      } else {
        throw new Error(`Unsupported provisioning mode: ${formData.mode}`);
      }

      // Success - close drawer
      onClose();
    } catch (error) {
      // Error handling - keep drawer open, error is shown via Zustand state
      console.error("Provisioning failed:", error);
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
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <VerticalDotsIcon className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="monitor" onPress={() => handleAction(device.device, "monitor")}>
                  Monitor
                </DropdownItem>
                <DropdownItem
                  key="configure"
                  onPress={() => handleAction(device.device, "configure")}
                >
                  Configure
                </DropdownItem>
                <DropdownItem
                  key="provision"
                  onPress={() => handleAction(device.device, "provision")}
                >
                  Provision
                </DropdownItem>
                <DropdownItem
                  key="disconnect"
                  onPress={() => handleAction(device.device, "disconnect")}
                >
                  Disconnect
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
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
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search devices..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown isDisabled={selectedCount === 0}>
              <DropdownTrigger>
                <Button
                  color={selectedCount > 0 ? "primary" : "default"}
                  endContent={<ChevronDownIcon className="text-small" />}
                  isDisabled={selectedCount === 0}
                  variant={selectedCount > 0 ? "solid" : "flat"}
                >
                  Actions {selectedCount > 0 ? `(${selectedCount})` : ""}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Bulk Actions">
                <DropdownItem key="bulk-monitor" onPress={() => handleBulkAction("monitor")}>
                  Monitor Selected
                </DropdownItem>
                <DropdownItem key="bulk-configure" onPress={() => handleBulkAction("configure")}>
                  Configure Selected
                </DropdownItem>
                <DropdownItem key="bulk-provision" onPress={() => handleBulkAction("provision")}>
                  Provision Selected
                </DropdownItem>
                <DropdownItem key="bulk-disconnect" onPress={() => handleBulkAction("disconnect")}>
                  Disconnect Selected
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Status Filter"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {displayDevices.length} devices</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    displayDevices.length,
    hasSearchFilter,
    selectedCount,
    hasSelection,
    handleBulkAction,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedCount} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            Previous
          </Button>
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, filteredItems.length, page, pages, onPreviousPage, onNextPage]);

  return (
    <>
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

      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose}>
        <DrawerContent>
          <DrawerHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Icon className="text-primary" height={24} icon="heroicons:cog-6-tooth" width={24} />
              <h2 className="text-xl font-semibold">
                {capitalize(drawerAction.replace("bulk-", ""))} Device
                {drawerAction.startsWith("bulk-") ? "s" : ""}
              </h2>
            </div>
            {selectedDevice && (
              <p className="text-small text-default-500">
                {drawerAction.startsWith("bulk-")
                  ? `${selectedCount} devices selected`
                  : `${selectedDevice.info.unitName} (${selectedDevice.credentials.host})`}
              </p>
            )}
          </DrawerHeader>
          <DrawerBody>
            {drawerAction === "provision" && selectedDevice ? (
              isProvisioningEditMode ? (
                <ProvisioningForm
                  device={selectedDevice}
                  onCancel={handleProvisioningCancel}
                  onSubmit={handleProvisioningSubmit}
                />
              ) : (
                <CurrentConfigDisplay device={selectedDevice} onEdit={handleProvisioningEdit} />
              )
            ) : (
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-default-100 rounded-lg">
                  <p className="text-center text-default-600">
                    {drawerAction.startsWith("bulk-") ? (
                      <>
                        Bulk {capitalize(drawerAction.replace("bulk-", ""))} functionality will be
                        implemented here.
                      </>
                    ) : (
                      <>{capitalize(drawerAction)} functionality will be implemented here.</>
                    )}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <Icon
                      className="text-default-400"
                      height={48}
                      icon={
                        drawerAction.startsWith("bulk-")
                          ? "heroicons:squares-2x2"
                          : "heroicons:wrench-screwdriver"
                      }
                      width={48}
                    />
                  </div>
                </div>
              </div>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

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
    </>
  );
}
