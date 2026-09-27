"use client";

import { useCallback, useEffect, useRef } from "react";
import type { PanelImperativeHandle } from "react-resizable-panels";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { NavigationRail } from "@/components/navigation-rail";
import { useLayoutContext } from "./layout-context";

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex h-dvh w-full overflow-hidden">
      <NavigationRail />

      <main className="h-full min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

export function WorkspaceLayoutShell({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  const panelRef = useRef<PanelImperativeHandle>(null);
  const { setSidebarOpen, setSidebarToggle } = useLayoutContext();

  const handleToggle = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (panel.isCollapsed()) {
      panel.expand();
      setSidebarOpen(true);
    } else {
      panel.collapse();
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  useEffect(() => {
    setSidebarToggle(() => handleToggle);

    return () => setSidebarToggle(null);
  }, [handleToggle, setSidebarToggle]);

  return (
    <div className="h-full w-full overflow-hidden">
      <ResizablePanelGroup orientation="horizontal" className="h-full">
        <ResizablePanel
          panelRef={panelRef}
          collapsible={true}
          defaultSize="25%"
          minSize="15%"
          maxSize="60%"
          onResize={(size) => setSidebarOpen(size.asPercentage > 0)}
          className="bg-sidebar border-sidebar-border border-r"
        >
          {sidebar}
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize="75%">
          <main className="h-full w-full overflow-y-auto">{children}</main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
