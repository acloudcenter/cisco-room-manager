import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

import SidebarLayout from "@/layouts/sidebar-layout";
import { ThemeSwitch } from "@/components/common/theme-switch";

export default function SettingsPage() {
  return (
    <SidebarLayout title="Settings">
      <div className="p-8">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-bold mb-6">Application Settings</h1>

          {/* UI Preferences */}
          <Card className="backdrop-blur-xl bg-background/30 border-divider mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Icon icon="solar:palette-outline" width={20} />
                <h2 className="text-lg font-semibold">UI Preferences</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* Theme Setting */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium">Theme</h3>
                  <p className="text-xs text-default-500 mt-1">
                    Choose between light and dark theme for the application
                  </p>
                </div>
                <ThemeSwitch />
              </div>

              <Divider />

              {/* Future settings can go here */}
              <div className="text-xs text-default-400">
                More UI preferences will be available in future updates
              </div>
            </CardBody>
          </Card>

          {/* Additional setting sections can be added here */}
        </div>
      </div>
    </SidebarLayout>
  );
}
