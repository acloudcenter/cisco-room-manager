/**
 * Types and interfaces for provisioning functionality
 */

export type ProvisioningMode = "Webex" | "TMS" | "Off";
export type ConnectivityType = "Internal" | "External" | "Auto";
export type ProtocolType = "HTTP" | "HTTPS";

export interface ProvisioningFormData {
  mode: ProvisioningMode;
  connectivity: ConnectivityType;
  externalManager: {
    address: string;
    alternateAddress?: string;
    domain: string;
    path: string;
    protocol: ProtocolType;
  };
  security: {
    webexEdge: boolean;
    tlsVerify: boolean;
  };
  credentials: {
    loginName: string;
    password: string;
  };
}

export interface ProvisioningFormProps {
  device: any; // ConnectedDevice
  onSubmit: (data: ProvisioningFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// Default form values
export const defaultProvisioningFormData: ProvisioningFormData = {
  mode: "Off",
  connectivity: "External",
  externalManager: {
    address: "",
    alternateAddress: "",
    domain: "WORKGROUP",
    path: "tms/public/external/management/SystemManagementService.asmx",
    protocol: "HTTPS",
  },
  security: {
    webexEdge: false,
    tlsVerify: true,
  },
  credentials: {
    loginName: "",
    password: "",
  },
};
