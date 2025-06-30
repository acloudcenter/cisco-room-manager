/**
 * Security Display Component
 * Container for all security-related functionality
 */

import type { ConnectedDevice } from "@/stores/device-store";

import { Icon } from "@iconify/react";

import CACertificatesSection from "./ca-certificates-section";

interface SecurityDisplayProps {
  device: ConnectedDevice;
}

export default function SecurityDisplay({ device }: SecurityDisplayProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon className="text-primary" icon="solar:shield-keyhole-outline" width={18} />
        <div>
          <h3 className="text-sm font-semibold">Security Management</h3>
          <p className="text-xs text-default-500">Manage CA certificates and security settings</p>
        </div>
      </div>

      {/* CA Certificates Section - no tabs needed anymore */}
      <CACertificatesSection device={device} />
    </div>
  );
}
