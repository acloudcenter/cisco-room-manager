/**
 * Provisioning Form Component
 * Single device provisioning configuration form
 */

import React from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
  Divider,
  Card,
  CardBody,
  CardHeader,
  CircularProgress,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import {
  ProvisioningFormProps,
  ProvisioningFormData,
  defaultProvisioningFormData,
  ProvisioningMode,
  ProtocolType,
  ConnectivityType,
} from "./provisioning-types";

import { useDeviceStore } from "@/stores/device-store";
import { getCurrentProvisioningConfig } from "@/lib/provisioning";

export default function ProvisioningForm({
  device,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProvisioningFormProps) {
  const [formData, setFormData] = React.useState<ProvisioningFormData>(defaultProvisioningFormData);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoadingConfig, setIsLoadingConfig] = React.useState(true);

  // Subscribe to provisioning state from Zustand store
  const { isProvisioning, provisioningProgress, provisioningError } = useDeviceStore();

  // Load current device configuration when component mounts
  React.useEffect(() => {
    const loadCurrentConfig = async () => {
      try {
        setIsLoadingConfig(true);
        const currentConfig = await getCurrentProvisioningConfig(device);

        // Map the API config to form data structure
        // If mode is "Off" or any other unsupported mode, default to "Off"
        let mode: ProvisioningMode = "Off";

        if (currentConfig.mode === "TMS") {
          mode = "TMS";
        } else if (currentConfig.mode === "Webex") {
          mode = "Webex";
        }

        const mappedFormData: ProvisioningFormData = {
          mode,
          connectivity: (currentConfig.connectivity as ConnectivityType) || "External",
          externalManager: {
            address: currentConfig.externalManager.address || "",
            alternateAddress: currentConfig.externalManager.alternateAddress || "",
            domain: currentConfig.externalManager.domain || "WORKGROUP",
            path:
              currentConfig.externalManager.path ||
              "tms/public/external/management/SystemManagementService.asmx",
            protocol: (currentConfig.externalManager.protocol || "HTTPS") as ProtocolType,
          },
          security: {
            webexEdge: currentConfig.webexEdge === "On",
            tlsVerify: currentConfig.tlsVerify === "On",
          },
          credentials: {
            loginName: currentConfig.loginName || "",
            password: currentConfig.password || "",
          },
        };

        setFormData(mappedFormData);
      } catch (error) {
        // Fall back to defaults on error
        // Error is handled silently to allow form to still function
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadCurrentConfig();
  }, [device]);

  // Auto-set connectivity to External when TMS mode is selected
  React.useEffect(() => {
    if (formData.mode === "TMS" && formData.connectivity !== "External") {
      setFormData((prev) => ({
        ...prev,
        connectivity: "External",
      }));
    }
  }, [formData.mode]);

  const handleModeChange = (mode: ProvisioningMode) => {
    setFormData((prev) => ({
      ...prev,
      mode,
      // Reset external manager fields when switching to Webex
      ...(mode === "Webex" && {
        externalManager: {
          ...defaultProvisioningFormData.externalManager,
        },
      }),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.mode === "TMS") {
      if (!formData.externalManager.address.trim()) {
        newErrors.address = "External Manager Address is required for TMS mode";
      }
      // Username and password are optional for TMS mode
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Clear any previous provisioning errors
    useDeviceStore.getState().setProvisioningError(null);

    try {
      await onSubmit(formData);
    } catch {
      // Error handling is now done in workflows via Zustand state
    }
  };

  const isTmsMode = formData.mode === "TMS";

  // Show loading state while fetching current config
  if (isLoadingConfig) {
    return (
      <Card className="bg-default-50">
        <CardBody className="flex flex-row items-center gap-3 p-4">
          <CircularProgress size="sm" />
          <div>
            <p className="text-xs font-medium">Loading Current Configuration...</p>
            <p className="text-xs text-default-500">Reading device settings...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center gap-2 p-3 bg-default-50 rounded-lg">
        <Icon className="text-primary" icon="solar:server-outline" width={16} />
        <div>
          <h3 className="text-sm font-semibold">Edit Provisioning Configuration</h3>
          <p className="text-xs text-default-500">
            Configure {device?.info?.unitName || "device"} provisioning settings
          </p>
        </div>
      </div>

      {/* Mode Selection */}
      <Card>
        <CardHeader className="pb-1 pt-2 px-3">
          <h4 className="text-xs font-medium">Provisioning Mode</h4>
        </CardHeader>
        <CardBody className="pt-1 pb-3 px-3">
          <Select
            label="Mode"
            placeholder="Select provisioning mode"
            selectedKeys={[formData.mode]}
            size="sm"
            onSelectionChange={(keys) => {
              const mode = Array.from(keys)[0] as ProvisioningMode;

              handleModeChange(mode);
            }}
          >
            <SelectItem key="Off">Off (No Provisioning)</SelectItem>
            <SelectItem key="Webex">Webex</SelectItem>
            <SelectItem key="TMS">TMS (Telepresence Management Suite)</SelectItem>
          </Select>
          <p className="text-xs text-default-400 mt-2">
            {formData.mode === "Off"
              ? "Device will not be configured by any provisioning system"
              : formData.mode === "Webex"
                ? "Device will register with Cisco Webex cloud service"
                : "Device will register with on-premises TMS server"}
          </p>
        </CardBody>
      </Card>

      {/* Main Configuration Section */}
      <Card>
        <CardHeader className="pb-1 pt-2 px-3">
          <h4 className="text-xs font-medium">Configuration</h4>
        </CardHeader>
        <CardBody className="pt-0 space-y-4">
          {/* Connectivity - Only show for TMS mode */}
          {isTmsMode && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-default-700">Connectivity</span>
              <div className="px-3 py-2 bg-default-100 border-2 border-default-200 rounded-md">
                <span className="text-default-500">{formData.connectivity}</span>
              </div>
              <p className="text-xs text-default-400">Automatically set to External for TMS mode</p>
            </div>
          )}

          {/* Credentials - Only show for TMS mode */}
          {isTmsMode && (
            <>
              <Input
                description="Username for TMS authentication (optional)"
                label="LoginName"
                placeholder="tms-user"
                size="sm"
                value={formData.credentials.loginName}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    credentials: { ...prev.credentials, loginName: value },
                  }))
                }
              />

              <Input
                description="Password for TMS authentication (optional)"
                endContent={
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      icon={showPassword ? "solar:eye-outline" : "solar:eye-closed-outline"}
                      width={20}
                    />
                  </Button>
                }
                label="Password"
                placeholder="Enter password"
                size="sm"
                type={showPassword ? "text" : "password"}
                value={formData.credentials.password}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    credentials: { ...prev.credentials, password: value },
                  }))
                }
              />
            </>
          )}

          {/* Security Settings */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium">TlsVerify</span>
              <span className="text-xs text-default-400">
                Verify TLS certificates during connection
              </span>
            </div>
            <Switch
              isSelected={formData.security.tlsVerify}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  security: { ...prev.security, tlsVerify: value },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium">WebexEdge</span>
              <span className="text-xs text-default-400">Enable Webex Edge connectivity</span>
            </div>
            <Switch
              isSelected={formData.security.webexEdge}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  security: { ...prev.security, webexEdge: value },
                }))
              }
            />
          </div>
        </CardBody>
      </Card>

      {/* External Manager Settings - Only show for TMS mode */}
      {isTmsMode && (
        <Card>
          <CardHeader className="pb-1 pt-2 px-3">
            <h4 className="text-xs font-medium">ExternalManager</h4>
          </CardHeader>
          <CardBody className="pt-0 space-y-4">
            <Input
              description="TMS server hostname or IP address"
              errorMessage={errors.address}
              isInvalid={!!errors.address}
              label="Address"
              placeholder="tms-server.company.com"
              size="sm"
              value={formData.externalManager.address}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  externalManager: { ...prev.externalManager, address: value },
                }))
              }
            />

            <Input
              description="Alternative TMS server address"
              label="AlternateAddress"
              placeholder=""
              size="sm"
              value={formData.externalManager.alternateAddress || ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  externalManager: { ...prev.externalManager, alternateAddress: value },
                }))
              }
            />

            <Input
              description="Windows domain name"
              label="Domain"
              placeholder="WORKGROUP"
              size="sm"
              value={formData.externalManager.domain}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  externalManager: { ...prev.externalManager, domain: value },
                }))
              }
            />

            <Input
              description="TMS web service path"
              label="Path"
              placeholder="tms/public/external/management/SystemManagementService.asmx"
              size="sm"
              value={formData.externalManager.path}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  externalManager: { ...prev.externalManager, path: value },
                }))
              }
            />

            <Select
              label="Protocol"
              selectedKeys={[formData.externalManager.protocol]}
              size="sm"
              onSelectionChange={(keys) => {
                const protocol = Array.from(keys)[0] as ProtocolType;

                setFormData((prev) => ({
                  ...prev,
                  externalManager: { ...prev.externalManager, protocol },
                }));
              }}
            >
              <SelectItem key="HTTP">HTTP</SelectItem>
              <SelectItem key="HTTPS">HTTPS</SelectItem>
            </Select>
          </CardBody>
        </Card>
      )}

      <Divider />

      {/* Progress Display */}
      {isProvisioning && (
        <Card className="bg-default-50 border-primary-200">
          <CardBody className="flex flex-row items-center gap-3 p-3">
            <CircularProgress color="primary" label="Provisioning..." size="sm" />
            <div className="flex flex-col">
              <p className="text-xs font-medium text-default-700">Configuring Device</p>
              <p className="text-xs text-default-500">{provisioningProgress || "Processing..."}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Error Display */}
      {provisioningError && !isProvisioning && (
        <Card className="bg-danger-50 border-danger-200">
          <CardBody className="p-3">
            <div className="flex items-start gap-3">
              <Icon
                className="text-danger-500 mt-0.5"
                icon="solar:danger-circle-outline"
                width={16}
              />
              <div className="flex flex-col">
                <p className="text-xs font-medium text-danger-700">Provisioning Failed</p>
                <p className="text-xs text-danger-600 mt-1">{provisioningError}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button isDisabled={isLoading || isProvisioning} variant="light" onPress={onCancel}>
          Cancel
        </Button>
        <Button
          color="primary"
          isDisabled={isProvisioning}
          isLoading={isLoading || isProvisioning}
          startContent={
            !(isLoading || isProvisioning) && <Icon icon="solar:settings-outline" width={16} />
          }
          onPress={handleSubmit}
        >
          {isProvisioning ? "Configuring..." : isLoading ? "Applying..." : "Apply Configuration"}
        </Button>
      </div>
    </div>
  );
}
