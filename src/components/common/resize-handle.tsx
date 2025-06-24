import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";

interface ResizeHandleProps {
  onResize: (deltaX: number) => void;
  onResizeEnd?: () => void;
  className?: string;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onResize,
  onResizeEnd,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = startX - e.clientX; // Negative because we're resizing from the left edge

      onResize(deltaX);
      setStartX(e.clientX);
    },
    [isDragging, startX, onResize],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onResizeEnd?.();
    }
  }, [isDragging, onResizeEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <button
      aria-label="Resize handle"
      className={`
        absolute left-0 top-0 h-full w-3 -ml-1.5 cursor-col-resize
        hover:bg-primary/10 transition-colors appearance-none border-none bg-transparent p-0
        ${isDragging ? "bg-primary/20" : ""}
        ${className}
      `}
      type="button"
      onKeyDown={(e) => {
        // Basic keyboard support for accessibility
        if (e.key === "ArrowLeft") {
          onResize(5);
        } else if (e.key === "ArrowRight") {
          onResize(-5);
        }
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Visual indicator */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-1 bg-default-200 rounded-full opacity-0 hover:opacity-100 transition-opacity">
        <Icon
          className={`
            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            text-default-500 rotate-90
            ${isDragging ? "text-primary" : ""}
          `}
          icon="solar:hamburger-menu-linear"
          width={14}
        />
      </div>
    </button>
  );
};
