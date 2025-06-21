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
} from "./provisioning-types";

import { useDeviceStore } from "@/stores/device-store";

export default function ProvisioningForm({
  device,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProvisioningFormProps) {
  const [formData, setFormData] = React.useState<ProvisioningFormData>(defaultProvisioningFormData);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Subscribe to provisioning state from Zustand store
  const { isProvisioning, provisioningProgress, provisioningError } = useDeviceStore();

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
      if (!formData.credentials.loginName.trim()) {
        newErrors.loginName = "Login Name is required for TMS mode";
      }
      if (!formData.credentials.password.trim()) {
        newErrors.password = "Password is required for TMS mode";
      }
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
    } catch (error) {
      // Error handling is now done in workflows via Zustand state
      console.error("Form submission error:", error);
    }
  };

  const isTmsMode = formData.mode === "TMS";

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center gap-3 p-4 bg-default-50 rounded-lg">
        <Icon className="text-primary" icon="solar:settings-outline" width={24} />
        <div>
          <h3 className="text-lg font-semibold">Provisioning Configuration</h3>
          <p className="text-sm text-default-500">
            Configure {device?.info?.unitName || "device"} provisioning settings
          </p>
        </div>
      </div>

      {/* Mode Selection */}
      <Card>
        <CardHeader className="pb-3">
          <h4 className="text-md font-semibold">Provisioning Mode</h4>
        </CardHeader>
        <CardBody className="pt-0">
          <Select
            label="Mode"
            placeholder="Select provisioning mode"
            selectedKeys={[formData.mode]}
            onSelectionChange={(keys) => {
              const mode = Array.from(keys)[0] as ProvisioningMode;

              handleModeChange(mode);
            }}
          >
            <SelectItem key="Webex">Webex</SelectItem>
            <SelectItem key="TMS">TMS (Telepresence Management Suite)</SelectItem>
          </Select>
          <p className="text-xs text-default-400 mt-2">
            {formData.mode === "Webex"
              ? "Device will register with Cisco Webex cloud service"
              : "Device will register with on-premises TMS server"}
          </p>
        </CardBody>
      </Card>

      {/* Main Configuration Section */}
      <Card>
        <CardHeader className="pb-3">
          <h4 className="text-md font-semibold">Configuration</h4>
        </CardHeader>
        <CardBody className="pt-0 space-y-4">
          {/* Connectivity - Only show for TMS mode */}
          {isTmsMode && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-default-700">Connectivity</span>
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
                description="Username for TMS authentication"
                errorMessage={errors.loginName}
                isInvalid={!!errors.loginName}
                label="LoginName"
                placeholder="tms-user"
                value={formData.credentials.loginName}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    credentials: { ...prev.credentials, loginName: value },
                  }))
                }
              />

              <Input
                description="Password for TMS authentication"
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
                errorMessage={errors.password}
                isInvalid={!!errors.password}
                label="Password"
                placeholder="Enter password"
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
              <span className="text-sm font-medium">TlsVerify</span>
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
              <span className="text-sm font-medium">WebexEdge</span>
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
          <CardHeader className="pb-3">
            <h4 className="text-md font-semibold">ExternalManager</h4>
          </CardHeader>
          <CardBody className="pt-0 space-y-4">
            <Input
              description="TMS server hostname or IP address"
              errorMessage={errors.address}
              isInvalid={!!errors.address}
              label="Address"
              placeholder="tms-server.company.com"
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
          <CardBody className="flex flex-row items-center gap-4 p-4">
            <CircularProgress color="primary" label="Provisioning..." size="md" />
            <div className="flex flex-col">
              <p className="text-sm font-medium text-default-700">Configuring Device</p>
              <p className="text-xs text-default-500">{provisioningProgress || "Processing..."}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Error Display */}
      {provisioningError && !isProvisioning && (
        <Card className="bg-danger-50 border-danger-200">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <Icon
                className="text-danger-500 mt-0.5"
                icon="solar:danger-circle-outline"
                width={20}
              />
              <div className="flex flex-col">
                <p className="text-sm font-medium text-danger-700">Provisioning Failed</p>
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
            !(isLoading || isProvisioning) && <Icon icon="solar:settings-outline" width={20} />
          }
          onPress={handleSubmit}
        >
          {isProvisioning ? "Configuring..." : isLoading ? "Applying..." : "Apply Configuration"}
        </Button>
      </div>
    </div>
  );
}
