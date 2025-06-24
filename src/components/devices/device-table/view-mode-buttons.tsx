import React from "react";
import { ButtonGroup, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface ViewModeButtonsProps {
  currentMode: "side" | "center";
  onModeChange: (mode: "side" | "center") => void;
}

export const ViewModeButtons: React.FC<ViewModeButtonsProps> = ({ currentMode, onModeChange }) => {
  return (
    <ButtonGroup size="sm" variant="flat">
      <Button
        isIconOnly
        color={currentMode === "side" ? "primary" : "default"}
        title="Side peek"
        onPress={() => onModeChange("side")}
      >
        <Icon icon="solar:sidebar-minimalistic-outline" width={16} />
      </Button>
      <Button
        isIconOnly
        color={currentMode === "center" ? "primary" : "default"}
        title="Center peek"
        onPress={() => onModeChange("center")}
      >
        <Icon icon="solar:align-horizontal-center-linear" width={16} />
      </Button>
    </ButtonGroup>
  );
};
