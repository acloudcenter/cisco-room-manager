import SidebarLayout from "@/layouts/sidebar-layout";
import { DeviceTable } from "@/components/devices";

export default function IndexPage() {
  return (
    <SidebarLayout title="Devices">
      <div className="p-8">
        <div className="backdrop-blur-xl bg-background/30 rounded-2xl border border-divider p-6">
          <DeviceTable />
        </div>
      </div>
    </SidebarLayout>
  );
}
