"use client";

import { useState, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
  Progress,
  Card,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import { useDeviceStore } from "@/stores/device-store";

interface ConnectDevicesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CSVDevice {
  systemName: string;
  ipAddress: string;
  username: string;
  password: string;
  uuid?: string;
  software?: string;
}

export default function ConnectDevicesModal({ isOpen, onOpenChange }: ConnectDevicesModalProps) {
  const [activeTab, setActiveTab] = useState("single");
  const [formData, setFormData] = useState({
    ipAddress: "",
    username: "",
    password: "",
  });

  // CSV upload state
  const [csvDevices, setCsvDevices] = useState<CSVDevice[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [isBulkConnecting, setIsBulkConnecting] = useState(false);
  const [bulkConnectionProgress, setBulkConnectionProgress] = useState<{
    current: number;
    total: number;
    errors: string[];
  }>({ current: 0, total: 0, errors: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { connectDevice, isConnecting, connectionError, clearConnectionError, devices } =
    useDeviceStore();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (connectionError) {
      clearConnectionError();
    }
  };

  const handleConnect = async () => {
    try {
      await connectDevice({
        host: formData.ipAddress,
        username: formData.username,
        password: formData.password,
      });

      // Success - close modal and reset form
      setFormData({ ipAddress: "", username: "", password: "" });
      onOpenChange(false);
    } catch {
      // Error is handled by the store and will be displayed in UI
    }
  };

  const handleBulkConnect = async () => {
    setIsBulkConnecting(true);
    setBulkConnectionProgress({ current: 0, total: csvDevices.length, errors: [] });

    const errors: string[] = [];
    const currentlyConnected = devices.length;
    const availableSlots = 10 - currentlyConnected;

    if (availableSlots <= 0) {
      setCsvError(
        "Connection limit reached. Please disconnect some devices before connecting more.",
      );
      setIsBulkConnecting(false);

      return;
    }

    // Only connect up to the available slots
    const devicesToConnect = csvDevices.slice(0, availableSlots);

    if (devicesToConnect.length < csvDevices.length) {
      setCsvError(
        `Can only connect ${availableSlots} more device(s) due to 10-device limit. ${csvDevices.length - availableSlots} device(s) will not be connected.`,
      );
    }

    for (let i = 0; i < devicesToConnect.length; i++) {
      const device = devicesToConnect[i];

      setBulkConnectionProgress((prev) => ({ ...prev, current: i + 1 }));

      try {
        await connectDevice({
          host: device.ipAddress,
          username: device.username,
          password: device.password,
        });
      } catch (error) {
        const errorMsg = `Failed to connect to ${device.systemName} (${device.ipAddress})`;

        errors.push(errorMsg);
        setBulkConnectionProgress((prev) => ({
          ...prev,
          errors: [...prev.errors, errorMsg],
        }));
      }
    }

    setIsBulkConnecting(false);

    if (errors.length === 0) {
      // Success - close modal and reset
      setCsvDevices([]);
      setCsvError(null);
      setFileName("");
      onOpenChange(false);
    } else {
      // Show error summary
      setCsvError(
        `Connected ${devicesToConnect.length - errors.length} of ${devicesToConnect.length} devices. ${errors.length} failed.`,
      );
    }
  };

  const handleCancel = () => {
    // Reset form and close modal
    setFormData({ ipAddress: "", username: "", password: "" });
    clearConnectionError();
    setCsvDevices([]);
    setCsvError(null);
    setFileName("");
    onOpenChange(false);
  };

  // CSV parsing function with strict validation
  const parseCSV = (csvText: string): CSVDevice[] => {
    const lines = csvText.trim().split("\n");
    const devices: CSVDevice[] = [];

    // Expected headers exactly as they should be
    const expectedHeaders = [
      "system name",
      "ip address",
      "username",
      "password",
      "uuid",
      "software",
    ];

    if (lines.length === 0) {
      throw new Error("CSV file is empty");
    }

    // Get the first line headers
    const headerLine = lines[0].toLowerCase().trim();
    const headers = headerLine.split(",").map((h) => h.trim());

    // Validate headers match exactly
    const hasValidHeaders = expectedHeaders.every((expected, index) => headers[index] === expected);

    if (!hasValidHeaders) {
      throw new Error(
        'Invalid CSV format. Headers must be exactly: "system name,ip address,username,password,uuid,software"',
      );
    }

    // Parse data rows starting from line 1 (after headers)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) continue;

      // Split by comma but handle quoted values
      const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
      const cleanParts = parts.map((part) => part.replace(/^"|"$/g, "").trim());

      // Validate we have at least the required fields (first 4)
      if (cleanParts.length < 4) {
        throw new Error(
          `Row ${i + 1} is missing required fields. Each row must have at least: system name, ip address, username, and password`,
        );
      }

      // Validate IP address format
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^[a-zA-Z0-9.-]+$/;

      if (!ipRegex.test(cleanParts[1])) {
        throw new Error(`Row ${i + 1} has invalid IP address or hostname: "${cleanParts[1]}"`);
      }

      // Validate software type if provided
      const validSoftware = ["CE", "RoomOS", "TC", "TE"];

      if (cleanParts[5] && !validSoftware.includes(cleanParts[5])) {
        throw new Error(
          `Row ${i + 1} has invalid software type: "${cleanParts[5]}". Must be one of: ${validSoftware.join(", ")}`,
        );
      }

      devices.push({
        systemName: cleanParts[0],
        ipAddress: cleanParts[1],
        username: cleanParts[2],
        password: cleanParts[3],
        uuid: cleanParts[4] || undefined,
        software: cleanParts[5] || undefined,
      });
    }

    if (devices.length === 0) {
      throw new Error(
        "No valid devices found in CSV. Make sure your CSV has data rows after the headers.",
      );
    }

    return devices;
  };

  // File handling
  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setCsvError("Please select a CSV file");

      return;
    }

    setFileName(file.name);
    setCsvError(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const devices = parseCSV(text);

        setCsvDevices(devices);
      } catch (error) {
        // Show the specific validation error message
        setCsvError(error instanceof Error ? error.message : "Failed to parse CSV file");
        console.error("CSV parse error:", error);
      }
    };
    reader.readAsText(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <Modal
      classNames={{
        base: "bg-background/95 backdrop-blur-xl border border-divider",
        header: "border-b border-divider",
        body: "py-6",
        footer: "border-t border-divider",
      }}
      isOpen={isOpen}
      size="2xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-light text-foreground">Connect to Room Systems</h2>
          <p className="text-sm text-default-500 font-normal">Add devices to manage</p>
        </ModalHeader>

        <ModalBody>
          <Tabs
            aria-label="Connection type selection"
            classNames={{
              tabList: "bg-default-100/50 p-1 rounded-lg",
              tab: "px-6 py-3 data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
              tabContent:
                "text-default-600 data-[selected=true]:text-primary-foreground font-medium",
            }}
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
          >
            <Tab key="single" title="Single Device">
              <form
                className="space-y-6 mt-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConnect();
                }}
              >
                {connectionError && (
                  <div className="p-3 rounded-lg bg-danger-50 border border-danger-200">
                    <div className="flex items-start gap-3">
                      <Icon
                        className="text-danger-500 mt-0.5"
                        icon="solar:danger-triangle-outline"
                        width={18}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-danger-700">Connection Failed</p>
                        <p className="text-sm text-danger-600 mt-1">{connectionError}</p>
                        {formData.ipAddress && (
                          <Button
                            className="mt-2"
                            color="danger"
                            size="sm"
                            variant="flat"
                            onPress={() => {
                              window.open(`https://${formData.ipAddress}`, "_blank");
                            }}
                          >
                            Accept Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    className="text-sm font-medium text-foreground mb-2 block"
                    htmlFor="ip-address"
                  >
                    IP Address or Hostname
                  </label>
                  <Input
                    classNames={{
                      inputWrapper:
                        "bg-default-100/60 border border-divider hover:bg-default-100/80 focus-within:bg-default-100/80",
                      input: "placeholder:text-default-400",
                    }}
                    id="ip-address"
                    placeholder="192.168.1.100 or room-system.company.com"
                    value={formData.ipAddress}
                    onValueChange={(value) => handleInputChange("ipAddress", value)}
                  />
                </div>

                <div>
                  <label
                    className="text-sm font-medium text-foreground mb-2 block"
                    htmlFor="username"
                  >
                    Username
                  </label>
                  <Input
                    classNames={{
                      inputWrapper:
                        "bg-default-100/60 border border-divider hover:bg-default-100/80 focus-within:bg-default-100/80",
                      input: "placeholder:text-default-400",
                    }}
                    id="username"
                    placeholder="admin"
                    value={formData.username}
                    onValueChange={(value) => handleInputChange("username", value)}
                  />
                </div>

                <div>
                  <label
                    className="text-sm font-medium text-foreground mb-2 block"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <Input
                    classNames={{
                      inputWrapper:
                        "bg-default-100/60 border border-divider hover:bg-default-100/80 focus-within:bg-default-100/80",
                      input: "placeholder:text-default-400",
                    }}
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={formData.password}
                    onValueChange={(value) => handleInputChange("password", value)}
                  />
                </div>
              </form>
            </Tab>

            <Tab key="multiple" title="Multiple Devices">
              <div className="space-y-6 mt-6">
                {/* File input hidden */}
                <input
                  ref={fileInputRef}
                  accept=".csv"
                  className="hidden"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) handleFileSelect(file);
                  }}
                />

                {/* Upload area or device list */}
                {csvDevices.length === 0 ? (
                  <div
                    className={`
                      border-2 border-dashed rounded-lg p-8 text-center transition-all
                      ${
                        isDragging
                          ? "border-primary bg-primary-50 dark:bg-primary-900/20"
                          : "border-default-300 bg-default-50 dark:bg-default-50/10"
                      }
                      ${csvError ? "border-danger bg-danger-50 dark:bg-danger-900/20" : ""}
                    `}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <Icon
                      className={`mx-auto mb-4 ${csvError ? "text-danger" : "text-default-400"}`}
                      icon={
                        csvError ? "solar:danger-triangle-outline" : "solar:cloud-upload-outline"
                      }
                      width={48}
                    />

                    {csvError ? (
                      <div className="max-w-md mx-auto">
                        <p className="text-danger font-medium mb-2">Error: {csvError}</p>
                        <div className="text-xs text-default-500 mb-4">
                          <p>Please ensure your CSV:</p>
                          <ul className="list-disc list-inside mt-1">
                            <li>
                              Has headers exactly as: system name,ip
                              address,username,password,uuid,software
                            </li>
                            <li>Contains valid IP addresses or hostnames</li>
                            <li>Has at least the first 4 required fields</li>
                            <li>Uses valid software types: CE, RoomOS, TC, or TE</li>
                          </ul>
                        </div>
                        <Button
                          className="mt-2"
                          size="sm"
                          variant="flat"
                          onPress={() => {
                            setCsvError(null);
                            fileInputRef.current?.click();
                          }}
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-default-700 font-medium">
                          Drop CSV file here or click to browse
                        </p>
                        <p className="text-sm text-default-500 mt-2">
                          Format: system name, ip address, username, password, uuid, software
                        </p>
                        <div className="flex items-center gap-3 justify-center mt-4">
                          <Button
                            size="sm"
                            variant="flat"
                            onPress={() => fileInputRef.current?.click()}
                          >
                            Browse Files
                          </Button>
                          <Button
                            size="sm"
                            startContent={<Icon icon="solar:download-outline" width={16} />}
                            variant="light"
                            onPress={() => {
                              // Download CSV template from public folder
                              const link = document.createElement("a");

                              link.href = "/device-template.csv";
                              link.download = "device-template.csv";
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            Download Template
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Connection limit warning */}
                    {devices.length > 0 && (
                      <Card className="p-3 bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
                        <div className="flex items-center gap-2">
                          <Icon
                            className="text-warning-600 dark:text-warning-400"
                            icon="solar:info-circle-bold"
                            width={20}
                          />
                          <div className="text-sm">
                            <span className="font-medium text-warning-800 dark:text-warning-300">
                              {devices.length}/10 devices connected.
                            </span>
                            <span className="text-warning-700 dark:text-warning-400 ml-1">
                              {10 - devices.length} slot
                              {10 - devices.length !== 1 ? "s" : ""} available.
                            </span>
                          </div>
                        </div>
                      </Card>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{fileName}</p>
                        <p className="text-xs text-default-500">
                          {csvDevices.length} device{csvDevices.length !== 1 ? "s" : ""} found
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => {
                          setCsvDevices([]);
                          setFileName("");
                          setCsvError(null);
                          setBulkConnectionProgress({ current: 0, total: 0, errors: [] });
                        }}
                      >
                        Clear
                      </Button>
                    </div>

                    {/* Progress display during bulk connection */}
                    {isBulkConnecting && (
                      <div className="space-y-2">
                        <Progress
                          className="mb-2"
                          color="primary"
                          size="sm"
                          value={
                            (bulkConnectionProgress.current / bulkConnectionProgress.total) * 100
                          }
                        />
                        <p className="text-xs text-default-500 text-center">
                          Connecting device {bulkConnectionProgress.current} of{" "}
                          {bulkConnectionProgress.total}...
                        </p>
                        {bulkConnectionProgress.errors.length > 0 && (
                          <div className="mt-2 text-xs text-danger">
                            <p className="font-medium mb-1">Connection errors:</p>
                            {bulkConnectionProgress.errors.map((error, idx) => (
                              <p key={idx} className="ml-2">
                                • {error}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Device preview table */}
                    <div className="max-h-[300px] overflow-y-auto">
                      <Table
                        aria-label="CSV devices preview"
                        classNames={{
                          wrapper: "max-h-[300px]",
                        }}
                      >
                        <TableHeader>
                          <TableColumn>System Name</TableColumn>
                          <TableColumn>IP Address</TableColumn>
                          <TableColumn>Username</TableColumn>
                          <TableColumn>Software</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {csvDevices.map((device, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-xs">{device.systemName}</TableCell>
                              <TableCell className="text-xs font-mono">
                                {device.ipAddress}
                              </TableCell>
                              <TableCell className="text-xs">{device.username}</TableCell>
                              <TableCell>
                                {device.software && (
                                  <Chip size="sm" variant="flat">
                                    {device.software}
                                  </Chip>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button className="text-default-600" variant="light" onPress={handleCancel}>
            Cancel
          </Button>
          {activeTab === "single" ? (
            <Button
              className="bg-primary text-primary-foreground"
              color="primary"
              endContent={
                isConnecting ? (
                  <Icon className="animate-spin" icon="solar:loading-outline" width={16} />
                ) : (
                  <Icon icon="solar:arrow-right-outline" width={16} />
                )
              }
              isDisabled={
                !formData.ipAddress || !formData.username || !formData.password || isConnecting
              }
              isLoading={isConnecting}
              onPress={handleConnect}
            >
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          ) : (
            <Button
              className="bg-primary text-primary-foreground"
              color="primary"
              endContent={!isBulkConnecting && <Icon icon="solar:arrow-right-outline" width={16} />}
              isDisabled={csvDevices.length === 0 || isBulkConnecting}
              onPress={handleBulkConnect}
            >
              {isBulkConnecting ? (
                <>
                  Connecting... {bulkConnectionProgress.current}/{bulkConnectionProgress.total}
                </>
              ) : (
                <>
                  Connect {csvDevices.length} Device{csvDevices.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
