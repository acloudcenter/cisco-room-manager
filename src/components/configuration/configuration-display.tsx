import type { ConnectedDevice } from "@/stores/device-store";

import React, { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { Icon } from "@iconify/react";

import { MacrosSection } from "./macros-section";
import { ExtensionsSection } from "./extensions-section";

interface ConfigurationDisplayProps {
  device: ConnectedDevice;
}

export const ConfigurationDisplay: React.FC<ConfigurationDisplayProps> = ({ device }) => {
  const [selectedTab, setSelectedTab] = useState("macros");

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon className="text-primary" icon="solar:settings-outline" width={18} />
        <div>
          <h3 className="text-sm font-semibold">Device Configuration</h3>
          <p className="text-xs text-default-500">
            Manage macros and extensions for {device.info.unitName}
          </p>
        </div>
      </div>

      <Tabs
        aria-label="Configuration options"
        classNames={{
          tabList: "gap-2",
          tab: "px-3 h-8",
          panel: "pt-3 pb-0 px-0",
        }}
        selectedKey={selectedTab}
        size="sm"
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tab
          key="macros"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:code-outline" width={14} />
              <span className="text-xs">Macros</span>
            </div>
          }
        >
          <MacrosSection device={device} />
        </Tab>
        <Tab
          key="extensions"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:widget-2-outline" width={14} />
              <span className="text-xs">UI Extensions</span>
            </div>
          }
        >
          <ExtensionsSection device={device} />
        </Tab>
      </Tabs>
    </div>
  );
};
