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
        key: "users",
        href: "/users",
        icon: "solar:users-group-two-rounded-outline",
        title: "Users",
      },
      {
        key: "locations",
        href: "/locations",
        icon: "solar:map-point-wave-linear",
        title: "Locations",
      },
      {
        key: "workspaces",
        href: "/workspaces",
        icon: "solar:widget-5-outline",
        title: "Workspaces",
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
      {
        key: "security",
        href: "/security",
        icon: "solar:shield-check-outline",
        title: "Security",
      },
    ],
  },
];
