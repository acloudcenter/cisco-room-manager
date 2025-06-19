import SidebarLayout from "@/layouts/sidebar-layout";

export default function SettingsPage() {
  return (
    <SidebarLayout title="Settings">
      <div className="p-8">
        <div className="backdrop-blur-xl bg-background/30 rounded-2xl border border-divider p-6">
          <p className="text-default-500">Settings content will go here</p>
        </div>
      </div>
    </SidebarLayout>
  );
}
