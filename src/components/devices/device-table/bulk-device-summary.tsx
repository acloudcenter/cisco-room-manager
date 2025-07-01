import React from "react";
import { Card, Chip, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";

import { ConnectedDevice } from "@/stores/device-store";

interface BulkDeviceSummaryProps {
  selectedDevices: ConnectedDevice[];
  totalInPool?: number;
  currentPageStart?: number;
  currentPageEnd?: number;
}

export const BulkDeviceSummary: React.FC<BulkDeviceSummaryProps> = ({
  selectedDevices,
  totalInPool,
  currentPageStart = 1,
  currentPageEnd,
}) => {
  // Group devices by type
  const deviceTypeCount = selectedDevices.reduce(
    (acc, device) => {
      const type = device.info.productId || "Unknown";

      acc[type] = (acc[type] || 0) + 1;

      return acc;
    },
    {} as Record<string, number>,
  );

  // Calculate connection states
  const connectionStates = selectedDevices.reduce(
    (acc, device) => {
      if (device.connectionState === "connected") {
        acc.connected++;
      } else if (device.connectionState === "connecting") {
        acc.connecting++;
      } else {
        acc.disconnected++;
      }

      return acc;
    },
    { connected: 0, connecting: 0, disconnected: 0 },
  );

  const totalSelected = selectedDevices.length;
  const connectedPercentage = (connectionStates.connected / totalSelected) * 100;

  return (
    <div className="space-y-4">
      {/* Connection Limit Info */}
      {totalInPool && totalInPool > 10 && (
        <Card className="p-4 bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
          <div className="flex items-start gap-3">
            <Icon
              className="text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5"
              icon="solar:info-circle-bold"
              width={20}
            />
            <div className="text-sm">
              <p className="font-medium text-warning-800 dark:text-warning-300">
                Connection Limit: 10 devices at a time
              </p>
              <p className="text-warning-700 dark:text-warning-400 mt-1">
                Currently connected to devices {currentPageStart}-
                {currentPageEnd || currentPageStart + 9} of {totalInPool} total. Navigate pages to
                access other devices.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Selected Devices Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {totalSelected} {totalSelected === 1 ? "Device" : "Devices"} Selected
          </h3>
          <Chip
            color={connectedPercentage === 100 ? "success" : "warning"}
            size="sm"
            variant="flat"
          >
            {connectionStates.connected}/{totalSelected} Connected
          </Chip>
        </div>

        {/* Connection Progress */}
        <div className="mb-4">
          <Progress
            className="mb-2"
            color={connectedPercentage === 100 ? "success" : "warning"}
            size="sm"
            value={connectedPercentage}
          />
          <div className="flex justify-between text-xs text-default-500">
            <span>{connectionStates.connected} Connected</span>
            {connectionStates.connecting > 0 && (
              <span>{connectionStates.connecting} Connecting</span>
            )}
            {connectionStates.disconnected > 0 && (
              <span>{connectionStates.disconnected} Disconnected</span>
            )}
          </div>
        </div>

        {/* Device Types */}
        <div>
          <h4 className="text-sm font-medium mb-2">Device Types</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(deviceTypeCount).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between p-2 bg-default-100 dark:bg-default-50/10 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Icon className="text-default-600" icon={getDeviceIcon(type)} width={20} />
                  <span className="text-sm font-medium">{type}</span>
                </div>
                <Chip size="sm" variant="flat">
                  {count}
                </Chip>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Action Info */}
      <Card className="p-4 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <div className="flex items-start gap-3">
          <Icon
            className="text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5"
            icon="solar:bolt-circle-bold"
            width={20}
          />
          <div className="text-sm">
            <p className="font-medium text-primary-800 dark:text-primary-300">Bulk Actions</p>
            <p className="text-primary-700 dark:text-primary-400 mt-1">
              Actions will be applied to all {totalSelected} selected devices. Some features may not
              be available on all device types.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Helper function to get appropriate icon for device type
function getDeviceIcon(deviceType: string): string {
  const type = deviceType.toLowerCase();

  if (type.includes("desk") || type.includes("dx")) {
    return "solar:monitor-smartphone-outline";
  } else if (type.includes("board")) {
    return "solar:board-outline";
  } else if (type.includes("room")) {
    return "solar:tv-outline";
  } else if (type.includes("touch")) {
    return "solar:tablet-outline";
  }

  return "solar:devices-outline";
}
