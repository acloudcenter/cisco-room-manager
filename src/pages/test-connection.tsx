import { useState } from "react";
import { Button, Input, Card, CardBody, CardHeader, Chip } from "@heroui/react";

import { ciscoConnectionService } from "@/services/cisco-connection-service";

export default function TestConnectionPage() {
  const [host, setHost] = useState("192.168.1.186");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("not-connected");
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setError("");
    setStatus("connecting");

    try {
      await ciscoConnectionService.connect({ host, username, password });
      setStatus("connected");

      const info = ciscoConnectionService.getDeviceInfo();

      setDeviceInfo(info);
    } catch (err: any) {
      setStatus("failed");
      setError(err.message || "Connection failed");

      if (err.message?.includes("self signed certificate")) {
        setError(
          `Certificate error. Please open https://${host} in a new tab and accept the certificate, then try again.`,
        );
      }
    }
  };

  const handleDisconnect = () => {
    ciscoConnectionService.disconnect();
    setStatus("not-connected");
    setDeviceInfo(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="backdrop-blur-md bg-background/70">
        <CardHeader>
          <h2 className="text-2xl font-bold">Test Cisco Device Connection</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <Chip
              color={
                status === "connected"
                  ? "success"
                  : status === "connecting"
                    ? "warning"
                    : status === "failed"
                      ? "danger"
                      : "default"
              }
              variant="flat"
            >
              {status}
            </Chip>
          </div>

          {status === "connected" && deviceInfo && (
            <div className="p-4 bg-default-100 rounded-lg space-y-2">
              <h3 className="font-semibold">Device Information:</h3>
              <p>Name: {deviceInfo.unitName}</p>
              <p>Type: {deviceInfo.unitType}</p>
              <p>Host: {deviceInfo.host}</p>
            </div>
          )}

          {status !== "connected" && (
            <>
              <Input
                label="Device IP/Hostname"
                placeholder="192.168.1.100"
                value={host}
                onChange={(e) => setHost(e.target.value)}
              />

              <Input
                label="Username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <Input
                label="Password"
                placeholder="Enter password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && (
                <div className="p-3 bg-danger-50 text-danger rounded-lg text-sm">{error}</div>
              )}

              <Button
                className="w-full"
                color="primary"
                isDisabled={!host || !username || !password}
                isLoading={status === "connecting"}
                onClick={handleConnect}
              >
                {status === "connecting" ? "Connecting..." : "Connect"}
              </Button>
            </>
          )}

          {status === "connected" && (
            <Button className="w-full" color="danger" variant="flat" onClick={handleDisconnect}>
              Disconnect
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
