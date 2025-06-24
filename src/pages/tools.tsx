import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";

import SidebarLayout from "@/layouts/sidebar-layout";

export default function ToolsPage() {
  return (
    <SidebarLayout title="Tools">
      <div className="p-8">
        <div className="backdrop-blur-xl bg-background/30 rounded-2xl border border-divider p-6">
          <div className="mb-6">
            <p className="text-sm text-default-500">Advanced device management utilities</p>
          </div>

          <Card>
            <CardBody className="flex flex-col items-center justify-center py-20">
              <Icon className="text-default-300 mb-4" icon="solar:tools-outline" width={48} />
              <h2 className="text-lg font-medium text-default-600 mb-2">Tools Coming Soon</h2>
              <p className="text-sm text-default-400 text-center max-w-md">
                This section will include advanced tools for device management, diagnostics, bulk
                operations, and custom commands.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
