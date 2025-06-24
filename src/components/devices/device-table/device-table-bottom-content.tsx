import type { Selection } from "@heroui/react";

import React from "react";
import { Pagination, Button } from "@heroui/react";

interface DeviceTableBottomContentProps {
  selectedKeys: Selection;
  selectedCount: number;
  filteredCount: number;
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export const DeviceTableBottomContent: React.FC<DeviceTableBottomContentProps> = ({
  selectedKeys,
  selectedCount,
  filteredCount,
  page,
  pages,
  onPageChange,
  onPreviousPage,
  onNextPage,
}) => {
  return (
    <div className="py-2 px-2 flex justify-between items-center">
      <span className="w-[30%] text-small text-default-400">
        {selectedKeys === "all"
          ? "All items selected"
          : `${selectedCount} of ${filteredCount} selected`}
      </span>
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={page}
        total={pages}
        onChange={onPageChange}
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
};
