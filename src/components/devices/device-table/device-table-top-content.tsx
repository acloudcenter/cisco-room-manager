import type { Selection } from "@heroui/react";

import React from "react";
import {
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";

import { SearchIcon, ChevronDownIcon } from "./device-table-icons";
import { capitalize, columns, statusOptions } from "./device-table-utils";

interface DeviceTableTopContentProps {
  filterValue: string;
  onFilterChange: (value?: string) => void;
  onFilterClear: () => void;
  selectedCount: number;
  onBulkAction: (action: string) => void;
  statusFilter: Selection;
  onStatusFilterChange: (keys: Selection) => void;
  visibleColumns: Selection;
  onVisibleColumnsChange: (keys: Selection) => void;
  deviceCount: number;
  rowsPerPage: number;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const DeviceTableTopContent: React.FC<DeviceTableTopContentProps> = ({
  filterValue,
  onFilterChange,
  onFilterClear,
  selectedCount,
  onBulkAction,
  statusFilter,
  onStatusFilterChange,
  visibleColumns,
  onVisibleColumnsChange,
  deviceCount,
  rowsPerPage,
  onRowsPerPageChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Search devices..."
          startContent={<SearchIcon />}
          value={filterValue}
          onClear={onFilterClear}
          onValueChange={onFilterChange}
        />
        <div className="flex gap-3 items-center">
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
              <DropdownItem key="bulk-monitor" onPress={() => onBulkAction("monitor")}>
                Monitor Selected
              </DropdownItem>
              <DropdownItem key="bulk-configure" onPress={() => onBulkAction("configure")}>
                Configure Selected
              </DropdownItem>
              <DropdownItem key="bulk-provision" onPress={() => onBulkAction("provision")}>
                Provision Selected
              </DropdownItem>
              <DropdownItem key="bulk-disconnect" onPress={() => onBulkAction("disconnect")}>
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
              onSelectionChange={onStatusFilterChange}
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
              onSelectionChange={onVisibleColumnsChange}
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
        <span className="text-default-400 text-xs">Total {deviceCount} devices</span>
        <label className="flex items-center text-default-400 text-xs">
          Rows per page:
          <select
            className="bg-transparent outline-none text-default-400 text-xs"
            value={rowsPerPage}
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
};
