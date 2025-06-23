/**
 * Device Monitor Display Component
 * Shows comprehensive real-time device monitoring data
 */

import type { ConnectedDevice } from "@/stores/device-store";
import type {
  SystemInfo,
  AudioStatus,
  VideoStatus,
  CallStatus,
  StandbyStatus,
} from "@/lib/device-status";

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
} from "@/lib/device-status";

interface DeviceMonitorDisplayProps {
  device: ConnectedDevice;
}

interface DeviceMonitorData {
  systemInfo: SystemInfo | null;
  audioStatus: AudioStatus | null;
  videoStatus: VideoStatus | null;
  callStatus: CallStatus | null;
  standbyStatus: StandbyStatus | null;
  healthStatus: any | null;
}

export default function DeviceMonitorDisplay({ device }: DeviceMonitorDisplayProps) {
  const { isProvisioning } = useDeviceStore();
  const [monitorData, setMonitorData] = React.useState<DeviceMonitorData>({
    systemInfo: null,
    audioStatus: null,
    videoStatus: null,
    callStatus: null,
    standbyStatus: null,
    healthStatus: null,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadDeviceData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load all device status data
      const [systemInfo, audioStatus, videoStatus, callStatus, standbyStatus, healthStatus] =
        await Promise.all([
          getSystemInfo(),
          getAudioStatus(),
          getVideoStatus(),
          getCallStatus(),
          getStandbyStatus(),
          getHealthStatus(),
        ]);

      setMonitorData({
        systemInfo,
        audioStatus,
        videoStatus,
        callStatus,
        standbyStatus,
        healthStatus,
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
        <CardBody className="flex flex-row items-center gap-4 p-6">
          <CircularProgress size="md" />
          <div>
            <p className="text-sm font-medium">Loading Device Data...</p>
            <p className="text-xs text-default-500">Reading system information...</p>
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
              <p className="text-sm font-medium text-danger-700">Failed to Load Device Data</p>
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="text-primary" icon="solar:monitor-outline" width={24} />
          <div>
            <h3 className="text-lg font-semibold">Device Monitoring</h3>
            <p className="text-sm text-default-500">{device?.info?.unitName || "Unknown Device"}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            isDisabled={isProvisioning}
            size="sm"
            startContent={<Icon icon="solar:refresh-outline" width={16} />}
            variant="light"
            onPress={loadDeviceData}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Icon icon="solar:cpu-outline" width={20} />
            <h4 className="text-md font-medium">System Information</h4>
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-default-500">Device Name</p>
              <p className="font-medium">{monitorData.systemInfo?.name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-default-500">Product Platform</p>
              <p className="font-medium">{monitorData.systemInfo?.productPlatform || "Unknown"}</p>
            </div>
            <div>
              <p className="text-default-500">Software Version</p>
              <p className="font-medium">{monitorData.systemInfo?.softwareVersion || "Unknown"}</p>
            </div>
            <div>
              <p className="text-default-500">Serial Number</p>
              <p className="font-medium">{monitorData.systemInfo?.serialNumber || "Unknown"}</p>
            </div>
            <div>
              <p className="text-default-500">IP Address</p>
              <p className="font-medium">{monitorData.systemInfo?.ipAddress || "Unknown"}</p>
            </div>
            <div>
              <p className="text-default-500">Uptime</p>
              <p className="font-medium">
                {monitorData.systemInfo?.uptime
                  ? `${Math.floor(monitorData.systemInfo.uptime / 3600)} hours`
                  : "Unknown"}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Audio Status */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Icon icon="solar:microphone-outline" width={20} />
            <h4 className="text-md font-medium">Audio Status</h4>
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-default-500">Volume Level</p>
                <span className="text-sm font-medium">{monitorData.audioStatus?.volume || 0}%</span>
              </div>
              <Progress
                className="max-w-full"
                color="primary"
                size="sm"
                value={monitorData.audioStatus?.volume || 0}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-default-500">Microphones</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {monitorData.audioStatus?.microphones.numberOfMicrophones || 0}
                  </p>
                  <Chip
                    color={monitorData.audioStatus?.microphones.muted ? "danger" : "success"}
                    size="sm"
                    variant="flat"
                  >
                    {monitorData.audioStatus?.microphones.muted ? "Muted" : "Active"}
                  </Chip>
                </div>
              </div>
              <div>
                <p className="text-default-500">Speakers</p>
                <p className="font-medium">
                  {monitorData.audioStatus?.speakers.numberOfSpeakers || 0}
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Video Status */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Icon icon="solar:video-camera-outline" width={20} />
            <h4 className="text-md font-medium">Video Status</h4>
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-default-500">Input Connectors</p>
              <p className="font-medium">
                {monitorData.videoStatus?.input.connectors.length || 0} available
              </p>
            </div>
            <div>
              <p className="text-default-500">Output Connectors</p>
              <p className="font-medium">
                {monitorData.videoStatus?.output.connectors.length || 0} available
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Call Status */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Icon icon="solar:phone-outline" width={20} />
            <h4 className="text-md font-medium">Call Status</h4>
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-default-500">Status</p>
              <Chip
                color={getCallStatusColor(monitorData.callStatus?.status || "")}
                size="sm"
                variant="flat"
              >
                {monitorData.callStatus?.status || "Unknown"}
              </Chip>
            </div>
            <div>
              <p className="text-default-500">Duration</p>
              <p className="font-medium">
                {monitorData.callStatus?.duration
                  ? `${Math.floor(monitorData.callStatus.duration / 60)}:${String(monitorData.callStatus.duration % 60).padStart(2, "0")}`
                  : "0:00"}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Standby Status */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Icon icon="solar:sleep-outline" width={20} />
            <h4 className="text-md font-medium">Power Status</h4>
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-default-500">State</p>
              <Chip
                color={getStandbyColor(monitorData.standbyStatus?.state || "")}
                size="sm"
                variant="flat"
              >
                {monitorData.standbyStatus?.state || "Unknown"}
              </Chip>
            </div>
            <div>
              <p className="text-default-500">Description</p>
              <p className="font-medium">
                {monitorData.standbyStatus?.state === "Off"
                  ? "Device is active"
                  : monitorData.standbyStatus?.state === "Standby"
                    ? "Device is in standby"
                    : "Device is waking up"}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Health Status */}
      {monitorData.healthStatus && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Icon icon="solar:heart-pulse-outline" width={20} />
              <h4 className="text-md font-medium">Health Status</h4>
            </div>
          </CardHeader>
          <CardBody className="pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-default-500">CPU Usage</p>
                <div className="flex items-center gap-2">
                  <Progress
                    className="flex-1"
                    color={
                      (monitorData.healthStatus.cpuUsage || 0) > 80
                        ? "danger"
                        : (monitorData.healthStatus.cpuUsage || 0) > 60
                          ? "warning"
                          : "success"
                    }
                    size="sm"
                    value={monitorData.healthStatus.cpuUsage || 0}
                  />
                  <span className="text-xs">{monitorData.healthStatus.cpuUsage || 0}%</span>
                </div>
              </div>
              <div>
                <p className="text-default-500">Memory Usage</p>
                <div className="flex items-center gap-2">
                  <Progress
                    className="flex-1"
                    color={
                      (monitorData.healthStatus.memoryUsage || 0) > 80
                        ? "danger"
                        : (monitorData.healthStatus.memoryUsage || 0) > 60
                          ? "warning"
                          : "success"
                    }
                    size="sm"
                    value={monitorData.healthStatus.memoryUsage || 0}
                  />
                  <span className="text-xs">{monitorData.healthStatus.memoryUsage || 0}%</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
