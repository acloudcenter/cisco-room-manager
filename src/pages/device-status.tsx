import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Chip, Spinner } from "@heroui/react";

import { ciscoConnectionService } from "@/services/cisco-connection-service";
import {
  ciscoStatusService,
  SystemInfo,
  AudioStatus,
  CallStatus,
  StandbyStatus,
} from "@/services/cisco-status-service";

export default function DeviceStatusPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [audioStatus, setAudioStatus] = useState<AudioStatus | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus | null>(null);
  const [standbyStatus, setStandbyStatus] = useState<StandbyStatus | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check connection status on mount
    setIsConnected(ciscoConnectionService.isConnected());
  }, []);

  const refreshStatus = async () => {
    if (!ciscoConnectionService.isConnected()) {
      setError("Device not connected");

      return;
    }

    setLoading(true);
    setError("");

    try {
      const [system, audio, call, standby] = await Promise.all([
        ciscoStatusService.getSystemInfo(),
        ciscoStatusService.getAudioStatus(),
        ciscoStatusService.getCallStatus(),
        ciscoStatusService.getStandbyStatus(),
      ]);

      setSystemInfo(system);
      setAudioStatus(audio);
      setCallStatus(call);
      setStandbyStatus(standby);
    } catch (err: any) {
      setError(err.message || "Failed to get device status");
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="backdrop-blur-md bg-background/70">
          <CardBody className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">Device Not Connected</h2>
            <p className="text-gray-600 mb-4">
              Please connect to a device first to view status information.
            </p>
            <Button as="a" color="primary" href="/test">
              Go to Connection Test
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Device Status</h1>
        <Button color="primary" isLoading={loading} onClick={refreshStatus}>
          {loading ? "Refreshing..." : "Refresh Status"}
        </Button>
      </div>

      {error && (
        <Card className="border-danger-200 bg-danger-50">
          <CardBody>
            <p className="text-danger">{error}</p>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Information */}
        <Card className="backdrop-blur-md bg-background/70">
          <CardHeader>
            <h3 className="text-lg font-semibold">System Information</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            {systemInfo ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Device Name:</span>
                  <span className="font-medium">{systemInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium">{systemInfo.productPlatform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Software:</span>
                  <span className="font-medium">{systemInfo.softwareVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IP Address:</span>
                  <span className="font-medium">{systemInfo.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium">{formatUptime(systemInfo.uptime)}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-4">
                {loading ? <Spinner size="sm" /> : <span className="text-gray-500">No data</span>}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Audio Status */}
        <Card className="backdrop-blur-md bg-background/70">
          <CardHeader>
            <h3 className="text-lg font-semibold">Audio Status</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            {audioStatus ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-medium">{audioStatus.volume}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Microphones:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {audioStatus.microphones.numberOfMicrophones}
                    </span>
                    <Chip
                      color={audioStatus.microphones.muted ? "danger" : "success"}
                      size="sm"
                      variant="flat"
                    >
                      {audioStatus.microphones.muted ? "Muted" : "Active"}
                    </Chip>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Speakers:</span>
                  <span className="font-medium">{audioStatus.speakers.numberOfSpeakers}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-4">
                {loading ? <Spinner size="sm" /> : <span className="text-gray-500">No data</span>}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Call Status */}
        <Card className="backdrop-blur-md bg-background/70">
          <CardHeader>
            <h3 className="text-lg font-semibold">Call Status</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            {callStatus ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Chip
                    color={
                      callStatus.status === "Connected"
                        ? "success"
                        : callStatus.status === "Connecting"
                          ? "warning"
                          : callStatus.status === "Disconnecting"
                            ? "warning"
                            : "default"
                    }
                    variant="flat"
                  >
                    {callStatus.status}
                  </Chip>
                </div>
                {callStatus.duration > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{formatUptime(callStatus.duration)}</span>
                  </div>
                )}
                {callStatus.remoteNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remote:</span>
                    <span className="font-medium">{callStatus.remoteNumber}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center py-4">
                {loading ? <Spinner size="sm" /> : <span className="text-gray-500">No data</span>}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Standby Status */}
        <Card className="backdrop-blur-md bg-background/70">
          <CardHeader>
            <h3 className="text-lg font-semibold">Power Status</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            {standbyStatus ? (
              <div className="flex justify-between">
                <span className="text-gray-600">State:</span>
                <Chip
                  color={
                    standbyStatus.state === "Off"
                      ? "success"
                      : standbyStatus.state === "Standby"
                        ? "warning"
                        : "default"
                  }
                  variant="flat"
                >
                  {standbyStatus.state}
                </Chip>
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                {loading ? <Spinner size="sm" /> : <span className="text-gray-500">No data</span>}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="backdrop-blur-md bg-background/70">
        <CardBody className="text-center">
          <p className="text-sm text-gray-600">
            Status information is retrieved in real-time from the connected device. Use the refresh
            button to get the latest status.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
