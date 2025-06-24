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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Icon className="text-primary" icon="solar:settings-bold-duotone" width={24} />
        <div>
          <h3 className="text-lg font-semibold">Device Configuration</h3>
          <p className="text-sm text-default-500">
            Manage macros and extensions for {device.info.unitName}
          </p>
        </div>
      </div>

      <Tabs
        aria-label="Configuration options"
        classNames={{
          tabList: "bg-background/70 backdrop-blur-md",
          cursor: "bg-primary/20",
          tab: "data-[selected=true]:text-primary",
        }}
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tab
          key="macros"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:code-file-bold-duotone" width="20" />
              <span>Macros</span>
            </div>
          }
        >
          <MacrosSection device={device} />
        </Tab>
        <Tab
          key="extensions"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:widget-2-bold-duotone" width="20" />
              <span>Extensions</span>
            </div>
          }
        >
          <ExtensionsSection device={device} />
        </Tab>
      </Tabs>
    </div>
  );
};
