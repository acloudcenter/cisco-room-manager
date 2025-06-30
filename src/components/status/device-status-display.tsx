/**
 * Device Status Display Component
 * Shows comprehensive real-time device status data
 */

import type { ConnectedDevice } from "@/stores/device-store";
import type {
  SystemInfo,
  AudioStatus,
  VideoStatus,
  CallStatus,
  StandbyStatus,
  SipStatus,
} from "@/lib/device-status";
import type { ProvisioningStatus } from "@/lib/provisioning";

import React from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  CircularProgress,
  Progress,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import { useDeviceStore } from "@/stores/device-store";
import {
  getSystemInfo,
  getAudioStatus,
  getVideoStatus,
  getCallStatus,
  getStandbyStatus,
  getHealthStatus,
  getSipStatus,
} from "@/lib/device-status";
import { getProvisioningStatus } from "@/lib/provisioning";

interface DeviceStatusDisplayProps {
  device: ConnectedDevice;
}

interface DeviceStatusData {
  systemInfo: SystemInfo | null;
  audioStatus: AudioStatus | null;
  videoStatus: VideoStatus | null;
  callStatus: CallStatus | null;
  standbyStatus: StandbyStatus | null;
  healthStatus: any | null;
  provisioningStatus: ProvisioningStatus | null;
  sipStatus: SipStatus | null;
}

export default function DeviceStatusDisplay({ device }: DeviceStatusDisplayProps) {
  const { isProvisioning } = useDeviceStore();
  const [statusData, setStatusData] = React.useState<DeviceStatusData>({
    systemInfo: null,
    audioStatus: null,
    videoStatus: null,
    callStatus: null,
    standbyStatus: null,
    healthStatus: null,
    provisioningStatus: null,
    sipStatus: null,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadDeviceData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load all device status data
      const [
        systemInfo,
        audioStatus,
        videoStatus,
        callStatus,
        standbyStatus,
        healthStatus,
        provisioningStatus,
        sipStatus,
      ] = await Promise.all([
        getSystemInfo(device),
        getAudioStatus(device),
        getVideoStatus(device),
        getCallStatus(device),
        getStandbyStatus(device),
        getHealthStatus(device),
        getProvisioningStatus(device),
        getSipStatus(device),
      ]);

      setStatusData({
        systemInfo,
        audioStatus,
        videoStatus,
        callStatus,
        standbyStatus,
        healthStatus,
        provisioningStatus,
        sipStatus,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load device data";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadDeviceData();
  }, [device]);

  if (isLoading) {
    return (
      <Card className="bg-default-50">
        <CardBody className="flex flex-row items-center gap-3 p-4">
          <CircularProgress size="sm" />
          <div>
            <p className="text-xs font-medium">Loading Device Data...</p>
            <p className="text-xs text-default-500">Reading system information...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-danger-50 border-danger-200">
        <CardBody className="p-3">
          <div className="flex items-start gap-2">
            <Icon
              className="text-danger-500 mt-0.5"
              icon="solar:danger-circle-outline"
              width={16}
            />
            <div className="flex flex-col">
              <p className="text-xs font-medium text-danger-700">Failed to Load Device Data</p>
              <p className="text-xs text-danger-600 mt-1">{error}</p>
              <Button
                className="mt-2 w-fit"
                color="danger"
                size="sm"
                variant="light"
                onPress={loadDeviceData}
              >
                Retry
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  const getCallStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "connected":
        return "success";
      case "connecting":
      case "dialing":
        return "warning";
      case "disconnected":
      case "idle":
        return "default";
      default:
        return "default";
    }
  };

  const getStandbyColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case "standby":
        return "warning";
      case "off":
        return "success";
      case "halfwake":
        return "primary";
      default:
        return "default";
    }
  };

  const getProvisioningStatusColor = (status: string) => {
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

  const getSipStatusColor = (status: string) => {
    switch (status) {
      case "Registered":
        return "success";
      case "Registering":
        return "primary";
      case "Deregister":
        return "warning";
      case "Failed":
        return "danger";
      case "Inactive":
        return "default";
      default:
        return "default";
    }
  };

  // Status field component for consistent styling
  const StatusField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
      <p className="text-xs text-default-500">{label}</p>
      <p className="text-xs font-medium">{value}</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="text-primary" icon="solar:chart-outline" width={18} />
          <div>
            <h3 className="text-sm font-semibold">Device Status</h3>
            <p className="text-xs text-default-500">{device?.info?.unitName || "Unknown Device"}</p>
          </div>
        </div>

        <Button
          isDisabled={isProvisioning}
          size="sm"
          startContent={<Icon icon="solar:refresh-outline" width={14} />}
          variant="light"
          onPress={loadDeviceData}
        >
          Refresh
        </Button>
      </div>

      {/* Status Grid - 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        {/* System Information */}
        <Card className="col-span-2">
          <CardHeader className="pb-1 pt-2 px-3">
            <div className="flex items-center gap-2">
              <Icon icon="solar:cpu-outline" width={16} />
              <h4 className="text-xs font-medium">System Information</h4>
            </div>
          </CardHeader>
          <CardBody className="pt-1 pb-3 px-3 space-y-2">
            <div className="grid grid-cols-3 gap-3">
              <StatusField label="Device Name" value={statusData.systemInfo?.name || "Unknown"} />
              <StatusField
                label="Platform"
                value={statusData.systemInfo?.productPlatform || "Unknown"}
              />
              <StatusField
                label="Version"
                value={statusData.systemInfo?.softwareVersion || "Unknown"}
              />
              <StatusField
                label="Serial"
                value={statusData.systemInfo?.serialNumber || "Unknown"}
              />
              <StatusField
                label="IP Address"
                value={statusData.systemInfo?.ipAddress || "Unknown"}
              />
              <StatusField
                label="Uptime"
                value={
                  statusData.systemInfo?.uptime
                    ? `${Math.floor(statusData.systemInfo.uptime / 3600)}h`
                    : "Unknown"
                }
              />
            </div>
          </CardBody>
        </Card>

        {/* Provisioning & SIP Status - Combined */}
        <Card>
          <CardHeader className="pb-1 pt-2 px-3">
            <div className="flex items-center gap-2">
              <Icon icon="solar:settings-outline" width={16} />
              <h4 className="text-xs font-medium">Registration</h4>
            </div>
          </CardHeader>
          <CardBody className="pt-1 pb-3 px-3 space-y-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-default-500">Provisioning</span>
                <Chip
                  color={getProvisioningStatusColor(statusData.provisioningStatus?.status || "")}
                  size="sm"
                  variant="flat"
                >
                  {statusData.provisioningStatus?.status || "Unknown"}
                </Chip>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-default-500">SIP Status</span>
                <Chip
                  color={getSipStatusColor(statusData.sipStatus?.registrationStatus || "")}
                  size="sm"
                  variant="flat"
                >
                  {statusData.sipStatus?.registrationStatus || "Unknown"}
                </Chip>
              </div>
              {statusData.sipStatus?.displayName && (
                <StatusField label="Display Name" value={statusData.sipStatus.displayName} />
              )}
            </div>
          </CardBody>
        </Card>

        {/* Call & Standby Status */}
        <Card>
          <CardHeader className="pb-1 pt-2 px-3">
            <div className="flex items-center gap-2">
              <Icon icon="solar:phone-outline" width={16} />
              <h4 className="text-xs font-medium">Call & Power</h4>
            </div>
          </CardHeader>
          <CardBody className="pt-1 pb-3 px-3 space-y-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-default-500">Call Status</span>
                <Chip
                  color={getCallStatusColor(statusData.callStatus?.status || "")}
                  size="sm"
                  variant="flat"
                >
                  {statusData.callStatus?.status || "Unknown"}
                </Chip>
              </div>
              {statusData.callStatus?.duration && statusData.callStatus.duration > 0 && (
                <StatusField
                  label="Duration"
                  value={`${Math.floor(statusData.callStatus.duration / 60)}:${String(statusData.callStatus.duration % 60).padStart(2, "0")}`}
                />
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-default-500">Power State</span>
                <Chip
                  color={getStandbyColor(statusData.standbyStatus?.state || "")}
                  size="sm"
                  variant="flat"
                >
                  {statusData.standbyStatus?.state || "Unknown"}
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Audio Status */}
        <Card>
          <CardHeader className="pb-1 pt-2 px-3">
            <div className="flex items-center gap-2">
              <Icon icon="solar:microphone-outline" width={16} />
              <h4 className="text-xs font-medium">Audio</h4>
            </div>
          </CardHeader>
          <CardBody className="pt-1 pb-3 px-3 space-y-2">
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-default-500">Volume</span>
                  <span className="text-xs font-medium">
                    {statusData.audioStatus?.volume || 0}%
                  </span>
                </div>
                <Progress
                  className="max-w-full"
                  color="primary"
                  size="sm"
                  value={statusData.audioStatus?.volume || 0}
                />
              </div>
              <div className="flex items-center justify-between">
                <StatusField
                  label="Microphones"
                  value={statusData.audioStatus?.microphones.numberOfMicrophones || 0}
                />
                <Chip
                  color={statusData.audioStatus?.microphones.muted ? "danger" : "success"}
                  size="sm"
                  variant="flat"
                >
                  {statusData.audioStatus?.microphones.muted ? "Muted" : "Active"}
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Video Status */}
        <Card>
          <CardHeader className="pb-1 pt-2 px-3">
            <div className="flex items-center gap-2">
              <Icon icon="solar:video-camera-outline" width={16} />
              <h4 className="text-xs font-medium">Video</h4>
            </div>
          </CardHeader>
          <CardBody className="pt-1 pb-3 px-3">
            <div className="grid grid-cols-2 gap-2">
              <StatusField
                label="Inputs"
                value={`${statusData.videoStatus?.input.connectors.length || 0} available`}
              />
              <StatusField
                label="Outputs"
                value={`${statusData.videoStatus?.output.connectors.length || 0} available`}
              />
            </div>
          </CardBody>
        </Card>

        {/* Health Status */}
        {statusData.healthStatus && (
          <Card className="col-span-2">
            <CardHeader className="pb-1 pt-2 px-3">
              <div className="flex items-center gap-2">
                <Icon icon="solar:heart-pulse-outline" width={16} />
                <h4 className="text-xs font-medium">Health Status</h4>
              </div>
            </CardHeader>
            <CardBody className="pt-1 pb-3 px-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-default-500">CPU Usage</span>
                    <span className="text-xs font-medium">
                      {statusData.healthStatus.cpuUsage || 0}%
                    </span>
                  </div>
                  <Progress
                    className="max-w-full"
                    color={
                      (statusData.healthStatus.cpuUsage || 0) > 80
                        ? "danger"
                        : (statusData.healthStatus.cpuUsage || 0) > 60
                          ? "warning"
                          : "success"
                    }
                    size="sm"
                    value={statusData.healthStatus.cpuUsage || 0}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-default-500">Memory Usage</span>
                    <span className="text-xs font-medium">
                      {statusData.healthStatus.memoryUsage || 0}%
                    </span>
                  </div>
                  <Progress
                    className="max-w-full"
                    color={
                      (statusData.healthStatus.memoryUsage || 0) > 80
                        ? "danger"
                        : (statusData.healthStatus.memoryUsage || 0) > 60
                          ? "warning"
                          : "success"
                    }
                    size="sm"
                    value={statusData.healthStatus.memoryUsage || 0}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
