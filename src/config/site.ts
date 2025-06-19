export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Cisco Room Manager",
  description: "Manage and configure Cisco video conferencing devices",
  navItems: [
    {
      label: "Devices",
      href: "/",
    },
  ],
  navMenuItems: [
    {
      label: "Devices",
      href: "/",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
  ],
  links: {
    github: "https://github.com/acloudcenter/cisco-room-manager",
  },
};
