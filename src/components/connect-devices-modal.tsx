"use client";

import React, { useState } from "react";
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
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface ConnectDevicesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ConnectDevicesModal({ isOpen, onOpenChange }: ConnectDevicesModalProps) {
  const [activeTab, setActiveTab] = useState("single");
  const [formData, setFormData] = useState({
    ipAddress: "",
    username: "",
    password: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConnect = () => {
    // TODO: Implement connection logic
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form and close modal
    setFormData({ ipAddress: "", username: "", password: "" });
    onOpenChange(false);
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
      size="lg"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-light text-foreground">Connect to Room Systems</h2>
          <p className="text-sm text-default-500 font-normal">Add devices to manage</p>
        </ModalHeader>

        <ModalBody>
          <Tabs
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
              <div className="space-y-6 mt-6">
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
              </div>
            </Tab>

            <Tab key="multiple" title="Multiple Devices">
              <div className="space-y-6 mt-6 min-h-[280px] flex flex-col justify-center">
                <div className="text-center">
                  <Icon
                    className="text-default-400 mx-auto mb-4"
                    icon="solar:upload-outline"
                    width={48}
                  />
                  <p className="text-default-500">Multiple device connection coming soon</p>
                  <p className="text-sm text-default-400 mt-2">
                    Upload CSV or configure network discovery
                  </p>
                </div>
              </div>
            </Tab>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button className="text-default-600" variant="light" onPress={handleCancel}>
            Cancel
          </Button>
          <Button
            className="bg-primary text-primary-foreground"
            color="primary"
            endContent={<Icon icon="solar:arrow-right-outline" width={16} />}
            isDisabled={!formData.ipAddress || !formData.username || !formData.password}
            onPress={handleConnect}
          >
            Connect
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
