import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface DeviceDrawerNavigationProps {
  currentAction: string;
  onActionChange: (action: string) => void;
  isBulkAction: boolean;
}

export const DeviceDrawerNavigation: React.FC<DeviceDrawerNavigationProps> = ({
  currentAction,
  onActionChange,
  isBulkAction,
}) => {
  if (isBulkAction) return null;

  const actions = [
    { key: "status", label: "Status", icon: "solar:chart-outline" },
    { key: "bookings", label: "Bookings", icon: "solar:calendar-outline" },
    { key: "configure", label: "Configure", icon: "solar:settings-outline" },
    { key: "provision", label: "Provision", icon: "solar:shield-check-outline" },
    { key: "security", label: "Security", icon: "solar:shield-keyhole-outline" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {actions.map((action) => (
        <Button
          key={action.key}
          color={currentAction === action.key ? "primary" : "default"}
          size="sm"
          startContent={<Icon icon={action.icon} width={16} />}
          variant={currentAction === action.key ? "solid" : "flat"}
          onPress={() => onActionChange(action.key)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};
