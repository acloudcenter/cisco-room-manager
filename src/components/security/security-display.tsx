/**
 * Security Display Component
 * Container for all security-related functionality
 */

import { Tabs, Tab } from "@heroui/react";
import { Icon } from "@iconify/react";

import CACertificatesSection from "./ca-certificates-section";
import CUCMCertificatesSection from "./cucm-certificates-section";

export default function SecurityDisplay() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon className="text-primary" icon="solar:shield-keyhole-outline" width={18} />
        <div>
          <h3 className="text-sm font-semibold">Security Management</h3>
          <p className="text-xs text-default-500">
            Manage device certificates and security settings
          </p>
        </div>
      </div>

      {/* Security Tabs */}
      <Tabs
        aria-label="Security options"
        classNames={{
          tabList: "gap-2",
          tab: "px-3 h-8",
          panel: "pt-3 pb-0 px-0",
        }}
        size="sm"
      >
        <Tab
          key="ca"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:diploma-verified-outline" width={14} />
              <span className="text-xs">CA Certificates</span>
            </div>
          }
        >
          <CACertificatesSection />
        </Tab>

        <Tab
          key="cucm"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:key-outline" width={14} />
              <span className="text-xs">CUCM (CTL/ITL)</span>
            </div>
          }
        >
          <CUCMCertificatesSection />
        </Tab>
      </Tabs>
    </div>
  );
}
