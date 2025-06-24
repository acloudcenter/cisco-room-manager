import { type SidebarItem } from "./sidebar";

export const sidebarItems: SidebarItem[] = [
  {
    key: "management",
    title: "Management",
    items: [
      {
        key: "devices",
        href: "/",
        icon: "solar:monitor-smartphone-line-duotone",
        title: "Devices",
      },
      {
        key: "tools",
        href: "/tools",
        icon: "solar:widget-2-outline",
        title: "Tools",
      },
    ],
  },
  {
    key: "services",
    title: "Services",
    items: [
      {
        key: "settings",
        href: "/settings",
        icon: "solar:settings-outline",
        title: "Settings",
      },
    ],
  },
];
