/**
 * Current Configuration Display Component
 * Shows read-only view of device's current provisioning configuration
 */

import type { ConnectedDevice } from "@/stores/device-store";
import type { ProvisioningConfig, ProvisioningStatus } from "@/lib/provisioning";

import React from "react";
import { Button, Card, CardBody, CardHeader, Chip, Divider, CircularProgress } from "@heroui/react";
import { Icon } from "@iconify/react";

import { useDeviceStore } from "@/stores/device-store";
import { getCurrentProvisioningConfig, getProvisioningStatus } from "@/lib/provisioning";

interface CurrentConfigDisplayProps {
  device: ConnectedDevice;
  onEdit: () => void;
}

export default function CurrentConfigDisplay({ device, onEdit }: CurrentConfigDisplayProps) {
  const { isProvisioning, provisioningProgress } = useDeviceStore();
  const [config, setConfig] = React.useState<ProvisioningConfig | null>(null);
  const [status, setStatus] = React.useState<ProvisioningStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadCurrentConfig = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [currentConfig, provStatus] = await Promise.all([
        getCurrentProvisioningConfig(device),
        getProvisioningStatus(),
      ]);

      setConfig(currentConfig);
      setStatus(provStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to read configuration";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadCurrentConfig();
  }, [device]);

  if (isLoading) {
    return (
      <Card className="bg-default-50">
        <CardBody className="flex flex-row items-center gap-4 p-6">
          <CircularProgress size="md" />
          <div>
            <p className="text-sm font-medium">Reading Configuration...</p>
            <p className="text-xs text-default-500">
              {provisioningProgress || "Connecting to device..."}
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-danger-50 border-danger-200">
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <Icon
              className="text-danger-500 mt-0.5"
              icon="solar:danger-circle-outline"
              width={20}
            />
            <div className="flex flex-col">
              <p className="text-sm font-medium text-danger-700">Failed to Read Configuration</p>
              <p className="text-xs text-danger-600 mt-1">{error}</p>
              <Button
                className="mt-2 w-fit"
                color="danger"
                size="sm"
                variant="light"
                onPress={loadCurrentConfig}
              >
                Retry
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "Webex":
        return "success";
      case "TMS":
        return "primary";
      case "CUCM":
      case "Edge":
        return "warning";
      case "VCS":
        return "secondary";
      case "Off":
        return "default";
      case "Auto":
        return "primary";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Provisioned":
        return "success";
      case "Provisioning":
        return "primary";
      case "NeedConfig":
        return "warning";
      case "AuthenticationFailed":
      case "ConfigError":
      case "Failed":
        return "danger";
      case "Idle":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="text-primary" icon="solar:monitor-outline" width={24} />
          <div>
            <h3 className="text-lg font-semibold">Current Device Configuration</h3>
            <p className="text-sm text-default-500">{device?.info?.unitName || "Unknown Device"}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            isDisabled={isProvisioning}
            size="sm"
            startContent={<Icon icon="solar:refresh-outline" width={16} />}
            variant="light"
            onPress={loadCurrentConfig}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Configuration Display */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <h4 className="text-md font-medium">Provisioning Status</h4>
            <Chip color={getModeColor(config?.mode || "")} size="sm" variant="flat">
              {config?.mode || "Unknown"}
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          {/* Provisioning Status */}
          {status && (
            <>
              <div className="p-3 bg-default-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-default-700">Status</p>
                  <Chip color={getStatusColor(status.status)} size="sm" variant="flat">
                    {status.status}
                  </Chip>
                </div>
              </div>
              <Divider />
            </>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-default-500">Mode</p>
              <p className="font-medium">{config?.mode || "Not configured"}</p>
            </div>
            <div>
              <p className="text-default-500">Connectivity</p>
              <p className="font-medium">{config?.connectivity || "Not set"}</p>
            </div>
          </div>

          {/* TMS Configuration */}
          {config?.mode === "TMS" && (
            <>
              <Divider />
              <div className="space-y-3">
                <p className="text-sm font-medium text-default-700">TMS Configuration</p>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <p className="text-default-500">External Manager Address</p>
                    <p className="font-medium font-mono">
                      {config?.externalManager.address || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-default-500">Domain</p>
                    <p className="font-medium">{config?.externalManager.domain || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-default-500">Path</p>
                    <p className="font-medium font-mono">
                      {config?.externalManager.path || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-default-500">Protocol</p>
                    <p className="font-medium">{config?.externalManager.protocol || "HTTPS"}</p>
                  </div>
                  <div>
                    <p className="text-default-500">Login Name</p>
                    <p className="font-medium">{config?.loginName || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-default-500">Password</p>
                    <p className="font-medium">{config?.password ? "••••••••" : "Not set"}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Webex Configuration */}
          {config?.mode === "Webex" && (
            <>
              <Divider />
              <div className="space-y-3">
                <p className="text-sm font-medium text-default-700">Webex Configuration</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-default-500">TLS Verify</p>
                    <p className="font-medium">{config?.tlsVerify || "On"}</p>
                  </div>
                  <div>
                    <p className="text-default-500">Webex Edge</p>
                    <p className="font-medium">{config?.webexEdge || "Off"}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Off Mode */}
          {config?.mode === "Off" && (
            <>
              <Divider />
              <div className="p-3 bg-default-100 rounded-lg">
                <p className="text-sm text-default-600">
                  Provisioning is currently disabled. The device is not configured by any
                  provisioning system.
                </p>
              </div>
            </>
          )}

          {/* Action Button */}
          <Divider />
          <div className="flex justify-end">
            <Button
              color="primary"
              isDisabled={isProvisioning}
              startContent={<Icon icon="solar:settings-outline" width={20} />}
              onPress={onEdit}
            >
              Edit Configuration
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
