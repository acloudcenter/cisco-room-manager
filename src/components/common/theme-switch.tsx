import React from "react";
import { Switch } from "@heroui/react";
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Icon
        className={`text-default-500 transition-colors ${theme === "light" ? "text-primary-500" : ""}`}
        icon="lucide:sun"
        width={16}
      />
      <Switch
        aria-label="Toggle theme"
        color="primary"
        isSelected={theme === "dark"}
        size="sm"
        onValueChange={(isSelected) => setTheme(isSelected ? "dark" : "light")}
      />
      <Icon
        className={`text-default-500 transition-colors ${theme === "dark" ? "text-primary-500" : ""}`}
        icon="lucide:moon"
        width={16}
      />
    </div>
  );
};
