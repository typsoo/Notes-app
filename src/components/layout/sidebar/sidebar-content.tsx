"use client";

import { useState } from "react";
import { SidebarTabs } from "@/components/layout/sidebar/sidebar-tabs";
import { SIDEBAR_TABS, type SidebarTabId } from "./tabs-data";
import { useRef } from "react";

interface ResizableSidebarProps {
  panelMap: Record<SidebarTabId, React.ReactNode>;
  defaultTab: SidebarTabId;
}

export function SidebarContent({
  panelMap,
  defaultTab,
}: ResizableSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTabId>(defaultTab);
  const visitedTabs = useRef<Set<SidebarTabId>>(new Set([defaultTab]));

  const handleTabChange = (nextTab: SidebarTabId) => {
    visitedTabs.current.add(nextTab);
    setActiveTab(nextTab);
  };
  return (
    <aside className="border-sidebar-border bg-sidebar text-sidebar-foreground relative flex h-full flex-col border-r">
      <main className="relative flex-1 overflow-hidden">
        {SIDEBAR_TABS.map((tab) => {
          if (!visitedTabs.current.has(tab.id)) return null;

          return (
            <div
              key={tab.id}
              id={`panel-${tab.id}`}
              role="tabpanel"
              aria-labelledby={tab.id}
              className={
                activeTab === tab.id ? "h-full overflow-y-auto p-3" : "hidden"
              }
            >
              {panelMap[tab.id]}
            </div>
          );
        })}
      </main>

      <SidebarTabs
        tabs={SIDEBAR_TABS}
        activeTab={activeTab}
        changeAction={handleTabChange}
      />
    </aside>
  );
}
