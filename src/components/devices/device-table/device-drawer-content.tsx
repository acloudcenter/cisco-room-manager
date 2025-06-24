import React from "react";
import { Icon } from "@iconify/react";

import { capitalize } from "./device-table-utils";

import { ConnectedDevice } from "@/stores/device-store";
import {
  ProvisioningForm,
  CurrentConfigDisplay,
  ProvisioningFormData,
} from "@/components/provisioning";
import { DeviceStatusDisplay } from "@/components/status";
import { BookingsDisplay } from "@/components/bookings";
import { ConfigurationDisplay } from "@/components/configuration";

interface DeviceDrawerContentProps {
  action: string;
  device: ConnectedDevice | null;
  isProvisioningEditMode: boolean;
  onProvisioningEdit: () => void;
  onProvisioningCancel: () => void;
  onProvisioningSubmit: (formData: ProvisioningFormData) => Promise<void>;
}

export const DeviceDrawerContent: React.FC<DeviceDrawerContentProps> = ({
  action,
  device,
  isProvisioningEditMode,
  onProvisioningEdit,
  onProvisioningCancel,
  onProvisioningSubmit,
}) => {
  if (!device) {
    return (
      <div className="flex flex-col gap-4">
        <div className="p-4 bg-default-100 rounded-lg">
          <p className="text-center text-default-600">No device selected</p>
        </div>
      </div>
    );
  }

  if (action === "provision") {
    return isProvisioningEditMode ? (
      <ProvisioningForm
        device={device}
        onCancel={onProvisioningCancel}
        onSubmit={onProvisioningSubmit}
      />
    ) : (
      <CurrentConfigDisplay device={device} onEdit={onProvisioningEdit} />
    );
  }

  if (action === "status") {
    return <DeviceStatusDisplay device={device} />;
  }

  if (action === "bookings") {
    return <BookingsDisplay device={device} />;
  }

  if (action === "configure") {
    return <ConfigurationDisplay device={device} />;
  }

  // Default content for unimplemented actions
  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-default-100 rounded-lg">
        <p className="text-center text-default-600">
          {action.startsWith("bulk-") ? (
            <>
              Bulk {capitalize(action.replace("bulk-", ""))} functionality will be implemented here.
            </>
          ) : (
            <>{capitalize(action)} functionality will be implemented here.</>
          )}
        </p>
        <div className="mt-4 flex justify-center">
          <Icon
            className="text-default-400"
            height={48}
            icon={
              action.startsWith("bulk-") ? "heroicons:squares-2x2" : "heroicons:wrench-screwdriver"
            }
            width={48}
          />
        </div>
      </div>
    </div>
  );
};
