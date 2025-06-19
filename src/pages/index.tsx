import SidebarLayout from "@/layouts/sidebar-layout";

export default function IndexPage() {
  return (
    <SidebarLayout title="Devices">
      <div className="p-8">
        <div className="backdrop-blur-xl bg-background/30 rounded-2xl border border-divider p-6">
          <p className="text-default-500">Device content will go here</p>
        </div>
      </div>
    </SidebarLayout>
  );
}
