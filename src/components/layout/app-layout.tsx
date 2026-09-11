"use client";

import { useRef, useState } from "react";
import type { PanelImperativeHandle } from "react-resizable-panels";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SideBar } from "@/components/sections/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
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
    <div className="bg-background flex h-screen w-screen overflow-hidden">
      <SideBar isOpen={isOpen} onToggleFiles={handleToggle} />

      <ResizablePanelGroup orientation="horizontal" className="h-full flex-1">
        <ResizablePanel
          panelRef={panelRef}
          collapsible={true}
          defaultSize="25%"
          minSize="15%"
          maxSize="60%"
          onResize={(size) => setIsOpen(size.asPercentage > 0)}

          className="bg-sidebar border-sidebar-border border-r"
        >
          {/* Содержимое панели файлов */}
          <div className="flex h-full flex-col overflow-y-auto p-3 select-none">
            <span className="text-muted-foreground mb- 3 text-xs font-semibold uppercase">
              Файлы
            </span>
            <div className="text-muted-foreground space-y-1 text-sm">
              <div className="hover:bg-sidebar-accent hover:text- foreground cursor-pointer rounded px-2 py-1">
                📄 Заметка fdsaaaaaaaaaaaaaaaaaaaaaaa1.md
              </div>
              <div className="hover:bg-sidebar-accent hover:text- foreground cursor-pointer rounded px-2 py-1">
                📄 Заметка 2.md
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize="75%">
          <main className="h-full w-full overflow-y-auto p-6">{children}</main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
