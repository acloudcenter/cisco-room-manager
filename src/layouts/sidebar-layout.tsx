"use client";

import React from "react";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Spacer } from "@heroui/spacer";
import { Input } from "@heroui/input";
import { useDisclosure } from "@heroui/modal";
import { Icon } from "@iconify/react";
import { useLocation } from "react-router-dom";

import { sidebarItems } from "@/components/sidebar/sidebar-items";
import SidebarDrawer from "@/components/sidebar/sidebar-drawer";
import Sidebar from "@/components/sidebar/sidebar";
import { ThemeSwitch } from "@/components/theme-switch";

export default function SidebarLayout({
  children,
  header,
  title = "Devices",
}: {
  children?: React.ReactNode;
  header?: React.ReactNode;
  title?: string;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const location = useLocation();
  const currentPath = location.pathname.split("/")[1] || "devices";

  const content = (
    <div className="relative flex h-full w-72 flex-1 flex-col backdrop-blur-xl bg-gradient-to-br from-background/90 via-default-50/90 to-primary-50/90 p-6 border-r border-divider">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" />
        <div
          className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 px-2">
          <h1 className="text-xl font-light text-foreground">Room Manager</h1>
        </div>
        <p className="text-xs text-default-500 mt-1 px-2">An open source tool for Cisco Devices</p>

        <Spacer y={8} />

        <div className="flex flex-col gap-4">
          <Input
            fullWidth
            aria-label="search"
            classNames={{
              base: "px-1",
              inputWrapper:
                "bg-default-100/60 backdrop-blur-sm border border-divider data-[hover=true]:bg-default-100/80 group-data-[focus=true]:bg-default-100/80",
              input: "placeholder:text-default-400 group-data-[has-value=true]:text-foreground",
            }}
            labelPlacement="outside"
            placeholder="Search devices..."
            startContent={
              <Icon className="text-default-400" icon="solar:magnifer-linear" width={18} />
            }
          />
        </div>

        <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
          <Sidebar
            defaultSelectedKey={currentPath}
            iconClassName="text-default-500 group-data-[selected=true]:text-primary-foreground"
            itemClasses={{
              base: "data-[selected=true]:bg-primary data-[hover=true]:bg-default-100/40 transition-all duration-200",
              title:
                "text-default-600 group-data-[selected=true]:text-primary-foreground font-light",
            }}
            items={sidebarItems}
            sectionClasses={{
              heading: "text-xs font-medium text-default-500 uppercase tracking-wider mb-3 px-3",
            }}
            selectedKeys={[currentPath]}
            variant="flat"
          />
        </ScrollShadow>

        <div className="mt-auto flex flex-col gap-2">
          <Button
            fullWidth
            className="justify-start text-default-600 data-[hover=true]:bg-default-100/40"
            startContent={
              <Icon className="text-default-500" icon="solar:question-circle-linear" width={20} />
            }
            variant="light"
          >
            Help & Support
          </Button>
          <Button
            fullWidth
            as="a"
            className="justify-start text-default-600 data-[hover=true]:bg-default-100/40"
            href="https://github.com/joshestrada"
            startContent={<Icon className="text-default-500" icon="mdi:github" width={20} />}
            target="_blank"
            variant="light"
          >
            GitHub
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-default-50 to-primary-50">
      {/* Desktop Sidebar */}
      <div className="hidden sm:flex flex-none">{content}</div>

      {/* Mobile Sidebar Drawer */}
      <SidebarDrawer className="sm:hidden" isOpen={isOpen} onOpenChange={onOpenChange}>
        {content}
      </SidebarDrawer>

      {/* Main Content Area */}
      <div className="flex w-full flex-col sm:max-w-[calc(100%_-_288px)]">
        {/* Header */}
        <header className="backdrop-blur-xl bg-background/30 border-b border-divider px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                isIconOnly
                className="flex sm:hidden"
                size="sm"
                variant="light"
                onPress={onOpen}
              >
                <Icon
                  className="text-gray-600"
                  height={24}
                  icon="solar:hamburger-menu-outline"
                  width={24}
                />
              </Button>
              <h2 className="text-2xl font-light text-foreground">{title}</h2>
            </div>
            <div className="flex items-center gap-4">
              {header}
              <ThemeSwitch />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
