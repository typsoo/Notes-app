"use client";

import * as React from "react";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SidebarToggleProps extends React.ComponentProps<typeof Button> {
  isOpen: boolean;
  onToggle: () => void;
}

export function SidebarToggle({
  isOpen,
  onToggle,
  title,
  variant = "ghost",
  size = "icon",
  ...props
}: SidebarToggleProps) {
  const label = title ?? (isOpen ? "Collapse sidebar" : "Expand sidebar");

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-haspopup="true"
      aria-label={label}
      title={label}
      className="text-muted-foreground hover:text-foreground"
      {...props}
    >
      {isOpen ? (
        <PanelLeftClose className="size-5" />
      ) : (
        <PanelLeftOpen className="size-5" />
      )}
    </Button>
  );
}
