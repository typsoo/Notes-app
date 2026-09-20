"use client";

import { useRef, useState } from "react";
import type { PanelImperativeHandle } from "react-resizable-panels";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { NavigationRail } from "@/components/navigation-rail";

export function AppLayoutShell({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  const panelRef = useRef<PanelImperativeHandle>(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    const panel = panelRef.current;
    if (!panel) return;

    if (panel.isCollapsed()) {
      panel.expand();
      setIsOpen(true);
    } else {
      panel.collapse();
      setIsOpen(false);
    }
  };

  return (
    <div className="bg-background flex h-dvh w-full overflow-hidden">
      <NavigationRail isOpen={isOpen} onToggleSidebar={handleToggle} />

      <ResizablePanelGroup orientation="horizontal" className="h-full flex-1">
        <ResizablePanel
          panelRef={panelRef}
          collapsible={true}
          defaultSize="25%"
          minSize="15%"
          maxSize="60%"
          onResize={(size) => {
            const open = size.asPercentage > 0;
            setIsOpen((prev) => (prev !== open ? open : prev));
          }}
          className="bg-sidebar border-sidebar-border border-r"
        >
          {sidebar}
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize="75%">
          <main className="h-full w-full overflow-y-auto p-6">{children}</main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
